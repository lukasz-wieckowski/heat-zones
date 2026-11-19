"""The weekly schedule, overrides, holds and preheat without Home Assistant."""

from __future__ import annotations

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import pytest

from custom_components.heat_zones.const import HOLD_NEXT, HOLD_PERMANENT, HOLD_UNTIL, PRESET_DEFAULTS
from custom_components.heat_zones.schedule import (
    HOLD,
    MANUAL,
    OVERRIDE,
    PREHEAT,
    SCHEDULE,
    Hold,
    Override,
    Program,
    ScheduleError,
    block_at,
    next_start,
    normalize_weekly,
    with_preheat,
)

TZ = ZoneInfo("Europe/Warsaw")
WORKDAYS = ["mon", "tue", "wed", "thu", "fri"]
WEEKEND = ["sat", "sun"]
WEEKLY = [
    {"days": WORKDAYS, "time": "06:30", "preset_mode": "comfort"},
    {"days": WORKDAYS, "time": "08:00", "preset_mode": "eco"},
    {"days": WORKDAYS, "time": "16:00", "preset_mode": "comfort"},
    {"days": [*WORKDAYS, *WEEKEND], "time": "22:30", "preset_mode": "sleep"},
    {"days": WEEKEND, "time": "08:00", "temperature": 21.5},
]


def t(day: int, hour: int, minute: int = 0) -> datetime:
    """November 2026: the 16th is a Monday."""
    return datetime(2026, 11, day, hour, minute, tzinfo=TZ)


def program(**kw) -> Program:
    defaults = {
        "presets": dict(PRESET_DEFAULTS),
        "schedule_enabled": True,
        "weekly": normalize_weekly(WEEKLY, PRESET_DEFAULTS),
        "overrides": [],
        "hold": None,
        "manual": (20.0, None),
    }
    return Program(**{**defaults, **kw})


def override(oid: str, start: datetime, end: datetime, created: datetime | None = None, **value) -> Override:
    return Override(
        oid,
        start,
        end,
        value.get("preset_mode"),
        value.get("temperature"),
        value.get("reason", ""),
        "test",
        created or start,
    )


# ——— Validation ———
def test_normalize_sorts_and_cleans():
    weekly = normalize_weekly(
        [
            {"days": ["Saturday", "sun"], "time": "8:00:00", "temperature": 21.3},
            {"days": "mon", "time": "06:30", "preset_mode": "comfort"},
        ],
        PRESET_DEFAULTS,
    )
    assert weekly == [
        {"days": ["mon"], "time": "06:30", "preset_mode": "comfort"},
        {"days": ["sat", "sun"], "time": "08:00", "temperature": 21.5},
    ]


@pytest.mark.parametrize(
    ("weekly", "code"),
    [
        ({"days": ["mon"]}, "invalid_schedule"),
        ([{"days": [], "time": "06:00", "preset_mode": "eco"}], "invalid_days"),
        ([{"days": ["xyz"], "time": "06:00", "preset_mode": "eco"}], "invalid_days"),
        ([{"days": ["mon"], "time": "25:00", "preset_mode": "eco"}], "invalid_time"),
        ([{"days": ["mon"], "time": "06:00"}], "preset_or_temperature"),
        ([{"days": ["mon"], "time": "06:00", "preset_mode": "eco", "temperature": 20}], "preset_or_temperature"),
        ([{"days": ["mon"], "time": "06:00", "preset_mode": "party"}], "unknown_preset"),
        ([{"days": ["mon"], "time": "06:00", "temperature": 35}], "invalid_temperature"),
        (
            [
                {"days": ["mon", "tue"], "time": "06:00", "preset_mode": "eco"},
                {"days": ["tue"], "time": "06:00", "temperature": 20},
            ],
            "duplicate_block",
        ),
    ],
)
def test_normalize_rejects(weekly, code):
    with pytest.raises(ScheduleError) as err:
        normalize_weekly(weekly, PRESET_DEFAULTS)
    assert err.value.code == code


# ——— The base: the block that started last ———
def test_block_in_force_crosses_days_and_weeks():
    weekly = normalize_weekly(WEEKLY, PRESET_DEFAULTS)
    assert block_at(weekly, t(17, 7))[1]["preset_mode"] == "comfort"  # Tuesday 7:00
    assert block_at(weekly, t(17, 3))[0] == t(16, 22, 30)  # sleep since Monday night
    assert block_at(weekly, t(21, 7))[0] == t(20, 22, 30)  # Saturday 7:00: still Friday's sleep
    assert block_at(weekly, t(23, 5))[0] == t(22, 22, 30)  # Monday early: Sunday's sleep
    assert next_start(weekly, t(20, 23)) == t(21, 8)  # after Friday's sleep — Saturday 8:00
    assert block_at([{"days": ["wed"], "time": "12:00", "temperature": 20}], t(16, 12))[0] == t(11, 12)


def test_timeline_follows_the_schedule():
    p = program()
    segments = p.timeline(t(17, 21), t(17, 21) + timedelta(hours=36))
    assert [(s.start, s.setting.temperature, s.setting.preset_mode, s.setting.source) for s in segments] == [
        (t(17, 21), 21.0, "comfort", SCHEDULE),
        (t(17, 22, 30), 18.0, "sleep", SCHEDULE),
        (t(18, 6, 30), 21.0, "comfort", SCHEDULE),
        (t(18, 8), 19.0, "eco", SCHEDULE),
        (t(18, 16), 21.0, "comfort", SCHEDULE),
        (t(18, 22, 30), 18.0, "sleep", SCHEDULE),
        (t(19, 6, 30), 21.0, "comfort", SCHEDULE),
        (t(19, 8), 19.0, "eco", SCHEDULE),
    ]
    assert segments[-1].end == t(19, 9)


def test_schedule_off_or_empty_is_manual():
    for p in (program(schedule_enabled=False), program(weekly=[])):
        (segment,) = p.timeline(t(17, 21), t(18, 21))
        assert segment.setting.source == MANUAL and segment.setting.temperature == 20.0


def test_preset_temperatures_follow_the_presets():
    p = program(presets={**PRESET_DEFAULTS, "comfort": 22.5})
    assert p.setting_at(t(17, 21)).temperature == 22.5


# ——— Overrides ———
def test_override_beats_the_schedule_and_ends():
    away = override("trip", t(18, 7), t(19, 18), preset_mode="away", reason="Trip")
    p = program(overrides=[away])
    segments = p.timeline(t(17, 21), t(19, 21))
    found = [(s.start, s.setting.source, s.setting.temperature) for s in segments]
    assert (t(18, 7), OVERRIDE, 16.0) in found
    assert (t(19, 18), SCHEDULE, 21.0) in found  # Thursday 18:00: comfort since 16:00
    s = p.setting_at(t(18, 12))
    assert (s.override_id, s.reason) == ("trip", "Trip")


def test_newest_override_wins():
    eco = override("eco", t(18, 9), t(18, 20), temperature=18.0)
    guests = override("guests", t(18, 17), t(18, 19), preset_mode="comfort")
    p = program(overrides=[guests, eco])
    assert p.setting_at(t(18, 18)).override_id == "guests"  # started later
    assert p.setting_at(t(18, 19, 30)).override_id == "eco"  # back to the earlier one until it ends


# ——— Holds ———
def test_hold_until_next_change():
    p = program(hold=Hold(23.0, None, t(17, 21), HOLD_NEXT))
    assert p.hold_end() == t(17, 22, 30)
    assert p.setting_at(t(17, 22)).source == HOLD
    assert p.setting_at(t(17, 22, 30)).preset_mode == "sleep"


def test_hold_ends_at_an_override_boundary():
    guests = override("guests", t(18, 10), t(18, 12), temperature=22.0)
    p = program(overrides=[guests], hold=Hold(23.0, None, t(18, 9), HOLD_NEXT))
    assert p.hold_end() == t(18, 10)
    p = program(overrides=[guests], hold=Hold(23.0, None, t(18, 11), HOLD_NEXT))
    assert p.setting_at(t(18, 11, 30)).source == HOLD  # newer than the override
    assert p.hold_end() == t(18, 12)


def test_hold_until_and_permanent():
    p = program(hold=Hold(23.0, None, t(17, 21), HOLD_UNTIL, t(18, 7)))
    assert p.setting_at(t(18, 6, 45)).source == HOLD
    assert p.setting_at(t(18, 7)).preset_mode == "comfort"
    p = program(hold=Hold(22.0, None, t(17, 21), HOLD_PERMANENT))
    assert all(s.setting.source == HOLD for s in p.timeline(t(17, 21), t(19, 21)))


def test_override_starting_later_beats_a_permanent_hold_and_the_hold_returns():
    away = override("trip", t(18, 7), t(18, 18), preset_mode="away", created=t(17, 20))
    p = program(overrides=[away], hold=Hold(22.0, None, t(17, 21), HOLD_PERMANENT))
    assert p.setting_at(t(18, 6)).source == HOLD
    assert p.setting_at(t(18, 12)).source == OVERRIDE  # starts after the hold was set
    assert p.setting_at(t(18, 19)).source == HOLD


# ——— Preheat ———
def test_preheat_starts_the_next_warmer_block_early():
    p = program()
    now = t(18, 5)
    segments = p.timeline(now, now + timedelta(hours=36))

    def start_for(at, target, before):
        assert (at, target, before) == (t(18, 6, 30), 21.0, 18.0)
        return t(18, 5, 30)

    result, preheat = with_preheat(segments, now, start_for)
    assert [(s.start, s.setting.source) for s in result[:3]] == [
        (t(18, 5), SCHEDULE),
        (t(18, 5, 30), PREHEAT),
        (t(18, 6, 30), SCHEDULE),
    ]
    assert preheat == (t(18, 6, 30), t(18, 5, 30))
    # when the start has passed, the zone heats for the block now
    result, _ = with_preheat(segments, t(18, 5, 40), lambda *_: t(18, 5, 30))
    assert result[0].setting.source == PREHEAT and result[0].setting.temperature == 21.0


def test_preheat_once_started_goes_on():
    now = t(18, 6)
    segments = program().timeline(now, now + timedelta(hours=36))
    # the room got warmer and the model says 6:15 now — but the preheat started at 5:30 continues
    result, kept = with_preheat(segments, now, lambda *_: t(18, 6, 15), sticky=(t(18, 6, 30), t(18, 5, 30)))
    assert result[0].setting.source == PREHEAT and kept == (t(18, 6, 30), t(18, 5, 30))
    # without the model (no room temperature) only the started preheat goes on
    result, _ = with_preheat(segments, now, None, sticky=(t(18, 6, 30), t(18, 5, 30)))
    assert result[0].setting.source == PREHEAT
    result, kept = with_preheat(segments, now, None)
    assert result[0].setting.source == SCHEDULE and kept is None


def test_no_preheat_for_cooler_blocks_or_explicit_holds():
    now = t(17, 21)
    segments = program().timeline(now, now + timedelta(hours=36))
    assert with_preheat(segments, now, lambda *_: t(17, 20))[1] is None  # 22:30 sleep is cooler
    held = program(hold=Hold(16.0, None, t(18, 5), HOLD_UNTIL, t(18, 6, 30)))
    segments = held.timeline(t(18, 5, 10), t(18, 20))
    assert with_preheat(segments, t(18, 5, 10), lambda *_: t(18, 5, 30))[1] is None


def test_no_preheat_towards_the_horizon_of_an_open_ended_override():
    """Nobody home: eco until a horizon the sender keeps moving — the room must not heat up towards it."""
    nobody = Override("nobody", t(18, 9), t(18, 20), "eco", None, "Nobody home", "homeai", t(18, 9), open_end=True)
    p = program(overrides=[nobody])
    now = t(18, 18)
    segments = p.timeline(now, now + timedelta(hours=36))
    assert (segments[1].start, segments[1].setting.preset_mode) == (t(18, 20), "comfort")  # still the honest end
    result, kept = with_preheat(segments, now, lambda *_: t(18, 18, 30), horizons=p.horizons)
    assert result == segments and kept is None
    # a real end (back from a trip) is prepared for
    trip = Override("trip", t(18, 9), t(18, 20), "away", None, "Trip", "homeai", t(18, 9))
    p = program(overrides=[trip])
    segments = p.timeline(now, now + timedelta(hours=36))
    result, kept = with_preheat(segments, now, lambda *_: t(18, 18, 30), horizons=p.horizons)
    assert kept == (t(18, 20), t(18, 18, 30))
