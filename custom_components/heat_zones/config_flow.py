"""Setup wizard, options, and zones as subentries.

The wizard can create one zone for every area with a thermostat. A zone (subentry) is set up in steps:
rooms and thermostats → one short step per room (sensor, limit) → presets → control.
"""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    ConfigSubentryData,
    ConfigSubentryFlow,
    OptionsFlow,
    SubentryFlowResult,
)
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    AreaSelector,
    AreaSelectorConfig,
    BooleanSelector,
    DateSelector,
    EntitySelector,
    EntitySelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
)
import probatio as vol

from .const import (
    CONTROL_MODES,
    DOMAIN,
    MAX_TEMP,
    MIN_TEMP,
    MODE_AUTO,
    NAME,
    OFFSET_MAX,
    PREHEAT_LIMIT,
    PREHEAT_MAX,
    PRESET_DEFAULTS,
    SUBENTRY_ZONE,
    WINDOW_DELAY,
)
from .home import area_map, area_of_entity

TEMPERATURE = NumberSelector(
    NumberSelectorConfig(min=MIN_TEMP, max=MAX_TEMP, step=0.5, mode=NumberSelectorMode.BOX, unit_of_measurement="°C")
)


def zone_defaults() -> dict[str, Any]:
    return {
        "areas": [],
        "thermostats": [],
        "windows": [],
        "window_pause": True,
        "window_delay": WINDOW_DELAY,
        "sensors": {},
        "limits": {},
        "presets": dict(PRESET_DEFAULTS),
        "custom_presets": [],
        "control_mode": MODE_AUTO,
        "offset_max": OFFSET_MAX,
        "optimum_start": True,
        "preheat_max": PREHEAT_MAX.total_seconds() / 3600,
        "external_inputs": [],
        "sensor_selects": [],
        "valve_limits": [],
    }


def parse_presets(text: str) -> list[dict[str, Any]]:
    """Own presets from lines „Name: 24” (or „Name = 24”); raises ValueError on a bad line."""
    result: list[dict[str, Any]] = []
    for raw in (text or "").splitlines():
        line = raw.strip()
        if not line:
            continue
        sep = ":" if ":" in line else "="
        name, _, value = line.rpartition(sep)
        name = name.strip()
        try:
            temperature = round(float(value.strip().replace(",", ".")) * 2) / 2
        except ValueError:
            raise ValueError(line) from None
        if not name or len(name) > 30 or not MIN_TEMP <= temperature <= MAX_TEMP:
            raise ValueError(line)
        if name.casefold() in {*PRESET_DEFAULTS, "none"} or any(
            p["name"].casefold() == name.casefold() for p in result
        ):
            raise ValueError(line)
        result.append({"name": name, "temperature": temperature})
    return result


def format_presets(presets: list[dict[str, Any]]) -> str:
    return "\n".join(f"{p['name']}: {p['temperature']:g}" for p in presets)


class HeatZonesConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> HeatZonesOptionsFlow:
        return HeatZonesOptionsFlow()

    @classmethod
    @callback
    def async_get_supported_subentry_types(cls, config_entry: ConfigEntry) -> dict[str, type[ConfigSubentryFlow]]:
        return {SUBENTRY_ZONE: ZoneSubentryFlow}

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if user_input is not None:
            subentries: list[ConfigSubentryData] = []
            if user_input.get("create_zones"):
                for area in area_map(self.hass).values():
                    if area.thermostats:
                        data = {**zone_defaults(), "areas": [area.id]}
                        subentries.append(
                            ConfigSubentryData(data=data, subentry_type=SUBENTRY_ZONE, title=area.name, unique_id=None)
                        )
            options = {k: user_input[k] for k in ("outdoor_sensor", "weather") if user_input.get(k)}
            return self.async_create_entry(title=NAME, data={}, options=options, subentries=subentries)
        found = [a.name for a in area_map(self.hass).values() if a.thermostats]
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Optional("outdoor_sensor"): EntitySelector(
                        EntitySelectorConfig(domain="sensor", device_class="temperature")
                    ),
                    vol.Optional("weather"): EntitySelector(EntitySelectorConfig(domain="weather")),
                    vol.Required("create_zones", default=bool(found)): BooleanSelector(),
                }
            ),
            description_placeholders={"areas": ", ".join(found) or "—"},
        )


class HeatZonesOptionsFlow(OptionsFlow):
    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data={k: v for k, v in user_input.items() if v})
        current = self.config_entry.options
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional("outdoor_sensor", description={"suggested_value": current.get("outdoor_sensor")}): (
                        EntitySelector(EntitySelectorConfig(domain="sensor", device_class="temperature"))
                    ),
                    vol.Optional("weather", description={"suggested_value": current.get("weather")}): EntitySelector(
                        EntitySelectorConfig(domain="weather")
                    ),
                    vol.Optional("heating_start", description={"suggested_value": current.get("heating_start")}): (
                        DateSelector()
                    ),
                }
            ),
        )


class ZoneSubentryFlow(ConfigSubentryFlow):
    """Add or change a zone."""

    def __init__(self) -> None:
        self._data: dict[str, Any] = zone_defaults()
        self._title = ""
        self._rooms: list[str] = []
        self._room_index = 0

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        return await self.async_step_zone(user_input)

    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        sub = self._get_reconfigure_subentry()
        self._data = {**zone_defaults(), **dict(sub.data)}
        self._title = sub.title
        return await self.async_step_zone()

    async def async_step_zone(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            areas = list(user_input.get("areas") or [])
            thermostats = list(user_input.get("thermostats") or [])
            homes = area_map(self.hass)
            if not areas:
                areas = list(dict.fromkeys(a for t in thermostats if (a := area_of_entity(self.hass, t))))
            if not areas:
                errors["areas"] = "no_areas"
            elif not thermostats and not any(homes[a].thermostats for a in areas if a in homes):
                errors["thermostats"] = "no_thermostats"
            if not errors:
                self._title = user_input["name"].strip() or homes[areas[0]].name
                self._data.update(
                    areas=areas,
                    thermostats=thermostats,
                    windows=list(user_input.get("windows") or []),
                    window_pause=user_input["window_pause"],
                    window_delay=int(user_input["window_delay"]),
                )
                self._rooms = areas
                self._room_index = 0
                return await self.async_step_room()
        d = self._data
        default_name = self._title
        if not default_name and d["areas"]:
            default_name = area_map(self.hass)[d["areas"][0]].name if d["areas"][0] in area_map(self.hass) else ""
        return self.async_show_form(
            step_id="zone",
            data_schema=vol.Schema(
                {
                    vol.Required("name", default=default_name): TextSelector(),
                    vol.Optional("areas", default=d["areas"]): AreaSelector(AreaSelectorConfig(multiple=True)),
                    vol.Optional("thermostats", default=d["thermostats"]): EntitySelector(
                        EntitySelectorConfig(domain="climate", multiple=True)
                    ),
                    vol.Optional("windows", default=d["windows"]): EntitySelector(
                        EntitySelectorConfig(
                            domain="binary_sensor",
                            device_class=["window", "door", "opening", "garage_door"],
                            multiple=True,
                        )
                    ),
                    vol.Required("window_pause", default=d["window_pause"]): BooleanSelector(),
                    vol.Required("window_delay", default=d["window_delay"]): NumberSelector(
                        NumberSelectorConfig(
                            min=0, max=30, step=1, mode=NumberSelectorMode.BOX, unit_of_measurement="min"
                        )
                    ),
                }
            ),
            errors=errors,
        )

    async def async_step_room(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        homes = area_map(self.hass)
        area = self._rooms[self._room_index]
        if user_input is not None:
            sensor = user_input.get("sensor")
            self._data["sensors"] = {
                **{k: v for k, v in self._data["sensors"].items() if k in self._rooms and k != area},
                **({area: sensor} if sensor and sensor != (homes[area].sensor if area in homes else None) else {}),
            }
            limits = {k: v for k, v in self._data["limits"].items() if k in self._rooms and k != area}
            if user_input.get("limit") is not None:
                limits[area] = float(user_input["limit"])
            self._data["limits"] = limits
            self._room_index += 1
            if self._room_index < len(self._rooms):
                return await self.async_step_room()
            return await self.async_step_presets()
        found = homes.get(area)
        current_sensor = self._data["sensors"].get(area) or (found.sensor if found else None)
        return self.async_show_form(
            step_id="room",
            data_schema=vol.Schema(
                {
                    vol.Optional("sensor", description={"suggested_value": current_sensor}): EntitySelector(
                        EntitySelectorConfig(domain="sensor", device_class="temperature")
                    ),
                    vol.Optional("limit", description={"suggested_value": self._data["limits"].get(area)}): TEMPERATURE,
                }
            ),
            description_placeholders={
                "room": found.name if found else area,
                "number": str(self._room_index + 1),
                "count": str(len(self._rooms)),
            },
        )

    async def async_step_presets(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                custom = parse_presets(user_input.get("custom_presets") or "")
            except ValueError:
                errors["custom_presets"] = "invalid_presets"
            else:
                self._data["presets"] = {k: float(user_input[k]) for k in PRESET_DEFAULTS}
                self._data["custom_presets"] = custom
                return await self.async_step_control()
        presets = {**PRESET_DEFAULTS, **(self._data.get("presets") or {})}
        fields: dict[Any, Any] = {vol.Required(k, default=presets[k]): TEMPERATURE for k in PRESET_DEFAULTS}
        fields[vol.Optional("custom_presets", default=format_presets(self._data.get("custom_presets") or []))] = (
            TextSelector(TextSelectorConfig(multiline=True))
        )
        return self.async_show_form(step_id="presets", data_schema=vol.Schema(fields), errors=errors)

    async def async_step_control(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        if user_input is not None:
            self._data.update(
                control_mode=user_input["control_mode"],
                offset_max=float(user_input["offset_max"]),
                optimum_start=user_input["optimum_start"],
                preheat_max=float(user_input["preheat_max"]),
                external_inputs=list(user_input.get("external_inputs") or []),
                sensor_selects=list(user_input.get("sensor_selects") or []),
                valve_limits=list(user_input.get("valve_limits") or []),
            )
            if self.source == "reconfigure":
                return self.async_update_and_abort(
                    self._get_entry(), self._get_reconfigure_subentry(), title=self._title, data=self._data
                )
            return self.async_create_entry(title=self._title, data=self._data)
        d = self._data
        return self.async_show_form(
            step_id="control",
            data_schema=vol.Schema(
                {
                    vol.Required("control_mode", default=d["control_mode"]): SelectSelector(
                        SelectSelectorConfig(
                            options=list(CONTROL_MODES),
                            translation_key="control_mode",
                            mode=SelectSelectorMode.DROPDOWN,
                        )
                    ),
                    vol.Required("offset_max", default=d["offset_max"]): NumberSelector(
                        NumberSelectorConfig(
                            min=0, max=6, step=0.5, mode=NumberSelectorMode.BOX, unit_of_measurement="°C"
                        )
                    ),
                    vol.Required("optimum_start", default=d["optimum_start"]): BooleanSelector(),
                    vol.Required("preheat_max", default=d["preheat_max"]): NumberSelector(
                        NumberSelectorConfig(
                            min=0.5,
                            max=PREHEAT_LIMIT.total_seconds() / 3600,
                            step=0.5,
                            mode=NumberSelectorMode.BOX,
                            unit_of_measurement="h",
                        )
                    ),
                    vol.Optional("external_inputs", default=d["external_inputs"]): EntitySelector(
                        EntitySelectorConfig(domain="number", multiple=True)
                    ),
                    vol.Optional("sensor_selects", default=d["sensor_selects"]): EntitySelector(
                        EntitySelectorConfig(domain="select", multiple=True)
                    ),
                    vol.Optional("valve_limits", default=d["valve_limits"]): EntitySelector(
                        EntitySelectorConfig(domain="number", multiple=True)
                    ),
                }
            ),
        )
