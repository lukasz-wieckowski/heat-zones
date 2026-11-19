"""Diagnostics: zones, their configuration, state, learning and what they currently do."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from . import HeatZonesConfigEntry
from .const import VERSION


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: HeatZonesConfigEntry) -> dict[str, Any]:
    engine = entry.runtime_data
    zones = {}
    for z in engine.zones.values():
        zones[z.name] = {
            "config": z.cfg,
            "areas": z.areas,
            "main_area": z.main_area,
            "sensors": z.sensors,
            "openings": z.openings,
            "thermostats": [
                {
                    "entity_id": t.entity_id,
                    "mode": t.mode,
                    "sensor_select": t.sensor_select,
                    "external_input": t.external_input,
                    "valve_limit": t.valve_limit,
                    "applied_offset": t.applied,
                    "repairs": t.repairs,
                }
                for t in z.trvs
            ],
            "state": z.state,
            "attributes": engine.attributes(z),
            "learning": engine.learning(z),
        }
    return {
        "version": VERSION,
        "options": dict(entry.options),
        "outside": {
            "sensor": engine.outside.sensor,
            "weather": engine.outside.weather,
            "now": engine.outside.temperature,
        },
        "zones": zones,
    }
