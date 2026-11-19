"""`switch.<zone>_schedule`: the zone follows its weekly schedule (on) or only manual changes (off)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
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
        async_add_entities([ScheduleSwitch(engine, zone)], config_subentry_id=zone.id)


class ScheduleSwitch(ZoneEntity, SwitchEntity):
    _attr_translation_key = "schedule"

    def __init__(self, engine: HeatZones, zone: Zone) -> None:
        super().__init__(engine, zone, "schedule")

    @property
    def is_on(self) -> bool:
        return bool(self.zone.state["schedule"].get("enabled", True))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"blocks": len(self.zone.state["schedule"].get("weekly") or [])}

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self._engine.set_schedule_enabled(self._zid, True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self._engine.set_schedule_enabled(self._zid, False)
