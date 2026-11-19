"""`binary_sensor.<zone>_problem` (something needs attention) and `binary_sensor.<zone>_window_pause`."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import HeatZonesConfigEntry
from .engine import HeatZones, Zone
from .entity import ZoneEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: HeatZonesConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    engine = entry.runtime_data
    for zone in engine.zones.values():
        async_add_entities([ProblemSensor(engine, zone), WindowPauseSensor(engine, zone)], config_subentry_id=zone.id)


class ProblemSensor(ZoneEntity, BinarySensorEntity):
    _attr_translation_key = "problem"
    _attr_device_class = BinarySensorDeviceClass.PROBLEM

    def __init__(self, engine: HeatZones, zone: Zone) -> None:
        super().__init__(engine, zone, "problem")

    @property
    def is_on(self) -> bool:
        return bool(self.zone.problem or self.zone.signals)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"problem": self.zone.problem, "signals": [s["title"] for s in self.zone.signals]}


class WindowPauseSensor(ZoneEntity, BinarySensorEntity):
    _attr_translation_key = "window_pause"

    def __init__(self, engine: HeatZones, zone: Zone) -> None:
        super().__init__(engine, zone, "window_pause")

    @property
    def is_on(self) -> bool:
        return bool(self.zone.state["window_paused"])

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"open_windows": self.zone.open_windows}
