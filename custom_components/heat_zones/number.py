"""`number.<zone>_valve_limit`: how far the valves open while heating — when the thermostats have such a setting."""

from __future__ import annotations

from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.const import PERCENTAGE, EntityCategory
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
        if any(t.valve_limit for t in zone.trvs):
            async_add_entities([ValveLimit(engine, zone)], config_subentry_id=zone.id)


class ValveLimit(ZoneEntity, NumberEntity):
    _attr_translation_key = "valve_limit"
    _attr_entity_category = EntityCategory.CONFIG
    _attr_native_min_value = 0
    _attr_native_max_value = 100
    _attr_native_step = 1
    _attr_native_unit_of_measurement = PERCENTAGE
    _attr_mode = NumberMode.SLIDER

    def __init__(self, engine: HeatZones, zone: Zone) -> None:
        super().__init__(engine, zone, "valve_limit")

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        from homeassistant.helpers.event import async_track_state_change_event

        entities = [t.valve_limit for t in self.zone.trvs if t.valve_limit]
        self.async_on_remove(
            async_track_state_change_event(self.hass, entities, lambda _event: self.async_write_ha_state())
        )

    @property
    def native_value(self) -> float | None:
        return self._engine.valve_limit(self._zid)

    async def async_set_native_value(self, value: float) -> None:
        await self._engine.set_valve_limit(self._zid, value)
