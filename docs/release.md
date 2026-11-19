# Releasing

Steps for a release. Items marked *(owner)* need the repository owner.

1. *(owner)* Repository settings on GitHub: a description (for example “Room-aware heating zones with a weekly
   schedule for Home Assistant”) and topics `home-assistant`, `hacs`, `homeassistant`, `integration`, `heating`,
   `thermostat`. HACS validation checks both.
2. CI green on the release commit: ruff, pytest, frontend build check, hassfest, HACS validation.
3. Versions match: `manifest.json`, `const.py`, `pyproject.toml`, `frontend/package.json`; `CHANGELOG.md` has the
   section for the version with the date.
4. Test on a Home Assistant 2026.11 instance (for example in Docker): install from the branch, run the wizard, add a
   zone with a real or simulated thermostat, set a schedule in the card, add and remove an override with the
   services, check `homeai_plan`.
5. *(owner)* Merge, tag `vX.Y.Z` on `main` and publish a GitHub release with the changelog section.
6. *(owner)* For the default catalog: open a pull request to `hacs/default` adding `lukasz-wieckowski/heat-zones` to
   the `integration` list (the repository must be public and have a release).
