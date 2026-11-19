# Changelog

## 1.0.0 — unreleased

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
