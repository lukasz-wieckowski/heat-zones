"""Start of the thermal model from Home Assistant's history, so preheat is accurate before days of learning.

- Cooling (`k`) from long-term statistics of the zone's room sensors and an outdoor sensor: the nights (0:00–6:00)
  of the 45 days before the heating start, when rooms only cooled. Only when the option *Heating start* is set —
  without it the integration cannot know which nights were unheated.
- Heating power (`a`) from the recorded history of the zone's own climate entity (the last 10 days): the same
  90-minute windows as live learning. Useful after a reset of learning or a restore.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta
from functools import partial
from typing import TYPE_CHECKING, Any

from homeassistant.const import UnitOfTemperature
from homeassistant.core import State
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util

from . import model
from .const import DOMAIN, HISTORY_DAYS, HISTORY_NIGHTS, K_TRUSTED, LOGGER, UNAVAILABLE
from .home import outdoor_sensors
from .outside import number

if TYPE_CHECKING:
    from .engine import HeatZones, Zone


def climate_unique_id(zid: str) -> str:
    return f"{zid}-climate"


def samples(states: list[State], outside: dict[datetime, float], start: datetime, end: datetime) -> list[model.Sample]:
    """History of a zone's climate entity as readings every 5 min — what learning saw live.

    The temperature at the point is `current_temperature`, the valve `hvac_action: heating`, the target
    `temperature`, outside the hourly mean (keys in UTC). Time with the window pause counts as a gap.
    """
    result: list[model.Sample] = []
    states = sorted(states, key=lambda x: x.last_updated)
    if not states:
        return result
    i, last = 0, None
    t = max(start, dt_util.as_local(states[0].last_updated))
    while t <= end:
        while i < len(states) and states[i].last_updated <= t:
            last, i = states[i], i + 1
        if last is not None:
            a = last.attributes
            temp = None if last.state in UNAVAILABLE or a.get("window_pause") else number(a.get("current_temperature"))
            out = outside.get(dt_util.as_utc(t).replace(minute=0, second=0, microsecond=0))
            u = 1.0 if a.get("hvac_action") == "heating" else 0.0
            result.append((t.timestamp(), temp, u, out, None, a.get("measure_at"), number(a.get("temperature"))))
        t += model.STEP
    return result


async def _history(engine: HeatZones, entities: list[str], start: datetime, end: datetime) -> dict[str, list[State]]:
    hass = engine.hass
    if "recorder" not in hass.config.components or not entities:
        return {}
    from homeassistant.components.recorder import get_instance, history

    found = await get_instance(hass).async_add_executor_job(
        partial(history.get_significant_states, hass, start, end, entities, None, True, False, False, False)
    )
    return {k: [x for x in v if isinstance(x, State)] for k, v in found.items()}


async def _statistics(
    engine: HeatZones, entities: set[str], start: datetime, end: datetime
) -> dict[str, dict[datetime, float]]:
    """Hourly means (°C) from the recorder: entity → {start of the hour in UTC: mean}.

    In UTC, because locally in the night of a clock change two 2:00 hours are the same key.
    """
    hass = engine.hass
    if "recorder" not in hass.config.components or not entities or end <= start:
        return {}
    from homeassistant.components.recorder import get_instance
    from homeassistant.components.recorder.statistics import statistics_during_period

    found = await get_instance(hass).async_add_executor_job(
        statistics_during_period,
        hass,
        dt_util.as_utc(start),
        dt_util.as_utc(end),
        set(entities),
        "hour",
        {"temperature": UnitOfTemperature.CELSIUS},
        {"mean"},
    )
    return {
        eid: {dt_util.utc_from_timestamp(w["start"]): w["mean"] for w in rows if w.get("mean") is not None}
        for eid, rows in found.items()
    }


def _best_outside(candidates: list[str], stats: dict[str, dict[datetime, float]]) -> str | None:
    """The outdoor sensor with the most hours in the window (on a tie — the first in the list)."""
    best = max(((len(stats.get(e) or {}), -i, e) for i, e in enumerate(candidates)), default=None)
    return best[2] if best and best[0] else None


def heating_start(engine: HeatZones) -> datetime | None:
    if d := engine.entry.options.get("heating_start"):
        try:
            return dt_util.start_of_local_day(date.fromisoformat(str(d)[:10]))
        except ValueError:
            LOGGER.warning("Option heating_start %r is not a date", d)
    return None


async def bootstrap(engine: HeatZones) -> None:
    """Seed the model of zones that know little yet."""
    hass = engine.hass
    now = dt_util.now()

    def m(z: Zone) -> dict[str, Any]:
        return z.state.setdefault("learning", {}).setdefault("model", {})

    candidates = [engine.outside.sensor] if engine.outside.sensor else outdoor_sensors(hass, engine.outside.weather)
    changed = False
    need_k = [
        z
        for z in engine.zones.values()
        if "k" not in (m(z).get("history") or {}) and m(z).get("samples_k", 0) < K_TRUSTED
    ]
    if need_k and (end := heating_start(engine)) is not None:
        end = min(end, now)
        start = end - HISTORY_NIGHTS
        sensors = {z.id: {a: c for a, c in z.sensors.items() if c} for z in need_k}
        stats = await _statistics(
            engine, {c for x in sensors.values() for c in x.values()} | set(candidates), start, end
        )
        if (outside := _best_outside(candidates, stats)) is not None:
            for z in need_k:
                tz = dt_util.get_default_time_zone()
                rooms = {
                    a: x
                    for a, c in sensors[z.id].items()
                    if (x := model.k_from_nights(stats.get(c) or {}, stats[outside], tz))
                }
                if (found := model.k_of_zone(rooms)) is None:
                    continue
                model.seed_k(
                    m(z),
                    found[0],
                    found[1],
                    start=start.date().isoformat(),
                    end=end.date().isoformat(),
                    outside=outside,
                    rooms={a: round(x[0], 4) for a, x in rooms.items()},
                )
                changed = True
                LOGGER.info("%s: cooling from %s night hours: k = %.4f/h", z.name, found[1], found[0])

    # heating power only with a known cooling (a = gain + losses), from the same windows as live
    need_a = [
        z
        for z in engine.zones.values()
        if "a" not in (m(z).get("history") or {})
        and m(z).get("samples_a", 0) < model.CONFIDENT
        and m(z).get("k") is not None
    ]
    if need_a:
        start = now - timedelta(days=HISTORY_DAYS)
        registry = er.async_get(hass)
        climates = {
            z.id: eid
            for z in need_a
            if (eid := registry.async_get_entity_id("climate", DOMAIN, climate_unique_id(z.id)))
        }
        found_states = await _history(engine, sorted(climates.values()), start, now)
        stats = await _statistics(engine, set(candidates), start - timedelta(hours=1), now)
        outside = _best_outside(candidates, stats)
        for z in need_a:
            if z.id not in climates:
                continue
            rows = samples(
                found_states.get(climates[z.id]) or [], (stats.get(outside) or {}) if outside else {}, start, now
            )
            trial = {"k": m(z)["k"], "kw": m(z).get("kw")}
            count = model.replay(trial, rows, what=("a",))
            if count >= model.CONFIDENT and trial.get("a") is not None:
                model.seed_a(
                    m(z), trial["a"], count, start=start.date().isoformat(), end=now.date().isoformat(), outside=outside
                )
                changed = True
                LOGGER.info("%s: heating power from %s history windows: a = %.2f °C/h", z.name, count, trial["a"])
    if changed:
        engine.save_later()
        engine.schedule_recalc(0)
