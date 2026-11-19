"""The zone controller: room temperature to thermostats, limits, window pause, silent sensors, knob, self-repair."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

from homeassistant.core import HomeAssistant

from .common import Home, settle, setup, tick, zone

LIVING = "climate.living_area"


async def living_area(hass: HomeAssistant, home: Home, **data: Any) -> tuple[Any, dict[str, str]]:
    """Living room with a radiator (TRVZB-like), kitchen and hall without one — one zone, measured in the hall."""
    living, kitchen, hall = home.area("Living room"), home.area("Kitchen"), home.area("Hall")
    e = {
        "trv": home.trv(living, "living_trv", target=21.0, current=21.5),
        "living": home.sensor(living, "living", 21.0),
        "kitchen": home.sensor(kitchen, "kitchen", 20.5),
        "hall": home.sensor(hall, "hall", 20.0),
        "window": home.window(kitchen, "kitchen"),
    }
    entry = await setup(hass, [zone("Living area", [living, kitchen, hall], **data)])
    return entry, e


async def test_entities_and_room_temperature(hass: HomeAssistant, home: Home) -> None:
    _entry, _e = await living_area(hass, home)
    st = hass.states.get(LIVING)
    assert st is not None
    assert st.state == "heat"
    assert st.attributes["current_temperature"] == 21.0  # measured in the first room with a sensor
    for eid in (
        "switch.living_area_schedule",
        "sensor.living_area_next_change",
        "select.living_area_measure_at",
        "binary_sensor.living_area_problem",
        "binary_sensor.living_area_window_pause",
        "number.living_area_valve_limit",
        "sensor.living_area_heating_rate",
        "sensor.living_area_model_confidence",
    ):
        assert hass.states.get(eid) is not None, eid
    # the thermostat gets the room temperature and the room sensor is selected
    assert home.values("set_value", "number.living_trv_external_temperature_input", "value") == [21.0]
    assert home.values("select_option", "select.living_trv_temperature_sensor_select", "option") == [
        "remote_temperature"
    ]
    assert st.attributes["homeai_schedule"] == {
        "version": 1,
        "domain": "heat_zones",
        "areas": ["living_room", "kitchen", "hall"],  # the rooms the zone heats
        "features": ["open_end"],  # optional parts of the contract it understands
    }
    assert [t["mode"] for t in st.attributes["thermostats"]] == ["room_sensor"]
    options = hass.states.get("select.living_area_measure_at").attributes["options"]
    assert options == ["Living room", "Kitchen", "Hall", "average", "coldest"]


async def test_measure_at_and_limit(hass: HomeAssistant, home: Home) -> None:
    _entry, e = await living_area(hass, home, limits={"living_room": 23.5})
    await hass.services.async_call(
        "select", "select_option", {"entity_id": "select.living_area_measure_at", "option": "Hall"}, blocking=True
    )
    await hass.services.async_call(
        "climate", "set_temperature", {"entity_id": LIVING, "temperature": 22}, blocking=True
    )
    await hass.async_block_till_done()
    assert hass.states.get(LIVING).attributes["current_temperature"] == 20.0
    assert home.values("set_value", "number.living_trv_external_temperature_input", "value")[-1] == 20.0
    # the living room approaches its limit: the thermostat sees the target already
    home.set_temperature(e["living"], 23.7)
    await settle(hass)
    a = hass.states.get(LIVING).attributes
    assert a["room_temperature_sent"] == 22.2  # 23.7 − (23.5 − 22)
    assert a["limited_by"]["area"] == "living_room"
    assert home.values("set_value", "number.living_trv_external_temperature_input", "value")[-1] == 22.2
    # average and coldest
    await hass.services.async_call(
        "select", "select_option", {"entity_id": "select.living_area_measure_at", "option": "coldest"}, blocking=True
    )
    assert hass.states.get(LIVING).attributes["current_temperature"] == 20.0


async def test_window_pause(hass: HomeAssistant, home: Home, freezer: Any) -> None:
    _entry, e = await living_area(hass, home)
    hass.states.async_set(e["window"], "on", {"device_class": "window"})
    await hass.async_block_till_done()
    assert hass.states.get(e["trv"]).state == "heat"  # not yet: a window counts after 2 minutes
    freezer.tick(timedelta(minutes=2, seconds=10))
    await settle(hass)
    assert hass.states.get(e["trv"]).state == "off"
    assert hass.states.get("binary_sensor.living_area_window_pause").state == "on"
    assert hass.states.get(LIVING).attributes["hvac_action"] == "idle"
    assert hass.states.get(LIVING).state == "heat"  # the zone stays on — only paused
    hass.states.async_set(e["window"], "off", {"device_class": "window"})
    await settle(hass)
    assert hass.states.get(e["trv"]).state == "heat"
    assert hass.states.get("binary_sensor.living_area_window_pause").state == "off"


async def test_silent_sensors_fall_back_to_own_thermometer(hass: HomeAssistant, home: Home) -> None:
    entry, e = await living_area(hass, home)
    for key in ("living", "kitchen", "hall"):
        home.set_temperature(e[key], None)
    home.thermostat(e["trv"], current_temperature=21.5)  # by its own thermometer now
    await settle(hass)
    a = hass.states.get(LIVING).attributes
    assert a["problem"] == "sensor"
    assert a["current_temperature"] == 21.5  # the thermostat's own thermometer
    assert (
        home.values("select_option", "select.living_trv_temperature_sensor_select", "option")[-1] == "local_temperature"
    )
    assert hass.states.get("binary_sensor.living_area_problem").state == "on"
    titles = [s["id"] for s in a["homeai_signals"]]
    assert "heat_zones_" + entry.runtime_data.zones[next(iter(entry.runtime_data.zones))].id + "_sensor_hall" in titles


async def test_knob_change_is_a_manual_change(hass: HomeAssistant, home: Home, freezer: Any) -> None:
    _entry, e = await living_area(hass, home)
    freezer.tick(timedelta(seconds=40))  # past the echo window of our own commands
    home.thermostat(e["trv"], temperature=23.0)
    await settle(hass)
    st = hass.states.get(LIVING)
    assert st.attributes["temperature"] == 23.0
    assert st.attributes["source"] == "manual"
    # turned off on the thermostat → the zone is off
    freezer.tick(timedelta(seconds=40))
    home.thermostat(e["trv"], state="off")
    await settle(hass)
    assert hass.states.get(LIVING).state == "off"


async def test_lost_command_is_repeated(hass: HomeAssistant, home: Home, freezer: Any) -> None:
    _entry, e = await living_area(hass, home)
    home.deaf.add(e["trv"])
    await hass.services.async_call(
        "climate", "set_temperature", {"entity_id": LIVING, "temperature": 22.5}, blocking=True
    )
    await hass.async_block_till_done()
    assert home.values("set_temperature", e["trv"], "temperature") == [22.5]
    await tick(hass, freezer, minutes=4)  # within 5 minutes: not again
    assert home.values("set_temperature", e["trv"], "temperature") == [22.5]
    await tick(hass, freezer, minutes=1)
    assert home.values("set_temperature", e["trv"], "temperature") == [22.5, 22.5]


async def test_self_repair_of_the_room_sensor(hass: HomeAssistant, home: Home, freezer: Any) -> None:
    """The thermostat reports its own thermometer although the room sensor is selected — select it again."""
    _entry, e = await living_area(hass, home)
    sel = "select.living_trv_temperature_sensor_select"
    selected = len(home.values("select_option", sel, "option"))
    assert hass.states.get(e["trv"]).attributes["current_temperature"] == 21.0  # reports the room reading
    home.broken.add(e["trv"])
    home.thermostat(e["trv"], current_temperature=23.0)  # the room reading it got is 21.0
    await tick(hass, freezer, times=2)
    assert len(home.values("select_option", sel, "option")) == selected  # under 15 minutes: wait
    await tick(hass, freezer)
    assert len(home.values("select_option", sel, "option")) == selected + 1
    assert hass.states.get(LIVING).attributes["problem"] is None
    await tick(hass, freezer, times=12)  # two more attempts, every 30 minutes
    a = hass.states.get(LIVING).attributes
    assert len(home.values("select_option", sel, "option")) == selected + 3
    assert a["problem"] == "thermostat"
    assert any("own thermometer" in s["title"] for s in a["homeai_signals"])
    home.broken.discard(e["trv"])
    home.thermostat(e["trv"], current_temperature=21.0)
    await tick(hass, freezer)
    assert hass.states.get(LIVING).attributes["problem"] is None


async def test_valve_guard(hass: HomeAssistant, home: Home, freezer: Any) -> None:
    _entry, e = await living_area(hass, home)
    await hass.services.async_call(
        "climate", "set_temperature", {"entity_id": LIVING, "temperature": 23}, blocking=True
    )
    home.thermostat(e["trv"], hvac_action="heating")
    for _ in range(25):  # two hours with the valve open, the room does not rise
        home.set_temperature(e["living"], 21.0)
        await tick(hass, freezer)
    a = hass.states.get(LIVING).attributes
    assert a["problem"] == "valve"
    (signal,) = [s for s in a["homeai_signals"] if "_valve_" in s["id"]]
    assert signal["severity"] == 2 and signal["category"] == "maintenance" and signal["need"] == "member"
    assert "valve open since 21:0" in signal["title"]
    # the room gets warmer — the valve works
    home.set_temperature(e["living"], 21.3)
    await tick(hass, freezer)
    assert hass.states.get(LIVING).attributes["problem"] is None


async def test_thermostat_without_room_input_gets_a_corrected_target(
    hass: HomeAssistant, home: Home, freezer: Any
) -> None:
    """P2: a thermostat that only knows its own thermometer — the target is moved by its difference from the room."""
    bedroom = home.area("Bedroom")
    trv = home.trv(bedroom, "bedroom_trv", room_input=False, valve=False, current=22.0, target=20.0)
    sensor = home.sensor(bedroom, "bedroom", 20.0)
    await setup(hass, [zone("Bedroom", [bedroom], offset_max=1.5)])
    a = hass.states.get("climate.bedroom").attributes
    assert a["thermostats"] == [{"entity_id": trv, "mode": "offset"}]
    await hass.services.async_call(
        "climate", "set_temperature", {"entity_id": "climate.bedroom", "temperature": 20}, blocking=True
    )
    # the thermostat reads 2 °C more than the room — the correction is limited to 1.5 °C
    assert home.values("set_temperature", trv, "temperature")[-1] == 21.5
    home.thermostat(trv, current_temperature=20.8)
    home.set_temperature(sensor, 20.0)
    for _ in range(6):
        await tick(hass, freezer)
    assert home.values("set_temperature", trv, "temperature")[-1] == 21.0  # smoothed difference 0.8 → +1.0
    assert hass.states.get("climate.bedroom").attributes["temperature"] == 20.0  # the zone target is unchanged
    # the knob: 22 on the thermostat means 21 in the room
    freezer.tick(timedelta(seconds=40))
    home.thermostat(trv, temperature=22.0)
    await settle(hass)
    assert hass.states.get("climate.bedroom").attributes["temperature"] == 21.0


async def test_thermostat_with_own_mode_and_auto_hvac(hass: HomeAssistant, home: Home) -> None:
    office = home.area("Office")
    trv = home.trv(office, "office_trv", room_input=False, valve=False, hvac_modes=["off", "auto"], state="off")
    home.sensor(office, "office", 19.0)
    await setup(hass, [zone("Office", [office], control_mode="own")])
    assert hass.states.get("climate.office").state == "off"
    await hass.services.async_call("climate", "turn_on", {"entity_id": "climate.office"}, blocking=True)
    assert home.values("set_hvac_mode", trv, "hvac_mode")[-1] == "auto"
    await hass.services.async_call(
        "climate", "set_temperature", {"entity_id": "climate.office", "temperature": 20.5}, blocking=True
    )
    assert home.values("set_temperature", trv, "temperature")[-1] == 20.5  # no correction in "own" mode


async def test_room_input_not_used_when_own_mode_is_chosen(hass: HomeAssistant, home: Home) -> None:
    hall = home.area("Hall")
    trv = home.trv(hall, "hall_trv")
    home.sensor(hall, "hall", 19.0)
    hass.states.async_set("select.hall_trv_temperature_sensor_select", "remote_temperature", {})
    await setup(hass, [zone("Hall", [hall], control_mode="own")])
    assert hass.states.get("climate.hall").attributes["thermostats"] == [{"entity_id": trv, "mode": "own"}]
    assert home.values("select_option", "select.hall_trv_temperature_sensor_select", "option") == ["local_temperature"]
    assert home.commands("number", "set_value", "number.hall_trv_external_temperature_input") == []


async def test_a_thermostat_belongs_to_one_zone(hass: HomeAssistant, home: Home) -> None:
    from homeassistant.config_entries import ConfigSubentry

    living, hall = home.area("Living room"), home.area("Hall")
    trv = home.trv(living, "living_trv")
    entry = await setup(hass, [zone("Living room", [living])])
    data = zone("Hall", [hall], thermostats=[trv, "climate.living_room"])  # a thermostat of a zone, and a zone
    hass.config_entries.async_add_subentry(
        entry, ConfigSubentry(data=data["data"], subentry_type="zone", title="Hall", unique_id=None)
    )
    await hass.async_block_till_done()
    await settle(hass)
    assert [z.name for z in entry.runtime_data.zones.values()] == ["Living room"]
    assert hass.states.get("climate.hall") is None


def test_climate_uses_the_temperature_api_of_its_home_assistant() -> None:
    """Native temperatures from Home Assistant 2026.11 (the old names stop working in 2027.11), old names before."""
    from homeassistant.components.climate import ClimateEntity

    from custom_components.heat_zones.climate import NATIVE, ZoneClimate

    assert hasattr(ClimateEntity, "native_current_temperature") == NATIVE
    native = {"_attr_native_temperature_unit", "native_current_temperature", "native_target_temperature"}
    old = {"_attr_temperature_unit", "current_temperature", "target_temperature"}
    defined = set(vars(ZoneClimate))
    assert (native <= defined, old & defined) == ((True, set()) if NATIVE else (False, old))
