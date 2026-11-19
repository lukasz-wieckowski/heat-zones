"""Thermal model of a zone: one resistance and one capacity.

    dT/dt = a·u − k(w)·(T − T_out),      k(w) = k0 + kw·w/10

- `a` — heating power: how many °C/h the room gains with the valve open (before losses);
- `u` — the share of time the valve was open (0–1, from the thermostat's `hvac_action`);
- `k` — cooling (1/h): which part of the difference between the room and outside the room loses per hour;
- `w` — wind from the forecast (km/h) when the weather provides it; without wind k = k0.

Learning online: every 5 minutes the zone adds a reading to a window, and a 90-minute window (Zigbee sensors
report every 25–48 minutes) teaches `k` when the valve was closed or `a` when it heated almost all the time
(mixed windows are skipped). Parameters live in the zone state (`learning` → `model`). The model gives the
preheat start — when to begin so that a block's target is reached on time — and estimates.

Start from history, so preheat works from the first day:

- `k` from long-term statistics — nights (hourly means 0:00–6:00) before the heating start, when the room only
  cools: dT/h = −k·(T − T_out), hours with a difference of at least 3°. It enters the least-squares sums with the
  weight of the number of hours (an hour = 2/3 of a learning window), at most the full memory of learning
  (1/(1 − FORGET) ≈ 33 windows); online learning corrects it like any old window;
- `a` from the history of the zone's climate entity (the last 10 days): the same 90-minute windows as live.

`source` in `describe()` says where the model comes from: `history` (the start from history still dominates),
`learning` (online learning dominates) or None (defaults). The functions are pure (no Home Assistant).
"""

from __future__ import annotations

from collections.abc import Callable, Iterable
from datetime import datetime, timedelta, tzinfo
from math import ceil
from typing import Any

STEP = timedelta(minutes=5)  # simulation step
_STEP_H = STEP.total_seconds() / 3600
K_DEFAULT = 0.05  # 1/h — time constant about 20 h (a flat in a block of flats) until learning knows better
K_MIN = 0.001  # 1/h — lower limit of cooling
A_DEFAULT = 2.0  # °C/h with the valve open
WINDOW = timedelta(minutes=90)  # learning window
MIN_DIFFERENCE = 4.0  # °C between the room and outside — less is too weak a cooling signal
FORGET = 0.97  # old cooling windows weigh less and less (memory of about 30 windows)
TOLERANCE = 0.05  # °C — this much may be missing at the block's time
CONFIDENT = 4  # windows — from this many a parameter counts as learned
# power only from windows of almost continuous heating: near the target the thermostat heats briefly and often,
# and the room stands still — such a window understates the power
CONTINUOUS = 0.8
# …and only from windows that ended clearly below the target: just below it the thermostat still says "heating"
# while the valve already throttles
NEAR_TARGET = 0.3
MEMORY = 1 / (1 - FORGET)  # ≈ 33 windows — the weight of the full memory of cooling
NIGHT = range(0, 6)  # cooling from hour pairs 0→1 … 5→6 (hourly means of the night 0:00–6:00)
MIN_DIFFERENCE_NIGHT = 3.0  # °C — hourly means are smoother than windows
ESTIMATE_MAX = timedelta(hours=12)
K_CONFIDENT = 12  # cooling windows for full confidence
A_CONFIDENT = 8  # heating windows for full confidence

# weather at time t: (outside temperature °C, wind km/h) — None when unknown
Weather = Callable[[datetime], tuple[float | None, float | None]]
# a history sample every 5 min: (time in s, temperature at the measuring point or None, valve 0/1, outside, wind,
# measuring point, target)
Sample = tuple[float, float | None, float, float | None, float | None, str | None, float | None]


def k(model: dict[str, Any] | None, wind: float | None = None) -> float:
    m = model or {}
    k0 = m.get("k")
    if k0 is None:
        return K_DEFAULT
    return k0 + (m.get("kw") or 0.0) * (wind or 0.0) / 10


def a(model: dict[str, Any] | None, rate: float | None = None) -> float:
    """Heating power; without learning — from the heating rate (gain while heating plus losses at a 20° difference
    from outside, with the model's cooling when known)."""
    m = model or {}
    if m.get("a") is not None:
        return m["a"]
    if rate:
        return max(A_DEFAULT / 2, rate + k(m) * 20)
    return A_DEFAULT


def _history_dominates(m: dict[str, Any]) -> bool:
    """Whether the start from history still weighs more than the online learning that came after it."""
    h = m.get("history") or {}
    if hk := h.get("k"):
        after = max(0, m.get("samples_k", 0) - hk.get("at", 0))
        left = hk.get("weight", 0.0) * FORGET**after
        if left > (m.get("ls") or [0.0])[0] - left:
            return True
    if ha := h.get("a"):
        return m.get("samples_a", 0) - ha.get("at", 0) < ha.get("windows", 0)
    return False


def source(model: dict[str, Any] | None) -> str | None:
    """`history` (the start from history still dominates), `learning` or None (defaults)."""
    m = model or {}
    if _history_dominates(m):
        return "history"
    if m.get("samples_k", 0) or m.get("samples_a", 0) or m.get("history"):
        return "learning"
    return None


def confidence(model: dict[str, Any] | None, outside_known: bool = True) -> float:
    """How much to trust estimates, 0–1: defaults alone give 0.1, a learned cooling and power give 1."""
    m = model or {}
    h = m.get("history") or {}
    c_k = 1.0 if "k" in h else min(1.0, m.get("samples_k", 0) / K_CONFIDENT)
    c_a = min(1.0, m.get("samples_a", 0) / A_CONFIDENT)
    if "a" in h:
        c_a = max(c_a, 0.8)
    value = 0.1 + 0.9 * (0.4 * c_k + 0.6 * c_a)
    if not outside_known:
        value *= 0.8
    return round(value, 2)


def describe(model: dict[str, Any] | None) -> dict[str, Any]:
    m = model or {}
    h = m.get("history") or {}
    result = {
        "k": m.get("k"),
        "kw": m.get("kw"),
        "a": m.get("a"),
        "samples_k": m.get("samples_k", 0),
        "samples_a": m.get("samples_a", 0),
        # the start from history counts as learned too: k from hundreds of night hours, a from enough windows
        "learned": (m.get("samples_k", 0) >= CONFIDENT or "k" in h)
        and (m.get("samples_a", 0) >= CONFIDENT or "a" in h),
        "source": source(m),
    }
    if h:
        result["history"] = {what: {x: v for x, v in d.items() if x != "at"} for what, d in h.items()}
    return result


# ——— Start from history ———
def k_from_nights(
    room: dict[datetime, float], outside: dict[datetime, float], zone: tzinfo | None = None
) -> tuple[float, int] | None:
    """Cooling from hourly means of nights without heating: dT/h = −k·(T − T_out).

    Keys are starts of hours (best in UTC — in the night of a clock change two local 2:00 hours are one key); the
    hour of the night is taken in the time zone `zone`. Each pair of consecutive night hours (0→1 … 5→6) gives the
    change dT and the mean difference from outside Δ (only Δ ≥ MIN_DIFFERENCE_NIGHT); k is least squares through
    zero, Σ(−dT·Δ)/ΣΔ². Returns (k, number of hours) or None when there is no hour.
    """
    temps = {t.timestamp(): (t, v) for t, v in room.items() if v is not None}
    out = {t.timestamp(): v for t, v in outside.items() if v is not None}
    num = den = 0.0
    n = 0
    for ts, (t, t0) in sorted(temps.items()):
        if (
            (t.astimezone(zone) if zone else t).hour not in NIGHT
            or (nxt := temps.get(ts + 3600)) is None
            or ts not in out
        ):
            continue
        diff = (t0 + nxt[1]) / 2 - (out[ts] + out.get(ts + 3600, out[ts])) / 2
        if diff < MIN_DIFFERENCE_NIGHT:
            continue
        num -= (nxt[1] - t0) * diff
        den += diff * diff
        n += 1
    if not n:
        return None
    return num / den, n


def k_of_zone(rooms: dict[str, tuple[float, int]]) -> tuple[float, int] | None:
    """Cooling of a zone of several rooms: mean of the rooms weighted by their number of night hours."""
    n = sum(g for _, g in rooms.values())
    if not n:
        return None
    return sum(k_ * g for k_, g in rooms.values()) / n, n


def seed_k(m: dict[str, Any], k_hist: float, hours: int, **info: Any) -> None:
    """Cooling from history as old learning windows: weight = hours (an hour = 2/3 of a window), at most full memory."""
    weight = round(min(MEMORY, hours * 3600 / WINDOW.total_seconds()), 2)
    s = list(m.get("ls") or [0.0] * 5)
    s[0] += weight
    s[3] += weight * k_hist
    m["ls"] = [round(v, 6) for v in s]
    _solve_k(m)
    m.setdefault("history", {})["k"] = {
        "k": round(k_hist, 4),
        "hours": hours,
        "weight": weight,
        "at": m.get("samples_k", 0),
        **info,
    }


def replay(model: dict[str, Any], samples: Iterable[Sample], what: tuple[str, ...] = ("k", "a")) -> int:
    """Learning from recorded history — the same 90-minute windows as live (samples every 5 min).

    A sample without temperature (sensor silent, window open) or a change of the measuring point starts a new
    window, as live. Returns how many windows it learned from.
    """
    window: dict[str, Any] | None = None
    count = 0
    for t, temp, u, out, w, point, target in samples:
        if temp is None:
            window = None
            continue
        if window is None or window["point"] != point:
            window = {**new_window(t, temp, u, out, w, target), "point": point}
            continue
        add(window, t, temp, u, out, w, target)
        if ready(window):
            count += learn(model, window, what) is not None
            window = {**new_window(t, temp, u, out, w, target), "point": point}
    return count


def seed_a(m: dict[str, Any], a_hist: float, windows: int, **info: Any) -> None:
    """Heating power from history; when online learning already knows something — a mean weighted by windows."""
    n = m.get("samples_a", 0)
    m["a"] = round(a_hist if m.get("a") is None or not n else (a_hist * windows + m["a"] * n) / (windows + n), 3)
    m.setdefault("history", {})["a"] = {"a": round(a_hist, 3), "windows": windows, "at": n, **info}


# ——— Learning ———
def new_window(
    t: float, temp: float, u: float, out: float | None, w: float | None, target: float | None = None
) -> dict[str, Any]:
    return {
        "t0": t,
        "T0": temp,
        "t": t,
        "T": temp,
        "su": 0.0,
        "sout": 0.0,
        "sw": 0.0,
        "dt": 0.0,
        "u": u,
        "out": out,
        "w": w,
        "no_wind": w is None,
        "no_outside": out is None,
        "target": target,
    }


def add(
    window: dict[str, Any],
    t: float,
    temp: float,
    u: float,
    out: float | None,
    w: float | None,
    target: float | None = None,
) -> None:
    """The stretch since the previous reading counts with the state from its start (valve, outside, wind)."""
    dt = t - window["t"]
    if dt > 0:
        window["su"] += window["u"] * dt
        if window["out"] is not None:
            window["sout"] += window["out"] * dt
        if window["w"] is not None:
            window["sw"] += window["w"] * dt
        window["dt"] += dt
    window.update(t=t, T=temp, u=u, out=out, w=w, target=target)
    window["no_wind"] |= w is None
    window["no_outside"] |= out is None


def ready(window: dict[str, Any]) -> bool:
    return window["t"] - window["t0"] >= WINDOW.total_seconds()


def _learn_k(m: dict[str, Any], k_obs: float, wind: float | None) -> None:
    """Least squares with forgetting: k = k0 + kw·w/10; kw is pulled to zero until data shows it."""
    x = (wind or 0.0) / 10
    s = [v * FORGET for v in (m.get("ls") or [0.0] * 5)]
    s[0] += 1
    s[1] += x
    s[2] += x * x
    s[3] += k_obs
    s[4] += k_obs * x
    m["ls"] = [round(v, 6) for v in s]
    _solve_k(m)
    m["samples_k"] = m.get("samples_k", 0) + 1


def _solve_k(m: dict[str, Any]) -> None:
    s = m["ls"]
    a11, a12, a22 = s[0] + 1e-3, s[1], s[2] + 0.5
    det = a11 * a22 - a12 * a12
    t0 = (s[3] * a22 - a12 * s[4]) / det
    t1 = (a11 * s[4] - a12 * s[3]) / det
    m["k"] = round(max(K_MIN, t0), 4)
    m["kw"] = round(max(0.0, t1), 4)


def learn(model: dict[str, Any], window: dict[str, Any], what: tuple[str, ...] = ("k", "a")) -> str | None:
    """Learns from a ready window; returns what it learned ("k", "a") or None (a window without signal)."""
    if window["dt"] <= 0 or window["no_outside"]:
        return None
    hours = (window["t"] - window["t0"]) / 3600
    rate = (window["T"] - window["T0"]) / hours
    u = window["su"] / window["dt"]
    out = window["sout"] / window["dt"]
    w = None if window["no_wind"] else window["sw"] / window["dt"]
    diff = (window["T0"] + window["T"]) / 2 - out
    if u < 0.05:
        if diff < MIN_DIFFERENCE or "k" not in what:
            return None
        k_obs = -rate / diff
        if not 0.0 <= k_obs <= 0.5:  # the room warms without heating (sun, kitchen) — not about cooling
            return None
        _learn_k(model, k_obs, w)
        return "k"
    if u >= CONTINUOUS and "a" in what:
        if window.get("target") is not None and window["T"] > window["target"] - NEAR_TARGET:
            return None  # reached the target zone — the valve throttles, the window would understate the power
        a_obs = (rate + k(model, w) * diff) / u
        if not 0.1 <= a_obs <= 15.0:
            return None
        n = model.get("samples_a", 0)
        previous = model.get("a")
        # windows from history count as earlier ones — the first online window does not erase the start
        alpha = max(0.15, 1 / (n + ((model.get("history") or {}).get("a") or {}).get("windows", 0) + 1))
        model["a"] = round(a_obs if previous is None else previous + alpha * (a_obs - previous), 3)
        model["samples_a"] = n + 1
        return "a"
    return None


# ——— Prediction ———
def step(
    temp: float, target: float | None, out: float, w: float | None, model: dict[str, Any] | None, power: float
) -> float:
    """Five minutes of a thermostat: heats at full power when the room would drop below the target, not above it."""
    losses = k(model, w) * (temp - out) * _STEP_H
    without = temp - losses
    if target is None or without >= target:
        return without
    return min(temp + power * _STEP_H - losses, max(target, without))


def _outside(weather: Weather, t: datetime, fallback: float) -> tuple[float, float | None]:
    out, w = weather(t)
    return (fallback if out is None else out), w


def preheat_start(
    model: dict[str, Any] | None,
    power: float,
    temp: float,
    now: datetime,
    at: datetime,
    target: float,
    target_before: float | None,
    weather: Weather,
    earliest: timedelta,
) -> datetime:
    """The latest moment to start heating so that the room has `target` at `at`.

    Until the start the zone keeps `target_before` (the room cools to it), then heats to `target`. When the room
    makes it anyway (or is warm enough) — start at `at`; when it would not make it even starting now — now.
    """
    if at <= now:
        return now
    out0, _ = weather(now)
    fallback = out0 if out0 is not None else 5.0
    n = ceil((at - now) / STEP)
    times = [now + i * STEP for i in range(n + 1)]
    outside = [_outside(weather, c, fallback) for c in times]
    before = [temp]
    for i in range(n):
        before.append(step(before[-1], target_before, *outside[i], model, power))
    if before[n] >= target - TOLERANCE:
        return at
    most = min(n, ceil(earliest / STEP))
    for j in range(1, most + 1):
        start = n - j
        t = before[start]
        for i in range(start, n):
            t = step(t, target, *outside[i], model, power)
        if t >= target - TOLERANCE:
            return times[start]
    return times[n - most]


def minutes_to_reach(
    model: dict[str, Any] | None,
    power: float,
    temp: float,
    target: float,
    now: datetime,
    weather: Weather,
    limit: timedelta = ESTIMATE_MAX,
) -> int | None:
    """Minutes of continuous heating until the room reaches `target`; None when not within `limit`."""
    if temp >= target - TOLERANCE:
        return 0
    out0, _ = weather(now)
    fallback = out0 if out0 is not None else 5.0
    t = temp
    for i in range(1, ceil(limit / STEP) + 1):
        out, w = _outside(weather, now + (i - 1) * STEP, fallback)
        t = step(t, target, out, w, model, power)
        if t >= target - TOLERANCE:
            return int(i * STEP.total_seconds() // 60)
    return None
