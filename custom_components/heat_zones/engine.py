"""The engine: zones from subentries, the controller, learning and the valve guard.

A zone is one or more rooms (Home Assistant areas) heated by one or more thermostats. The user chooses where the
zone measures (a room, the average or the coldest room) and the target; the zone drives every thermostat:

- **room sensor** (thermostats with an external sensor input, e.g. SONOFF TRVZB): the zone feeds the thermostat
  the temperature at the measuring point, raised by rooms that approach their limit —

      fed = max(temperature at the point, T_room − (limit_room − target))  for every room with a limit

  so when a limited room reaches its limit the thermostat already sees the target and closes;
- **offset** (thermostats without such an input): the target sent is corrected by the difference between the
  thermostat's own thermometer and the room, within a limit;
- **own**: the thermostat regulates by its own thermometer (no room sensor, or chosen so).

An open window pauses the radiators; a silent sensor makes the thermostats fall back to their own thermometers;
commands a thermostat did not take are repeated; a change on the knob becomes the zone's manual change. The
target comes from the schedule, overrides and holds (schedule.py), with preheat from the thermal model (model.py).
The zone learns the differences between its rooms, the heating rate and the model; the valve guard notices a
valve that is open while the room does not get warmer.
"""

from __future__ import annotations

import asyncio
from collections import deque
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from statistics import mean
import time
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import CALLBACK_TYPE, Event, EventStateChangedData, HomeAssistant, State, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.event import (
    async_call_later,
    async_track_point_in_time,
    async_track_state_change_event,
    async_track_time_interval,
)
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util, ulid as ulid_util

from . import i18n, model
from .const import (
    AVERAGE,
    CALIBRATE_SUFFIXES,
    COLDEST,
    DOMAIN,
    ECHO,
    EXTERNAL_INPUT_SUFFIXES,
    FREEZING,
    HOLD_NEXT,
    HOLD_PERMANENT,
    HOLD_UNTIL,
    HORIZON,
    LEARNING_CONFIDENT,
    LOGGER,
    MAX_TEMP,
    MIN_TEMP,
    MISMATCH,
    MISMATCH_AFTER,
    MODE_AUTO,
    MODE_OFFSET,
    MODE_OWN,
    MODE_ROOM_SENSOR,
    NEAR_TARGET,
    OFFSET_MAX,
    OFFSET_SMOOTHING,
    PLAN_MAX,
    PREHEAT_LIMIT,
    PREHEAT_MAX,
    PRESET_DEFAULTS,
    REFRESH_SENT,
    RELOAD_AFTER,
    REPAIR_EVERY,
    REPAIR_MAX,
    RETRY_AFTER,
    SAVE_DELAY,
    SENSOR_EXTERNAL,
    SENSOR_LOCAL,
    SENSOR_OFFLINE,
    SENSOR_SELECT_SUFFIXES,
    STALE,
    STORAGE_VERSION,
    SUBENTRY_ZONE,
    TICK,
    UNAVAILABLE,
    VALVE_AFTER,
    VALVE_LIMIT_SUFFIXES,
    VALVE_OPEN,
    VALVE_RISE,
    WINDOW_DELAY,
    WINDOW_SIGNAL,
    WINDOW_SIGNAL_COLD,
)
from .home import Area, area_map, area_of_entity, best_weather, companion, last_report, pick_for
from .outside import Outside, number, parse_time
from .schedule import (
    HOLD,
    MANUAL,
    OVERRIDE,
    PREHEAT,
    SCHEDULE,
    Hold,
    Override,
    Program,
    Segment,
    Setting,
    block_at,
    with_preheat,
)

HOMEAI_SCHEDULE = {"version": 1, "domain": DOMAIN}


@dataclass
class Trv:
    """One thermostat of a zone and its companion entities."""

    entity_id: str
    mode: str
    sensor_select: str | None = None
    external_input: str | None = None
    valve_limit: str | None = None
    calibrate: str | None = None
    fed: float | None = None
    fed_at: float = 0.0
    sent: dict[str, tuple[Any, float]] = field(default_factory=dict)  # kind → (value, monotonic time)
    offset: float | None = None  # smoothed thermostat − room (offset mode)
    applied: float = 0.0  # correction included in the target last sent
    mismatch: tuple[float, float] | None = None  # (thermostat's temperature, room reading) while they differ
    mismatch_since: datetime | None = None
    repair_at: datetime | None = None
    repairs: int = 0


@dataclass
class Zone:
    id: str  # subentry id
    name: str
    areas: list[str]
    area_names: dict[str, str]
    main_area: str  # room of the first thermostat — learning counts room differences from it
    trvs: list[Trv]
    sensors: dict[str, str | None]
    limits: dict[str, float]
    openings: list[str]
    measure_options: list[str]
    presets: dict[str, float]
    custom_presets: list[str]
    cfg: dict[str, Any]
    state: dict[str, Any]
    # derived on every recalculation
    temperatures: dict[str, float | None] = field(default_factory=dict)
    current_room: float | None = None  # at the measuring point, from room sensors
    current: float | None = None  # the same, or the thermostats' own thermometers
    fed: float | None = None
    limited_by: dict[str, Any] | None = None
    open_windows: list[str] = field(default_factory=list)
    problem: str | None = None
    action: str | None = None
    history: deque = field(default_factory=lambda: deque(maxlen=12))  # (time, temperature at the point)
    heating_since: float | None = None
    setting: Setting | None = None
    segments: list[Segment] = field(default_factory=list)
    signals: list[dict[str, Any]] = field(default_factory=list)
    unavailable_since: datetime | None = None

    @property
    def preset_modes(self) -> list[str]:
        return [*PRESET_DEFAULTS, *self.custom_presets]


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def _round_step(v: float, step: float) -> float:
    return round(round(v / step) * step, 2)


class HeatZones:
    """All zones of the config entry."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self._store: Store = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}")
        self._stored: dict[str, dict[str, Any]] = {}
        self.zones: dict[str, Zone] = {}
        self.areas: dict[str, Area] = {}
        self.outside = Outside(hass)
        self._listeners: dict[str, list[Callable[[], None]]] = {}
        self._unsubs: list[CALLBACK_TYPE] = []
        self._recalc_timer: CALLBACK_TYPE | None = None
        self._reload_timer: CALLBACK_TYPE | None = None
        self._window_timer: CALLBACK_TYPE | None = None
        self._boundary_timer: CALLBACK_TYPE | None = None
        self._tracked: set[str] = set()
        self._trv_ids: set[str] = set()
        self._lock = asyncio.Lock()
        self._windows: dict[str, dict[str, Any]] = {}  # model learning windows
        self._valves: dict[str, dict[str, Any]] = {}  # valve guard

    # ——— Life cycle ———
    async def async_setup(self) -> None:
        data = await self._store.async_load() or {}
        self._stored = data.get("zones", {})
        self.outside.sensor = self.entry.options.get("outdoor_sensor") or None
        self.outside.weather = self.entry.options.get("weather") or best_weather(self.hass)
        self.build()
        tracked: set[str] = set()
        for z in self.zones.values():
            tracked.update(t.entity_id for t in z.trvs)
            tracked.update(x for x in z.sensors.values() if x)
            tracked.update(z.openings)
        self._trv_ids = {t.entity_id for z in self.zones.values() for t in z.trvs}
        if tracked:
            self._unsubs.append(async_track_state_change_event(self.hass, sorted(tracked), self._state_changed))
        self._tracked = tracked
        self._unsubs.append(async_track_time_interval(self.hass, self._tick, TICK))
        self._unsubs.append(async_track_time_interval(self.hass, self.outside.refresh_forecast, timedelta(minutes=30)))
        self._unsubs.append(self.hass.bus.async_listen(er.EVENT_ENTITY_REGISTRY_UPDATED, self._entity_registry_updated))
        self._unsubs.append(self.hass.bus.async_listen(dr.EVENT_DEVICE_REGISTRY_UPDATED, self._device_registry_updated))

        @callback
        def after_start(_now: Any = None) -> None:
            self.hass.async_create_background_task(self._after_start(), f"{DOMAIN}: history and forecast")

        self._unsubs.append(async_call_later(self.hass, 5, after_start))
        self.schedule_recalc(2)

    async def _after_start(self) -> None:
        await self.outside.refresh_forecast()
        from .history import bootstrap

        try:
            await bootstrap(self)
        except Exception:  # without history the model learns from zero
            LOGGER.warning("Could not start the thermal model from history", exc_info=True)

    async def async_unload(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        for timer in (self._recalc_timer, self._reload_timer, self._window_timer, self._boundary_timer):
            if timer:
                timer()
        await self._store.async_save(self._data())

    async def async_remove(self) -> None:
        await self._store.async_remove()

    def _data(self) -> dict[str, Any]:
        for z in self.zones.values():
            self._stored[z.id] = z.state
        return {"zones": self._stored}

    @callback
    def save_later(self) -> None:
        self._store.async_delay_save(self._data, SAVE_DELAY)

    # ——— Building zones from subentries and registries ———
    @callback
    def build(self) -> None:
        self.areas = area_map(self.hass)
        self.zones = {}
        for sub in self.entry.subentries.values():
            if sub.subentry_type != SUBENTRY_ZONE:
                continue
            try:
                zone = self._zone(sub.subentry_id, sub.title, dict(sub.data))
            except Exception:
                LOGGER.exception("Zone %s could not be built", sub.title)
                continue
            if zone is not None:
                self.zones[zone.id] = zone

    def _zone(self, zid: str, title: str, cfg: dict[str, Any]) -> Zone | None:
        areas = [a for a in cfg.get("areas") or [] if a in self.areas]
        registry = er.async_get(self.hass)
        thermostats = [
            t
            for t in cfg.get("thermostats") or []
            if t and ((e := registry.async_get(t)) is None or e.platform != DOMAIN)  # never another zone
        ]
        if not thermostats:
            thermostats = [t for a in areas for t in self.areas[a].thermostats]
        taken = {t.entity_id for z in self.zones.values() for t in z.trvs}
        if used := [t for t in thermostats if t in taken]:
            LOGGER.warning("Zone %s: %s already belong to another zone", title, ", ".join(used))
            thermostats = [t for t in thermostats if t not in taken]
        if not thermostats:
            LOGGER.warning("Zone %s has no thermostat", title)
            return None
        if not areas:
            areas = [a for t in thermostats if (a := area_of_entity(self.hass, t)) and a in self.areas][:1]
        if not areas:
            LOGGER.warning("Zone %s has no area", title)
            return None
        main = next((a for t in thermostats if (a := area_of_entity(self.hass, t)) in areas), areas[0])
        configured = cfg.get("sensors") or {}
        sensors = {a: (configured.get(a) or self.areas[a].sensor) for a in areas}
        with_sensor = [a for a in areas if sensors.get(a)]
        options = with_sensor + ([AVERAGE, COLDEST] if len(with_sensor) > 1 else [])
        limits = {}
        for a, v in (cfg.get("limits") or {}).items():
            if a in areas and (x := number(v)) is not None:
                limits[a] = x
        windows = cfg.get("windows")
        openings = list(windows) if windows else [x for a in areas for x in self.areas[a].openings]
        presets = {k: float((cfg.get("presets") or {}).get(k, v)) for k, v in PRESET_DEFAULTS.items()}
        custom: list[str] = []
        for p in cfg.get("custom_presets") or []:
            name = str(p.get("name") or "").strip()
            if name and name not in presets and (t := number(p.get("temperature"))) is not None:
                presets[name] = t
                custom.append(name)
        mode = cfg.get("control_mode") or MODE_AUTO
        inputs, selects, valves = (
            cfg.get("external_inputs") or [],
            cfg.get("sensor_selects") or [],
            cfg.get("valve_limits") or [],
        )
        trvs = []
        for i, eid in enumerate(thermostats):
            ext = pick_for(self.hass, eid, inputs, i, len(thermostats)) or companion(
                self.hass, eid, EXTERNAL_INPUT_SUFFIXES
            )
            sel = pick_for(self.hass, eid, selects, i, len(thermostats)) or companion(
                self.hass, eid, SENSOR_SELECT_SUFFIXES
            )
            valve = pick_for(self.hass, eid, valves, i, len(thermostats)) or companion(
                self.hass, eid, VALVE_LIMIT_SUFFIXES
            )
            resolved = self._mode(mode, ext is not None, bool(with_sensor))
            trvs.append(
                Trv(
                    eid,
                    resolved,
                    sensor_select=sel,
                    external_input=ext if resolved == MODE_ROOM_SENSOR else None,
                    valve_limit=valve,
                    calibrate=companion(self.hass, eid, CALIBRATE_SUFFIXES),
                )
            )
        state = dict(self._stored.get(zid, {}))
        first = self.hass.states.get(thermostats[0])
        state.setdefault("hvac", "off" if first is not None and first.state == "off" else "heat")
        if not isinstance(state.get("manual"), dict):
            t0 = number(first.attributes.get("temperature")) if first else None
            state["manual"] = {"temperature": t0 if t0 is not None else presets["comfort"], "preset_mode": None}
        state.setdefault("hold", None)
        if not isinstance(state.get("schedule"), dict):
            state["schedule"] = {"enabled": True, "weekly": []}
        state.setdefault("overrides", [])
        if state.get("measure_at") not in options:
            state["measure_at"] = cfg.get("measure_at") if cfg.get("measure_at") in options else (options or [None])[0]
        state.setdefault("window_paused", False)
        state.setdefault("learning", {})
        state.setdefault("preheat", None)
        return Zone(
            id=zid,
            name=title,
            areas=areas,
            area_names={a: self.areas[a].name for a in areas},
            main_area=main,
            trvs=trvs,
            sensors=sensors,
            limits=limits,
            openings=openings,
            measure_options=options,
            presets=presets,
            custom_presets=custom,
            cfg=cfg,
            state=state,
        )

    @staticmethod
    def _mode(configured: str, has_input: bool, has_sensor: bool) -> str:
        if configured == MODE_OWN or not has_sensor:
            return MODE_OWN
        if configured == MODE_OFFSET:
            return MODE_OFFSET
        return MODE_ROOM_SENSOR if has_input else MODE_OFFSET

    # ——— Listeners ———
    @callback
    def listen(self, zid: str, cb: Callable[[], None]) -> CALLBACK_TYPE:
        self._listeners.setdefault(zid, []).append(cb)

        @callback
        def remove() -> None:
            if cb in self._listeners.get(zid, []):
                self._listeners[zid].remove(cb)

        return remove

    @callback
    def _notify(self, zid: str) -> None:
        for cb in list(self._listeners.get(zid, [])):
            cb()

    @callback
    def schedule_recalc(self, delay: float = 5) -> None:
        if self._recalc_timer:
            return

        @callback
        def run(_now: datetime) -> None:
            self._recalc_timer = None
            self.hass.async_create_task(self.recalc(), eager_start=True)

        self._recalc_timer = async_call_later(self.hass, delay, run)

    @callback
    def _state_changed(self, event: Event[EventStateChangedData]) -> None:
        eid = event.data["entity_id"]
        if eid in self._trv_ids:
            self._thermostat_changed(event)
        new = event.data["new_state"]
        if new and new.state == "on" and any(eid in z.openings for z in self.zones.values()):
            # a window counts only after its delay — then recalculate again
            if self._window_timer:
                self._window_timer()
            delay = max(z.cfg.get("window_delay", WINDOW_DELAY) for z in self.zones.values() if eid in z.openings)

            @callback
            def later(_now: datetime) -> None:
                self._window_timer = None
                self.schedule_recalc(0)

            self._window_timer = async_call_later(self.hass, float(delay) * 60 + 5, later)
        self.schedule_recalc()

    @callback
    def _thermostat_changed(self, event: Event[EventStateChangedData]) -> None:
        """Somebody turned the knob or set the thermostat outside the zone — the zone takes over the change."""
        old, new = event.data["old_state"], event.data["new_state"]
        if not old or not new or old.state in UNAVAILABLE or new.state in UNAVAILABLE:
            return
        for z in self.zones.values():
            trv = next((x for x in z.trvs if x.entity_id == event.data["entity_id"]), None)
            if trv is None:
                continue
            now = time.monotonic()
            t_old, t_new = number(old.attributes.get("temperature")), number(new.attributes.get("temperature"))
            if (
                t_new is not None
                and t_new != t_old
                and new.state != "off"
                and not self._ours(trv, "target", t_new, now)
            ):
                target = round((t_new - trv.applied) * 2) / 2
                LOGGER.debug("%s: target %s set on the thermostat", z.name, target)
                self._manual(z, target, None)
                self.save_later()
                self.schedule_recalc(1)
            if new.state != old.state and not self._ours(trv, "hvac", new.state, now):
                if new.state == "off" and not z.state["window_paused"]:
                    z.state["hvac"] = "off"
                elif new.state != "off" and z.state["hvac"] == "off":
                    z.state["hvac"] = "heat"
                self.save_later()
            self._notify(z.id)

    @staticmethod
    def _ours(trv: Trv, kind: str, value: Any, now: float) -> bool:
        """The echo of our command: right after it, or our value arriving later (within 10 min)."""
        sent = trv.sent.get(kind)
        if not sent:
            return False
        if now - sent[1] < ECHO:
            return True
        if isinstance(value, float) and isinstance(sent[0], float):
            same = abs(sent[0] - value) < 0.01
        else:
            same = sent[0] == value
        return same and now - sent[1] < 600

    @callback
    def _entity_registry_updated(self, event: Event[er.EventEntityRegistryUpdatedData]) -> None:
        d = event.data
        eid = d.get("entity_id", "")
        domains = ("climate.", "sensor.", "binary_sensor.", "number.", "select.")
        relevant = {"area_id", "device_id", "disabled_by", "hidden_by"}
        created = d["action"] in ("create", "remove") and eid.startswith(domains)
        if created or (d["action"] == "update" and relevant & set(d.get("changes", {}))):
            self._reload_soon()

    @callback
    def _device_registry_updated(self, event: Event[dr.EventDeviceRegistryUpdatedData]) -> None:
        if event.data["action"] == "update" and "area_id" in event.data.get("changes", {}):
            self._reload_soon()

    @callback
    def _reload_soon(self) -> None:
        """A new thermostat, sensor or another area — zones are built anew (after a moment, once)."""
        if self._reload_timer:
            self._reload_timer()

        @callback
        def now(_now: datetime) -> None:
            self._reload_timer = None
            if self._map_changed():
                self.hass.config_entries.async_schedule_reload(self.entry.entry_id)

        self._reload_timer = async_call_later(self.hass, RELOAD_AFTER, now)

    def _map_changed(self) -> bool:
        new = area_map(self.hass)

        def key(m: dict[str, Area]) -> dict[str, Any]:
            return {a: (o.thermostats, o.sensors, o.sensor, o.openings) for a, o in m.items()}

        if key(new) != key(self.areas):
            return True
        for z in self.zones.values():
            for t in z.trvs:
                if (
                    t.external_input is None
                    and t.mode != MODE_OWN
                    and companion(self.hass, t.entity_id, EXTERNAL_INPUT_SUFFIXES)
                ):
                    return True
        return False

    @callback
    def _tick(self, _now: datetime) -> None:
        self.hass.async_create_task(self.recalc(learn=True), eager_start=True)

    # ——— Program: schedule, overrides, holds ———
    def program(self, z: Zone) -> Program:
        st = z.state
        overrides = [o for x in st.get("overrides") or [] if (o := Override.from_dict(x, parse_time)) is not None]
        manual = st.get("manual") or {}
        return Program(
            presets=z.presets,
            schedule_enabled=bool(st["schedule"].get("enabled", True)),
            weekly=list(st["schedule"].get("weekly") or []),
            overrides=overrides,
            hold=Hold.from_dict(st.get("hold"), parse_time),
            manual=(float(manual.get("temperature", z.presets["comfort"])), manual.get("preset_mode")),
        )

    def _clean(self, z: Zone, now: datetime) -> Program:
        """Drop an expired hold and finished overrides (the hold first: it may end with an override)."""
        p = self.program(z)
        changed = False
        if p.hold is not None and not p.hold_valid(now):
            p.hold, z.state["hold"], changed = None, None, True
        alive = [o for o in p.overrides if o.end > now]
        if len(alive) != len(p.overrides):
            p.overrides = alive
            z.state["overrides"] = [o.stored() for o in alive]
            changed = True
        if changed:
            self.save_later()
        return p

    def _manual(self, z: Zone, temperature: float, preset: str | None, now: datetime | None = None) -> None:
        """A manual change: with the schedule running it holds until the next change (or keeps an explicit hold)."""
        now = now or dt_util.now()
        lo, hi = self.target_range(z)
        temperature = _clamp(round(temperature * 2) / 2 if preset is None else temperature, lo, hi)
        p = self._clean(z, now)
        override_now = any(o.start <= now < o.end for o in p.overrides)
        if not p.schedule_active:
            z.state["manual"] = {"temperature": temperature, "preset_mode": preset}
            z.state["hold"] = Hold(temperature, preset, now).stored() if override_now else None
        else:
            mode, until = HOLD_NEXT, None
            if p.hold is not None and p.hold.mode in (HOLD_UNTIL, HOLD_PERMANENT):
                mode, until = p.hold.mode, p.hold.until
            z.state["hold"] = Hold(temperature, preset, now, mode, until).stored()
        z.state["preheat"] = None
        self.save_later()

    # ——— Control from entities and services ———
    async def set_temperature(self, zid: str, temperature: float, hvac_on: bool | None = None) -> None:
        z = self.zones[zid]
        self._manual(z, temperature, None)
        if hvac_on is not None:
            z.state["hvac"] = "heat" if hvac_on else "off"
        await self.recalc()

    async def set_preset(self, zid: str, preset: str) -> None:
        z = self.zones[zid]
        if preset == "none":
            current = z.setting.temperature if z.setting else z.state["manual"]["temperature"]
            self._manual(z, current, None)
        else:
            self._manual(z, z.presets[preset], preset)
        await self.recalc()

    async def set_hvac(self, zid: str, on: bool) -> None:
        self.zones[zid].state["hvac"] = "heat" if on else "off"
        self.save_later()
        await self.recalc()

    async def set_measure_at(self, zid: str, point: str) -> None:
        z = self.zones[zid]
        if point not in z.measure_options:
            raise ValueError(point)
        z.state["measure_at"] = point
        z.history.clear()
        self._windows.pop(zid, None)
        self.save_later()
        await self.recalc()

    async def set_schedule_enabled(self, zid: str, enabled: bool) -> None:
        z = self.zones[zid]
        now = dt_util.now()
        if not enabled and z.setting is not None:
            # the schedule stops: what the zone holds now stays as the manual target
            z.state["manual"] = {"temperature": z.setting.temperature, "preset_mode": z.setting.preset_mode}
        z.state["schedule"]["enabled"] = enabled
        z.state["hold"] = None
        z.state["preheat"] = None
        self._clean(z, now)
        self.save_later()
        await self.recalc()

    async def set_weekly(self, zid: str, weekly: list[dict[str, Any]]) -> None:
        z = self.zones[zid]
        z.state["schedule"]["weekly"] = weekly
        z.state["preheat"] = None
        self.save_later()
        await self.recalc()

    async def hold(
        self, zid: str, temperature: float | None, preset: str | None, until: datetime | None, permanent: bool
    ) -> None:
        z = self.zones[zid]
        now = dt_util.now()
        if preset is not None:
            value, chosen = z.presets[preset], preset
        elif temperature is not None:
            value, chosen = temperature, None
        else:
            value = z.setting.temperature if z.setting else z.state["manual"]["temperature"]
            chosen = z.setting.preset_mode if z.setting else None
        lo, hi = self.target_range(z)
        value = _clamp(value, lo, hi)
        mode = HOLD_PERMANENT if permanent else HOLD_UNTIL if until is not None else HOLD_NEXT
        z.state["hold"] = Hold(value, chosen, now, mode, until).stored()
        if not self.program(z).schedule_active:
            z.state["manual"] = {"temperature": value, "preset_mode": chosen}
        z.state["preheat"] = None
        self.save_later()
        await self.recalc()

    async def resume(self, zid: str) -> None:
        z = self.zones[zid]
        z.state["hold"] = None
        self.save_later()
        await self.recalc()

    async def add_override(
        self,
        zids: list[str],
        start: datetime,
        end: datetime,
        preset: str | None,
        temperature: float | None,
        reason: str,
        source: str,
        override_id: str | None,
    ) -> str:
        oid = override_id or ulid_util.ulid_now().lower()
        now = dt_util.now()
        for zid in zids:
            z = self.zones[zid]
            value = temperature
            if value is not None:
                lo, hi = self.target_range(z)
                value = _clamp(round(value * 2) / 2, lo, hi)
            o = Override(oid, start, end, preset, value, reason, source, now)
            kept = [x for x in z.state["overrides"] if x.get("override_id") != oid]
            z.state["overrides"] = [*kept, o.stored()]
            z.state["preheat"] = None
        self.save_later()
        await self.recalc()
        return oid

    async def remove_overrides(self, zids: list[str], override_id: str | None, source: str | None) -> int:
        removed = 0
        for zid in zids:
            z = self.zones[zid]
            kept = [
                x
                for x in z.state["overrides"]
                if not (
                    (override_id is not None and x.get("override_id") == override_id)
                    or (source is not None and x.get("source") == source)
                )
            ]
            removed += len(z.state["overrides"]) - len(kept)
            z.state["overrides"] = kept
        if removed:
            self.save_later()
            await self.recalc()
        return removed

    def get_schedule(self, zid: str) -> dict[str, Any]:
        z = self.zones[zid]
        p = self.program(z)
        now = dt_util.now()
        return {
            "enabled": p.schedule_enabled,
            "weekly": [dict(b) for b in p.weekly],
            "overrides": [o.as_dict() for o in sorted(p.overrides, key=lambda o: o.start) if o.end > now],
        }

    def estimate(self, zid: str, temperature: float) -> dict[str, Any]:
        z = self.zones[zid]
        m = z.state["learning"].get("model")
        known = self.outside.temperature is not None or bool(self.outside.forecast)
        if z.current is None:
            return {"minutes": None, "confidence": 0.0}
        power = model.a(m, z.state["learning"].get("rate"))
        minutes = model.minutes_to_reach(m, power, z.current, temperature, dt_util.now(), self.outside.at)
        return {"minutes": minutes, "confidence": model.confidence(m, known)}

    async def reset_learning(self, zid: str) -> None:
        z = self.zones[zid]
        z.state["learning"] = {}
        z.history.clear()
        self._windows.pop(zid, None)
        self.save_later()
        self._notify(zid)

    async def set_valve_limit(self, zid: str, value: float) -> None:
        for trv in self.zones[zid].trvs:
            if trv.valve_limit:
                await self._call("number", "set_value", {"entity_id": trv.valve_limit, "value": value})

    def valve_limit(self, zid: str) -> float | None:
        values = [
            v
            for t in self.zones[zid].trvs
            if t.valve_limit and (st := self.hass.states.get(t.valve_limit)) and (v := number(st.state)) is not None
        ]
        return min(values) if values else None

    def available(self, z: Zone) -> bool:
        """A zone with at least one thermostat that responds."""
        return any((st := self.hass.states.get(t.entity_id)) and st.state not in UNAVAILABLE for t in z.trvs)

    def target_range(self, z: Zone) -> tuple[float, float]:
        """The lowest and highest target every thermostat of the zone accepts."""
        lo, hi = [], []
        for t in z.trvs:
            if st := self.hass.states.get(t.entity_id):
                if (v := number(st.attributes.get("min_temp"))) is not None:
                    lo.append(v)
                if (v := number(st.attributes.get("max_temp"))) is not None:
                    hi.append(v)
        return (max([*lo, MIN_TEMP]), min([*hi, MAX_TEMP]))

    # ——— Recalculation ———
    async def recalc(self, learn: bool = False) -> None:
        """Read and learn every zone, plan its target, drive the thermostats and check the valves."""
        async with self._lock:
            now = dt_util.now()
            self.outside.read()
            for z in list(self.zones.values()):
                try:
                    self._read(z)
                    if learn:
                        self._learn(z, now)
                    self._plan(z, now)
                    await self._drive(z, learn)
                    self._guard(z, now)
                except Exception:  # one zone must not stop the others
                    LOGGER.exception("Zone %s: recalculation failed", z.name)
                self._notify(z.id)
            self._schedule_boundary(now)

    @callback
    def _schedule_boundary(self, now: datetime) -> None:
        """Recalculate exactly when the next segment starts, so targets change on time (not at the next tick)."""
        if self._boundary_timer:
            self._boundary_timer()
            self._boundary_timer = None
        nxt = [z.segments[1].start for z in self.zones.values() if len(z.segments) > 1]
        if not nxt or (at := min(nxt)) - now > TICK:
            return

        @callback
        def run(_now: datetime) -> None:
            self._boundary_timer = None
            self.hass.async_create_task(self.recalc(), eager_start=True)

        self._boundary_timer = async_track_point_in_time(self.hass, run, at + timedelta(seconds=1))

    def _temperature(self, eid: str | None) -> float | None:
        st = self.hass.states.get(eid) if eid else None
        if st is None or st.state in UNAVAILABLE:
            return None
        if dt_util.utcnow() - (last_report(self.hass, eid) or st.last_reported) > STALE:
            return None
        return number(st.state)

    def _read(self, z: Zone) -> None:
        z.temperatures = {a: self._temperature(z.sensors.get(a)) for a in z.areas}
        z.current_room = self.at_point(z, z.temperatures)
        own = [
            v
            for t in z.trvs
            if (st := self.hass.states.get(t.entity_id))
            and st.state not in UNAVAILABLE
            and (v := number(st.attributes.get("current_temperature"))) is not None
        ]
        z.current = z.current_room if z.current_room is not None else (round(mean(own), 2) if own else None)
        now = dt_util.utcnow()
        delay = timedelta(minutes=float(z.cfg.get("window_delay", WINDOW_DELAY)))
        z.open_windows = [
            x
            for x in z.openings
            if (st := self.hass.states.get(x)) and st.state == "on" and now - st.last_changed >= delay
        ]
        actions = [
            st.attributes.get("hvac_action")
            for t in z.trvs
            if (st := self.hass.states.get(t.entity_id)) and st.state not in UNAVAILABLE
        ]
        z.action = "heating" if "heating" in actions or "preheating" in actions else (actions[0] if actions else None)

    def at_point(self, z: Zone, temperatures: dict[str, float | None]) -> float | None:
        point = z.state.get("measure_at")
        values = [v for v in temperatures.values() if v is not None]
        if point == AVERAGE:
            return round(mean(values), 2) if values else None
        if point == COLDEST:
            return min(values) if values else None
        if point is None:
            return None
        if (v := temperatures.get(point)) is not None:
            return v
        # the chosen room's sensor is silent: the other rooms are better than the thermostat's own thermometer
        return round(mean(values), 2) if values else None

    def _plan(self, z: Zone, now: datetime) -> None:
        p = self._clean(z, now)
        segments = p.timeline(now, now + HORIZON)
        sticky = None
        if (
            (pre := z.state.get("preheat"))
            and (a := parse_time(pre.get("for")))
            and (b := parse_time(pre.get("start")))
        ):
            sticky = (a, b)
        start_for = None
        if z.cfg.get("optimum_start", True) and z.state["hvac"] == "heat" and z.current is not None:
            m = z.state["learning"].get("model")
            power = model.a(m, z.state["learning"].get("rate"))
            hours = float(z.cfg.get("preheat_max", PREHEAT_MAX.total_seconds() / 3600))
            earliest = min(timedelta(hours=max(0.0, hours)), PREHEAT_LIMIT)
            current = z.current

            def start_for(at: datetime, target: float, before: float) -> datetime:
                return model.preheat_start(m, power, current, now, at, target, before, self.outside.at, earliest)

        if not z.cfg.get("optimum_start", True) or z.state["hvac"] != "heat":
            sticky = None
        segments, preheat = with_preheat(segments, now, start_for, sticky)
        stored = {"for": preheat[0].isoformat(), "start": preheat[1].isoformat()} if preheat else None
        if stored != z.state.get("preheat"):
            z.state["preheat"] = stored
            self.save_later()
        z.segments = segments
        z.setting = segments[0].setting if segments else Setting(*p.manual, MANUAL)

    # ——— Driving the thermostats ———
    async def _drive(self, z: Zone, learn: bool) -> None:
        assert z.setting is not None
        target = z.setting.temperature
        pause = bool(z.cfg.get("window_pause", True)) and bool(z.open_windows)
        if pause != z.state["window_paused"]:
            z.state["window_paused"] = pause
            self.save_later()
        heat = z.state["hvac"] == "heat" and not pause

        # the room temperature for thermostats: the measuring point, raised by rooms approaching their limit
        z.fed, z.limited_by, z.problem = None, None, None
        needs_room = any(t.mode != MODE_OWN for t in z.trvs)
        if z.current_room is None:
            if needs_room:
                z.problem = "sensor"
        else:
            fed = z.current_room
            for a, limit in z.limits.items():
                t = z.temperatures.get(a)
                if t is None:
                    continue
                candidate = t - (limit - target)
                if candidate > fed + 0.05:
                    fed = candidate
                    z.limited_by = {"area": a, "name": z.area_names[a], "limit": limit, "temperature": t}
            z.fed = round(fed, 1)

        for trv in z.trvs:
            st = self.hass.states.get(trv.entity_id)
            if st is None or st.state in UNAVAILABLE:
                continue
            setpoint = target
            if trv.mode == MODE_ROOM_SENSOR:
                repair = self._needs_repair(trv, st, z.fed)
                if trv.mismatch is not None and trv.repairs >= REPAIR_MAX and z.problem is None:
                    z.problem = "thermostat"  # self-repair does not help — the guard reports it
                if z.fed is not None and trv.external_input:
                    await self._feed(trv, z.fed, force=repair)
                if trv.sensor_select:
                    await self._select(trv, SENSOR_EXTERNAL if z.fed is not None else SENSOR_LOCAL, force=repair)
            elif trv.mode == MODE_OFFSET and z.fed is not None:
                own = number(st.attributes.get("current_temperature"))
                if own is not None and (learn or trv.offset is None):
                    diff = own - z.fed
                    trv.offset = diff if trv.offset is None else trv.offset + OFFSET_SMOOTHING * (diff - trv.offset)
                limit = float(z.cfg.get("offset_max", OFFSET_MAX))
                correction = _clamp(trv.offset or 0.0, -limit, limit)
                if abs(correction - trv.applied) >= 0.3:
                    trv.applied = round(correction, 2)
                setpoint = target + trv.applied
            else:
                trv.applied = 0.0
            if trv.mode != MODE_ROOM_SENSOR and trv.sensor_select:
                await self._select(trv, SENSOR_LOCAL)  # chosen not to use the room input: its own thermometer
            modes = st.attributes.get("hvac_modes") or ["off", "heat"]
            on_mode = "heat" if "heat" in modes else next((m for m in modes if m != "off"), "heat")
            wanted = on_mode if heat else "off"
            if st.state != wanted:
                await self._send(
                    trv, "hvac", wanted, "climate", "set_hvac_mode", {"entity_id": trv.entity_id, "hvac_mode": wanted}
                )
            if heat:
                lo, hi = (
                    number(st.attributes.get("min_temp")) or MIN_TEMP,
                    number(st.attributes.get("max_temp")) or MAX_TEMP,
                )
                step = number(st.attributes.get("target_temp_step")) or 0.5
                value = _clamp(_round_step(setpoint, step), lo, hi)
                if number(st.attributes.get("temperature")) != value:
                    await self._send(
                        trv,
                        "target",
                        value,
                        "climate",
                        "set_temperature",
                        {"entity_id": trv.entity_id, "temperature": value},
                    )

    def _needs_repair(self, trv: Trv, st: State, fed: float | None) -> bool:
        """Self-repair: does the thermostat quietly regulate by its own thermometer — then sensor selection and the
        reading go again, whatever the selection entity shows.

        With the room sensor a TRVZB reports as its own temperature exactly the reading it received. After a firmware
        update thermostats fell back to their own thermometer while Zigbee2MQTT still showed `remote_temperature`;
        the entity proves nothing — the mismatch does. Mismatch of MISMATCH longer than MISMATCH_AFTER → repair,
        then at most every REPAIR_EVERY until they agree; from REPAIR_MAX attempts the zone has a problem.
        """
        now = dt_util.utcnow()
        given = self.hass.states.get(trv.external_input) if trv.external_input else None
        taken = number(given.state) if given is not None and given.state not in UNAVAILABLE else None
        received = taken if taken is not None else trv.fed
        own = number(st.attributes.get("current_temperature"))
        if fed is None or not trv.sensor_select or received is None or own is None or abs(own - received) < MISMATCH:
            if trv.repairs:
                LOGGER.info(
                    "%s regulates by the room temperature again (repair attempts: %d)", trv.entity_id, trv.repairs
                )
            trv.mismatch, trv.mismatch_since, trv.repair_at, trv.repairs = None, None, None, 0
            return False
        trv.mismatch = (own, received)
        if trv.mismatch_since is None:
            trv.mismatch_since = now
        if now - trv.mismatch_since < MISMATCH_AFTER or (
            trv.repair_at is not None and now - trv.repair_at < REPAIR_EVERY
        ):
            return False
        trv.repair_at = now
        trv.repairs += 1
        (LOGGER.warning if trv.repairs <= REPAIR_MAX else LOGGER.debug)(
            "%s regulates by its own thermometer (%.1f°, room %.1f°) — selecting the room sensor again (attempt %d)",
            trv.entity_id,
            own,
            received,
            trv.repairs,
        )
        return True

    async def _feed(self, trv: Trv, value: float, force: bool = False) -> None:
        now = time.monotonic()
        if (
            not force
            and trv.fed is not None
            and abs(trv.fed - value) < 0.1
            and now - trv.fed_at < REFRESH_SENT.total_seconds()
        ):
            return
        trv.fed, trv.fed_at = value, now
        assert trv.external_input is not None
        await self._call("number", "set_value", {"entity_id": trv.external_input, "value": _clamp(value, 0.0, 99.9)})

    async def _select(self, trv: Trv, option: str, force: bool = False) -> None:
        assert trv.sensor_select is not None
        st = self.hass.states.get(trv.sensor_select)
        if st is None:
            return
        if force:
            trv.sent.pop("select", None)
        elif st.state == option or (option == SENSOR_EXTERNAL and st.state == SENSOR_OFFLINE and trv.fed is None):
            return
        await self._send(
            trv, "select", option, "select", "select_option", {"entity_id": trv.sensor_select, "option": option}
        )

    async def _send(self, trv: Trv, kind: str, value: Any, domain: str, service: str, data: dict[str, Any]) -> None:
        """A command to a thermostat; the same one is repeated only after RETRY_AFTER (radio links lose messages)."""
        now = time.monotonic()
        sent = trv.sent.get(kind)
        if sent and sent[0] == value and now - sent[1] < RETRY_AFTER:
            return
        trv.sent[kind] = (value, now)
        await self._call(domain, service, data)

    async def _call(self, domain: str, service: str, data: dict[str, Any]) -> None:
        try:
            await self.hass.services.async_call(domain, service, data, blocking=False)
        except Exception:
            LOGGER.warning("Command %s.%s %s failed", domain, service, data, exc_info=True)

    # ——— Learning ———
    def _learn(self, z: Zone, now: datetime) -> None:
        self._learn_model(z, now)
        n = z.state.setdefault("learning", {})
        mono = time.monotonic()
        if z.state["hvac"] == "heat" and not z.state["window_paused"]:
            main = z.temperatures.get(z.main_area)
            offsets = n.setdefault("offsets", {})
            if main is not None and len(z.areas) > 1:
                n.setdefault("since", dt_util.utcnow().isoformat())
                samples = n.get("samples", 0)
                alpha = max(0.02, 1 / (samples + 1))
                for a in z.areas:
                    t = z.temperatures.get(a)
                    if a == z.main_area or t is None:
                        continue
                    d = t - main
                    offsets[a] = round(d if a not in offsets else offsets[a] + alpha * (d - offsets[a]), 3)
                n["samples"] = samples + 1

        # heating rate at the measuring point: the gain over the last half hour of continuous heating
        if z.action == "heating" and z.current_room is not None:
            z.heating_since = z.heating_since or mono
            z.history.append((mono, z.current_room))
            old = [h for h in z.history if mono - h[0] >= 1700]
            if old and mono - z.heating_since >= 1800:
                t0, v0 = old[-1]
                rate = (z.current_room - v0) / ((mono - t0) / 3600)
                if rate > 0.05:
                    previous = n.get("rate")
                    n["rate"] = round(rate if previous is None else previous + 0.2 * (rate - previous), 3)
                    n.setdefault("since", dt_util.utcnow().isoformat())
        else:
            z.heating_since = None
            z.history.clear()
        self.save_later()

    def _learn_model(self, z: Zone, now: datetime) -> None:
        n = z.state.setdefault("learning", {})
        m = n.setdefault("model", {})
        temp = z.current_room
        if temp is None or z.state["window_paused"] or z.open_windows:
            self._windows.pop(z.id, None)
            return
        t = now.timestamp()
        u = 1.0 if z.state["hvac"] == "heat" and z.action == "heating" else 0.0
        out, w = self.outside.at(now)
        window = self._windows.get(z.id)
        point = z.state.get("measure_at")
        target = z.setting.temperature if z.setting else None
        if window is None or window.get("point") != point:
            self._windows[z.id] = {**model.new_window(t, temp, u, out, w, target), "point": point}
            return
        model.add(window, t, temp, u, out, w, target)
        if model.ready(window):
            if what := model.learn(m, window):
                LOGGER.debug("%s model %s → %s", z.name, what, model.describe(m))
                n.setdefault("since", dt_util.utcnow().isoformat())
            self._windows[z.id] = {**model.new_window(t, temp, u, out, w, target), "point": point}

    def offset_of(self, z: Zone, point: str | None) -> float | None:
        """How much the point differs from the room with the radiator (learned)."""
        n = z.state.get("learning", {})
        if n.get("samples", 0) < LEARNING_CONFIDENT or point is None:
            return None
        r = {**n.get("offsets", {}), z.main_area: 0.0}
        if point == AVERAGE:
            return mean(r[a] for a in z.areas if a in r)
        if point == COLDEST:
            return min(r[a] for a in z.areas if a in r)
        return r.get(point)

    # ——— Valve guard and signals ———
    def _valve_open(self, z: Zone) -> float:
        result = 0.0
        for t in z.trvs:
            st = self.hass.states.get(t.entity_id)
            if st is None or st.attributes.get("hvac_action") not in ("heating", "preheating"):
                continue
            pos = None
            if t.valve_limit and (vs := self.hass.states.get(t.valve_limit)) is not None:
                pos = number(vs.state)
            result = max(result, 100.0 if pos is None else pos)
        return result

    def _valve_stuck(self, z: Zone, now: datetime) -> datetime | None:
        """Since when the valve stands open while the room with the radiator has not risen at all (or None).

        A sensor hangs across the room from the radiator: right after the valve opens the room may still get
        colder and the heat reaches the sensor after an hour. So the rise counts from the lowest reading after
        opening, and a room that rose once proves the valve works — until it closes.
        """
        temp = z.temperatures.get(z.main_area)
        if temp is None:
            temp = z.current_room
        is_open = z.state["hvac"] == "heat" and not z.state["window_paused"] and self._valve_open(z) >= VALVE_OPEN
        if not is_open or temp is None:
            self._valves.pop(z.id, None)
            return None
        v = self._valves.setdefault(z.id, {"since": now, "low": temp, "works": False})
        v["low"] = min(v["low"], temp)
        if v["works"] or temp - v["low"] >= VALVE_RISE:
            v["works"] = True
            return None
        if z.setting is not None and temp >= z.setting.temperature - NEAR_TARGET:
            return None  # just below the target the valve throttles although the thermostat says "heating"
        return v["since"] if now - v["since"] >= VALVE_AFTER else None

    def _name(self, eid: str, fallback: str) -> str:
        st = self.hass.states.get(eid)
        return (st.name if st else None) or fallback

    def _guard(self, z: Zone, now: datetime) -> None:
        signals: list[dict[str, Any]] = []
        group = f"{DOMAIN}_{z.id}"

        def signal(
            kind: str, title: str, severity: int, category: str, need: str, description: str | None = None
        ) -> None:
            s: dict[str, Any] = {
                "id": f"{DOMAIN}_{z.id}_{kind}",
                "title": title,
                "severity": severity,
                "category": category,
                "need": need,
                "group": group,
            }
            if description:
                s["description"] = description
            signals.append(s)

        if not self.available(z):
            z.unavailable_since = z.unavailable_since or now
            if now - z.unavailable_since >= timedelta(minutes=15):
                z.problem = z.problem or "unavailable"
                when = i18n.since(self.hass, z.unavailable_since, now)
                signal(
                    "unavailable",
                    i18n.text(self.hass, "signal.unavailable", zone=z.name, since=when),
                    2,
                    "system",
                    "admin",
                )
        else:
            z.unavailable_since = None

        if (since := self._valve_stuck(z, now)) is not None and z.problem is None:
            z.problem = "valve"
            trv = next(
                (
                    t
                    for t in z.trvs
                    if (st := self.hass.states.get(t.entity_id)) and st.attributes.get("hvac_action") == "heating"
                ),
                z.trvs[0],
            )
            title = i18n.text(
                self.hass,
                "signal.valve",
                thermostat=self._name(trv.entity_id, z.name),
                since=i18n.since(self.hass, since, now),
            )
            signal(
                f"valve_{trv.entity_id.split('.', 1)[1]}",
                title,
                2,
                "maintenance",
                "member",
                i18n.text(self.hass, "signal.valve.description"),
            )

        out = self.outside.temperature
        if z.state["hvac"] == "heat":
            after = WINDOW_SIGNAL_COLD if out is not None and out <= FREEZING else WINDOW_SIGNAL
            for x in z.openings:
                st = self.hass.states.get(x)
                if st is not None and st.state == "on" and dt_util.utcnow() - st.last_changed >= after:
                    since = dt_util.as_local(st.last_changed)
                    extra = (
                        i18n.text(self.hass, "signal.window.outside", temperature=i18n.degrees(self.hass, out))
                        if out is not None
                        else ""
                    )
                    title = i18n.text(
                        self.hass,
                        "signal.window",
                        window=st.name,
                        since=i18n.since(self.hass, since, now),
                        outside=extra,
                    )
                    signal("window", title, 2 if out is not None and out <= FREEZING else 1, "energy", "member")
                    break

        for t in z.trvs:
            if t.mode != MODE_ROOM_SENSOR:
                continue
            name = self._name(t.entity_id, z.name)
            key = f"thermostat_{t.entity_id.split('.', 1)[1]}"
            if (
                t.sensor_select
                and (st := self.hass.states.get(t.sensor_select)) is not None
                and st.state == SENSOR_OFFLINE
            ):
                when = i18n.since(self.hass, dt_util.as_local(st.last_changed), now)
                signal(key, i18n.text(self.hass, "signal.offline", thermostat=name, since=when), 1, "system", "admin")
            elif t.mismatch is not None and t.mismatch_since is not None and t.repairs >= REPAIR_MAX:
                when = i18n.since(self.hass, dt_util.as_local(t.mismatch_since), now)
                own, room = (i18n.degrees(self.hass, v) for v in t.mismatch)
                signal(
                    key,
                    i18n.text(self.hass, "signal.repair", thermostat=name, since=when, own=own, room=room),
                    1,
                    "system",
                    "admin",
                )

        for a, sensor in z.sensors.items():
            if not sensor or (st := self.hass.states.get(sensor)) is None:
                continue
            if st.state in UNAVAILABLE:
                since = dt_util.as_local(st.last_changed)
            elif dt_util.utcnow() - (report := last_report(self.hass, sensor) or st.last_reported) > STALE:
                since = dt_util.as_local(report)
            else:
                continue
            title = i18n.text(
                self.hass, "signal.sensor", room=z.area_names.get(a, a), since=i18n.since(self.hass, since, now)
            )
            signal(f"sensor_{a}", title, 1, "maintenance", "member", i18n.text(self.hass, "signal.sensor.description"))
        z.signals = signals

    # ——— Attributes ———
    def reason(self, z: Zone) -> str | None:
        s = z.setting
        if s is None:
            return None
        if z.state["hvac"] != "heat":
            return i18n.text(self.hass, "reason.off")
        if z.state["window_paused"]:
            return i18n.text(self.hass, "reason.window")
        if s.source == OVERRIDE:
            return s.reason or i18n.text(self.hass, "reason.override")
        if s.source == PREHEAT and len(z.segments) > 1:
            at = z.segments[0].end
            target = i18n.target_label(self.hass, s.temperature, s.preset_mode)
            return i18n.text(self.hass, "reason.preheat", target=target, time=i18n.clock(dt_util.as_local(at)))
        if s.source == HOLD:
            if s.hold_mode == HOLD_PERMANENT:
                return i18n.text(self.hass, "reason.hold_permanent")
            if s.hold_mode == HOLD_UNTIL and (h := self.program(z).hold) and h.until:
                return i18n.text(
                    self.hass, "reason.hold_until", time=i18n.since(self.hass, dt_util.as_local(h.until), dt_util.now())
                )
            return i18n.text(self.hass, "reason.hold")
        return i18n.text(self.hass, f"reason.{s.source}")

    def next_change(self, z: Zone) -> dict[str, Any] | None:
        if z.state["hvac"] != "heat" or len(z.segments) < 2:
            return None
        seg = z.segments[1]
        return {
            "at": seg.start.isoformat(),
            "temperature": seg.setting.temperature,
            "preset_mode": seg.setting.preset_mode,
            "source": seg.setting.source,
            "reason": seg.setting.reason,
        }

    def _true_start(self, z: Zone, seg: Segment, p: Program) -> datetime:
        """When the first segment really began (the timeline starts now)."""
        s = seg.setting
        if s.source == SCHEDULE and (found := block_at(p.weekly, seg.start)):
            return found[0]
        if s.source == OVERRIDE and (o := next((o for o in p.overrides if o.override_id == s.override_id), None)):
            return o.start
        if s.source == HOLD and p.hold is not None:
            return p.hold.set_at
        if s.source == PREHEAT and (pre := z.state.get("preheat")) and (t := parse_time(pre.get("start"))):
            return t
        return seg.start

    def plan(self, z: Zone) -> list[dict[str, Any]]:
        """`homeai_plan`: what the zone will hold over the next 36 h (schedule, overrides, holds, preheat)."""
        if z.state["hvac"] != "heat" or not z.segments:
            return []
        p = self.program(z)
        result = []
        for i, seg in enumerate(z.segments):
            s = seg.setting
            if s.source == MANUAL:
                continue
            target = i18n.target_label(self.hass, s.temperature, s.preset_mode)
            if s.source == PREHEAT:
                title = i18n.text(self.hass, "plan.preheat", zone=z.name, target=target)
            elif s.source == OVERRIDE and s.reason:
                title = i18n.text(self.hass, "plan.reason", zone=z.name, target=target, reason=s.reason)
            elif s.source == HOLD:
                title = i18n.text(self.hass, "plan.hold", zone=z.name, target=target)
            else:
                title = i18n.text(self.hass, "plan", zone=z.name, target=target)
            start = self._true_start(z, seg, p) if i == 0 else seg.start
            result.append(
                {
                    "start": dt_util.as_local(start).isoformat(),
                    "end": dt_util.as_local(seg.end).isoformat(),
                    "title": title,
                }
            )
            if len(result) >= PLAN_MAX:
                break
        return result

    def rooms(self, z: Zone) -> list[dict[str, Any]]:
        target = z.setting.temperature if z.setting else None
        d_point = self.offset_of(z, z.state.get("measure_at"))
        main_limit = z.limits.get(z.main_area)
        result = []
        for a in z.areas:
            predicted = None
            if target is not None and d_point is not None and (d_a := self.offset_of(z, a)) is not None:
                t_main = target - d_point
                if main_limit is not None:
                    t_main = min(t_main, main_limit)
                predicted = round(t_main + d_a, 1)
            result.append(
                {
                    "area": a,
                    "name": z.area_names[a],
                    "temperature": z.temperatures.get(a),
                    "sensor": z.sensors.get(a),
                    "limit": z.limits.get(a),
                    "offset": (
                        round(o, 1) if (o := (z.state["learning"].get("offsets") or {}).get(a)) is not None else None
                    ),
                    "predicted": predicted,
                }
            )
        return result

    def max_reachable(self, z: Zone) -> float | None:
        """The highest the point gets when the room with the radiator stops at its limit (from learning)."""
        if z.setting is None:
            return None
        d_point = self.offset_of(z, z.state.get("measure_at"))
        main_limit = z.limits.get(z.main_area)
        if d_point is None or main_limit is None or not any(t.mode != MODE_OWN for t in z.trvs):
            return None
        if z.setting.temperature > main_limit + d_point + 0.05:
            return round(main_limit + d_point, 1)
        return None

    def reach_at(self, z: Zone) -> str | None:
        """When the target is expected at the measuring point (from the model)."""
        s = z.setting
        if s is None or z.state["hvac"] != "heat" or z.state["window_paused"] or z.current is None:
            return None
        if s.temperature - z.current <= 0.15 or self.max_reachable(z) is not None:
            return None
        minutes = self.estimate(z.id, s.temperature)["minutes"]
        if minutes is None:
            return None
        return (dt_util.now() + timedelta(minutes=minutes)).isoformat()

    def attributes(self, z: Zone) -> dict[str, Any]:
        s = z.setting
        p = self.program(z)
        hold = None
        if s is not None and s.source == HOLD and p.hold is not None:
            hold = {"mode": p.hold.mode, "until": (end.isoformat() if (end := p.hold_end()) else None)}
        return {
            "areas": z.areas,
            "measure_at": z.state.get("measure_at"),
            "measure_options": z.measure_options,
            "rooms": self.rooms(z),
            "thermostats": [{"entity_id": t.entity_id, "mode": t.mode} for t in z.trvs],
            "room_temperature_sent": z.fed,
            "limited_by": z.limited_by,
            "max_reachable": self.max_reachable(z),
            "reach_at": self.reach_at(z),
            "window_pause": bool(z.state["window_paused"]),
            "open_windows": z.open_windows,
            "problem": z.problem,
            "source": s.source if s else None,
            "reason": self.reason(z),
            "override_id": s.override_id if s else None,
            "hold": hold,
            "schedule_enabled": p.schedule_enabled,
            "preset_temperatures": dict(z.presets),
            "next_change": self.next_change(z),
            "homeai_schedule": HOMEAI_SCHEDULE,
            "homeai_plan": self.plan(z),
            "homeai_signals": z.signals,
        }

    def learning(self, z: Zone) -> dict[str, Any]:
        n = z.state.get("learning", {})
        m = n.get("model")
        known = self.outside.temperature is not None or bool(self.outside.forecast)
        return {
            "since": n.get("since"),
            "samples": n.get("samples", 0),
            "offsets": {a: round(v, 1) for a, v in (n.get("offsets") or {}).items()},
            "rate": n.get("rate"),
            "model": model.describe(m),
            "confidence": model.confidence(m, known),
        }
