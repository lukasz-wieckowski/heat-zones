"""A small home for the tests: areas, thermostats with companion entities, sensors and windows.

Commands to thermostats do not go through Home Assistant services: `Home.calls` records them, and a thermostat
"takes" a command (its state changes) unless it is told to ignore commands.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar, device_registry as dr, entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.heat_zones.config_flow import zone_defaults
from custom_components.heat_zones.const import DOMAIN, SUBENTRY_ZONE
from custom_components.heat_zones.engine import HeatZones

TZ = "Europe/Warsaw"


class Home:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.areas = ar.async_get(hass)
        self.entities = er.async_get(hass)
        self.devices = dr.async_get(hass)
        self.source = MockConfigEntry(domain="fake")
        self.source.add_to_hass(hass)
        self.calls: list[tuple[str, str, dict[str, Any]]] = []
        self.deaf: set[str] = set()  # thermostats that ignore commands
        self.broken: set[str] = set()  # thermostats that regulate by their own thermometer whatever is selected
        self.inputs: dict[str, tuple[str, str]] = {}  # room temperature input → (thermostat, sensor selection)

    # ——— building ———
    def area(self, name: str) -> str:
        return self.areas.async_create(name).id

    def _device(self, key: str, name: str, area: str) -> str:
        dev = self.devices.async_get_or_create(
            config_entry_id=self.source.entry_id, identifiers={("fake", key)}, name=name
        )
        self.devices.async_update_device(dev.id, area_id=area)
        return dev.id

    def sensor(self, area: str, key: str, value: float | None) -> str:
        device = self._device(f"sensor_{key}", f"Climate sensor {key}", area)
        e = self.entities.async_get_or_create(
            "sensor",
            "fake",
            f"{key}_temperature",
            suggested_object_id=f"{key}_temperature",
            device_id=device,
            original_device_class="temperature",
        )
        self.set_temperature(e.entity_id, value)
        return e.entity_id

    def trv(
        self,
        area: str,
        key: str,
        *,
        room_input: bool = True,
        valve: bool = True,
        target: float = 21.0,
        current: float = 20.0,
        state: str = "heat",
        hvac_modes: list[str] | None = None,
    ) -> str:
        device = self._device(f"trv_{key}", f"Radiator {key}", area)
        e = self.entities.async_get_or_create(
            "climate", "fake", f"{key}_climate", suggested_object_id=key, device_id=device
        )
        self.hass.states.async_set(
            e.entity_id,
            state,
            {
                "temperature": target,
                "current_temperature": current,
                "min_temp": 5,
                "max_temp": 30,
                "target_temp_step": 0.5,
                "hvac_modes": hvac_modes or ["off", "heat"],
                "hvac_action": "idle",
                "friendly_name": f"Radiator {key}",
            },
        )
        if room_input:
            sel = self.entities.async_get_or_create(
                "select",
                "fake",
                f"0x{key}_temperature_sensor_select_zigbee2mqtt",
                suggested_object_id=f"{key}_temperature_sensor_select",
                device_id=device,
            )
            self.hass.states.async_set(
                sel.entity_id, "local_temperature", {"options": ["local_temperature", "remote_temperature"]}
            )
            inp = self.entities.async_get_or_create(
                "number",
                "fake",
                f"0x{key}_external_temperature_input_zigbee2mqtt",
                suggested_object_id=f"{key}_external_temperature_input",
                device_id=device,
            )
            self.hass.states.async_set(inp.entity_id, "0", {"min": 0, "max": 99.9, "unit_of_measurement": "°C"})
            self.inputs[inp.entity_id] = (e.entity_id, sel.entity_id)
        if valve:
            v = self.entities.async_get_or_create(
                "number",
                "fake",
                f"0x{key}_valve_opening_degree_zigbee2mqtt",
                suggested_object_id=f"{key}_valve_opening_degree",
                device_id=device,
            )
            self.hass.states.async_set(v.entity_id, "100", {"min": 0, "max": 100, "unit_of_measurement": "%"})
        return e.entity_id

    def window(self, area: str, key: str, is_open: bool = False) -> str:
        device = self._device(f"window_{key}", f"Window {key}", area)
        e = self.entities.async_get_or_create(
            "binary_sensor",
            "fake",
            f"{key}_contact",
            suggested_object_id=f"{key}_window",
            device_id=device,
            original_device_class="window",
        )
        self.hass.states.async_set(e.entity_id, "on" if is_open else "off", {"device_class": "window"})
        return e.entity_id

    # ——— changing ———
    def set_temperature(self, eid: str, value: float | None) -> None:
        self.hass.states.async_set(
            eid,
            "unavailable" if value is None else str(value),
            {"device_class": "temperature", "unit_of_measurement": "°C", "state_class": "measurement"},
            force_update=True,
        )

    def thermostat(self, eid: str, **changes: Any) -> None:
        st = self.hass.states.get(eid)
        assert st is not None
        state = changes.pop("state", st.state)
        self.hass.states.async_set(eid, state, {**st.attributes, **changes})

    def commands(self, domain: str | None = None, service: str | None = None, entity: str | None = None) -> list:
        return [
            c
            for c in self.calls
            if (domain is None or c[0] == domain)
            and (service is None or c[1] == service)
            and (entity is None or c[2].get("entity_id") == entity)
        ]

    def values(self, service: str, entity: str, key: str) -> list[Any]:
        return [c[2][key] for c in self.commands(None, service, entity)]

    async def apply(self, domain: str, service: str, data: dict[str, Any]) -> None:
        """A device takes a command."""
        self.calls.append((domain, service, dict(data)))
        eid = data.get("entity_id")
        st = self.hass.states.get(eid) if eid else None
        if st is None or eid in self.deaf:
            return
        if (domain, service) == ("climate", "set_temperature"):
            self.hass.states.async_set(eid, st.state, {**st.attributes, "temperature": data["temperature"]})
        elif (domain, service) == ("climate", "set_hvac_mode"):
            self.hass.states.async_set(eid, data["hvac_mode"], dict(st.attributes))
        elif (domain, service) == ("number", "set_value"):
            self.hass.states.async_set(eid, str(data["value"]), dict(st.attributes))
            self._room_reading(eid)
        elif (domain, service) == ("select", "select_option"):
            self.hass.states.async_set(eid, data["option"], dict(st.attributes))
            for inp, (_trv, sel) in self.inputs.items():
                if sel == eid:
                    self._room_reading(inp)

    def _room_reading(self, inp: str) -> None:
        """With the room sensor selected a TRVZB reports the reading it got as its own temperature."""
        if inp not in self.inputs:
            return
        trv, sel = self.inputs[inp]
        selected, value = self.hass.states.get(sel), self.hass.states.get(inp)
        if trv in self.broken or selected is None or selected.state != "remote_temperature" or value is None:
            return
        self.thermostat(trv, current_temperature=float(value.state))


def patch_commands(monkeypatch: Any, home: Home) -> None:
    async def call(_self: HeatZones, domain: str, service: str, data: dict[str, Any]) -> None:
        await home.apply(domain, service, data)

    monkeypatch.setattr(HeatZones, "_call", call)


def zone(name: str, areas: list[str], **data: Any) -> dict[str, Any]:
    return {"title": name, "data": {**zone_defaults(), "areas": areas, **data}}


async def setup(
    hass: HomeAssistant, zones: list[dict[str, Any]], options: dict[str, Any] | None = None
) -> MockConfigEntry:
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Heat Zones",
        data={},
        options=options or {},
        subentries_data=[
            {"data": z["data"], "subentry_type": SUBENTRY_ZONE, "title": z["title"], "unique_id": None} for z in zones
        ],
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await settle(hass)
    return entry


async def settle(hass: HomeAssistant) -> None:
    """Fire the pending short timers (first recalculation, window delays) and wait."""
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=10))
    await hass.async_block_till_done()


async def tick(hass: HomeAssistant, freezer: Any, minutes: float = 5, times: int = 1) -> None:
    """Let time pass in 5-minute controller ticks (a jump moves the tick — HA counts the next from the run)."""
    for _ in range(times):
        freezer.tick(timedelta(minutes=minutes))
        async_fire_time_changed(hass, dt_util.utcnow())
        await hass.async_block_till_done()
        async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=2))
        await hass.async_block_till_done()


def engine(entry: MockConfigEntry) -> HeatZones:
    return entry.runtime_data


def zone_id(entry: MockConfigEntry, title: str) -> str:
    return next(s.subentry_id for s in entry.subentries.values() if s.title == title)


def local(text: str) -> datetime:
    t = dt_util.parse_datetime(text)
    assert t is not None
    return dt_util.as_local(t)
