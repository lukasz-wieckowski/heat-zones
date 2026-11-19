"""Constants of Heat Zones."""

from __future__ import annotations

from datetime import timedelta
import logging

DOMAIN = "heat_zones"
NAME = "Heat Zones"
VERSION = "1.0.0"
LOGGER = logging.getLogger(__package__)

SUBENTRY_ZONE = "zone"
STORAGE_VERSION = 1
SAVE_DELAY = 60  # s: zone state (targets, schedule, learning) is saved this long after the last change

STATIC_URL = "/heat_zones_static"
CARD_FILE = "heat-zones-card.js"

TICK = timedelta(minutes=5)  # controller and learning
REFRESH_SENT = timedelta(minutes=30)  # a thermostat gets the room reading at least this often, even unchanged
STALE = timedelta(hours=2)  # a sensor silent for longer is not used
ECHO = 30.0  # s: a thermostat change this soon after our command is our echo, not a hand on the knob
RETRY_AFTER = 300.0  # s: a command the thermostat did not take is repeated after this long
RELOAD_AFTER = 10.0  # s: after registry changes (new thermostat, other area)

# Where the zone measures its temperature: a room (area id), the average of all rooms or the coldest room.
AVERAGE = "average"
COLDEST = "coldest"

# How a thermostat is driven (P2).
MODE_AUTO = "auto"  # room sensor input when the thermostat has one, else target offset, else own thermometer
MODE_ROOM_SENSOR = "room_sensor"  # the room temperature goes to the thermostat's external sensor input
MODE_OFFSET = "offset"  # the target is corrected by the difference between the thermostat and the room
MODE_OWN = "own"  # the thermostat regulates by its own thermometer
CONTROL_MODES = (MODE_AUTO, MODE_ROOM_SENSOR, MODE_OFFSET, MODE_OWN)
OFFSET_MAX = 3.0  # °C: default limit of the target correction
OFFSET_SMOOTHING = 0.3  # weight of a new reading in the smoothed offset

# Companion entities of a thermostat, found on the same device by the end of their unique_id (Zigbee2MQTT
# exposes: SONOFF TRVZB / TRV-ZBT and others), else by the end of their entity_id.
SENSOR_SELECT_SUFFIXES = ("_temperature_sensor_select",)
EXTERNAL_INPUT_SUFFIXES = ("_external_temperature_input",)
VALVE_LIMIT_SUFFIXES = ("_valve_opening_degree", "_heating_valve_position")
CALIBRATE_SUFFIXES = ("_valve_travel_calibration",)
SENSOR_EXTERNAL = "remote_temperature"
SENSOR_LOCAL = "local_temperature"
SENSOR_OFFLINE = "remote_source_offline"

# Self-repair of the room sensor: with the room sensor selected the thermostat reports as its own temperature
# exactly the reading it received. A mismatch of MISMATCH for longer than MISMATCH_AFTER means the thermostat
# quietly regulates by its own thermometer (seen after a firmware update) — sensor selection and the reading are
# sent again, at most every REPAIR_EVERY; after REPAIR_MAX failed attempts the zone reports a problem.
MISMATCH = 0.5
MISMATCH_AFTER = timedelta(minutes=15)
REPAIR_EVERY = timedelta(minutes=30)
REPAIR_MAX = 3

UNAVAILABLE = ("unknown", "unavailable")

# Schedule, overrides and holds
HORIZON = timedelta(hours=36)  # plan published for other systems
PLAN_MAX = 50  # entries in `homeai_plan`
PREHEAT_MAX = timedelta(hours=3)  # default: the earliest preheat start before a block
PREHEAT_LIMIT = timedelta(hours=6)  # upper limit of the option
OVERRIDE_MAX = timedelta(days=90)
REASON_MAX = 200
SOURCE_MAX = 60
ID_MAX = 80
HOLD_NEXT = "next_block"
HOLD_UNTIL = "until"
HOLD_PERMANENT = "permanent"

# Presets
PRESET_DEFAULTS = {"comfort": 21.0, "eco": 19.0, "sleep": 18.0, "away": 16.0}
MIN_TEMP = 5.0
MAX_TEMP = 30.0

# Window pause
WINDOW_DELAY = 2  # min: open longer — the radiator waits

# Learning
LEARNING_CONFIDENT = 12  # hourly samples — from this many the zone shows predicted room temperatures
K_TRUSTED = 12  # cooling windows learned online — fewer: the start from history may still add cooling
HISTORY_DAYS = 10  # what the recorder usually keeps
HISTORY_NIGHTS = timedelta(days=45)  # cooling from long-term statistics of nights before the heating start
BOOTSTRAP_RETRY = timedelta(minutes=10)

# Valve guard: the valve is open at least VALVE_OPEN % for VALVE_AFTER and the room did not rise even
# VALVE_RISE from its lowest reading. Sensors hang across the room from the radiator and report every few dozen
# minutes; real rooms took up to an hour from the dip to +0.2°, and 45 min gave false alarms.
VALVE_OPEN = 80.0
VALVE_AFTER = timedelta(hours=2)
VALVE_RISE = 0.2
NEAR_TARGET = 0.3  # °C: just below the target the valve throttles although the thermostat says "heating"
FREEZING = 0.0  # °C outside
WINDOW_SIGNAL_COLD = timedelta(minutes=10)  # window open while heating and freezing outside
WINDOW_SIGNAL = timedelta(minutes=30)  # …otherwise

# A device with such a domain controls something: its thermometer or door sensor says nothing about the room.
CONTROLLING = {
    "light",
    "switch",
    "fan",
    "vacuum",
    "climate",
    "media_player",
    "cover",
    "lock",
    "valve",
    "humidifier",
    "water_heater",
    "siren",
    "lawn_mower",
    "remote",
    "camera",
    "alarm_control_panel",
    "plant",
}
OPENINGS = {"door", "window", "opening", "garage_door"}
