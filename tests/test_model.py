"""The thermal model on synthetic data: learning cooling and power, preheat start within 0.5 °C, estimates.

A real room: dT/dt = a·u − (k0 + kw·w/10)·(T − T_out). The zone only sees readings every 5 minutes (rounded to
0.1°, like a Zigbee sensor), the valve and the weather — the model has to recover a and k and then say when to
start heating so that the target is reached at the given time.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from math import sin, tau
from zoneinfo import ZoneInfo

import pytest

from custom_components.heat_zones import model

TZ = ZoneInfo("Europe/Warsaw")
STEP = timedelta(minutes=5)
H = STEP.total_seconds() / 3600


class Room:
    """A real room with a thermostat (full power below the target)."""

    def __init__(self, a: float, k0: float, kw: float = 0.0, temp: float = 20.0) -> None:
        self.a, self.k0, self.kw, self.T = a, k0, kw, temp

    def step(self, target: float | None, out: float, w: float = 0.0) -> float:
        k = self.k0 + self.kw * w / 10
        u = 1.0 if target is not None and target > self.T else 0.0
        self.T = self.T + (self.a * u - k * (self.T - out)) * H
        if u and target < self.T:
            self.T = target
        return u


def outside(t: datetime) -> float:
    return 1.0 + 3.0 * sin(tau * (t.hour + t.minute / 60 - 9) / 24)  # from −2° at night to +4° in the afternoon


def wind(t: datetime) -> float:
    return 10.0 + 10.0 * sin(tau * t.day / 3)


def schedule(t: datetime) -> float:
    h = t.hour + t.minute / 60
    return 22.0 if 6 <= h < 8 or 16 <= h < 23 else 17.0


def learned(room: Room, days: int = 5, with_wind: bool = False) -> dict:
    m: dict = {}
    t = datetime(2026, 11, 2, 0, 0, tzinfo=TZ)
    window = None
    for _ in range(int(days * 24 / H)):
        w = wind(t) if with_wind else 0.0
        u = room.step(schedule(t), outside(t), w)
        t += STEP
        reading = round(room.T, 1)  # a sensor every 0.1°
        if window is None:
            window = model.new_window(t.timestamp(), reading, u, outside(t), w if with_wind else None)
            continue
        model.add(window, t.timestamp(), reading, u, outside(t), w if with_wind else None)
        if model.ready(window):
            model.learn(m, window)
            window = model.new_window(t.timestamp(), reading, u, outside(t), w if with_wind else None)
    return m


def test_learns_cooling_and_power():
    m = learned(Room(a=3.0, k0=0.04))
    assert m["samples_k"] >= 10 and m["samples_a"] >= 5
    assert m["k"] == pytest.approx(0.04, abs=0.01)
    assert m["a"] == pytest.approx(3.0, abs=0.4)
    assert model.describe(m)["learned"]
    assert model.confidence(m) > 0.8
    assert model.confidence(None) == 0.1


def test_wind_increases_cooling():
    m = learned(Room(a=1.6, k0=0.03, kw=0.01), days=8, with_wind=True)
    assert model.k(m, 20.0) > model.k(m, 0.0)
    assert model.k(m, 20.0) == pytest.approx(0.03 + 0.02, abs=0.015)


@pytest.mark.parametrize(("out", "t0"), [(-10.0, 17.0), (-2.0, 17.5), (6.0, 18.0)])
def test_preheat_reaches_the_target_on_time(out, t0):
    """Reached at the given time within 0.5 °C, and not much earlier."""
    real = Room(a=3.0, k0=0.04)
    m = learned(Room(a=3.0, k0=0.04))
    now = datetime(2026, 11, 9, 2, 0, tzinfo=TZ)
    at = datetime(2026, 11, 9, 6, 30, tzinfo=TZ)
    start = model.preheat_start(m, model.a(m), t0, now, at, 22.0, 17.0, lambda _t: (out, None), timedelta(hours=6))
    assert now <= start < at

    real.T = t0
    t = now
    warm_since = None
    while t < at:
        real.step(22.0 if t >= start else 17.0, out)
        t += STEP
        if warm_since is None and real.T >= 21.9:
            warm_since = t
    assert pytest.approx(22.0, abs=0.5) == real.T
    assert warm_since is not None and warm_since >= at - timedelta(minutes=30)


def test_preheat_edges():
    m = {"k": 0.04, "a": 1.6}
    now = datetime(2026, 11, 9, 12, 0, tzinfo=TZ)
    at = now + timedelta(hours=2)

    def weather(_t: datetime) -> tuple[float, None]:
        return 0.0, None

    # 23° now and 22° in half an hour: it will not cool below — start at the block
    assert model.preheat_start(
        m, 1.6, 23.0, now, now + timedelta(minutes=30), 22.0, 20.0, weather, timedelta(hours=6)
    ) == (now + timedelta(minutes=30))
    # …but in two hours cooling towards 20° goes below 22°, so start earlier
    assert model.preheat_start(m, 1.6, 23.0, now, at, 22.0, 20.0, weather, timedelta(hours=6)) < at
    assert model.preheat_start(m, 1.6, 10.0, now, at, 22.0, 10.0, weather, timedelta(hours=6)) == now  # too late
    assert model.preheat_start(
        m, 1.6, 10.0, now, now + timedelta(hours=10), 22.0, 10.0, weather, timedelta(hours=6)
    ) == (now + timedelta(hours=4))
    assert model.preheat_start(None, model.a(None), 18.0, now, at, 22.0, 18.0, weather, timedelta(hours=6)) < at


def test_minutes_to_reach():
    m = {"k": 0.04, "a": 2.0}

    def weather(_t: datetime) -> tuple[float, None]:
        return 0.0, None

    now = datetime(2026, 11, 9, 12, 0, tzinfo=TZ)
    assert model.minutes_to_reach(m, 2.0, 22.0, 21.5, now, weather) == 0
    minutes = model.minutes_to_reach(m, 2.0, 19.0, 21.0, now, weather)
    assert minutes is not None and 70 <= minutes <= 120  # 2 °C at about 1.2 °C/h net
    assert model.minutes_to_reach({"k": 0.2, "a": 1.0}, 1.0, 15.0, 22.0, now, weather) is None  # never


# ——— Start from history ———
def nights(k0: float, days: int = 10, out_night: float = 5.0) -> tuple[dict, dict]:
    """Hourly means: heated to 21° by day, at night (0–6) the room cools k0·(T − outside) per hour."""
    room, out = {}, {}
    t = datetime(2026, 10, 1, 0, 0, tzinfo=TZ)
    temp = 21.0
    for _ in range(days * 24):
        out[t] = out_night if t.hour < 8 else 10.0
        room[t] = round(temp, 2)
        temp = temp - k0 * (temp - out[t]) if t.hour < 6 else 21.0
        t += timedelta(hours=1)
    return room, out


def test_k_from_night_statistics():
    room, out = nights(0.008)
    k_, hours = model.k_from_nights(room, out)
    assert k_ == pytest.approx(0.008, abs=0.0003)
    assert hours == 10 * 6
    assert model.k_from_nights(*nights(0.008, out_night=19.5)) is None  # less than 3° from outside says nothing
    assert model.k_of_zone({"living": (0.010, 300), "hall": (0.006, 100)}) == (pytest.approx(0.009), 400)
    assert model.k_of_zone({}) is None


def test_seeded_k_weight_and_further_learning():
    m: dict = {}
    model.seed_k(m, 0.0091, 807, start="2026-09-15", end="2026-10-30")
    assert m["k"] == pytest.approx(0.0091, abs=1e-4)
    assert m["history"]["k"]["weight"] == pytest.approx(model.MEMORY, abs=0.01)
    d = model.describe(m)
    assert (d["source"], d["samples_k"], d["history"]["k"]["hours"]) == ("history", 0, 807)
    assert "at" not in d["history"]["k"]
    small: dict = {}
    model.seed_k(small, 0.01, 6)
    assert small["history"]["k"]["weight"] == 4.0
    for _ in range(5):
        model._learn_k(m, 0.02, None)
    assert 0.0091 < m["k"] < 0.02 and model.source(m) == "history"
    for _ in range(40):
        model._learn_k(m, 0.02, None)
    assert 0.016 < m["k"] < 0.02 and model.source(m) == "learning"
    assert model.source({}) is None


def test_power_from_history_windows():
    real = Room(a=1.5, k0=0.008, temp=18.0)
    t = datetime(2026, 11, 2, 5, 0, tzinfo=TZ)
    samples = []
    for _ in range(4 * 12):  # 4 h of heating from 18° to a target of 24°
        u = real.step(24.0, 5.0)
        t += STEP
        samples.append((t.timestamp(), round(real.T, 1), u, 5.0, None, "living", 24.0))
    m = {"k": 0.008}
    count = model.replay(m, samples, what=("a",))
    assert count >= 2
    assert m["a"] == pytest.approx(1.5, abs=0.15)
    assert "samples_k" not in m
    near = [(*x[:6], x[1] + 0.2) for x in samples]  # the target just above the room: nothing to learn
    assert model.replay({"k": 0.008}, near, what=("a",)) == 0
    broken = [(x[0], None if i % 15 == 14 else x[1], *x[2:]) for i, x in enumerate(samples)]
    assert model.replay({"k": 0.008}, broken, what=("a",)) == 0

    m = {"k": 0.008}
    model.seed_a(m, 1.5, 6, start="2026-10-30")
    assert model.describe(m)["source"] == "history" and model.describe(m)["history"]["a"]["windows"] == 6
    window = model.new_window(0, 20.0, 1.0, 5.0, None, 24.0)
    model.add(window, 5400, 23.0, 1.0, 5.0, None, 24.0)
    assert model.learn(m, window) == "a"
    assert m["a"] == pytest.approx(1.5 + 0.15 * (2.132 - 1.5), abs=0.01)
    assert model.a({"k": 0.009}, rate=1.0) == pytest.approx(1.18)
