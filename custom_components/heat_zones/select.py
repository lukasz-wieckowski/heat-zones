"""`select.<zone>_measure_at`: where the zone measures — a room, the average or the coldest room."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import HeatZonesConfigEntry
from .const import AVERAGE, COLDEST
from .engine import HeatZones, Zone
from .entity import ZoneEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: HeatZonesConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    engine = entry.runtime_data
    for zone in engine.zones.values():
        if len(zone.measure_options) > 1:
            async_add_entities([MeasureAtSelect(engine, zone)], config_subentry_id=zone.id)


class MeasureAtSelect(ZoneEntity, SelectEntity):
    """Options are room names (as Home Assistant shows them) plus the translated `average` and `coldest`."""

    _attr_translation_key = "measure_at"

    def __init__(self, engine: HeatZones, zone: Zone) -> None:
        super().__init__(engine, zone, "measure_at")

    def _label(self, point: str) -> str:
        return point if point in (AVERAGE, COLDEST) else self.zone.area_names.get(point, point)

    @property
    def options(self) -> list[str]:
        return [self._label(p) for p in self.zone.measure_options]

    @property
    def current_option(self) -> str | None:
        point = self.zone.state.get("measure_at")
        return self._label(point) if point else None

    async def async_select_option(self, option: str) -> None:
        point = next((p for p in self.zone.measure_options if self._label(p) == option or p == option), option)
        await self._engine.set_measure_at(self._zid, point)
