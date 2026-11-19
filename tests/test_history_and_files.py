"""The model's start from history, diagnostics, translations and the files hassfest and HACS check."""

from __future__ import annotations

from datetime import datetime, timedelta
import json
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant, State
from homeassistant.util import dt as dt_util
import pytest
import yaml

from custom_components.heat_zones import history
from custom_components.heat_zones.diagnostics import async_get_config_entry_diagnostics

from .common import Home, setup, zone

ROOT = Path(__file__).parent.parent / "custom_components" / "heat_zones"


async def test_model_starts_from_history(hass: HomeAssistant, home: Home, monkeypatch: pytest.MonkeyPatch) -> None:
    living = home.area("Living room")
    home.trv(living, "living_trv")
    sensor = home.sensor(living, "living", 20.0)
    outdoor = home.sensor(home.area("Balcony"), "balcony", 3.0)

    end = dt_util.start_of_local_day(datetime(2026, 10, 15))
    room: dict[datetime, float] = {}
    out: dict[datetime, float] = {}
    t, temp = dt_util.as_utc(end - timedelta(days=20)), 21.0
    while t < end:
        hour = dt_util.as_local(t).hour
        out[t] = 5.0
        room[t] = round(temp, 2)
        temp = temp - 0.01 * (temp - 5.0) if hour < 6 else 21.0
        t += timedelta(hours=1)

    async def statistics(_engine: Any, entities: set[str], start: datetime, finish: datetime) -> dict:
        return {sensor: room, outdoor: out} if finish <= end + timedelta(days=1) else {}

    async def nothing(*_args: Any) -> dict:
        return {}

    monkeypatch.setattr(history, "_statistics", statistics)
    monkeypatch.setattr(history, "_history", nothing)
    entry = await setup(
        hass, [zone("Living room", [living])], {"outdoor_sensor": outdoor, "heating_start": "2026-10-15"}
    )
    await history.bootstrap(entry.runtime_data)
    (z,) = entry.runtime_data.zones.values()
    m = z.state["learning"]["model"]
    assert m["k"] == pytest.approx(0.01, abs=0.001)
    assert m["history"]["k"]["outside"] == outdoor
    assert hass.states.get("sensor.living_room_model_confidence") is not None


def test_history_samples_skip_window_pause() -> None:
    start = dt_util.as_local(datetime(2026, 11, 2, 5, 0, tzinfo=dt_util.UTC))
    states = [
        State(
            "climate.x",
            "heat",
            {"current_temperature": 19.0, "hvac_action": "heating", "temperature": 22, "measure_at": "a"},
        ),
        State("climate.x", "heat", {"current_temperature": 19.5, "window_pause": True}),
    ]
    object.__setattr__(states[0], "last_updated", dt_util.as_utc(start))
    object.__setattr__(states[1], "last_updated", dt_util.as_utc(start + timedelta(minutes=12)))
    rows = history.samples(states, {}, start, start + timedelta(minutes=20))
    assert [r[1] for r in rows] == [19.0, 19.0, 19.0, None, None]
    assert rows[0][2] == 1.0 and rows[0][5] == "a" and rows[0][6] == 22.0


async def test_diagnostics(hass: HomeAssistant, home: Home) -> None:
    living = home.area("Living room")
    home.trv(living, "living_trv")
    entry = await setup(hass, [zone("Living room", [living])])
    d = await async_get_config_entry_diagnostics(hass, entry)
    assert d["zones"]["Living room"]["thermostats"][0]["mode"] == "own"  # no room sensor
    json.dumps(d, default=str)


def _keys(d: Any, prefix: str = "") -> set[str]:
    if not isinstance(d, dict):
        return {prefix}
    return {k for key, v in d.items() for k in _keys(v, f"{prefix}.{key}" if prefix else key)}


def test_translations_match() -> None:
    strings = json.loads((ROOT / "strings.json").read_text())
    en = json.loads((ROOT / "translations" / "en.json").read_text())
    pl = json.loads((ROOT / "translations" / "pl.json").read_text())
    assert en == strings
    assert _keys(pl) == _keys(en)


def test_services_have_translations_and_icons() -> None:
    services = yaml.safe_load((ROOT / "services.yaml").read_text())
    strings = json.loads((ROOT / "strings.json").read_text())["services"]
    icons = json.loads((ROOT / "icons.json").read_text())["services"]
    assert set(services) == set(strings) == set(icons)
    for name, spec in services.items():
        assert set((spec or {}).get("fields") or {}) == set(strings[name].get("fields") or {}), name


def test_versions_match() -> None:
    manifest = json.loads((ROOT / "manifest.json").read_text())
    package = json.loads((ROOT.parent.parent / "frontend" / "package.json").read_text())
    from custom_components.heat_zones.const import VERSION

    assert manifest["version"] == VERSION == package["version"]
    assert f"## {VERSION}" in (ROOT.parent.parent / "CHANGELOG.md").read_text()
    hacs = json.loads((ROOT.parent.parent / "hacs.json").read_text())
    assert hacs["homeassistant"] == "2026.11.0"
