"""`sensor.<zone>_next_change` and diagnostic sensors of learning and the thermal model."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.const import PERCENTAGE, EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from . import HeatZonesConfigEntry
from .engine import HeatZones, Zone
from .entity import ZoneEntity

RATE = "°C/h"


@dataclass(frozen=True)
class Diagnostic:
    key: str
    unit: str | None
    value: Callable[[dict[str, Any]], Any]
    attributes: Callable[[dict[str, Any]], dict[str, Any]]
    precision: int | None = None


DIAGNOSTICS = (
    Diagnostic("heating_rate", RATE, lambda n: n["rate"], lambda n: {"since": n["since"]}, 2),
    Diagnostic(
        "cooling_rate",
        "1/h",
        lambda n: n["model"]["k"],
        lambda n: {"wind_factor": n["model"]["kw"], "windows": n["model"]["samples_k"], "source": n["model"]["source"]},
        4,
    ),
    Diagnostic(
        "heating_power",
        RATE,
        lambda n: n["model"]["a"],
        lambda n: {"windows": n["model"]["samples_a"], "source": n["model"]["source"]},
        2,
    ),
    Diagnostic(
        "model_confidence",
        PERCENTAGE,
        lambda n: round(n["confidence"] * 100),
        lambda n: {"learned": n["model"]["learned"], "history": n["model"].get("history")},
        0,
    ),
    Diagnostic(
        "room_samples",
        None,
        lambda n: n["samples"],
        lambda n: {"offsets": n["offsets"]},
        0,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: HeatZonesConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    engine = entry.runtime_data
    for zone in engine.zones.values():
        entities: list[SensorEntity] = [NextChange(engine, zone)]
        entities.extend(LearningSensor(engine, zone, d) for d in DIAGNOSTICS)
        async_add_entities(entities, config_subentry_id=zone.id)


class NextChange(ZoneEntity, SensorEntity):
    """When the target changes next (schedule, override, end of a hold, preheat), to what and why."""

    _attr_translation_key = "next_change"
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, engine: HeatZones, zone: Zone) -> None:
        super().__init__(engine, zone, "next_change")

    @property
    def native_value(self) -> datetime | None:
        nxt = self._engine.next_change(self.zone)
        return dt_util.parse_datetime(nxt["at"]) if nxt else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        nxt = self._engine.next_change(self.zone) or {}
        return {k: nxt.get(k) for k in ("temperature", "preset_mode", "source", "reason")}


class LearningSensor(ZoneEntity, SensorEntity):
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, engine: HeatZones, zone: Zone, d: Diagnostic) -> None:
        super().__init__(engine, zone, d.key)
        self._d = d
        self._attr_translation_key = d.key
        self._attr_native_unit_of_measurement = d.unit
        self._attr_suggested_display_precision = d.precision

    @property
    def native_value(self) -> Any:
        return self._d.value(self._engine.learning(self.zone))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return self._d.attributes(self._engine.learning(self.zone))
