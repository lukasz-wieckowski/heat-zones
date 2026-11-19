"""Weekly schedule, overrides and holds — what a zone should hold at any moment. Pure functions, no Home Assistant.

Layers, from the bottom:

1. **Base**: the weekly schedule when it is enabled and has blocks (the block that started last is in force,
   across days and weeks), otherwise the manual target.
2. **Overrides**: from–to, a preset or a temperature, with a reason and a source. They beat the schedule and
   disappear by themselves.
3. **Hold**: a manual change while the schedule runs. `next_block` lasts until the next change of the schedule or
   of an override (start or end), `until` until a given time, `permanent` until the schedule is resumed.

Between overrides and the hold the newest instruction wins: the hold counts from when it was set, an override from
its start (or from when it was added, if it started earlier). So an override that starts later beats a permanent
hold, and when it ends the hold is back.
"""

from __future__ import annotations

from collections.abc import Callable, Collection, Iterable, Mapping
from dataclasses import dataclass, replace
from datetime import date, datetime, time, timedelta
from itertools import pairwise
from typing import Any

from .const import HOLD_NEXT, HOLD_PERMANENT, HOLD_UNTIL, MAX_TEMP, MIN_TEMP

DAYS = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")
MAX_BLOCKS = 200

SCHEDULE = "schedule"
OVERRIDE = "override"
HOLD = "hold"
MANUAL = "manual"
PREHEAT = "preheat"


class ScheduleError(ValueError):
    """The schedule did not pass validation; `code` is a translation key, `detail` the offending part."""

    def __init__(self, code: str, detail: str = "") -> None:
        super().__init__(f"{code}: {detail}" if detail else code)
        self.code = code
        self.detail = detail


def parse_time(value: Any) -> time:
    if isinstance(value, time):
        return value.replace(second=0, microsecond=0)
    text = str(value or "").strip()
    parts = text.split(":")
    if len(parts) not in (2, 3) or not all(p.isdigit() for p in parts):
        raise ScheduleError("invalid_time", text)
    h, m = int(parts[0]), int(parts[1])
    if not (0 <= h < 24 and 0 <= m < 60):
        raise ScheduleError("invalid_time", text)
    return time(h, m)


def normalize_weekly(raw: Any, presets: Collection[str]) -> list[dict[str, Any]]:
    """A checked weekly schedule: blocks `{days, time "HH:MM", preset_mode | temperature}`, in week order."""
    if raw is None:
        return []
    if not isinstance(raw, list):
        raise ScheduleError("invalid_schedule", "not a list")
    if len(raw) > MAX_BLOCKS:
        raise ScheduleError("too_many_blocks", str(len(raw)))
    seen: set[tuple[str, time]] = set()
    result: list[dict[str, Any]] = []
    for i, block in enumerate(raw):
        if not isinstance(block, Mapping):
            raise ScheduleError("invalid_schedule", f"block {i + 1}")
        days = block.get("days")
        if isinstance(days, str):
            days = [days]
        if not days or not isinstance(days, list):
            raise ScheduleError("invalid_days", f"block {i + 1}")
        clean = []
        for raw_day in days:
            d = str(raw_day).strip().lower()[:3]
            if d not in DAYS:
                raise ScheduleError("invalid_days", str(raw_day))
            if d not in clean:
                clean.append(d)
        at = parse_time(block.get("time"))
        out: dict[str, Any] = {"days": sorted(clean, key=DAYS.index), "time": at.strftime("%H:%M")}
        preset, temperature = block.get("preset_mode"), block.get("temperature")
        if (preset is None) == (temperature is None):
            raise ScheduleError("preset_or_temperature", f"block {i + 1}")
        if preset is not None:
            if preset not in presets:
                raise ScheduleError("unknown_preset", str(preset))
            out["preset_mode"] = preset
        else:
            try:
                value = round(float(temperature) * 2) / 2
            except TypeError, ValueError:
                raise ScheduleError("invalid_temperature", str(temperature)) from None
            if not MIN_TEMP <= value <= MAX_TEMP:
                raise ScheduleError("invalid_temperature", str(temperature))
            out["temperature"] = value
        for d in out["days"]:
            if (d, at) in seen:
                raise ScheduleError("duplicate_block", f"{d} {out['time']}")
            seen.add((d, at))
        result.append(out)
    result.sort(key=lambda b: (DAYS.index(b["days"][0]), b["time"]))
    return result


def occurrences(weekly: Iterable[Mapping[str, Any]], start: date, end: date, tz: Any) -> list[tuple[datetime, Mapping]]:
    """Every start of every block on the days from `start` to `end` (inclusive), in time order."""
    by_day: dict[str, list[tuple[time, Mapping]]] = {d: [] for d in DAYS}
    for block in weekly:
        at = parse_time(block["time"])
        for d in block["days"]:
            by_day[d].append((at, block))
    result = []
    day = start
    while day <= end:
        for at, block in by_day[DAYS[day.weekday()]]:
            result.append((datetime.combine(day, at, tzinfo=tz), block))
        day += timedelta(days=1)
    result.sort(key=lambda x: x[0])
    return result


def block_at(weekly: list[Mapping[str, Any]], t: datetime) -> tuple[datetime, Mapping] | None:
    """The block in force at `t` and when it started (the last start at or before `t`, up to a week back)."""
    if not weekly:
        return None
    found = None
    for at, block in occurrences(weekly, t.date() - timedelta(days=7), t.date(), t.tzinfo):
        if at <= t:
            found = (at, block)
    return found


def next_start(weekly: list[Mapping[str, Any]], t: datetime) -> datetime | None:
    """The first block start after `t`."""
    if not weekly:
        return None
    for at, _ in occurrences(weekly, t.date(), t.date() + timedelta(days=8), t.tzinfo):
        if at > t:
            return at
    return None


@dataclass(frozen=True)
class Override:
    override_id: str
    start: datetime
    end: datetime
    preset_mode: str | None
    temperature: float | None
    reason: str
    source: str
    created: datetime

    def as_dict(self) -> dict[str, Any]:
        d: dict[str, Any] = {
            "override_id": self.override_id,
            "start": self.start.isoformat(),
            "end": self.end.isoformat(),
        }
        if self.preset_mode is not None:
            d["preset_mode"] = self.preset_mode
        else:
            d["temperature"] = self.temperature
        d.update(reason=self.reason, source=self.source)
        return d

    def stored(self) -> dict[str, Any]:
        return {**self.as_dict(), "created": self.created.isoformat()}

    @classmethod
    def from_dict(cls, d: Mapping[str, Any], parse: Callable[[Any], datetime | None]) -> Override | None:
        start, end, created = parse(d.get("start")), parse(d.get("end")), parse(d.get("created"))
        if start is None or end is None:
            return None
        return cls(
            override_id=str(d["override_id"]),
            start=start,
            end=end,
            preset_mode=d.get("preset_mode"),
            temperature=d.get("temperature"),
            reason=d.get("reason") or "",
            source=d.get("source") or "",
            created=created or start,
        )


@dataclass(frozen=True)
class Hold:
    temperature: float
    preset_mode: str | None
    set_at: datetime
    mode: str = HOLD_NEXT
    until: datetime | None = None

    def stored(self) -> dict[str, Any]:
        return {
            "temperature": self.temperature,
            "preset_mode": self.preset_mode,
            "set_at": self.set_at.isoformat(),
            "mode": self.mode,
            "until": self.until.isoformat() if self.until else None,
        }

    @classmethod
    def from_dict(cls, d: Mapping[str, Any] | None, parse: Callable[[Any], datetime | None]) -> Hold | None:
        if not d or (set_at := parse(d.get("set_at"))) is None or d.get("temperature") is None:
            return None
        mode = d.get("mode") if d.get("mode") in (HOLD_NEXT, HOLD_UNTIL, HOLD_PERMANENT) else HOLD_NEXT
        return cls(float(d["temperature"]), d.get("preset_mode"), set_at, mode, parse(d.get("until")))


@dataclass(frozen=True)
class Setting:
    """What the zone holds: a temperature, the preset it comes from, and why."""

    temperature: float
    preset_mode: str | None
    source: str
    override_id: str | None = None
    reason: str | None = None
    hold_mode: str | None = None


@dataclass(frozen=True)
class Segment:
    start: datetime
    end: datetime
    setting: Setting


@dataclass
class Program:
    """Everything that decides a zone's target over time."""

    presets: Mapping[str, float]
    schedule_enabled: bool
    weekly: list[dict[str, Any]]
    overrides: list[Override]
    hold: Hold | None
    manual: tuple[float, str | None]

    @property
    def schedule_active(self) -> bool:
        return self.schedule_enabled and bool(self.weekly)

    def value(self, preset: str | None, temperature: float | None) -> tuple[float, str | None] | None:
        if preset is not None:
            t = self.presets.get(preset)
            return None if t is None else (float(t), preset)
        return None if temperature is None else (float(temperature), None)

    def hold_end(self) -> datetime | None:
        """When the hold stops (None: it does not, or there is no hold)."""
        h = self.hold
        if h is None or h.mode == HOLD_PERMANENT:
            return None
        if h.mode == HOLD_UNTIL:
            return h.until
        found = [x for o in self.overrides for x in (o.start, o.end) if x > h.set_at]
        if self.schedule_active and (n := next_start(self.weekly, h.set_at)) is not None:
            found.append(n)
        return min(found) if found else None

    def hold_valid(self, t: datetime) -> bool:
        if self.hold is None or t < self.hold.set_at:
            return False
        end = self.hold_end()
        return end is None or t < end

    def base(self, t: datetime) -> Setting:
        found = block_at(self.weekly, t) if self.schedule_active else None
        if found is not None and (v := self.value(found[1].get("preset_mode"), found[1].get("temperature"))):
            return Setting(v[0], v[1], SCHEDULE)
        return Setting(self.manual[0], self.manual[1], MANUAL)

    def setting_at(self, t: datetime) -> Setting:
        candidates: list[tuple[datetime, Setting]] = []
        if self.hold_valid(t):
            h = self.hold
            assert h is not None
            candidates.append((h.set_at, Setting(h.temperature, h.preset_mode, HOLD, hold_mode=h.mode)))
        for o in self.overrides:
            if o.start <= t < o.end and (v := self.value(o.preset_mode, o.temperature)) is not None:
                candidates.append(
                    (max(o.created, o.start), Setting(v[0], v[1], OVERRIDE, o.override_id, o.reason or None))
                )
        if candidates:
            newest = max(c[0] for c in candidates)
            return next(s for at, s in candidates if at == newest)
        return self.base(t)

    def timeline(self, now: datetime, end: datetime) -> list[Segment]:
        """What the zone holds from now to `end`, as segments without repeats."""
        bounds = {now, end}
        if self.schedule_active:
            bounds.update(
                at for at, _ in occurrences(self.weekly, now.date(), end.date(), now.tzinfo) if now < at < end
            )
        for o in self.overrides:
            bounds.update(x for x in (o.start, o.end) if now < x < end)
        if (h_end := self.hold_end()) is not None and now < h_end < end:
            bounds.add(h_end)
        points = sorted(bounds)
        segments: list[Segment] = []
        for a, b in pairwise(points):
            s = self.setting_at(a)
            if segments and segments[-1].setting == s:
                segments[-1] = replace(segments[-1], end=b)
            else:
                segments.append(Segment(a, b, s))
        return segments


def with_preheat(
    segments: list[Segment],
    now: datetime,
    start_for: Callable[[datetime, float, float], datetime] | None,
    sticky: tuple[datetime, datetime] | None = None,
) -> tuple[list[Segment], tuple[datetime, datetime] | None]:
    """Optimum start: heating for the next warmer step begins early enough to reach it on time.

    `start_for(at, target, target_before)` gives the start from the thermal model (None: no estimate now, e.g.
    no room temperature — then only an already started preheat goes on). `sticky` is a preheat started earlier:
    once started for a step it goes on, otherwise a warmer room would push the start away and the target would
    jump. Returns the segments with the preheat and the preheat (step, start) to remember.
    """
    if len(segments) < 2:
        return segments, None
    cur, nxt = segments[0], segments[1]
    if nxt.setting.temperature <= cur.setting.temperature or nxt.setting.source not in (SCHEDULE, OVERRIDE):
        return segments, None
    if cur.setting.source == HOLD and cur.setting.hold_mode in (HOLD_UNTIL, HOLD_PERMANENT):
        return segments, None
    start = start_for(nxt.start, nxt.setting.temperature, cur.setting.temperature) if start_for else None
    if sticky and sticky[0] == nxt.start and sticky[1] <= now:
        start = sticky[1] if start is None else min(start, sticky[1])
    if start is None or start >= nxt.start:
        return segments, None
    pre = replace(nxt.setting, source=PREHEAT, hold_mode=None)
    if start <= now:
        return [Segment(cur.start, nxt.start, pre), *segments[1:]], (nxt.start, start)
    return [replace(cur, end=start), Segment(start, nxt.start, pre), *segments[1:]], (nxt.start, start)
