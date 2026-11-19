"""Outside temperature and wind: a sensor or a weather entity now, the hourly forecast ahead (for the model)."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import LOGGER, UNAVAILABLE

WIND_TO_KMH = {"km/h": 1.0, "m/s": 3.6, "mph": 1.609, "kn": 1.852, "ft/s": 1.097}


def number(v: Any) -> float | None:
    try:
        x = float(v)
    except TypeError, ValueError:
        return None
    return x if x == x else None  # NaN


def parse_time(x: Any) -> datetime | None:
    if isinstance(x, datetime):
        return dt_util.as_local(x)
    t = dt_util.parse_datetime(str(x)) if x else None
    return dt_util.as_local(t) if t else None


class Outside:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.sensor: str | None = None
        self.weather: str | None = None
        self.forecast: list[tuple[datetime, float | None, float | None]] = []
        self.temperature: float | None = None
        self.wind: float | None = None

    def read(self) -> None:
        """Outside temperature and wind now."""
        temp = None
        if self.sensor and (st := self.hass.states.get(self.sensor)) and st.state not in UNAVAILABLE:
            temp = number(st.state)
        wind = None
        if self.weather and (st := self.hass.states.get(self.weather)) and st.state not in UNAVAILABLE:
            if temp is None:
                temp = number(st.attributes.get("temperature"))
            if (w := number(st.attributes.get("wind_speed"))) is not None:
                wind = w * WIND_TO_KMH.get(st.attributes.get("wind_speed_unit") or "km/h", 1.0)
        self.temperature, self.wind = temp, wind

    async def refresh_forecast(self, _now: Any = None) -> None:
        eid = self.weather
        if not eid or not self.hass.services.has_service("weather", "get_forecasts"):
            return
        try:
            response = await self.hass.services.async_call(
                "weather", "get_forecasts", {"entity_id": eid, "type": "hourly"}, blocking=True, return_response=True
            )
        except Exception:  # without a forecast the model uses the temperature now
            LOGGER.debug("Forecast of %s not available", eid, exc_info=True)
            return
        st = self.hass.states.get(eid)
        factor = WIND_TO_KMH.get((st.attributes.get("wind_speed_unit") if st else None) or "km/h", 1.0)
        forecast = []
        for x in ((response or {}).get(eid) or {}).get("forecast") or []:
            if (t := parse_time(x.get("datetime"))) is None:
                continue
            w = number(x.get("wind_speed"))
            forecast.append((t, number(x.get("temperature")), w * factor if w is not None else None))
        self.forecast = sorted(forecast, key=lambda p: p[0])

    def at(self, t: datetime) -> tuple[float | None, float | None]:
        """Outside temperature and wind (km/h) at `t` — from the hourly forecast, else now."""
        chosen = None
        for p in self.forecast:
            if p[0] <= t:
                chosen = p
            else:
                break
        if chosen is not None and t - chosen[0] < timedelta(hours=2) and chosen[1] is not None:
            return chosen[1], chosen[2] if chosen[2] is not None else self.wind
        return self.temperature, self.wind
