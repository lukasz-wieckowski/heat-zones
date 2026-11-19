"""The home from Home Assistant's registries: thermostats, temperature sensors and openings in every area.

Rules: an entity belongs to its own area or its device's area; a thermometer or a door sensor counts only on a
device that controls nothing (a thermostat's thermometer or a dishwasher's door say nothing about the room); the
room sensor of an area is the one set on the area in Home Assistant, else a device named like a climate sensor.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime
import re

from homeassistant.components.weather import WeatherEntityFeature
from homeassistant.core import HomeAssistant, State
from homeassistant.helpers import area_registry as ar, device_registry as dr, entity_registry as er

from .const import CONTROLLING, DOMAIN, OPENINGS, UNAVAILABLE

CLIMATE_NAME = re.compile(r"klimat|termometr|temperatur|climate|thermo", re.IGNORECASE)
# outdoor temperature that is not air: apparent, ground, dew point…
NOT_AIR = re.compile(r"odczuwaln|apparent|feels|grunt|ground|gleb|soil|ros[ya]|dew|wewn|indoor|inside", re.IGNORECASE)
OUTSIDE = re.compile(
    r"balkon|taras|ogr[oó]d|zewn|outdoor|outside|garden|patio|dw[oó]r|balcony|terrace|yard", re.IGNORECASE
)


@dataclass
class Area:
    id: str
    name: str
    thermostats: list[str] = field(default_factory=list)
    sensors: list[str] = field(default_factory=list)  # every thermometer in the area — for the user to choose
    sensor: str | None = None  # the room sensor chosen automatically
    openings: list[str] = field(default_factory=list)


def _device_class(hass: HomeAssistant, e: er.RegistryEntry) -> str | None:
    st = hass.states.get(e.entity_id)
    return (st.attributes.get("device_class") if st else None) or e.device_class or e.original_device_class


def _area_of(devices: dr.DeviceRegistry, e: er.RegistryEntry) -> str | None:
    if e.area_id:
        return e.area_id
    dev = devices.async_get(e.device_id) if e.device_id else None
    return dev.area_id if dev else None


def area_map(hass: HomeAssistant) -> dict[str, Area]:
    entities = er.async_get(hass)
    devices = dr.async_get(hass)
    registry = ar.async_get(hass)
    areas = {a.id: Area(a.id, a.name) for a in registry.async_list_areas()}
    configured = {a.id: a.temperature_entity_id for a in registry.async_list_areas()}

    on_device: dict[str, list[er.RegistryEntry]] = defaultdict(list)
    for e in entities.entities.values():
        if e.device_id and not e.disabled_by:
            on_device[e.device_id].append(e)

    def controls(e: er.RegistryEntry) -> bool:
        return bool(e.device_id) and any(x.domain in CONTROLLING for x in on_device[e.device_id])

    def plant(e: er.RegistryEntry) -> bool:
        return bool(e.device_id) and any(
            x.domain == "sensor" and _device_class(hass, x) == "moisture" for x in on_device[e.device_id]
        )

    def device_name(e: er.RegistryEntry) -> str:
        dev = devices.async_get(e.device_id) if e.device_id else None
        return (dev.name_by_user or dev.name or "") if dev else ""

    candidates: dict[str, list[er.RegistryEntry]] = defaultdict(list)
    for e in entities.entities.values():
        if e.disabled_by or e.platform == DOMAIN or (area := areas.get(_area_of(devices, e) or "")) is None:
            continue
        if e.domain == "climate":
            if not e.hidden_by:
                area.thermostats.append(e.entity_id)
        elif e.domain == "sensor" and _device_class(hass, e) == "temperature" and not plant(e):
            area.sensors.append(e.entity_id)
            if not controls(e) and not e.entity_category and not e.hidden_by:
                candidates[area.id].append(e)
        elif (
            e.domain == "binary_sensor"
            and _device_class(hass, e) in OPENINGS
            and not controls(e)
            and not e.entity_category
        ):
            area.openings.append(e.entity_id)

    def order(e: er.RegistryEntry) -> tuple[int, int, str]:
        return (0 if CLIMATE_NAME.search(device_name(e)) else 1, len(on_device[e.device_id or ""]), e.entity_id)

    for area in areas.values():
        area.thermostats.sort()
        area.sensors.sort()
        area.openings.sort()
        found = sorted(candidates[area.id], key=order)
        area.sensor = configured.get(area.id) or (found[0].entity_id if found else None)
    return areas


def area_of_entity(hass: HomeAssistant, entity_id: str) -> str | None:
    entry = er.async_get(hass).async_get(entity_id)
    return _area_of(dr.async_get(hass), entry) if entry else None


def companion(hass: HomeAssistant, thermostat: str, suffixes: tuple[str, ...]) -> str | None:
    """An entity on the thermostat's device (sensor selection, sensor input, valve limit) — by unique_id, then id."""
    registry = er.async_get(hass)
    entry = registry.async_get(thermostat)
    if not entry or not entry.device_id:
        return None
    for e in er.async_entries_for_device(registry, entry.device_id, include_disabled_entities=False):
        unique = (e.unique_id or "").removesuffix("_zigbee2mqtt")
        if any(unique.endswith(s) or e.entity_id.endswith(s) for s in suffixes):
            return e.entity_id
    return None


def pick_for(hass: HomeAssistant, thermostat: str, chosen: list[str], index: int, count: int) -> str | None:
    """The entity from a list the user chose that belongs to this thermostat: same device, else same position."""
    registry = er.async_get(hass)
    entry = registry.async_get(thermostat)
    device = entry.device_id if entry else None
    for eid in chosen:
        if device and (e := registry.async_get(eid)) is not None and e.device_id == device:
            return eid
    if len(chosen) == count and index < len(chosen):
        e = registry.async_get(chosen[index])
        if e is None or e.device_id is None or e.device_id == device or device is None:
            return chosen[index]
    return None


def last_report(hass: HomeAssistant, entity_id: str) -> datetime | None:
    """When a sensor last reported: the newest `last_reported` among its device's entities.

    `last_reported` of the temperature entity alone is not enough: MQTT entities do not write an unchanged state,
    so in a room with a steady temperature it may not move for hours although the sensor reports (humidity, link
    quality). A device is alive when any of its entities speaks. An entity without a device: its own report.
    """
    st = hass.states.get(entity_id)
    if st is None:
        return None
    result = st.last_reported
    registry = er.async_get(hass)
    entry = registry.async_get(entity_id)
    if entry and entry.device_id:
        for e in er.async_entries_for_device(registry, entry.device_id):
            if (other := hass.states.get(e.entity_id)) is not None and other.state not in UNAVAILABLE:
                result = max(result, other.last_reported)
    return result


def outdoor_sensors(hass: HomeAssistant, weather: str | None) -> list[str]:
    """Outdoor air temperature sensors with statistics (`state_class`), best first.

    Outdoor = without an area or in an area like a balcony, terrace or garden; without apparent temperature, ground
    and dew point. First a sensor from the same config entry as the weather entity, then the rest by entity_id.
    """
    entities, devices = er.async_get(hass), dr.async_get(hass)
    names = {a.id: a.name for a in ar.async_get(hass).async_list_areas()}
    weather_entry = e.config_entry_id if weather and (e := entities.async_get(weather)) else None
    result = []
    for e in entities.entities.values():
        if e.domain != "sensor" or e.disabled_by or e.entity_category or e.platform == DOMAIN:
            continue
        st = hass.states.get(e.entity_id)
        if _device_class(hass, e) != "temperature" or st is None or st.attributes.get("state_class") != "measurement":
            continue
        area = _area_of(devices, e)
        if area is not None and not OUTSIDE.search(f"{area} {names.get(area, '')}"):
            continue
        text = f"{e.entity_id} {e.name or ''} {e.original_name or ''} {st.attributes.get('friendly_name', '')}"
        if NOT_AIR.search(text):
            continue
        result.append((0 if weather_entry and e.config_entry_id == weather_entry else 1, e.entity_id))
    return [eid for _, eid in sorted(result)]


def best_weather(hass: HomeAssistant) -> str | None:
    """A weather entity, preferring one with an hourly forecast."""
    candidates = [st for st in hass.states.async_all("weather") if st.state not in UNAVAILABLE]

    def key(st: State) -> tuple[int, int, str]:
        f = int(st.attributes.get("supported_features") or 0)
        return (0 if f & WeatherEntityFeature.FORECAST_HOURLY else 1, -bin(f).count("1"), st.entity_id)

    return min(candidates, key=key).entity_id if candidates else None
