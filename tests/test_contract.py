"""The schedule on a live zone and the contract for HomeAI and other systems (services and attributes)."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
import pytest

from .common import Home, local, settle, setup, tick, zone

LIVING = "climate.living_area"
BEDROOM = "climate.bedroom"
WEEKLY = [
    {"days": ["mon", "tue", "wed", "thu", "fri"], "time": "06:30", "preset_mode": "comfort"},
    {"days": ["mon", "tue", "wed", "thu", "fri"], "time": "08:00", "preset_mode": "eco"},
    {"days": ["mon", "tue", "wed", "thu", "fri"], "time": "16:00", "preset_mode": "comfort"},
    {"days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], "time": "22:30", "preset_mode": "sleep"},
    {"days": ["sat", "sun"], "time": "08:00", "temperature": 21.5},
]


@pytest.fixture
async def zones(hass: HomeAssistant, home: Home) -> dict[str, Any]:
    living, bedroom = home.area("Living room"), home.area("Bedroom")
    e = {
        "living_trv": home.trv(living, "living_trv", current=20.5),
        "living": home.sensor(living, "living", 20.5),
        "bedroom_trv": home.trv(bedroom, "bedroom_trv", current=19.0),
        "bedroom": home.sensor(bedroom, "bedroom", 19.0),
    }
    e["entry"] = await setup(
        hass,
        [
            zone("Living area", [living], custom_presets=[{"name": "Party", "temperature": 23}]),
            zone("Bedroom", [bedroom], optimum_start=False),
        ],
    )
    return e


async def call(hass: HomeAssistant, service: str, target: str | list[str] | None = None, **data: Any) -> Any:
    if target is not None:
        data["entity_id"] = target
    response = service in ("add_override", "remove_override", "get_schedule", "estimate")
    result = await hass.services.async_call("heat_zones", service, data, blocking=True, return_response=response)
    await hass.async_block_till_done()
    return result


async def test_follows_the_schedule(hass: HomeAssistant, home: Home, zones: dict, freezer: Any) -> None:
    await call(hass, "set_schedule", [LIVING, BEDROOM], weekly=WEEKLY)
    st = hass.states.get(BEDROOM)  # Tuesday 21:00
    assert (st.attributes["temperature"], st.attributes["preset_mode"], st.attributes["source"]) == (
        21.0,
        "comfort",
        "schedule",
    )
    nxt = hass.states.get("sensor.bedroom_next_change")
    assert local(nxt.state) == local("2026-11-17T22:30:00+01:00")
    assert nxt.attributes["preset_mode"] == "sleep" and nxt.attributes["temperature"] == 18.0
    # the target changes at the block's time, not at the next 5-minute tick
    freezer.move_to("2026-11-17 22:30:00.5+01:00")
    await tick(hass, freezer, minutes=0.1)
    assert hass.states.get(BEDROOM).attributes["temperature"] == 18.0
    assert home.values("set_temperature", zones["bedroom_trv"], "temperature")[-1] == 18.0
    # the schedule switch off: the zone keeps its target and ignores blocks
    await hass.services.async_call("switch", "turn_off", {"entity_id": "switch.bedroom_schedule"}, blocking=True)
    freezer.move_to("2026-11-18 06:31:00+01:00")
    await tick(hass, freezer, minutes=0.1)
    st = hass.states.get(BEDROOM)
    assert (st.attributes["temperature"], st.attributes["source"]) == (18.0, "manual")
    assert hass.states.get("sensor.bedroom_next_change").state == "unknown"


async def test_manual_change_lasts_until_the_next_block(hass: HomeAssistant, zones: dict, freezer: Any) -> None:
    await call(hass, "set_schedule", BEDROOM, weekly=WEEKLY)
    await hass.services.async_call(
        "climate", "set_temperature", {"entity_id": BEDROOM, "temperature": 23}, blocking=True
    )
    st = hass.states.get(BEDROOM)
    assert (st.attributes["temperature"], st.attributes["source"], st.attributes["hold"]["mode"]) == (
        23.0,
        "hold",
        "next_block",
    )
    assert local(st.attributes["hold"]["until"]) == local("2026-11-17T22:30:00+01:00")
    freezer.move_to("2026-11-17 22:31:00+01:00")
    await tick(hass, freezer, minutes=0.1)
    assert hass.states.get(BEDROOM).attributes["preset_mode"] == "sleep"
    # a preset set by hand is a manual change too
    await hass.services.async_call(
        "climate", "set_preset_mode", {"entity_id": BEDROOM, "preset_mode": "away"}, blocking=True
    )
    st = hass.states.get(BEDROOM)
    assert (st.attributes["preset_mode"], st.attributes["temperature"], st.attributes["source"]) == (
        "away",
        16.0,
        "hold",
    )


async def test_hold_until_permanent_and_resume(hass: HomeAssistant, zones: dict, freezer: Any) -> None:
    await call(hass, "set_schedule", BEDROOM, weekly=WEEKLY)
    await call(hass, "hold", BEDROOM, temperature=22, until="2026-11-18T07:00:00+01:00")
    st = hass.states.get(BEDROOM)
    assert st.attributes["hold"] == {"mode": "until", "until": "2026-11-18T07:00:00+01:00"}
    freezer.move_to("2026-11-18 06:45:00+01:00")
    await tick(hass, freezer, minutes=0.1)
    assert hass.states.get(BEDROOM).attributes["temperature"] == 22.0  # through the 22:30 and 6:30 blocks
    await call(hass, "hold", BEDROOM, permanent=True)
    freezer.move_to("2026-11-18 09:00:00+01:00")
    await tick(hass, freezer, minutes=0.1)
    st = hass.states.get(BEDROOM)
    assert (st.attributes["temperature"], st.attributes["hold"]["mode"]) == (22.0, "permanent")
    await hass.services.async_call(
        "climate", "set_temperature", {"entity_id": BEDROOM, "temperature": 21}, blocking=True
    )
    assert hass.states.get(BEDROOM).attributes["hold"]["mode"] == "permanent"  # adjusting keeps the permanent hold
    await call(hass, "resume", BEDROOM)
    st = hass.states.get(BEDROOM)
    assert (st.attributes["preset_mode"], st.attributes["source"]) == ("eco", "schedule")


async def test_preheat_before_a_block(hass: HomeAssistant, home: Home, zones: dict, freezer: Any) -> None:
    await call(hass, "set_schedule", LIVING, weekly=WEEKLY)
    freezer.move_to("2026-11-18 03:00:00+01:00")
    await tick(hass, freezer, minutes=0.1)
    home.set_temperature(zones["living"], 18.0)
    await settle(hass)
    st = hass.states.get(LIVING)
    assert st.attributes["temperature"] == 18.0
    nxt = hass.states.get("sensor.living_area_next_change")
    preheat_at = local(nxt.state)
    assert nxt.attributes["source"] == "preheat"
    assert local("2026-11-18T03:30:00+01:00") <= preheat_at < local("2026-11-18T06:30:00+01:00")
    plan = st.attributes["homeai_plan"]
    assert any(p["title"] == "Living area: heating up for Comfort 21 °C" for p in plan)
    freezer.move_to(preheat_at + timedelta(seconds=1))
    await tick(hass, freezer, minutes=0.1)
    st = hass.states.get(LIVING)
    assert (st.attributes["temperature"], st.attributes["source"]) == (21.0, "preheat")
    assert st.attributes["reason"] == "Heating up for Comfort 21 °C at 06:30"
    # the bedroom has preheating turned off
    assert hass.states.get("sensor.bedroom_next_change").attributes["source"] != "preheat"


async def test_overrides_contract(hass: HomeAssistant, zones: dict, freezer: Any) -> None:
    await call(hass, "set_schedule", [LIVING, BEDROOM], weekly=WEEKLY)
    result = await call(
        hass,
        "add_override",
        [LIVING, BEDROOM],
        start="2026-11-18T07:00:00+01:00",
        end="2026-11-19T18:00:00+01:00",
        preset_mode="away",
        reason="Trip to the mountains",
        source="homeai",
    )
    oid = result["override_id"]
    assert isinstance(oid, str) and oid
    schedule = await call(hass, "get_schedule")
    assert set(schedule) == {LIVING, BEDROOM}
    living = schedule[LIVING]
    assert living["enabled"] is True and living["weekly"] == WEEKLY
    assert living["overrides"] == [
        {
            "override_id": oid,
            "start": "2026-11-18T07:00:00+01:00",
            "end": "2026-11-19T18:00:00+01:00",
            "preset_mode": "away",
            "reason": "Trip to the mountains",
            "source": "homeai",
        }
    ]
    plan = hass.states.get(LIVING).attributes["homeai_plan"]
    trip = next(p for p in plan if "Trip" in p["title"])
    assert trip == {
        "start": "2026-11-18T07:00:00+01:00",
        "end": "2026-11-19T09:00:00+01:00",  # the plan covers 36 hours
        "title": "Living area: Away 16 °C (Trip to the mountains)",
    }
    assert len(plan) <= 50 and all({"start", "end", "title"} <= set(p) for p in plan)
    # the same id replaces
    await call(
        hass,
        "add_override",
        LIVING,
        end="2026-11-17T23:00:00+01:00",
        temperature=23.5,
        source="homeai",
        override_id=oid,
    )
    st = hass.states.get(LIVING)
    assert (st.attributes["temperature"], st.attributes["source"], st.attributes["override_id"]) == (
        23.5,
        "override",
        oid,
    )
    assert len((await call(hass, "get_schedule", LIVING))[LIVING]["overrides"]) == 1
    # remove by source: all from HomeAI in every zone
    assert (await call(hass, "remove_override", source="homeai"))["removed"] == 2
    assert hass.states.get(LIVING).attributes["source"] == "schedule"
    # remove by id
    oid2 = (await call(hass, "add_override", BEDROOM, end="2026-11-18T10:00:00+01:00", preset_mode="eco"))[
        "override_id"
    ]
    assert (await call(hass, "remove_override", BEDROOM, override_id=oid2))["removed"] == 1


async def test_override_ends_by_itself(hass: HomeAssistant, zones: dict, freezer: Any) -> None:
    await call(hass, "add_override", BEDROOM, end="2026-11-17T21:30:00+01:00", temperature=24)
    assert hass.states.get(BEDROOM).attributes["temperature"] == 24.0
    freezer.move_to("2026-11-17 21:30:01+01:00")
    await tick(hass, freezer, minutes=0.1)
    assert hass.states.get(BEDROOM).attributes["source"] == "manual"
    assert (await call(hass, "get_schedule", BEDROOM))[BEDROOM]["overrides"] == []


@pytest.mark.parametrize(
    ("data", "key"),
    [
        ({"end": "2026-11-18T10:00:00+01:00"}, "preset_or_temperature"),
        ({"end": "2026-11-18T10:00:00+01:00", "preset_mode": "eco", "temperature": 20}, "preset_or_temperature"),
        ({"end": "2026-11-17T10:00:00+01:00", "preset_mode": "eco"}, "invalid_period"),
        ({"end": "2027-06-01T10:00:00+01:00", "preset_mode": "eco"}, "period_too_long"),
        ({"end": "2026-11-18T10:00:00+01:00", "preset_mode": "party"}, "unknown_preset"),
    ],
)
async def test_override_errors(hass: HomeAssistant, zones: dict, data: dict, key: str) -> None:
    with pytest.raises(ServiceValidationError) as err:
        await call(hass, "add_override", BEDROOM, **data)
    assert err.value.translation_key == key


async def test_own_preset_in_one_zone_only(hass: HomeAssistant, zones: dict) -> None:
    await call(hass, "add_override", LIVING, end="2026-11-18T01:00:00+01:00", preset_mode="Party")
    assert hass.states.get(LIVING).attributes["temperature"] == 23.0
    assert "Party" in hass.states.get(LIVING).attributes["preset_modes"]
    assert "Party" not in hass.states.get(BEDROOM).attributes["preset_modes"]


async def test_set_schedule_errors_and_targets(hass: HomeAssistant, zones: dict) -> None:
    with pytest.raises(ServiceValidationError) as err:
        await call(hass, "set_schedule", BEDROOM, weekly=[{"days": ["mon"], "time": "6:00", "preset_mode": "Party"}])
    assert err.value.translation_key == "schedule_unknown_preset"
    with pytest.raises(ServiceValidationError) as err:
        await call(hass, "set_schedule", weekly=WEEKLY)
    assert err.value.translation_key == "no_target"
    with pytest.raises(ServiceValidationError) as err:
        await call(hass, "set_schedule", "climate.living_trv", weekly=WEEKLY)
    assert err.value.translation_key == "not_a_zone"
    with pytest.raises(ServiceValidationError) as err:
        await call(hass, "remove_override", BEDROOM)
    assert err.value.translation_key == "id_or_source"


async def test_estimate_and_reset_learning(hass: HomeAssistant, zones: dict, freezer: Any) -> None:
    result = await call(hass, "estimate", temperature=21.0)
    assert set(result) == {LIVING, BEDROOM}
    bedroom = result[BEDROOM]
    assert set(bedroom) == {"minutes", "confidence"}
    assert isinstance(bedroom["minutes"], int) and bedroom["minutes"] > 0  # 19 → 21 °C
    assert 0 <= bedroom["confidence"] <= 1
    assert (await call(hass, "estimate", BEDROOM, temperature=18.0))[BEDROOM]["minutes"] == 0
    engine = zones["entry"].runtime_data
    zid = next(z.id for z in engine.zones.values() if z.name == "Bedroom")
    engine.zones[zid].state["learning"] = {"rate": 1.2, "samples": 40}
    await call(hass, "reset_learning", BEDROOM)
    assert engine.zones[zid].state["learning"] == {}


async def test_signals_and_plan_format(hass: HomeAssistant, home: Home, zones: dict) -> None:
    home.set_temperature(zones["bedroom"], None)
    await settle(hass)
    st = hass.states.get(BEDROOM)
    (signal,) = st.attributes["homeai_signals"]
    assert set(signal) <= {"id", "title", "severity", "category", "description", "need", "group"}
    assert 0 <= signal["severity"] <= 4
    assert signal["category"] in ("safety", "security", "damage", "system", "energy", "comfort", "maintenance", "info")
    assert signal["need"] in ("nobody", "member", "admin", "service")
    assert signal["title"].startswith("Bedroom: temperature sensor silent since")
    assert st.attributes["homeai_schedule"] == {"version": 1, "domain": "heat_zones", "areas": ["bedroom"]}
    # heating off: no plan
    await hass.services.async_call("climate", "turn_off", {"entity_id": BEDROOM}, blocking=True)
    assert hass.states.get(BEDROOM).attributes["homeai_plan"] == []


async def test_presets_for_all_zones_in_one_call(hass: HomeAssistant, zones: dict) -> None:
    await hass.services.async_call(
        "climate", "set_preset_mode", {"entity_id": [LIVING, BEDROOM], "preset_mode": "eco"}, blocking=True
    )
    assert {hass.states.get(e).attributes["preset_mode"] for e in (LIVING, BEDROOM)} == {"eco"}


async def test_override_sent_again_unchanged_keeps_its_age(hass: HomeAssistant, zones: dict, freezer: Any) -> None:
    """A sender that re-sends its override (e.g. after a restart) must not undo a person's change made since."""
    trip = {"start": "2026-11-17T20:00:00+01:00", "end": "2026-11-18T20:00:00+01:00", "preset_mode": "away"}
    await call(hass, "add_override", BEDROOM, override_id="homeai_away_1", source="homeai", **trip)
    assert hass.states.get(BEDROOM).attributes["preset_mode"] == "away"
    freezer.tick(timedelta(minutes=10))
    await hass.services.async_call(
        "climate", "set_temperature", {"entity_id": BEDROOM, "temperature": 22}, blocking=True
    )
    assert hass.states.get(BEDROOM).attributes["source"] == "hold"  # back early: the person wins
    freezer.tick(timedelta(minutes=10))
    await call(hass, "add_override", BEDROOM, override_id="homeai_away_1", source="homeai", reason="Trip", **trip)
    assert hass.states.get(BEDROOM).attributes["temperature"] == 22.0  # unchanged override: still the person
    # a changed override is a new instruction
    await call(
        hass,
        "add_override",
        BEDROOM,
        override_id="homeai_away_1",
        source="homeai",
        **{**trip, "end": "2026-11-18T21:00:00+01:00"},
    )
    st = hass.states.get(BEDROOM)
    assert (st.attributes["source"], st.attributes["preset_mode"]) == ("override", "away")


async def test_state_context_says_who_changed_it(
    hass: HomeAssistant, zones: dict, freezer: Any, hass_admin_user: Any
) -> None:
    """HomeAI tells people's changes from scheduled ones by the context of the state."""
    from homeassistant.core import Context

    await call(hass, "set_schedule", BEDROOM, weekly=WEEKLY)
    person = Context(user_id=hass_admin_user.id)
    await hass.services.async_call(
        "climate", "set_temperature", {"entity_id": BEDROOM, "temperature": 23}, blocking=True, context=person
    )
    assert hass.states.get(BEDROOM).context.id == person.id
    homeai = Context(user_id=hass_admin_user.id)
    await hass.services.async_call(
        "heat_zones",
        "add_override",
        {"entity_id": BEDROOM, "end": "2026-11-18T01:00:00+01:00", "preset_mode": "eco", "source": "homeai"},
        blocking=True,
        context=homeai,
    )
    assert hass.states.get(BEDROOM).context.id == homeai.id
    # the override ends by itself: a fresh context, no user
    freezer.move_to("2026-11-18 01:00:01+01:00")
    await tick(hass, freezer, minutes=0.1)
    st = hass.states.get(BEDROOM)
    assert st.attributes["preset_mode"] == "sleep"
    assert st.context.user_id is None and st.context.parent_id is None
