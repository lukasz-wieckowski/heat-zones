"""Heat Zones — room-aware heating zones with a weekly schedule.

A zone is one or more rooms (areas) heated by one or more thermostats. The zone measures where the user wants
(a room, the average or the coldest room), feeds the room temperature to thermostats that accept it (or corrects
the target of those that do not), respects room limits and open windows, learns the rooms and a thermal model,
follows a weekly schedule with preheat, manual holds and timed overrides, and publishes its plan and problems for
other systems (HomeAI). Every zone is a config subentry. Details: README.md, engine.py and schedule.py.
"""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .card import async_register_card
from .const import DOMAIN
from .engine import HeatZones
from .services import async_register as async_register_services

PLATFORMS = [
    Platform.BINARY_SENSOR,
    Platform.CLIMATE,
    Platform.NUMBER,
    Platform.SELECT,
    Platform.SENSOR,
    Platform.SWITCH,
]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type HeatZonesConfigEntry = ConfigEntry[HeatZones]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    async_register_services(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: HeatZonesConfigEntry) -> bool:
    engine = HeatZones(hass, entry)
    await engine.async_setup()
    entry.runtime_data = engine
    entry.async_on_unload(entry.add_update_listener(_updated))
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await async_register_card(hass)
    return True


async def _updated(hass: HomeAssistant, entry: HeatZonesConfigEntry) -> None:
    """Options or zones (subentries) changed — build everything anew."""
    hass.config_entries.async_schedule_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: HeatZonesConfigEntry) -> bool:
    ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if ok:
        await entry.runtime_data.async_unload()
    return ok


async def async_remove_entry(hass: HomeAssistant, entry: HeatZonesConfigEntry) -> None:
    await HeatZones(hass, entry).async_remove()
