"""Shared fixtures for Heat Zones tests."""

from __future__ import annotations

from collections.abc import Generator
from typing import Any

import pytest

from .common import TZ, Home, patch_commands


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> Generator[None]:
    """Let Home Assistant load integrations from custom_components in every test."""
    yield


@pytest.fixture
async def home(hass: Any, monkeypatch: pytest.MonkeyPatch, freezer: Any) -> Home:
    """A home in Warsaw on Tuesday 17 November 2026, 21:00, with thermostats taking commands."""
    await hass.config.async_set_time_zone(TZ)
    freezer.move_to("2026-11-17 21:00:00+01:00")
    h = Home(hass)
    patch_commands(monkeypatch, h)
    return h
