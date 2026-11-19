# Changelog

## 1.0.0 — unreleased

- The zone thermostat uses Home Assistant's native temperature API from 2026.11 (no deprecation warnings; the old
  names stop working in 2027.11).
- Open-ended overrides (`add_override` with `open_end: true`, agreed with HomeAI and advertised in
  `homeai_schedule.features`): no preheat towards their horizon, and renewals keep the override's age. Fixes heating up an empty home before a rolling "nobody home"
  override is renewed (#2).
- The card and the editor elements take every colour, font, size, radius and spacing from the Home Assistant theme
  (light and dark), through `--heat-zones-*` variables with Home Assistant defaults and `::part` names, described
  in the README (Theming). The card also shows the window pause and the zone's problems in their own colours.
- Default look after Liquid Glass, carried over to the web: glass only on the controls (grouped in shared
  containers, selected option tinted, main action filled, concentric corners), editing in raised glass sheets,
  press feedback; solid glass with reduced transparency or more contrast, no animation with reduced motion. All of
  it on `--heat-zones-*` variables with Home Assistant defaults.

First public version, built from the private *Strefy ciepła* 1.10 (code only, no stored state).

- Zones from areas as config subentries, with a setup wizard that can create a zone for every area with a
  thermostat; several rooms and thermostats per zone; where to measure (a room, the average, the coldest room).
- Thermostat control per thermostat: room temperature to the sensor input (SONOFF TRVZB / TRV-ZBT and others,
  found by `unique_id` or chosen), corrected target for thermostats without such an input, or their own
  thermometer.
- Room limits, window pause, work without sensors, repeated commands, changes on the knob taken over, self-repair
  of the room sensor, valve guard.
- Learning of room differences and the heating rate; thermal model (cooling, heating power, outside temperature,
  wind) learned online and started from Home Assistant's history.
- Weekly schedule per zone with preheat (optimum start), manual changes until the next block, holds until a time
  or permanently, and timed overrides.
- Entities: climate with standard and own presets, schedule switch, next change, measuring point, problem, window
  pause, valve limit and diagnostic sensors.
- Lovelace card with the weekly schedule editor and overrides, served by the integration.
- Contract for other systems such as HomeAI: `homeai_schedule` (with the zone's `areas`), `homeai_plan` and
  `homeai_signals` attributes; `add_override` (upsert by id; an unchanged re-send keeps its age),
  `remove_override`, `get_schedule`, `set_schedule`, `estimate` and `reset_learning` services. States carry the
  caller's context; the integration's own changes get a fresh one.
- Translations: English and Polish.

Not carried over from *Strefy ciepła* 1.10: the Auto mode and its planner, household rhythm, presence and
Proximity, HomeAI exceptions, desk work, coffee machine wake-up, "worth airing", the home-wide mode entity and the
configuration WebSocket.
