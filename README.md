# Heat Zones

[Polski](README.pl.md)

Heat Zones turns the thermostats of your rooms into **heating zones that understand rooms** and follow a
**weekly schedule** like a programmable thermostat. A zone is one or more rooms (Home Assistant areas) heated by
one or more thermostats. You choose where the zone measures — one room, the average or the coldest room — and the
zone drives every thermostat so that *that* place gets the target temperature.

- **Room temperature to the thermostat**: thermostats with a room sensor input (SONOFF TRVZB / TRV-ZBT and others)
  get the temperature from the room; thermostats without one get a target corrected by the difference between
  their own thermometer and the room.
- **Room limits**: “the living room never warmer than 23.5 °C” while the zone measures in the hall.
- **Window pause**, **work without sensors** (falls back to the thermostats' own thermometers), **lost commands
  repeated**, **changes on the knob taken over**.
- **Self-repair of the room sensor**: a thermostat that quietly went back to its own thermometer (seen after a
  firmware update) is switched back; only when that fails you get a problem report.
- **Valve guard**: notices a valve that stays open while the room does not get warmer.
- **Learning**: differences between the rooms, heating rate, and a **thermal model** (cooling, heating power,
  outside temperature, wind) — also started from Home Assistant's history.
- **Weekly schedule** per zone with **preheat** (optimum start) from the model, **manual changes until the next
  block**, **hold until a time** or **permanently**, and **timed overrides** (vacation, guests, working from home).
- A **Lovelace card** with the schedule editor, included and registered automatically.
- A **contract for other systems** (such as [HomeAI](https://github.com/lukasz-wieckowski/homeai)): the plan for
  the next 36 hours, problems as signals, and services to read and change the schedule.

No cloud, no AI — Heat Zones is a thermostat. Systems like HomeAI can drive it like any thermostat and add
overrides through the contract below.

## Requirements

- Home Assistant **2026.11** or newer.
- Thermostats as `climate` entities, placed in areas. Temperature sensors in the rooms are strongly recommended.
- Optional: an outdoor temperature sensor or a weather entity with an hourly forecast (better preheat).

## Installation

**With HACS**

1. Open HACS → ⋮ → *Custom repositories*, add `https://github.com/lukasz-wieckowski/heat-zones`, category
   **Integration**.
2. Find **Heat Zones** in HACS, install it and restart Home Assistant.

**Manually**: copy `custom_components/heat_zones` into the `custom_components` folder of your configuration and
restart Home Assistant.

## Setup

*Settings → Devices & services → Add integration → Heat Zones.* The wizard asks for an optional outdoor sensor and
weather entity, and can create a zone for every area with a thermostat.

Every zone is a **subentry** of the integration (*Add zone*, and ⋮ → *Reconfigure* on a zone):

1. **Zone** — name, rooms (areas), thermostats (empty: every thermostat in the rooms), windows and doors (empty:
   every opening sensor in the rooms), window pause and its delay.
2. **One step per room** — its temperature sensor (empty: the area's temperature sensor, else one found in the
   room) and an optional limit.
3. **Presets** — temperatures of `comfort`, `eco`, `sleep` and `away`, plus your own presets, one per line
   (`Shower: 24`).
4. **Control** — how thermostats are driven (automatic, room sensor input, corrected target, own thermometer),
   the largest target correction, preheat on/off and how early it may start, and companion entities when they
   are not found automatically.

Options of the integration: outdoor sensor, weather, and **heating start** — the day your heating season started;
the zones then learn cooling from the nights before it, so preheat is accurate from day one.

## How a zone works

**Measuring point.** `select.<zone>_measure_at`: a room, `average` or `coldest`. If the chosen room's sensor is
silent the zone uses the other rooms; with no room reading at all the thermostats fall back to their own
thermometers and the zone reports a problem.

**Thermostat control** (per thermostat, *automatic* by default):

| Mode | When | What the zone sends |
|---|---|---|
| Room sensor input | the thermostat has an external temperature input (found by `unique_id`, e.g. Zigbee2MQTT `external_temperature_input` and `temperature_sensor_select`) | the room temperature (raised by limited rooms) and the zone target |
| Corrected target | no such input, but room sensors | target + (thermostat thermometer − room), smoothed and limited (default ±3 °C) |
| Own thermometer | no room sensors, or chosen | the zone target |

**Room limits.** For every room with a limit the zone feeds
`max(point, T_room − (limit − target))`, so the thermostat closes when the limited room reaches its limit. The
climate entity shows which room limits the zone (`limited_by`) and, from learning, the highest temperature the
measuring point can reach (`max_reachable`).

**Window pause.** A window or door open longer than the delay (default 2 min) turns the thermostats off until
it closes (`binary_sensor.<zone>_window_pause`). Long open windows while heating also become a signal.

**Valve limit.** When thermostats have a valve opening setting, `number.<zone>_valve_limit` sets it for all of them.

## Schedule

The schedule is weekly and per zone: blocks `{days, time, preset_mode | temperature}`. A block lasts until the
next one — across days and weeks. `switch.<zone>_schedule` turns it on and off (off: only manual changes).

What the zone holds at any moment, from the bottom:

1. **Schedule** (when on and not empty), otherwise the manual target.
2. **Overrides** — from–to, a preset or a temperature, with a reason and a source. They beat the schedule and
   disappear by themselves.
3. **Manual changes** — from the card, the knob, a remote, voice or another system. With the schedule on they
   last **until the next change** (the next block, or the start or end of an override). Use **Hold until** or
   **Hold permanently** (service `heat_zones.hold`) to keep them longer, and `heat_zones.resume` to return.

Between overrides and manual changes **the newest instruction wins**: a manual change beats a running override;
an override that starts later beats an earlier hold, and when it ends the hold is back.

**Preheat (optimum start).** Before a warmer step the zone starts heating early enough to reach it on time, from
the thermal model, the measured temperature and the outside temperature forecast — at most *Start preheating at
most* hours early (default 3). Until the model has learned, defaults are used; it gets accurate after a few days
of heating (or right away with *Heating start*).

`sensor.<zone>_next_change` shows when the target changes next, to what and why (`schedule`, `override`,
`hold`, `preheat`).

## Entities of a zone

| Entity | What |
|---|---|
| `climate.<zone>` | target at the measuring point, `heat`/`off`, presets `comfort`, `eco`, `sleep`, `away` and your own; attributes below |
| `switch.<zone>_schedule` | the schedule on/off |
| `sensor.<zone>_next_change` | the next change (timestamp; `temperature`, `preset_mode`, `source`, `reason`) |
| `select.<zone>_measure_at` | where the zone measures (zones with more than one room sensor) |
| `binary_sensor.<zone>_problem` | something needs attention (`device_class: problem`) |
| `binary_sensor.<zone>_window_pause` | heating paused by an open window |
| `number.<zone>_valve_limit` | valve opening limit (thermostats with such a setting) |
| `sensor.<zone>_heating_rate`, `_cooling_rate`, `_heating_power`, `_model_confidence`, `_room_samples` | learning and the thermal model (diagnostic) |

To set a preset on every zone at once, call `climate.set_preset_mode` with all zone thermostats as the target.

Climate attributes: `measure_at`, `rooms` (temperature, sensor, limit, learned offset and predicted temperature
per room), `thermostats` (entity and control mode), `room_temperature_sent`, `limited_by`, `max_reachable`,
`reach_at` (when the target is expected), `window_pause`, `open_windows`, `problem`, `source`, `reason`,
`override_id`, `hold`, `schedule_enabled`, `preset_temperatures`, `next_change`, and the contract attributes.

## Card

The integration serves and registers the card; add it from the dashboard editor (*Heat Zones*) or in YAML:

```yaml
type: custom:heat-zones-card
entity: climate.living_area
# optional
show_controls: true
show_schedule: true
show_overrides: true
```

It shows the zone now (temperature, target, why, what comes next), presets and holds, the weekly schedule editor
(tap a day, edit its blocks, copy them to other days) and the overrides. The editor and the overrides list are
also separate elements, `<heat-zones-schedule-editor>` and `<heat-zones-overrides>` (properties `hass` and
`entity`), for use in other cards.

## Contract for other systems

Heat Zones publishes what it will do and accepts changes from systems such as HomeAI. Any thermostat integration
can implement the same contract.

**Attributes of `climate.<zone>`:**

- `homeai_schedule` = `{"version": 1, "domain": "heat_zones", "areas": [...], "features": ["open_end"]}` — this
  thermostat supports the contract; `areas` (optional for other implementations) are the ids of the areas the zone
  heats (the zone's own device has no area, so systems should read the rooms from here); `features` lists the
  optional parts of version 1 it understands — senders use `open_end` only with thermostats that list it.
- `homeai_plan` = list of `{start, title, end?}` (ISO times): the schedule, overrides, holds and preheat of the
  next 36 hours, at most 50 entries. Empty while the zone is off.
- `homeai_signals` = list of `{id, title, severity 0–4, category, description?, need?, group?}` — the zone's
  problems (silent sensor, stuck valve, open window while heating, thermostat not using the room sensor,
  thermostats unavailable), as described in HomeAI's
  [docs/integrations.md](https://github.com/lukasz-wieckowski/homeai/blob/main/docs/integrations.md).

**Services** — targets are the zones' climate entities (entity, device, area or label targets work):

| Service | Fields | Response |
|---|---|---|
| `heat_zones.add_override` | `end` (required), `start` (default now), exactly one of `preset_mode` / `temperature`, `reason` (≤ 200 characters), `source`, `override_id` (the same id replaces the override), `open_end` (optional, default false) | `{override_id}` |
| `heat_zones.remove_override` | `override_id` or `source` (removes all overrides from that source); without a target: every zone | `{removed}` |
| `heat_zones.get_schedule` | without a target: every zone | `{entity_id: {enabled, weekly: [{days: ["mon", …], time: "HH:MM", preset_mode \| temperature}], overrides: [{override_id, start, end, preset_mode \| temperature, reason, source, open_end?}]}}` |
| `heat_zones.set_schedule` | `weekly` in the same format | — |
| `heat_zones.estimate` | `temperature` | `{entity_id: {minutes \| null, confidence 0–1}}` |
| `heat_zones.reset_learning` | — | — |

Details:

- `add_override` with an `override_id` that does not exist yet creates it under that id (upsert); `override_id` is
  1–80 characters, `source` at most 60. An override sent again **unchanged** (same start, end and value) keeps its
  age, so re-sending after a restart does not undo a manual change made since; a changed one is a new instruction.
- Times are ISO 8601 (without an offset: local time). An override may start in the past; its end must be in the
  future and after the start, and it may last at most 90 days. `preset_mode` must exist in every targeted zone.
- **Open-ended overrides** (`open_end: true`): the end is only a horizon — the sender renews the override while its
  reason lasts (nobody home, vacation mode) and removes it when the reason is gone. An active override always beats
  the schedule; the zone never preheats towards the horizon (a real end, such as the return from a trip, is
  prepared for). A renewal — the same id and value, a later end, the same start or a start of "now" once it has
  begun — keeps the override's age and start, so it does not beat a manual change made since. If nobody renews it,
  the schedule simply resumes at the horizon. `get_schedule` returns `open_end: true` on such overrides.
- `remove_override` with an unknown id removes nothing (`{removed: 0}`), not an error.
- `set_schedule` replaces the whole week; days are `mon` … `sun`, times `HH:MM`, temperatures 5–30 °C (rounded to
  0.5). A schedule invalid for any targeted zone changes none.
- `estimate` gives the minutes of continuous heating from now (0 when already there, `null` without a room
  temperature or when not reachable within 12 hours).
- **Who changed it**: states written because of a Heat Zones service carry the caller's context, and changes on the
  zone thermostat carry the context Home Assistant gives them; the integration's own changes (schedule, preheat,
  the end of an override or a hold) get a fresh context without a user. The `source` attribute (`schedule`,
  `override`, `hold`, `manual`, `preheat`) says the same without contexts: `hold` and `manual` are a person's change,
  also a turn of the knob. `source` and `preset_temperatures` (preset → °C) are part of the contract and stay stable.

Example — HomeAI knows about a trip:

```yaml
action: heat_zones.add_override
target:
  entity_id: [climate.living_area, climate.bedroom]
data:
  start: "2026-12-20T08:00:00+01:00"
  end: "2026-12-27T16:00:00+01:00"
  preset_mode: away
  reason: Christmas trip
  source: homeai
  override_id: homeai-trip-2026-12
response_variable: result
```

Besides the contract, `heat_zones.hold` (`temperature` or `preset_mode`, `until` or `permanent`) and
`heat_zones.resume` control holds.

## Notes

- Zones built from areas react to registry changes: a new thermostat or sensor in a zone's room rebuilds the
  zones after a moment.
- Learning starts from zero after installation; `heat_zones.reset_learning` forgets it.
- Diagnostics (*⋮ → Download diagnostics*) contain the zones' configuration, state and learning.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md). Heat Zones grew out of the private *Strefy ciepła* integration
(version 1.10), without its AI-like automatic mode: planning from presence and habits belongs to systems like
HomeAI, which use the contract above.

## License

[Apache 2.0](LICENSE)
