// The Heat Zones card: the zone now (temperature, target, why, what's next), presets and holds, the weekly schedule
// editor and overrides. Config: `entity` (a Heat Zones climate entity), optional `show_controls`, `show_schedule`,
// `show_overrides`.
import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { element } from "./define";
import "./editor";
import { clock, degrees, lang, presetName, t } from "./i18n";
import { localInput } from "./schedule";
import { parts, shared } from "./styles";
import type { HassEntity, HomeAssistant, Signal } from "./types";

interface CardConfig {
  type: string;
  entity: string;
  title?: string;
  show_controls?: boolean;
  show_schedule?: boolean;
  show_overrides?: boolean;
}

function isZone(st: HassEntity | undefined): boolean {
  return st?.attributes?.homeai_schedule?.domain === "heat_zones";
}

// Parts of the embedded editors, passed on so that `heat-zones-card::part(segment)` reaches into them as well.
export const EDITOR_PARTS =
  "week, day-label, day-bar, segment, hours, blocks, sheet, sheet-title, block, input, button, message, selected, cold, warm, unknown, active, primary, icon, glass";
export const OVERRIDES_PARTS = "list, override, form, sheet, input, button, message, primary, icon, glass";

@element("heat-zones-card")
export class HeatZonesCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private config!: CardConfig;
  @state() private holdOpen = false;
  @state() private holdUntil = "";

  static styles = [
    shared,
    css`
      ha-card {
        padding: var(--hz-padding);
      }
      .head {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: var(--hz-gap);
      }
      .head > .grow {
        flex: 1 1 20ch;
        min-width: auto;
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
      .chips {
        margin-top: var(--hz-gap);
      }
      .why {
        margin-top: var(--hz-small-gap);
      }
      .why.window {
        color: var(--hz-window);
      }
      .problem {
        color: var(--hz-problem);
        font-size: var(--hz-small-font-size);
      }
      .section-head,
      .note {
        margin-bottom: var(--hz-gap);
      }
    `,
  ];

  setConfig(config: CardConfig): void {
    if (!config.entity) throw new Error("entity is required");
    this.config = { show_controls: true, show_schedule: true, show_overrides: true, ...config };
  }

  getCardSize(): number {
    return 8;
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

  private scheduleSwitch(): string | undefined {
    const reg = this.hass.entities?.[this.config.entity];
    if (reg?.device_id) {
      const found = Object.values(this.hass.entities ?? {}).find(
        (e) => e.device_id === reg.device_id && e.platform === "heat_zones" && e.translation_key === "schedule",
      );
      if (found) return found.entity_id;
    }
    const guess = `switch.${this.config.entity.split(".")[1]}_schedule`;
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

  private renderHead(st: HassEntity) {
    const language = lang(this.hass);
    const a = st.attributes;
    const next = a.next_change as { at: string; temperature: number; preset_mode: string | null } | null;
    const heating = a.hvac_action === "heating";
    const paused = Boolean(a.window_pause);
    const admin = this.hass.user?.is_admin ?? true;
    const signals = ((a.homeai_signals ?? []) as Signal[]).filter((s) => admin || s.need !== "admin");
    return html`<div class="head" part="header">
        <div class="grow">
          <h3 part="title">${this.config.title ?? a.friendly_name}</h3>
          <div class="now ${heating ? "heating" : ""}" part=${parts("temperature", heating && "heating")}>
            ${degrees(language, a.current_temperature)}
          </div>
          <div class="why muted ${paused ? "window" : ""}" part=${parts("reason", paused && "window")}>${a.reason ?? ""}</div>
          ${signals.map((s) => html`<div class="problem" part="problem">${s.title}</div>`)}
          ${next
            ? html`<div class="muted" part="next">
                ${t(language, "next")}: ${clock(language, next.at)} →
                ${next.preset_mode ? presetName(language, next.preset_mode) : ""} ${degrees(language, next.temperature)}
              </div>`
            : nothing}
        </div>
        ${this.config.show_controls
          ? html`<div class="target glass group" part="target group glass">
              <button class="icon" part="button icon" @click=${() => this.step(-0.5)} ?disabled=${st.state === "off"}>−</button>
              <strong part="target-value">${st.state === "off" ? t(language, "off") : degrees(language, a.temperature)}</strong>
              <button class="icon" part="button icon" @click=${() => this.step(0.5)} ?disabled=${st.state === "off"}>＋</button>
            </div>`
          : nothing}
      </div>
      ${this.config.show_controls ? this.renderControls(st) : nothing}`;
  }

  private renderControls(st: HassEntity) {
    const language = lang(this.hass);
    const a = st.attributes;
    const presets = (a.preset_modes ?? []).filter((p: string) => p !== "none") as string[];
    const held = a.source === "hold";
    const scheduled = a.schedule_enabled;
    const on = st.state !== "off";
    return html`<div class="row chips">
      <div class="glass group" part="controls group glass">
        <button class=${on ? "active" : ""} part=${parts("button", on && "active")} @click=${() => this.climate(on ? "turn_off" : "turn_on")}>
          ${on ? t(language, "on") : t(language, "off")}
        </button>
        ${presets.map((p) => {
          const active = a.preset_mode === p;
          return html`<button
            class=${active ? "active" : ""}
            part=${parts("button", active && "active")}
            @click=${() => this.climate("set_preset_mode", { preset_mode: p })}
          >
            ${presetName(language, p)}
          </button>`;
        })}
      </div>
      ${scheduled
        ? html`<div class="glass group" part="controls group glass">
            ${held
              ? html`<button part="button" @click=${() => this.hass.callService("heat_zones", "resume", {}, { entity_id: this.config.entity })}>
                  ${t(language, "resume")}
                </button>`
              : nothing}
            <button part="button" @click=${() => this.hold({ permanent: true })}>${t(language, "hold_permanent")}</button>
            ${this.holdOpen
              ? html`<input
                    type="datetime-local"
                    part="input"
                    .value=${this.holdUntil}
                    @change=${(e: Event) => (this.holdUntil = (e.target as HTMLInputElement).value)}
                  />
                  <button class="primary" part="button primary" @click=${() => this.hold({ until: new Date(this.holdUntil).toISOString() })}>
                    ${t(language, "hold")}
                  </button>`
              : html`<button
                  part="button"
                  @click=${() => {
                    this.holdUntil = localInput(new Date(Date.now() + 2 * 3600 * 1000));
                    this.holdOpen = true;
                  }}
                >
                  ${t(language, "hold_until")}…
                </button>`}
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
    const sw = this.scheduleSwitch();
    const enabled = sw ? this.hass.states[sw]?.state === "on" : st.attributes.schedule_enabled;
    return html`<ha-card part="card">
      <section part="section">${this.renderHead(st)}</section>
      ${this.config.show_schedule
        ? html`<section part="section">
            <div class="row section-head">
              <h3 class="grow" part="section-title">${t(language, "schedule")}</h3>
              ${sw
                ? html`<button
                    class="glass ${enabled ? "active" : ""}"
                    part=${parts("button", "glass", enabled && "active")}
                    @click=${() => this.hass.callService("switch", enabled ? "turn_off" : "turn_on", {}, { entity_id: sw })}
                  >
                    ${enabled ? t(language, "on") : t(language, "off")}
                  </button>`
                : nothing}
            </div>
            ${enabled ? nothing : html`<div class="muted note" part="message">${t(language, "schedule_off")}</div>`}
            <heat-zones-schedule-editor
              exportparts=${EDITOR_PARTS}
              .hass=${this.hass}
              .entity=${this.config.entity}
            ></heat-zones-schedule-editor>
          </section>`
        : nothing}
      ${this.config.show_overrides
        ? html`<section part="section">
            <h3 class="section-head" part="section-title">${t(language, "overrides")}</h3>
            <heat-zones-overrides exportparts=${OVERRIDES_PARTS} .hass=${this.hass} .entity=${this.config.entity}></heat-zones-overrides>
          </section>`
        : nothing}
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
