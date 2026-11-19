"""The zone thermostat: target at the measuring point, presets, heat or off."""

from __future__ import annotations

from typing import Any

from homeassistant.components.climate import (
    ATTR_HVAC_MODE,
    PRESET_NONE,
    ClimateEntity,
    ClimateEntityFeature,
    HVACAction,
    HVACMode,
)
from homeassistant.const import ATTR_TEMPERATURE, PRECISION_TENTHS, UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import HeatZonesConfigEntry
from .const import DOMAIN
from .engine import HeatZones, Zone
from .entity import ZoneEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: HeatZonesConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    engine = entry.runtime_data
    for zone in engine.zones.values():
        async_add_entities([ZoneClimate(engine, zone)], config_subentry_id=zone.id)


class ZoneClimate(ZoneEntity, ClimateEntity):
    _attr_name = None
    _attr_translation_key = "zone"
    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_precision = PRECISION_TENTHS
    _attr_target_temperature_step = 0.5
    _attr_hvac_modes = [HVACMode.OFF, HVACMode.HEAT]  # noqa: RUF012 — Home Assistant's own attribute style
    _attr_supported_features = (
        ClimateEntityFeature.TARGET_TEMPERATURE
        | ClimateEntityFeature.PRESET_MODE
        | ClimateEntityFeature.TURN_ON
        | ClimateEntityFeature.TURN_OFF
    )
    # large attributes for the card and other systems — not into the database on every change; `measure_at`,
    # `window_pause` and `source` stay recorded (the model replays them from history)
    _unrecorded_attributes = frozenset(
        {
            "areas",
            "measure_options",
            "rooms",
            "thermostats",
            "limited_by",
            "max_reachable",
            "reach_at",
            "open_windows",
            "reason",
            "override_id",
            "hold",
            "preset_temperatures",
            "next_change",
            "homeai_schedule",
            "homeai_plan",
            "homeai_signals",
        }
    )

    def __init__(self, engine: HeatZones, zone: Zone) -> None:
        super().__init__(engine, zone, "climate")

    @property
    def available(self) -> bool:
        return self._engine.available(self.zone)

    @property
    def hvac_mode(self) -> HVACMode:
        return HVACMode.HEAT if self.zone.state["hvac"] == "heat" else HVACMode.OFF

    @property
    def hvac_action(self) -> HVACAction:
        z = self.zone
        if z.state["hvac"] != "heat":
            return HVACAction.OFF
        if z.state["window_paused"]:
            return HVACAction.IDLE
        return HVACAction.HEATING if z.action == "heating" else HVACAction.IDLE

    @property
    def current_temperature(self) -> float | None:
        return self.zone.current

    @property
    def target_temperature(self) -> float | None:
        return self.zone.setting.temperature if self.zone.setting else None

    @property
    def preset_modes(self) -> list[str]:
        return [PRESET_NONE, *self.zone.preset_modes]

    @property
    def preset_mode(self) -> str:
        s = self.zone.setting
        return (s.preset_mode if s and s.preset_mode in self.zone.presets else None) or PRESET_NONE

    @property
    def min_temp(self) -> float:
        return self._engine.target_range(self.zone)[0]

    @property
    def max_temp(self) -> float:
        return self._engine.target_range(self.zone)[1]

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return self._engine.attributes(self.zone)

    async def async_set_temperature(self, **kwargs: Any) -> None:
        if (mode := kwargs.get(ATTR_HVAC_MODE)) is not None and kwargs.get(ATTR_TEMPERATURE) is None:
            await self.async_set_hvac_mode(mode)
            return
        if (t := kwargs.get(ATTR_TEMPERATURE)) is None:
            return
        on = None if mode is None else mode != HVACMode.OFF
        await self._engine.set_temperature(self._zid, float(t), on)

    async def async_set_preset_mode(self, preset_mode: str) -> None:
        if preset_mode != PRESET_NONE and preset_mode not in self.zone.presets:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="unknown_preset",
                translation_placeholders={"preset": preset_mode, "presets": ", ".join(self.zone.preset_modes)},
            )
        await self._engine.set_preset(self._zid, preset_mode)

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        await self._engine.set_hvac(self._zid, hvac_mode != HVACMode.OFF)

    async def async_turn_on(self) -> None:
        await self._engine.set_hvac(self._zid, True)

    async def async_turn_off(self) -> None:
        await self._engine.set_hvac(self._zid, False)
