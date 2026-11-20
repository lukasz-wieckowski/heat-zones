# Contributing to Heat Zones

Thanks for helping. A few rules keep Heat Zones usable in every home.

## Principles

- **No home-specific code.** No entity IDs, area names or vendor quirks in the core. Discover everything from Home
  Assistant's registries; hardware knowledge (companion entities of thermostats) lives in `const.py` as suffixes
  and can always be overridden in the zone's settings.
- **A thermostat, not a planner.** Heat Zones follows its schedule, overrides and manual changes. Planning from
  presence or habits belongs to other systems, which use the contract in the README.
- **Everything from the UI.** Settings are in the setup wizard and the zone subentry, with translations in `en`
  and `pl`.
- **The contract is stable.** `homeai_schedule`, `homeai_plan`, `homeai_signals`, the contract services, and the
  climate attributes other systems read — `source` (`schedule`, `override`, `hold`, `manual`, `preheat`) and
  `preset_temperatures` — change only with a new `homeai_schedule.version`.
- **English** for code, comments and documentation. User-facing text lives in `translations/` (entities, flows,
  services, errors) and `i18n.py` (plan titles and signals).

## Development setup

Requirements: Python 3.14 and [uv](https://docs.astral.sh/uv/) (or pip), Node.js 22 for the card.

```bash
uv venv -p 3.14
uv pip install -r requirements_test.txt
```

Run the checks before opening a pull request:

```bash
ruff check .
ruff format --check .
pytest
```

The card is written in TypeScript with Lit and bundled with esbuild. The bundle is committed, so rebuild it after
changing `frontend/src`:

```bash
cd frontend
npm ci
npm run check
npm run build
```

## Screenshots

The screenshots in the READMEs come from a clean Home Assistant with a demo home, built by
`scripts/demo/demo.mjs` (needs Docker and Node.js 22 or newer):

```bash
node scripts/demo/demo.mjs up en       # Home Assistant 2026.11 on http://127.0.0.1:18301 (pl: 18302)
npm install --no-save playwright       # once; it uses Playwright's Chromium or the installed Chrome
node scripts/demo/demo.mjs shots en    # into docs/images/en/
node scripts/demo/demo.mjs down en
```

`up` copies the integration from `custom_components/heat_zones`, onboards a user, builds the home (four rooms with
virtual thermostats, room sensors and windows, an outdoor sensor), adds three zones with a schedule, overrides and a
hold, and puts their cards on a *Heating* dashboard, all with names in the chosen language. Everything lives in
`.demo/<lang>/`, which git ignores; the demo user's password is in `.demo/<lang>/credentials.json`. Take the
screenshots again in both languages whenever the card, the setup or the integration's pages change.

## Layout

| File | What |
|---|---|
| `engine.py` | zones from subentries, the controller, learning, valve guard, attributes |
| `schedule.py` | weekly schedule, overrides, holds and preheat (pure functions) |
| `model.py` | the thermal model (pure functions) |
| `history.py` | the model's start from Home Assistant's history |
| `home.py` | areas, thermostats, sensors and openings from the registries |
| `services.py` | the contract and hold services |
| `config_flow.py` | the wizard, options and the zone subentry |
| `frontend/` | the card and the schedule editor |
| `scripts/demo/` | the demo home and the screenshots for the READMEs |

## Pull requests

- Keep each pull request to one change, with tests.
- Versions match: `manifest.json`, `const.py`, `pyproject.toml`, `frontend/package.json`; `CHANGELOG.md` has the
  section for the version (a test checks it).
- CI runs hassfest, the HACS validation, ruff, pytest and the frontend build check; all must pass.
