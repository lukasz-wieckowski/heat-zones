"""The setup wizard, options and zones as subentries."""

from __future__ import annotations

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
import pytest

from custom_components.heat_zones.config_flow import format_presets, parse_presets
from custom_components.heat_zones.const import DOMAIN, SUBENTRY_ZONE

from .common import Home, setup, zone


async def test_wizard_creates_a_zone_per_area_with_a_thermostat(hass: HomeAssistant, home: Home) -> None:
    living, bedroom, hall = home.area("Living room"), home.area("Bedroom"), home.area("Hall")
    home.trv(living, "living_trv")
    home.trv(bedroom, "bedroom_trv")
    home.sensor(hall, "hall", 20.0)
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    assert result["type"] is FlowResultType.FORM
    assert result["description_placeholders"]["areas"] == "Living room, Bedroom"
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {"create_zones": True})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    entry = result["result"]
    assert sorted(s.title for s in entry.subentries.values()) == ["Bedroom", "Living room"]
    await hass.async_block_till_done()
    assert hass.states.get("climate.living_room") is not None
    assert hass.states.get("climate.bedroom") is not None
    # only one Heat Zones
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    assert result["type"] is FlowResultType.ABORT


async def test_add_and_change_a_zone(hass: HomeAssistant, home: Home) -> None:
    living, kitchen = home.area("Living room"), home.area("Kitchen")
    trv = home.trv(living, "living_trv")
    home.sensor(living, "living", 21.0)
    other = home.sensor(kitchen, "kitchen", 20.0)
    automatic = home.sensor(kitchen, "a_kitchen", 19.5)  # first by name — found automatically
    entry = await setup(hass, [])
    result = await hass.config_entries.subentries.async_init(
        (entry.entry_id, SUBENTRY_ZONE), context={"source": config_entries.SOURCE_USER}
    )
    assert result["step_id"] == "zone"
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {"name": "", "areas": [kitchen], "window_pause": True, "window_delay": 2}
    )
    assert result["errors"] == {"thermostats": "no_thermostats"}
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {"name": "Day zone", "areas": [living, kitchen], "window_pause": True, "window_delay": 3}
    )
    assert (result["step_id"], result["description_placeholders"]["room"]) == ("room", "Living room")
    result = await hass.config_entries.subentries.async_configure(result["flow_id"], {"limit": 23.5})
    assert result["description_placeholders"]["room"] == "Kitchen"
    result = await hass.config_entries.subentries.async_configure(result["flow_id"], {"sensor": other})
    assert result["step_id"] == "presets"
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {"comfort": 22, "eco": 19.5, "sleep": 18, "away": 15, "custom_presets": "Party = 99"},
    )
    assert result["errors"] == {"custom_presets": "invalid_presets"}
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {"comfort": 22, "eco": 19.5, "sleep": 18, "away": 15, "custom_presets": "Party: 23.5\nShower: 24"},
    )
    assert result["step_id"] == "control"
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {"control_mode": "auto", "offset_max": 2, "optimum_start": False, "preheat_max": 2}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    (sub,) = entry.subentries.values()
    assert sub.title == "Day zone"
    assert sub.data["limits"] == {living: 23.5}
    assert sub.data["sensors"] == {kitchen: other}  # only the choices that differ from the automatic sensor
    assert sub.data["custom_presets"] == [
        {"name": "Party", "temperature": 23.5},
        {"name": "Shower", "temperature": 24.0},
    ]
    st = hass.states.get("climate.day_zone")
    assert st is not None
    assert st.attributes["preset_modes"] == ["none", "comfort", "eco", "sleep", "away", "Party", "Shower"]
    assert [r["sensor"] for r in st.attributes["rooms"]] == ["sensor.living_temperature", other]
    assert automatic not in [r["sensor"] for r in st.attributes["rooms"]]
    assert st.attributes["thermostats"][0]["entity_id"] == trv

    # change it: the flow starts with what is set
    result = await entry.start_subentry_reconfigure_flow(hass, sub.subentry_id)
    assert result["step_id"] == "zone"
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {"name": "Day", "areas": [living], "window_pause": False, "window_delay": 2}
    )
    result = await hass.config_entries.subentries.async_configure(result["flow_id"], {})
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {"comfort": 21, "eco": 19, "sleep": 18, "away": 16, "custom_presets": ""}
    )
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {"control_mode": "own", "offset_max": 3, "optimum_start": True, "preheat_max": 3}
    )
    assert result["type"] is FlowResultType.ABORT and result["reason"] == "reconfigure_successful"
    await hass.async_block_till_done()
    (sub,) = entry.subentries.values()
    assert (sub.title, sub.data["areas"], sub.data["limits"], sub.data["control_mode"]) == ("Day", [living], {}, "own")


async def test_options(hass: HomeAssistant, home: Home) -> None:
    living = home.area("Living room")
    home.trv(living, "living_trv")
    entry = await setup(hass, [zone("Living room", [living])])
    outdoor = home.sensor(home.area("Balcony"), "balcony", 3.0)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"outdoor_sensor": outdoor, "heating_start": "2026-10-15"}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    assert entry.options == {"outdoor_sensor": outdoor, "heating_start": "2026-10-15"}
    assert entry.runtime_data.outside.sensor == outdoor  # reloaded with the new options


def test_own_presets_text():
    assert parse_presets("Shower: 24\n\n Morning = 21,3 ") == [
        {"name": "Shower", "temperature": 24.0},
        {"name": "Morning", "temperature": 21.5},
    ]
    assert format_presets([{"name": "Shower", "temperature": 24.0}]) == "Shower: 24"
    for bad in ("comfort: 22", "Shower: 24\nshower: 25", "Shower", "Hot: 40", ": 20"):
        with pytest.raises(ValueError):
            parse_presets(bad)
