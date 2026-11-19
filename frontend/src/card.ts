// The Heat Zones card. At a glance: the zone now (temperature, target, why, problems), today as the zone will run it,
// and the presets. Rarely used things open in sheets: the weekly schedule with its overrides, and the settings
// (heating on or off, where to measure, keeping a manual change). Config: `entity` (a Heat Zones climate entity),
// optional `title`, `show_controls`, `show_schedule`, `show_overrides`.
import { LitElement, css, html, nothing } from "lit";
import { property, query, state } from "lit/decorators.js";
import { element } from "./define";
import { fetchSchedule } from "./editor";
import { clock, degrees, lang, presetName, t } from "./i18n";
import { localInput, temperatureOf, todayBars, tone } from "./schedule";
import { parts, shared } from "./styles";
import type { HassEntity, HomeAssistant, Schedule, Signal } from "./types";

interface CardConfig {
  type: string;
  entity: string;
  title?: string;
  show_controls?: boolean;
  show_schedule?: boolean;
  show_overrides?: boolean;
}

type Sheet = "schedule" | "settings";

function isZone(st: HassEntity | undefined): boolean {
  return st?.attributes?.homeai_schedule?.domain === "heat_zones";
}

// Parts of the embedded editors, passed on so that `heat-zones-card::part(segment)` reaches into them as well.
export const EDITOR_PARTS =
  "week, day-label, day-bar, segment, hours, blocks, sheet, sheet-title, block, input, button, message, selected, cold, warm, unknown, active, primary, icon, glass, inset";
export const OVERRIDES_PARTS = "list, override, form, sheet, input, button, message, primary, icon, glass, inset";

@element("heat-zones-card")
export class HeatZonesCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private config!: CardConfig;
  @state() private sheet: Sheet | null = null;
  @state() private holdOpen = false;
  @state() private holdUntil = "";
  @state() private schedule: Schedule | null = null;
  @query("dialog") private dialog?: HTMLDialogElement;
  private loadedFor = "";
  private stamp = "";

  static styles = [
    shared,
    css`
      ha-card {
        padding: var(--hz-padding);
        display: flex;
        flex-direction: column;
        gap: var(--hz-gap);
      }
      .top {
        display: flex;
        align-items: center;
        gap: var(--hz-gap);
      }
      .now-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--hz-gap);
      }
      .now {
        font-size: var(--hz-temperature-font-size);
        font-weight: var(--hz-temperature-font-weight);
        line-height: var(--hz-condensed-line-height);
        white-space: nowrap;
      }
      .now.heating {
        color: var(--hz-heating);
      }
      .target strong {
        font-size: var(--hz-target-font-size);
        font-weight: var(--hz-title-font-weight);
        min-width: 6ch;
        text-align: center;
        white-space: nowrap;
      }
      .why.window {
        color: var(--hz-window);
      }
      .problem {
        color: var(--hz-problem);
        font-size: var(--hz-small-font-size);
      }
      .today-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--hz-gap);
      }
      .ribbon {
        position: relative;
        height: var(--hz-ribbon-height);
        border-radius: var(--hz-ribbon-radius);
        background: var(--hz-track);
        cursor: pointer;
      }
      .ribbon .clip {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        overflow: hidden;
      }
      .ribbon .segment {
        position: absolute;
        top: 0;
        bottom: 0;
        background: color-mix(
          in srgb,
          color-mix(in srgb, var(--hz-tone) var(--hz-schedule-strength), var(--hz-schedule-base)) var(--hz-share),
          var(--hz-schedule-base)
        );
        border-right: var(--hz-border-width) solid var(--hz-schedule-base);
        box-sizing: border-box;
      }
      .segment.cold {
        --hz-tone: var(--hz-cold);
      }
      .segment.warm {
        --hz-tone: var(--hz-warm);
      }
      .segment.unknown {
        --hz-tone: var(--hz-unknown);
      }
      .ribbon .past {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        background: var(--hz-past);
      }
      .ribbon .marker {
        position: absolute;
        top: calc(var(--hz-small-gap) * -1);
        bottom: calc(var(--hz-small-gap) * -1);
        width: var(--hz-focus-width);
        border-radius: var(--hz-ribbon-radius);
        background: var(--hz-text);
        translate: calc(var(--hz-focus-width) / -2);
      }
      .ribbon:focus-visible {
        outline: var(--hz-focus-width) solid var(--hz-accent);
        outline-offset: var(--hz-focus-width);
      }

      dialog {
        margin: 0;
        padding: 0;
        border: 0;
        width: 100%;
        height: 100%;
        max-width: none;
        max-height: none;
        background: transparent;
        color: var(--hz-text);
      }
      dialog[open] {
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }
      /* The page behind is dimmed the way Home Assistant dims it for its own dialogs; the sheet's glass blurs it. */
      dialog::backdrop {
        background: transparent;
        -webkit-backdrop-filter: var(--hz-scrim-filter);
        backdrop-filter: var(--hz-scrim-filter);
      }
      .panel {
        width: 100%;
        max-height: 92dvh;
        overflow: hidden;
        box-sizing: border-box;
        border-radius: var(--hz-sheet-radius) var(--hz-sheet-radius) 0 0;
        background: var(--hz-sheet-fill);
        animation: hz-rise var(--hz-sheet-duration) ease-out;
        display: flex;
        flex-direction: column;
      }
      .body {
        overflow: auto;
        overscroll-behavior: contain;
        padding: 0 var(--hz-padding) calc(var(--hz-padding) + env(safe-area-inset-bottom));
        display: flex;
        flex-direction: column;
        gap: var(--hz-section-gap);
      }
      @media (min-width: 600px) {
        dialog[open] {
          align-items: center;
        }
        .panel {
          width: min(100%, 72ch);
          border-radius: var(--hz-sheet-radius);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .panel {
          animation: none;
        }
      }
      @keyframes hz-rise {
        from {
          transform: translateY(var(--ha-space-6));
          opacity: 0;
        }
      }
      .sheet-head {
        display: flex;
        align-items: center;
        gap: var(--hz-gap);
        padding: var(--hz-sheet-padding) var(--hz-padding);
      }
      .setting {
        display: flex;
        align-items: center;
        gap: var(--hz-gap);
        min-height: var(--hz-control-height);
      }
      .setting + .setting {
        border-top: var(--hz-border-width) solid var(--hz-line);
        padding-top: var(--hz-small-gap);
      }
      .setting select {
        max-width: 60%;
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: var(--hz-gap);
      }
    `,
  ];

  setConfig(config: CardConfig): void {
    if (!config.entity) throw new Error("entity is required");
    this.config = { show_controls: true, show_schedule: true, show_overrides: true, ...config };
  }

  getCardSize(): number {
    return 5;
  }

  static getStubConfig(hass: HomeAssistant): CardConfig {
    const entity = Object.values(hass.states).find((s) => s.entity_id.startsWith("climate.") && isZone(s));
    return { type: "custom:heat-zones-card", entity: entity?.entity_id ?? "" };
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("heat-zones-card-editor");
  }

  private get st(): HassEntity | undefined {
    return this.hass?.states[this.config.entity];
  }

  updated(): void {
    const st = this.st;
    if (!st || !this.config.show_schedule) return;
    if (this.loadedFor !== this.config.entity || st.last_updated !== this.stamp) {
      this.loadedFor = this.config.entity;
      this.stamp = st.last_updated;
      fetchSchedule(this.hass, this.config.entity).then(
        (s) => (this.schedule = s),
        () => (this.schedule = null),
      );
    }
  }

  // Another entity of the zone's device, found by its translation key (or by the usual entity id).
  private sibling(domain: string, key: string): string | undefined {
    const reg = this.hass.entities?.[this.config.entity];
    if (reg?.device_id) {
      const found = Object.values(this.hass.entities ?? {}).find(
        (e) =>
          e.device_id === reg.device_id &&
          e.platform === "heat_zones" &&
          e.translation_key === key &&
          e.entity_id.startsWith(`${domain}.`),
      );
      if (found) return found.entity_id;
    }
    const guess = `${domain}.${this.config.entity.split(".")[1]}_${key}`;
    return this.hass.states[guess] ? guess : undefined;
  }

  private climate(service: string, data: Record<string, unknown> = {}): void {
    this.hass.callService("climate", service, data, { entity_id: this.config.entity });
  }

  private step(delta: number): void {
    const a = this.st!.attributes;
    const next = Math.round(((a.temperature ?? 20) + delta) * 2) / 2;
    this.climate("set_temperature", { temperature: Math.max(a.min_temp ?? 5, Math.min(a.max_temp ?? 30, next)) });
  }

  private hold(data: Record<string, unknown>): void {
    this.hass.callService("heat_zones", "hold", data, { entity_id: this.config.entity });
    this.holdOpen = false;
  }

  private resume(): void {
    this.hass.callService("heat_zones", "resume", {}, { entity_id: this.config.entity });
  }

  private async open(sheet: Sheet): Promise<void> {
    this.sheet = sheet;
    await this.updateComplete;
    if (this.dialog && !this.dialog.open) this.dialog.showModal();
  }

  private close(): void {
    this.dialog?.close();
  }

  private closed(): void {
    this.sheet = null;
    this.holdOpen = false;
  }

  private switchButton(on: boolean, label: string, toggle: () => void) {
    return html`<button
      class="switch"
      part=${parts("switch", on && "on")}
      role="switch"
      aria-checked=${on ? "true" : "false"}
      aria-label=${label}
      @click=${toggle}
    ></button>`;
  }

  private renderNow(st: HassEntity) {
    const language = lang(this.hass);
    const a = st.attributes;
    const heating = a.hvac_action === "heating";
    const paused = Boolean(a.window_pause);
    const off = st.state === "off";
    const admin = this.hass.user?.is_admin ?? true;
    const signals = ((a.homeai_signals ?? []) as Signal[]).filter((s) => admin || s.need !== "admin");
    return html`<div class="top" part="header">
        <h3 class="grow" part="title">${this.config.title ?? a.friendly_name}</h3>
        <button
          class="icon glass"
          part="button icon glass"
          aria-label=${t(language, "settings")}
          title=${t(language, "settings")}
          @click=${() => this.open("settings")}
        >
          ⋯
        </button>
      </div>
      <div class="now-row">
        <div class="now ${heating ? "heating" : ""}" part=${parts("temperature", heating && "heating")}>
          ${degrees(language, a.current_temperature)}
        </div>
        ${this.config.show_controls
          ? html`<div class="target glass group" part="target group glass">
              <button class="icon" part="button icon" @click=${() => this.step(-0.5)} ?disabled=${off}>−</button>
              <strong part="target-value">${off ? t(language, "off") : degrees(language, a.temperature)}</strong>
              <button class="icon" part="button icon" @click=${() => this.step(0.5)} ?disabled=${off}>＋</button>
            </div>`
          : nothing}
      </div>
      <div>
        <div class="row">
          <span class="why muted ${paused ? "window" : ""}" part=${parts("reason", paused && "window")}>${a.reason ?? ""}</span>
          ${a.source === "hold"
            ? html`<button class="link" part="button link" @click=${this.resume}>${t(language, "resume")}</button>`
            : nothing}
        </div>
        ${signals.map((s) => html`<div class="problem" part="problem">${s.title}</div>`)}
      </div>`;
  }

  private renderToday(st: HassEntity) {
    const language = lang(this.hass);
    const a = st.attributes;
    const s = this.schedule;
    const now = new Date();
    const bars = s ? todayBars(s, now) : [];
    const position = ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;
    const temps = (a.preset_temperatures ?? {}) as Record<string, number>;
    const next = a.next_change as { at: string; temperature: number; preset_mode: string | null } | null;
    const status = !a.schedule_enabled ? t(language, "schedule_paused") : bars.length ? t(language, "today") : t(language, "schedule_empty");
    return html`<div class="stack">
      <div class="today-head">
        <span class="muted">${status}</span>
        <button class="link" part="button link" @click=${() => this.open("schedule")}>${t(language, "schedule")}</button>
      </div>
      ${bars.length
        ? html`<div
            class="ribbon"
            part="today"
            role="button"
            tabindex="0"
            aria-label=${t(language, "schedule")}
            @click=${() => this.open("schedule")}
            @keydown=${(e: KeyboardEvent) => (e.key === "Enter" || e.key === " ") && this.open("schedule")}
          >
            <div class="clip">
              ${bars.map((b) => {
                const temp = temperatureOf(b.value, temps);
                const { side, share } = tone(temp);
                const title = `${b.value.startsWith("t:") ? "" : presetName(language, b.value)} ${degrees(language, temp)}`;
                return html`<div
                  class="segment ${side}"
                  part=${parts("segment", side)}
                  style="left:${(b.from / 1440) * 100}%;width:${((b.to - b.from) / 1440) * 100}%;--hz-share:${Math.round(share * 100)}%"
                  title=${title.trim()}
                ></div>`;
              })}
              <div class="past" part="past" style="width:${position}%"></div>
            </div>
            <div class="marker" part="now" style="left:${position}%"></div>
          </div>`
        : nothing}
      ${next && a.schedule_enabled
        ? html`<div class="muted" part="next">
            ${t(language, "from_time", {
              time: clock(language, next.at),
              what: `${next.preset_mode ? `${presetName(language, next.preset_mode)} ` : ""}${degrees(language, next.temperature)}`,
            })}
          </div>`
        : nothing}
    </div>`;
  }

  private renderPresets(st: HassEntity) {
    const language = lang(this.hass);
    const a = st.attributes;
    if (st.state === "off")
      return html`<div class="row">
        <button class="primary" part="button primary" @click=${() => this.climate("turn_on")}>${t(language, "turn_on")}</button>
      </div>`;
    const presets = (a.preset_modes ?? []).filter((p: string) => p !== "none") as string[];
    if (!presets.length) return nothing;
    return html`<div class="row">
      <div class="glass group" part="controls group glass">
        ${presets.map((p) => {
          const active = a.preset_mode === p;
          return html`<button
            class=${active ? "active" : ""}
            part=${parts("button", active && "active")}
            aria-pressed=${active ? "true" : "false"}
            @click=${() => this.climate("set_preset_mode", { preset_mode: p })}
          >
            ${presetName(language, p)}
          </button>`;
        })}
      </div>
    </div>`;
  }

  private renderScheduleSheet() {
    const language = lang(this.hass);
    const sw = this.sibling("switch", "schedule");
    const enabled = sw ? this.hass.states[sw]?.state === "on" : Boolean(this.st?.attributes.schedule_enabled);
    return html`<div class="sheet-head">
        <h3 class="grow" part="sheet-title">${t(language, "schedule")}</h3>
        ${sw
          ? this.switchButton(enabled, t(language, "schedule"), () =>
              this.hass.callService("switch", enabled ? "turn_off" : "turn_on", {}, { entity_id: sw }),
            )
          : nothing}
        <button class="link" part="button link" @click=${this.close}>${t(language, "done")}</button>
      </div>
      <div class="body">
      ${enabled ? nothing : html`<div class="muted" part="message">${t(language, "schedule_off")}</div>`}
      <heat-zones-schedule-editor inset exportparts=${EDITOR_PARTS} .hass=${this.hass} .entity=${this.config.entity}></heat-zones-schedule-editor>
      ${this.config.show_overrides
        ? html`<div class="stack">
            <h3 part="section-title">${t(language, "overrides")}</h3>
            <heat-zones-overrides inset exportparts=${OVERRIDES_PARTS} .hass=${this.hass} .entity=${this.config.entity}></heat-zones-overrides>
          </div>`
        : nothing}
      </div>`;
  }

  private renderSettingsSheet(st: HassEntity) {
    const language = lang(this.hass);
    const on = st.state !== "off";
    const measure = this.sibling("select", "measure_at");
    const ms = measure ? this.hass.states[measure] : undefined;
    const options = (ms?.attributes.options ?? []) as string[];
    const label = (o: string) => (o === "average" || o === "coldest" ? t(language, `measure.${o}`) : o);
    return html`<div class="sheet-head">
        <h3 class="grow" part="sheet-title">${t(language, "settings")}</h3>
        <button class="link" part="button link" @click=${this.close}>${t(language, "done")}</button>
      </div>
      <div class="body">
      <div class="inset" part="settings inset">
        <div class="setting" part="setting">
          <span class="grow">${t(language, "heating")}</span>
          ${this.switchButton(on, t(language, "heating"), () => this.climate(on ? "turn_off" : "turn_on"))}
        </div>
        ${ms && options.length > 1
          ? html`<div class="setting" part="setting">
              <span class="grow">${t(language, "measure_at")}</span>
              <select
                part="input"
                aria-label=${t(language, "measure_at")}
                @change=${(e: Event) =>
                  this.hass.callService("select", "select_option", { option: (e.target as HTMLSelectElement).value }, { entity_id: measure })}
              >
                ${options.map((o) => html`<option value=${o} ?selected=${ms.state === o}>${label(o)}</option>`)}
              </select>
            </div>`
          : nothing}
      </div>
      ${st.attributes.schedule_enabled && on
        ? html`<div class="stack">
            <h3 part="section-title">${t(language, "current")}</h3>
            <div class="muted">${t(language, "hold_help")}</div>
            <div class="row">
              ${st.attributes.source === "hold"
                ? html`<button class="glass" part="button glass" @click=${this.resume}>${t(language, "resume")}</button>`
                : nothing}
              <button class="glass" part="button glass" @click=${() => this.hold({ permanent: true })}>${t(language, "hold_permanent")}</button>
              ${this.holdOpen
                ? html`<input
                      type="datetime-local"
                      part="input"
                      aria-label=${t(language, "hold_until")}
                      .value=${this.holdUntil}
                      @change=${(e: Event) => (this.holdUntil = (e.target as HTMLInputElement).value)}
                    />
                    <button class="primary" part="button primary" @click=${() => this.hold({ until: new Date(this.holdUntil).toISOString() })}>
                      ${t(language, "hold")}
                    </button>`
                : html`<button
                    class="glass"
                    part="button glass"
                    @click=${() => {
                      this.holdUntil = localInput(new Date(Date.now() + 2 * 3600 * 1000));
                      this.holdOpen = true;
                    }}
                  >
                    ${t(language, "hold_until")}…
                  </button>`}
            </div>
          </div>`
        : nothing}
      </div>`;
  }

  render() {
    if (!this.hass || !this.config) return nothing;
    const st = this.st;
    const language = lang(this.hass);
    if (!st)
      return html`<ha-card part="card"><div class="muted" part="message">${this.config.entity}: ${t(language, "unavailable")}</div></ha-card>`;
    return html`<ha-card part="card">
      ${this.renderNow(st)}
      ${this.config.show_schedule || this.config.show_overrides ? this.renderToday(st) : nothing}
      ${this.config.show_controls ? this.renderPresets(st) : nothing}
      <dialog
        part="dialog"
        aria-label=${this.sheet ? t(language, this.sheet) : ""}
        @close=${this.closed}
        @click=${(e: Event) => e.target === e.currentTarget && this.close()}
      >
        ${this.sheet
          ? html`<div class="panel glass" part="sheet glass">
              ${this.sheet === "schedule" ? this.renderScheduleSheet() : this.renderSettingsSheet(st)}
            </div>`
          : nothing}
      </dialog>
    </ha-card>`;
  }
}

@element("heat-zones-card-editor")
export class HeatZonesCardEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private config!: CardConfig;

  setConfig(config: CardConfig): void {
    this.config = config;
  }

  private changed(e: CustomEvent): void {
    this.config = e.detail.value;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this.config }, bubbles: true, composed: true }));
  }

  render() {
    if (!this.hass || !this.config) return nothing;
    const language = lang(this.hass);
    const schema = [
      { name: "entity", required: true, selector: { entity: { domain: "climate", integration: "heat_zones" } } },
      { name: "title", selector: { text: {} } },
      { name: "show_controls", selector: { boolean: {} } },
      { name: "show_schedule", selector: { boolean: {} } },
      { name: "show_overrides", selector: { boolean: {} } },
    ];
    const labels: Record<string, string> = {
      entity: t(language, "pick_entity"),
      show_controls: t(language, "show_controls"),
      show_schedule: t(language, "show_schedule"),
      show_overrides: t(language, "show_overrides"),
    };
    return html`<ha-form
      .hass=${this.hass}
      .data=${{ show_controls: true, show_schedule: true, show_overrides: true, ...this.config }}
      .schema=${schema}
      .computeLabel=${(s: { name: string }) => labels[s.name] ?? s.name}
      @value-changed=${this.changed}
    ></ha-form>`;
  }
}

declare global {
  interface Window {
    customCards?: { type: string; name: string; description: string; preview?: boolean }[];
  }
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((c) => c.type === "heat-zones-card")) {
  window.customCards.push({
    type: "heat-zones-card",
    name: "Heat Zones",
    description: "A heat zone with its weekly schedule, holds and overrides.",
    preview: false,
  });
}
