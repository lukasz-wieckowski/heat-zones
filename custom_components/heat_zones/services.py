"""Services: the schedule contract for HomeAI and other systems, plus holds.

Contract (see README, “Contract for other systems”) — targets are the zones' climate entities:

- `add_override`: `end`, `start` (default now), exactly one of `preset_mode`/`temperature`, `reason`, `source`,
  `override_id` (the same id replaces). Response `{override_id}`.
- `remove_override`: `override_id` or `source` (removes all from that source).
- `get_schedule` (response): `{entity_id: {enabled, weekly, overrides}}`.
- `set_schedule`: `weekly` in the same format.
- `estimate` (response): `temperature` → `{entity_id: {minutes | null, confidence 0–1}}`.
- `reset_learning`.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv, entity_registry as er
from homeassistant.helpers.service import async_extract_entity_ids
from homeassistant.util import dt as dt_util
import probatio as vol

from .const import DOMAIN, ID_MAX, MAX_TEMP, MIN_TEMP, OVERRIDE_MAX, REASON_MAX, SOURCE_MAX
from .engine import CALLER, HeatZones
from .schedule import ScheduleError, normalize_weekly

TEMPERATURE = vol.All(vol.Coerce(float), vol.Range(min=MIN_TEMP, max=MAX_TEMP))
TARGET = cv.ENTITY_SERVICE_FIELDS

ADD_OVERRIDE = vol.Schema(
    {
        **TARGET,
        vol.Required("end"): cv.datetime,
        vol.Optional("start"): cv.datetime,
        vol.Optional("preset_mode"): cv.string,
        vol.Optional("temperature"): TEMPERATURE,
        vol.Optional("reason", default=""): vol.All(cv.string, vol.Length(max=REASON_MAX)),
        vol.Optional("source", default=""): vol.All(cv.string, vol.Length(max=SOURCE_MAX)),
        vol.Optional("override_id"): vol.All(cv.string, vol.Length(min=1, max=ID_MAX)),
        vol.Optional("open_end", default=False): cv.boolean,
    }
)
REMOVE_OVERRIDE = vol.Schema(
    {
        **TARGET,
        vol.Optional("override_id"): vol.All(cv.string, vol.Length(min=1, max=ID_MAX)),
        vol.Optional("source"): vol.All(cv.string, vol.Length(min=1, max=SOURCE_MAX)),
    }
)
GET_SCHEDULE = vol.Schema({**TARGET})
SET_SCHEDULE = vol.Schema({**TARGET, vol.Required("weekly"): list})
ESTIMATE = vol.Schema({**TARGET, vol.Required("temperature"): TEMPERATURE})
RESET_LEARNING = vol.Schema({**TARGET})
HOLD = vol.Schema(
    {
        **TARGET,
        vol.Optional("preset_mode"): cv.string,
        vol.Optional("temperature"): TEMPERATURE,
        vol.Optional("until"): cv.datetime,
        vol.Optional("permanent", default=False): cv.boolean,
    }
)
RESUME = vol.Schema({**TARGET})


def _local(t: datetime) -> datetime:
    return dt_util.as_local(t if t.tzinfo else t.replace(tzinfo=dt_util.get_default_time_zone()))


def _error(key: str, **placeholders: Any) -> ServiceValidationError:
    return ServiceValidationError(
        translation_domain=DOMAIN,
        translation_key=key,
        translation_placeholders={k: str(v) for k, v in placeholders.items()},
    )


def _engine(hass: HomeAssistant) -> HeatZones:
    engine = next((e.runtime_data for e in hass.config_entries.async_loaded_entries(DOMAIN)), None)
    if engine is None:
        raise _error("not_loaded")
    return engine


def _has_target(call: ServiceCall) -> bool:
    return any(call.data.get(k) for k in ("entity_id", "device_id", "area_id", "floor_id", "label_id"))


async def _targets(hass: HomeAssistant, call: ServiceCall, required: bool) -> tuple[HeatZones, dict[str, str]]:
    """The zones a call targets: entity_id → zone id. Without a target — all zones (when allowed)."""
    engine = _engine(hass)
    registry = er.async_get(hass)
    by_entity = {}
    for zid in engine.zones:
        if eid := registry.async_get_entity_id("climate", DOMAIN, f"{zid}-climate"):
            by_entity[eid] = zid
    if not _has_target(call):
        if required:
            raise _error("no_target")
        return engine, by_entity
    wanted = await async_extract_entity_ids(call)
    found = {eid: by_entity[eid] for eid in sorted(wanted) if eid in by_entity}
    strangers = sorted(eid for eid in wanted if eid not in by_entity and eid.startswith("climate."))
    if call.data.get("entity_id") and strangers:
        raise _error("not_a_zone", entity_id=", ".join(strangers))
    if not found:
        raise _error("no_target")
    return engine, found


def async_register(hass: HomeAssistant) -> None:
    async def add_override(call: ServiceCall) -> ServiceResponse:
        engine, targets = await _targets(hass, call, required=True)
        now = dt_util.now()
        start = _local(call.data["start"]) if call.data.get("start") else now
        end = _local(call.data["end"])
        preset, temperature = call.data.get("preset_mode"), call.data.get("temperature")
        if (preset is None) == (temperature is None):
            raise _error("preset_or_temperature")
        if end <= start or end <= now:
            raise _error("invalid_period")
        if end - start > OVERRIDE_MAX:
            raise _error("period_too_long", days=OVERRIDE_MAX.days)
        if preset is not None:
            for eid, zid in targets.items():
                if preset not in engine.zones[zid].presets:
                    raise _error(
                        "unknown_preset",
                        preset=preset,
                        presets=", ".join(engine.zones[zid].preset_modes),
                        entity_id=eid,
                    )
        oid = await engine.add_override(
            list(targets.values()),
            start,
            end,
            preset,
            temperature,
            call.data.get("reason", "").strip(),
            call.data.get("source", "").strip(),
            call.data.get("override_id"),
            call.data.get("open_end", False),
        )
        return {"override_id": oid}

    async def remove_override(call: ServiceCall) -> ServiceResponse:
        oid, source = call.data.get("override_id"), call.data.get("source")
        if (oid is None) == (source is None):
            raise _error("id_or_source")
        engine, targets = await _targets(hass, call, required=False)
        removed = await engine.remove_overrides(list(targets.values()), oid, source)
        return {"removed": removed}

    async def get_schedule(call: ServiceCall) -> ServiceResponse:
        engine, targets = await _targets(hass, call, required=False)
        return {eid: engine.get_schedule(zid) for eid, zid in targets.items()}

    async def set_schedule(call: ServiceCall) -> None:
        engine, targets = await _targets(hass, call, required=True)
        checked = {}
        for eid, zid in targets.items():
            try:
                checked[zid] = normalize_weekly(call.data["weekly"], engine.zones[zid].presets)
            except ScheduleError as err:
                raise _error(f"schedule_{err.code}", detail=err.detail or "—", entity_id=eid) from None
        for zid, weekly in checked.items():
            await engine.set_weekly(zid, weekly)

    async def estimate(call: ServiceCall) -> ServiceResponse:
        engine, targets = await _targets(hass, call, required=False)
        return {eid: engine.estimate(zid, call.data["temperature"]) for eid, zid in targets.items()}

    async def reset_learning(call: ServiceCall) -> None:
        engine, targets = await _targets(hass, call, required=True)
        for zid in targets.values():
            await engine.reset_learning(zid)

    async def hold(call: ServiceCall) -> None:
        engine, targets = await _targets(hass, call, required=True)
        preset, temperature = call.data.get("preset_mode"), call.data.get("temperature")
        until = _local(call.data["until"]) if call.data.get("until") else None
        permanent = call.data.get("permanent", False)
        if preset is not None and temperature is not None:
            raise _error("preset_or_temperature")
        if until is not None and permanent:
            raise _error("until_or_permanent")
        if until is not None and until <= dt_util.now():
            raise _error("invalid_period")
        for eid, zid in targets.items():
            if preset is not None and preset not in engine.zones[zid].presets:
                raise _error(
                    "unknown_preset", preset=preset, presets=", ".join(engine.zones[zid].preset_modes), entity_id=eid
                )
        for zid in targets.values():
            await engine.hold(zid, temperature, preset, until, permanent)

    async def resume(call: ServiceCall) -> None:
        engine, targets = await _targets(hass, call, required=True)
        for zid in targets.values():
            await engine.resume(zid)

    def with_caller(handler: Callable[[ServiceCall], Awaitable[Any]]) -> Callable[[ServiceCall], Awaitable[Any]]:
        """States written by the call carry the caller's context (a person, an automation, HomeAI)."""

        async def run(call: ServiceCall) -> Any:
            token = CALLER.set(call.context)
            try:
                return await handler(call)
            finally:
                CALLER.reset(token)

        return run

    def register(domain: str, service: str, handler: Callable[[ServiceCall], Awaitable[Any]], **kw: Any) -> None:
        hass.services.async_register(domain, service, with_caller(handler), **kw)

    register(DOMAIN, "add_override", add_override, schema=ADD_OVERRIDE, supports_response=SupportsResponse.OPTIONAL)
    register(
        DOMAIN, "remove_override", remove_override, schema=REMOVE_OVERRIDE, supports_response=SupportsResponse.OPTIONAL
    )
    register(DOMAIN, "get_schedule", get_schedule, schema=GET_SCHEDULE, supports_response=SupportsResponse.ONLY)
    register(DOMAIN, "set_schedule", set_schedule, schema=SET_SCHEDULE)
    register(DOMAIN, "estimate", estimate, schema=ESTIMATE, supports_response=SupportsResponse.ONLY)
    register(DOMAIN, "reset_learning", reset_learning, schema=RESET_LEARNING)
    register(DOMAIN, "hold", hold, schema=HOLD)
    register(DOMAIN, "resume", resume, schema=RESUME)
