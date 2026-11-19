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
- **The contract is stable.** `homeai_schedule`, `homeai_plan`, `homeai_signals` and the contract services change
  only with a new `homeai_schedule.version`.
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

## Pull requests

- Keep each pull request to one change, with tests.
- Versions match: `manifest.json`, `const.py`, `pyproject.toml`, `frontend/package.json`; `CHANGELOG.md` has the
  section for the version (a test checks it).
- CI runs hassfest, the HACS validation, ruff, pytest and the frontend build check; all must pass.
