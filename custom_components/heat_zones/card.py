"""The Lovelace card with the schedule editor: one module served by the integration and added to dashboards."""

from __future__ import annotations

from pathlib import Path

from homeassistant.core import HomeAssistant

from .const import CARD_FILE, LOGGER, STATIC_URL, VERSION

DATA_REGISTERED = "heat_zones_card_registered"


async def async_register_card(hass: HomeAssistant) -> None:
    path = Path(__file__).parent / "frontend"
    if not (path / CARD_FILE).exists():
        LOGGER.warning("The Heat Zones card is not built (%s missing)", CARD_FILE)
        return
    if hass.data.get(DATA_REGISTERED) or getattr(hass, "http", None) is None:
        return
    from homeassistant.components.http import StaticPathConfig

    await hass.http.async_register_static_paths([StaticPathConfig(STATIC_URL, str(path), cache_headers=False)])
    hass.data[DATA_REGISTERED] = True
    if "frontend" in hass.config.components:
        from homeassistant.components.frontend import add_extra_js_url

        url = f"{STATIC_URL}/{CARD_FILE}?v={VERSION}"
        # the card on dashboards: as a module for current browsers and as a script for the legacy build
        add_extra_js_url(hass, url)
        add_extra_js_url(hass, url, es5=True)
