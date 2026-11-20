"""Texts the integration writes into attributes (plan titles, signals) in the language of Home Assistant.

Entity names, config flows and service errors use `translations/`; these are free texts for other systems
(`homeai_plan`, `homeai_signals`) and for the card.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant

TEXTS: dict[str, dict[str, str]] = {
    "en": {
        "preset.comfort": "Comfort",
        "preset.eco": "Eco",
        "preset.sleep": "Sleep",
        "preset.away": "Away",
        "preset.none": "Manual",
        "device.model": "Heat zone",
        "plan": "{zone}: {target}",
        "plan.reason": "{zone}: {target} ({reason})",
        "plan.preheat": "{zone}: heating up for {target}",
        "plan.hold": "{zone}: {target}, held",
        "reason.schedule": "Schedule",
        "reason.override": "Override",
        "reason.hold": "Manual until the next change",
        "reason.hold_until": "Manual until {time}",
        "reason.hold_permanent": "Manual, schedule paused",
        "reason.manual": "Manual",
        "reason.preheat": "Heating up for {target} at {time}",
        "reason.window": "Window open — heating paused",
        "reason.off": "Heating off",
        "signal.valve": "{thermostat}: valve open since {since}, the room is not getting warmer",
        "signal.valve.description": "Check the radiator and the valve; calibrating the valve may help.",
        "signal.window": "{window} open since {since} while heating{outside}",
        "signal.window.outside": ", {temperature} outside",
        "signal.offline": "{thermostat} gets no room temperature since {since} and heats by its own thermometer",
        "signal.repair": "{thermostat} heats by its own thermometer ({own}, room {room}) since {since} "
        "and does not switch back to the room sensor",
        "signal.sensor": "{room}: temperature sensor silent since {since}",
        "signal.sensor.description": "The zone uses other rooms or the thermostats' own thermometers meanwhile.",
        "signal.unavailable": "{zone}: no thermostat responds since {since}",
    },
    "pl": {
        "preset.comfort": "Komfort",
        "preset.eco": "Eko",
        "preset.sleep": "Sen",
        "preset.away": "Poza domem",
        "preset.none": "Ręcznie",
        "device.model": "Strefa grzewcza",
        "plan": "{zone}: {target}",
        "plan.reason": "{zone}: {target} ({reason})",
        "plan.preheat": "{zone}: nagrzewanie na {target}",
        "plan.hold": "{zone}: {target}, wstrzymane",
        "reason.schedule": "Harmonogram",
        "reason.override": "Nadpisanie",
        "reason.hold": "Ręcznie do następnej zmiany",
        "reason.hold_until": "Ręcznie do {time}",
        "reason.hold_permanent": "Ręcznie, harmonogram wstrzymany",
        "reason.manual": "Ręcznie",
        "reason.preheat": "Nagrzewanie na {target} o {time}",
        "reason.window": "Otwarte okno — grzanie wstrzymane",
        "reason.off": "Grzanie wyłączone",
        "signal.valve": "{thermostat}: zawór otwarty od {since}, a w pokoju nie robi się cieplej",
        "signal.valve.description": "Sprawdź grzejnik i zawór; może pomóc kalibracja zaworu.",
        "signal.window": "{window} otwarte od {since} przy grzaniu{outside}",
        "signal.window.outside": ", na dworze {temperature}",
        "signal.offline": "{thermostat} nie dostaje temperatury z pokoju od {since} "
        "i grzeje według własnego termometru",
        "signal.repair": "{thermostat} od {since} grzeje według własnego termometru ({own}, w pokoju {room}) "
        "i nie daje się przełączyć na czujnik pokoju",
        "signal.sensor": "{room}: czujnik temperatury milczy od {since}",
        "signal.sensor.description": "Strefa korzysta w tym czasie z innych pokoi albo z termometrów głowic.",
        "signal.unavailable": "{zone}: żadna głowica nie odpowiada od {since}",
    },
}


def language(hass: HomeAssistant) -> str:
    lang = (hass.config.language or "en").split("-")[0].lower()
    return lang if lang in TEXTS else "en"


def text(hass: HomeAssistant, key: str, **values: Any) -> str:
    template = TEXTS[language(hass)].get(key) or TEXTS["en"].get(key) or key
    return template.format(**values)


def degrees(hass: HomeAssistant, value: float) -> str:
    s = f"{value:.1f}".rstrip("0").rstrip(".")
    s = s.replace("-", "−")
    if language(hass) == "pl":
        s = s.replace(".", ",")
    return f"{s} °C"


def clock(t: datetime) -> str:
    return t.strftime("%H:%M")


def since(hass: HomeAssistant, t: datetime, now: datetime) -> str:
    """„18:05” today, else „17.11 18:05” (pl) / „11/17 18:05” (en)."""
    if t.date() == now.date():
        return clock(t)
    if language(hass) == "pl":
        return f"{t.day}.{t.month:02d} {clock(t)}"
    return f"{t.month}/{t.day} {clock(t)}"


def preset_name(hass: HomeAssistant, preset: str | None) -> str | None:
    if preset is None:
        return None
    return TEXTS[language(hass)].get(f"preset.{preset}", preset)


def target_label(hass: HomeAssistant, temperature: float, preset: str | None) -> str:
    if preset:
        return f"{preset_name(hass, preset)} {degrees(hass, temperature)}"
    return degrees(hass, temperature)
