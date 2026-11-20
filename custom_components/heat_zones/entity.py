"""Common base of the zone entities: one device per zone."""

from __future__ import annotations

from homeassistant.core import Context, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity import Entity

from . import i18n
from .const import DOMAIN, NAME, VERSION
from .engine import CALLER, HeatZones, Zone


class ZoneEntity(Entity):
    _attr_should_poll = False
    _attr_has_entity_name = True

    def __init__(self, engine: HeatZones, zone: Zone, key: str) -> None:
        self._engine = engine
        self._zid = zone.id
        self._attr_unique_id = f"{zone.id}-{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, zone.id)},
            name=zone.name,
            manufacturer=NAME,
            model=i18n.text(engine.hass, "device.model"),
            sw_version=VERSION,
            entry_type=DeviceEntryType.SERVICE,
        )

    @property
    def zone(self) -> Zone:
        return self._engine.zones[self._zid]

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self._engine.listen(self._zid, self._changed))

    @callback
    def _changed(self) -> None:
        caller = CALLER.get()
        if isinstance(caller, Context):
            self.async_set_context(caller)  # a Heat Zones service: the caller's context
        elif caller is False:
            self.async_set_context(Context())  # the integration's own change (schedule, preheat, devices)
        self.async_write_ha_state()
