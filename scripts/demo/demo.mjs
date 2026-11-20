#!/usr/bin/env node
// A clean Home Assistant with a demo home and Heat Zones, for the screenshots in the README.
//
//   node scripts/demo/demo.mjs up en|pl     start Home Assistant in Docker, onboard it, build the home,
//                                           set up Heat Zones with three zones, a schedule and overrides
//   node scripts/demo/demo.mjs shots en|pl  take the screenshots into docs/images/<lang>/ (needs Playwright)
//   node scripts/demo/demo.mjs down en|pl   remove the container and its data
//
// Everything lives in .demo/<lang>/ (ignored by git): the configuration, the demo user's password and tokens.
// `up` copies custom_components/heat_zones into the demo, so run it again after a change.

import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const IMAGE = "ghcr.io/home-assistant/home-assistant:2026.11.2";
const PORTS = { en: 18301, pl: 18302 };
const TIME_ZONE = "Europe/Warsaw";
const DASHBOARD = "dashboard-heating";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const TEXT = {
  en: {
    home: "Home",
    heating: "Heating",
    country: "GB",
    currency: "EUR",
    locale: "en-GB",
    areas: { living: "Living Room", kitchen: "Kitchen", bedroom: "Bedroom", bathroom: "Bathroom" },
    radiator: {
      living: "Living room radiator",
      kitchen: "Kitchen radiator",
      bedroom: "Bedroom radiator",
      bathroom: "Bathroom radiator",
    },
    heater: "valve",
    temperature: {
      living: "Living room temperature",
      kitchen: "Kitchen temperature",
      bedroom: "Bedroom temperature",
      bathroom: "Bathroom temperature",
    },
    window: { living: "Living room window", bedroom: "Bedroom window" },
    outdoor: "Outdoor temperature",
    zones: { living: "Living area", bedroom: "Bedroom", bathroom: "Bathroom" },
    morning: "Morning",
    shower: "Shower",
    wfh: "Working from home",
    guests: "Guests",
    trip: "Christmas trip",
    ui: {
      schedule: "Schedule",
      settings: "Settings",
      add_override: "Add override",
      add_zone: "Add zone",
    },
  },
  pl: {
    home: "Dom",
    heating: "Ogrzewanie",
    country: "PL",
    currency: "PLN",
    locale: "pl-PL",
    areas: { living: "Salon", kitchen: "Kuchnia", bedroom: "Sypialnia", bathroom: "Łazienka" },
    radiator: {
      living: "Grzejnik w salonie",
      kitchen: "Grzejnik w kuchni",
      bedroom: "Grzejnik w sypialni",
      bathroom: "Grzejnik w łazience",
    },
    heater: "zawór",
    temperature: {
      living: "Temperatura w salonie",
      kitchen: "Temperatura w kuchni",
      bedroom: "Temperatura w sypialni",
      bathroom: "Temperatura w łazience",
    },
    window: { living: "Okno w salonie", bedroom: "Okno w sypialni" },
    outdoor: "Temperatura na zewnątrz",
    zones: { living: "Część dzienna", bedroom: "Sypialnia", bathroom: "Łazienka" },
    morning: "Poranek",
    shower: "Prysznic",
    wfh: "Praca z domu",
    guests: "Goście",
    trip: "Wyjazd na święta",
    ui: {
      schedule: "Harmonogram",
      settings: "Ustawienia",
      add_override: "Dodaj nadpisanie",
      add_zone: "Dodaj strefę",
    },
  },
};

// Room temperatures of the demo: the living area heats, the bedroom has a window open, the bathroom is warm.
const ROOMS = { living: 19.9, kitchen: 20.5, bedroom: 18.2, bathroom: 23.9 };
const OUTDOOR = 3.5;

const [command, lang] = process.argv.slice(2);
if (!["up", "shots", "down"].includes(command) || !TEXT[lang]) {
  console.error("usage: node scripts/demo/demo.mjs up|shots|down en|pl");
  process.exit(1);
}
const T = TEXT[lang];
const DATA = join(ROOT, ".demo", lang);
const NAME = `heat-zones-demo-${lang}`;
const BASE = `http://127.0.0.1:${PORTS[lang]}`;
const CLIENT = `${BASE}/`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${lang}]`, ...a);
const docker = (...args) => execFileSync("docker", args, { encoding: "utf8" }).trim();

// ---------------------------------------------------------------------------------------------- Home Assistant

async function http(path, { method = "GET", token, json, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form) {
    body = new URLSearchParams(form);
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function connect(token) {
  const ws = new WebSocket(`${BASE.replace("http", "ws")}/api/websocket`);
  const pending = new Map();
  let id = 0;
  await new Promise((resolve, reject) => {
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.type === "auth_required") ws.send(JSON.stringify({ type: "auth", access_token: token }));
      else if (m.type === "auth_ok") resolve();
      else if (m.type === "auth_invalid") reject(new Error("auth_invalid"));
      else if (m.type === "result" && pending.has(m.id)) {
        const { ok, fail } = pending.get(m.id);
        pending.delete(m.id);
        if (m.success) ok(m.result);
        else fail(new Error(`${m.error?.code}: ${m.error?.message}`));
      }
    };
    ws.onerror = () => reject(new Error("websocket"));
  });
  return {
    call(type, data = {}) {
      id += 1;
      const n = id;
      return new Promise((ok, fail) => {
        pending.set(n, { ok, fail });
        ws.send(JSON.stringify({ id: n, type, ...data }));
      });
    },
    close: () => ws.close(),
  };
}

async function waitFor(what, check, seconds = 180) {
  for (let i = 0; i < seconds; i += 1) {
    try {
      const result = await check();
      if (result) return result;
    } catch {
      // not yet
    }
    await sleep(1000);
  }
  throw new Error(`timed out waiting for ${what}`);
}

async function login() {
  const { username, password } = JSON.parse(readFileSync(join(DATA, "credentials.json"), "utf8"));
  const flow = await http("/auth/login_flow", {
    method: "POST",
    json: { client_id: CLIENT, handler: ["homeassistant", null], redirect_uri: `${CLIENT}?auth_callback=1` },
  });
  const done = await http(`/auth/login_flow/${flow.flow_id}`, {
    method: "POST",
    json: { client_id: CLIENT, username, password },
  });
  return http("/auth/token", {
    method: "POST",
    form: { grant_type: "authorization_code", code: done.result, client_id: CLIENT },
  });
}

// ---------------------------------------------------------------------------------------------- the demo home

function configuration() {
  const rooms = Object.keys(ROOMS);
  const lines = ["default_config:", "", "input_number:"];
  for (const r of [...rooms, "outdoor"]) {
    const value = r === "outdoor" ? OUTDOOR : ROOMS[r];
    lines.push(`  demo_${r}:`, `    min: -30`, `    max: 40`, `    step: 0.1`, `    initial: ${value}`);
  }
  lines.push("", "input_boolean:");
  for (const r of rooms) lines.push(`  demo_${r}_heater:`, `    name: "${T.radiator[r]} ${T.heater}"`);
  for (const r of Object.keys(T.window)) lines.push(`  demo_${r}_window:`, `    initial: ${r === "bedroom"}`);
  lines.push("", "template:", "  - sensor:");
  for (const r of [...rooms, "outdoor"]) {
    const name = r === "outdoor" ? T.outdoor : T.temperature[r];
    lines.push(
      `      - unique_id: demo_${r}_temperature`,
      `        default_entity_id: sensor.demo_${r}_temperature`,
      `        name: "${name}"`,
      `        device_class: temperature`,
      `        state_class: measurement`,
      `        unit_of_measurement: "°C"`,
      `        state: "{{ states('input_number.demo_${r}') }}"`,
    );
  }
  lines.push("  - binary_sensor:");
  for (const r of Object.keys(T.window)) {
    lines.push(
      `      - unique_id: demo_${r}_window`,
      `        default_entity_id: binary_sensor.demo_${r}_window`,
      `        name: "${T.window[r]}"`,
      `        device_class: window`,
      `        state: "{{ is_state('input_boolean.demo_${r}_window', 'on') }}"`,
    );
  }
  lines.push("", "climate:");
  for (const r of rooms) {
    lines.push(
      `  - platform: generic_thermostat`,
      `    unique_id: demo_${r}_radiator`,
      `    name: "${T.radiator[r]}"`,
      `    heater: input_boolean.demo_${r}_heater`,
      `    target_sensor: input_number.demo_${r}`,
      `    initial_hvac_mode: heat`,
      `    target_temp: 20`,
      `    min_temp: 5`,
      `    max_temp: 30`,
      `    precision: 0.1`,
      `    target_temp_step: 0.5`,
      `    cold_tolerance: 0.2`,
      `    hot_tolerance: 0.2`,
    );
  }
  return `${lines.join("\n")}\n`;
}

function at(day, time) {
  // a local wall-clock time `day` days from today, as an ISO string with the offset of the demo's time zone
  const d = new Date();
  d.setDate(d.getDate() + day);
  const [h, m] = time.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

async function up() {
  if (docker("ps", "-aq", "-f", `name=^${NAME}$`)) docker("rm", "-f", NAME);
  // empty the folders but keep them: Docker Desktop may keep mounting a folder that was removed and made again
  const config = join(DATA, "config");
  mkdirSync(config, { recursive: true });
  for (const dir of [DATA, config]) {
    for (const name of readdirSync(dir)) {
      if (join(dir, name) !== config) rmSync(join(dir, name), { recursive: true, force: true });
    }
  }
  mkdirSync(join(config, "custom_components"), { recursive: true });
  cpSync(join(ROOT, "custom_components", "heat_zones"), join(DATA, "config", "custom_components", "heat_zones"), {
    recursive: true,
    filter: (src) => !src.includes("__pycache__"),
  });
  writeFileSync(join(DATA, "config", "configuration.yaml"), configuration());

  log("starting", IMAGE);
  docker(
    "run", "-d", "--name", NAME,
    "-p", `127.0.0.1:${PORTS[lang]}:8123`,
    "-e", `TZ=${TIME_ZONE}`,
    "-v", `${join(DATA, "config")}:/config`,
    IMAGE,
  );
  await waitFor("onboarding", () => http("/api/onboarding"), 300);

  // onboarding: the owner, core config, analytics off, done
  const username = "anna";
  const password = randomBytes(18).toString("base64url");
  const { auth_code } = await http("/api/onboarding/users", {
    method: "POST",
    json: { client_id: CLIENT, name: "Anna", username, password, language: lang },
  });
  const tokens = await http("/auth/token", {
    method: "POST",
    form: { grant_type: "authorization_code", code: auth_code, client_id: CLIENT },
  });
  const token = tokens.access_token;
  await http("/api/onboarding/core_config", { method: "POST", token, json: {} });
  await http("/api/onboarding/analytics", { method: "POST", token, json: {} });
  await http("/api/onboarding/integration", {
    method: "POST",
    token,
    json: { client_id: CLIENT, redirect_uri: `${CLIENT}?auth_callback=1` },
  });
  writeFileSync(join(DATA, "credentials.json"), JSON.stringify({ username, password }, null, 2));
  log("onboarded");

  const ha = await connect(token);
  await ha.call("config/core/update", {
    location_name: T.home,
    country: T.country,
    currency: T.currency,
    language: lang,
    time_zone: TIME_ZONE,
    unit_system: "metric",
  });
  // the profile: a 24-hour clock in both languages, like the integration's own messages
  await ha.call("frontend/set_user_data", {
    key: "language",
    value: {
      language: lang,
      number_format: "language",
      time_format: "24",
      date_format: "language",
      time_zone: "local",
      first_weekday: "language",
    },
  });

  // rooms: onboarding made Living Room, Kitchen and Bedroom in the user's language
  const areas = await ha.call("config/area_registry/list");
  const area = {};
  for (const [key, name] of Object.entries(T.areas)) {
    const found = areas.find((a) => a.name === name);
    area[key] = found ? found.area_id : (await ha.call("config/area_registry/create", { name })).area_id;
  }
  const registry = await ha.call("config/entity_registry/list");
  // the helpers behind them (input_number, input_boolean) share some unique ids, so only these domains
  const byUnique = Object.fromEntries(
    registry
      .filter((e) => /^(climate|sensor|binary_sensor)\./.test(e.entity_id) && e.unique_id?.startsWith("demo_"))
      .map((e) => [e.unique_id, e]),
  );
  for (const r of Object.keys(ROOMS)) {
    for (const unique of [`demo_${r}_radiator`, `demo_${r}_temperature`, `demo_${r}_window`]) {
      if (byUnique[unique]) {
        await ha.call("config/entity_registry/update", { entity_id: byUnique[unique].entity_id, area_id: area[r] });
      }
    }
    await ha.call("config/area_registry/update", {
      area_id: area[r],
      temperature_entity_id: `sensor.demo_${r}_temperature`,
    });
  }
  log("rooms ready");

  // Heat Zones: the wizard, then a zone per part of the home
  const states = await http("/api/states", { token });
  const weather = states.find((s) => s.entity_id.startsWith("weather."))?.entity_id;
  let flow = await http("/api/config/config_entries/flow", {
    method: "POST",
    token,
    json: { handler: "heat_zones", show_advanced_options: false },
  });
  flow = await http(`/api/config/config_entries/flow/${flow.flow_id}`, {
    method: "POST",
    token,
    json: { outdoor_sensor: "sensor.demo_outdoor_temperature", ...(weather ? { weather } : {}), create_zones: false },
  });
  const entry = flow.result.entry_id;

  const zone = async (steps) => {
    let f = await http("/api/config/config_entries/subentries/flow", {
      method: "POST",
      token,
      json: { handler: [entry, "zone"], show_advanced_options: false },
    });
    for (const input of steps) {
      f = await http(`/api/config/config_entries/subentries/flow/${f.flow_id}`, { method: "POST", token, json: input });
      if (f.errors && Object.keys(f.errors).length) throw new Error(JSON.stringify(f.errors));
    }
    if (f.type !== "create_entry") throw new Error(`zone flow ended with ${f.type}`);
  };
  const control = {
    control_mode: "auto",
    offset_max: 3,
    optimum_start: true,
    preheat_max: 3,
    external_inputs: [],
    sensor_selects: [],
    valve_limits: [],
  };
  const zoneStep = (name, rooms, delay = 2) => ({
    name,
    areas: rooms.map((r) => area[r]),
    thermostats: [],
    windows: [],
    window_pause: true,
    window_delay: delay,
  });
  await zone([
    zoneStep(T.zones.living, ["living", "kitchen"]),
    {},
    { limit: 23 },
    { comfort: 21, eco: 19, sleep: 18, away: 16, custom_presets: "" },
    control,
  ]);
  await zone([
    zoneStep(T.zones.bedroom, ["bedroom"], 1),
    {},
    { comfort: 20, eco: 18.5, sleep: 17.5, away: 16, custom_presets: `${T.morning}: 21` },
    control,
  ]);
  await zone([
    zoneStep(T.zones.bathroom, ["bathroom"]),
    {},
    { comfort: 22, eco: 20, sleep: 19, away: 16, custom_presets: `${T.shower}: 24` },
    control,
  ]);

  const climates = await waitFor("the zones", async () => {
    const list = (await ha.call("config/entity_registry/list")).filter(
      (e) => e.platform === "heat_zones" && e.entity_id.startsWith("climate."),
    );
    return list.length === 3 ? list : null;
  });
  const zoneStates = await http("/api/states", { token });
  const zoneOf = (title) =>
    climates.find((e) => zoneStates.find((s) => s.entity_id === e.entity_id)?.attributes.friendly_name === title)
      .entity_id;
  const living = zoneOf(T.zones.living);
  const bedroom = zoneOf(T.zones.bedroom);
  const bathroom = zoneOf(T.zones.bathroom);
  log("zones", living, bedroom, bathroom);

  // the living area measures the average of the living room and the kitchen
  const measure = zoneStates.find(
    (s) => s.entity_id.startsWith("select.") && s.attributes.friendly_name?.startsWith(T.zones.living),
  );
  await http("/api/services/select/select_option", {
    method: "POST",
    token,
    json: { entity_id: measure.entity_id, option: "average" },
  });

  // the week
  const weekdays = ["mon", "tue", "wed", "thu", "fri"];
  const weekend = ["sat", "sun"];
  const service = (name, data) =>
    http(`/api/services/heat_zones/${name}`, {
      method: "POST",
      token,
      json: data,
    });
  await service("set_schedule", {
    entity_id: living,
    weekly: [
      { days: weekdays, time: "06:30", preset_mode: "comfort" },
      { days: weekdays, time: "08:30", preset_mode: "eco" },
      { days: weekdays, time: "16:00", preset_mode: "comfort" },
      { days: weekdays, time: "22:30", preset_mode: "sleep" },
      { days: weekend, time: "08:00", preset_mode: "comfort" },
      { days: weekend, time: "23:00", preset_mode: "sleep" },
    ],
  });
  await service("set_schedule", {
    entity_id: bedroom,
    weekly: [
      { days: weekdays, time: "06:15", preset_mode: T.morning },
      { days: weekdays, time: "07:30", preset_mode: "eco" },
      { days: weekdays, time: "22:00", preset_mode: "sleep" },
      { days: weekend, time: "08:00", preset_mode: T.morning },
      { days: weekend, time: "10:00", preset_mode: "eco" },
      { days: weekend, time: "23:00", preset_mode: "sleep" },
    ],
  });
  await service("set_schedule", {
    entity_id: bathroom,
    weekly: [
      { days: weekdays, time: "06:00", preset_mode: T.shower },
      { days: weekdays, time: "07:30", preset_mode: "eco" },
      { days: weekdays, time: "19:00", preset_mode: "comfort" },
      { days: weekdays, time: "22:00", preset_mode: "sleep" },
      { days: weekend, time: "08:00", preset_mode: T.shower },
      { days: weekend, time: "10:00", preset_mode: "comfort" },
      { days: weekend, time: "23:00", preset_mode: "sleep" },
    ],
  });

  // overrides: working from home today, guests tomorrow evening, a trip at Christmas for every zone
  await service("add_override", {
    entity_id: living,
    start: at(0, "08:30"),
    end: at(0, "16:00"),
    preset_mode: "comfort",
    reason: T.wfh,
    source: "homeai",
    override_id: "demo-wfh",
  });
  await service("add_override", {
    entity_id: living,
    start: at(1, "17:00"),
    end: at(1, "23:30"),
    temperature: 22,
    reason: T.guests,
    source: "card",
    override_id: "demo-guests",
  });
  const year = new Date().getFullYear();
  await service("add_override", {
    entity_id: [living, bedroom, bathroom],
    start: `${year}-12-23T08:00:00`,
    end: `${year}-12-28T15:00:00`,
    preset_mode: "away",
    reason: T.trip,
    source: "homeai",
    override_id: "demo-trip",
  });

  // the bathroom keeps the shower temperature a little longer
  const until = new Date(Date.now() + 2 * 3600e3);
  until.setMinutes(until.getMinutes() < 30 ? 30 : 60, 0, 0);
  await service("hold", { entity_id: bathroom, preset_mode: T.shower, until: until.toISOString() });

  // a dashboard with one card per zone (the default Overview is Home Assistant's own)
  await ha.call("lovelace/dashboards/create", {
    url_path: DASHBOARD,
    title: T.heating,
    icon: "mdi:radiator",
    show_in_sidebar: true,
    require_admin: false,
    mode: "storage",
  });
  await ha.call("lovelace/config/save", {
    url_path: DASHBOARD,
    config: {
      title: T.heating,
      views: [
        {
          title: T.heating,
          path: "zones",
          type: "sections",
          max_columns: 3,
          sections: [living, bedroom, bathroom].map((entity) => ({
            type: "grid",
            cards: [{ type: "custom:heat-zones-card", entity, grid_options: { columns: "full" } }],
          })),
        },
      ],
    },
  });
  writeFileSync(join(DATA, "zones.json"), JSON.stringify({ entry, living, bedroom, bathroom }, null, 2));
  ha.close();
  log(`ready: ${BASE} (user anna, password in .demo/${lang}/credentials.json)`);
}

// ---------------------------------------------------------------------------------------------- screenshots

async function shots() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.error("Playwright is needed: npm install --no-save playwright && npx playwright install chromium");
    process.exit(1);
  }
  const zones = JSON.parse(readFileSync(join(DATA, "zones.json"), "utf8"));
  // the bedroom window is open from the start; the zone pauses after its delay
  const { access_token } = await login();
  await waitFor("the window pause", async () => {
    const st = await http(`/api/states/${zones.bedroom}`, { token: access_token });
    return st.attributes.window_pause;
  });
  const out = join(ROOT, "docs", "images", lang);
  mkdirSync(out, { recursive: true });
  // Playwright's own Chromium, else the Chrome installed on the machine
  const browser = await chromium.launch().catch(() => chromium.launch({ channel: "chrome" }));

  const open = async ({ width = 1440, height = 900, scale = 1, dark = false, mobile = false } = {}) => {
    const tokens = await login();
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: scale,
      isMobile: mobile,
      hasTouch: mobile,
      colorScheme: dark ? "dark" : "light",
      locale: T.locale,
      timezoneId: TIME_ZONE,
      reducedMotion: "reduce",
    });
    await context.addInitScript(
      ({ tokens, base, client, lang }) => {
        localStorage.setItem(
          "hassTokens",
          JSON.stringify({ ...tokens, hassUrl: base, clientId: client, expires: Date.now() + tokens.expires_in * 1000 }),
        );
        localStorage.setItem("selectedLanguage", JSON.stringify(lang));
      },
      { tokens, base: BASE, client: CLIENT, lang },
    );
    return context.newPage();
  };
  const shot = async (page, name) => {
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(out, name), type: "jpeg", quality: 85 });
    log(name);
  };
  const dashboard = async (page) => {
    await page.goto(`${BASE}/${DASHBOARD}/zones`);
    await page.locator("heat-zones-card").nth(2).locator(".ribbon, [part~='today']").first().waitFor({ timeout: 60000 });
    await page.waitForTimeout(1500);
  };
  const card = (page, n = 0) => page.locator("heat-zones-card").nth(n);
  const sheet = (page) => card(page).locator("dialog[open]");

  // the dashboard, the schedule sheet, a day being edited, an override being added, the settings
  let page = await open();
  await dashboard(page);
  await shot(page, "01-dashboard.jpg");
  await card(page).getByRole("button", { name: T.ui.schedule, exact: true }).first().click();
  await sheet(page).waitFor();
  await shot(page, "02-schedule.jpg");
  const today = (new Date().getDay() + 6) % 7;
  await sheet(page).locator("[part~='day-bar']").nth(today).click();
  await shot(page, "03-edit-day.jpg");
  await page.keyboard.press("Escape");
  await card(page).getByRole("button", { name: T.ui.schedule, exact: true }).first().click();
  await sheet(page).getByRole("button", { name: T.ui.add_override }).click();
  await sheet(page).locator("[part~='form']").scrollIntoViewIfNeeded();
  await shot(page, "04-override.jpg");
  await page.keyboard.press("Escape");
  await card(page).getByRole("button", { name: T.ui.settings }).click();
  await sheet(page).waitFor();
  await shot(page, "05-settings.jpg");
  await page.keyboard.press("Escape");

  // Home Assistant's own places: the integration, adding a zone, a zone's device
  await page.goto(`${BASE}/config/integrations/integration/heat_zones`);
  await page.getByText(T.zones.bathroom).first().waitFor();
  await shot(page, "09-integration.jpg");
  await page.getByRole("button", { name: T.ui.add_zone }).first().click();
  await page.locator("dialog-data-entry-flow .dialog-title").waitFor();
  await page.waitForTimeout(1500);
  await shot(page, "10-add-zone.jpg");
  await page.keyboard.press("Escape");
  const ha = await connect((await login()).access_token);
  const entity = await ha.call("config/entity_registry/get", { entity_id: zones.living });
  ha.close();
  await page.goto(`${BASE}/config/devices/device/${entity.device_id}`);
  await page.waitForTimeout(3000);
  // the device's information and entities, without the activity column
  await page.waitForTimeout(800);
  await page.screenshot({
    path: join(out, "11-device.jpg"),
    type: "jpeg",
    quality: 85,
    clip: { x: 256, y: 0, width: 790, height: 900 },
  });
  log("11-device.jpg");
  await page.context().close();

  // dark: the schedule sheet over the cards
  page = await open({ dark: true });
  await dashboard(page);
  await card(page).getByRole("button", { name: T.ui.schedule, exact: true }).first().click();
  await sheet(page).waitFor();
  await shot(page, "08-dark.jpg");
  await page.context().close();

  // the phone
  page = await open({ width: 390, height: 844, scale: 2, mobile: true });
  await dashboard(page);
  await shot(page, "06-phone.jpg");
  await card(page).getByRole("button", { name: T.ui.schedule, exact: true }).first().click();
  await sheet(page).waitFor();
  await shot(page, "07-phone-schedule.jpg");
  await page.context().close();

  await browser.close();
}

async function down() {
  if (docker("ps", "-aq", "-f", `name=^${NAME}$`)) docker("rm", "-f", NAME);
  if (existsSync(DATA)) rmSync(DATA, { recursive: true, force: true });
  log("removed");
}

await { up, shots, down }[command]();
