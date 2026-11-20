// The weekly schedule editor and the overrides list — reusable elements: the Heat Zones card uses them, and any
// other card can embed <heat-zones-schedule-editor> or <heat-zones-overrides> with `hass` and `entity`.
import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { element } from "./define";
import { clock, degrees, lang, presetName, t } from "./i18n";
import {
  DAYS,
  blockValue,
  byDay,
  dayBars,
  localInput,
  temperatureOf,
  tone,
  toWeekly,
} from "./schedule";
import { parts, shared } from "./styles";
import type { Day, DayBlock, HomeAssistant, Schedule } from "./types";

export async function fetchSchedule(hass: HomeAssistant, entity: string): Promise<Schedule | null> {
  const result = await hass.callWS<{ response: Record<string, Schedule> }>({
    type: "call_service",
    domain: "heat_zones",
    service: "get_schedule",
    target: { entity_id: entity },
    return_response: true,
  });
  return result.response?.[entity] ?? null;
}

function presets(hass: HomeAssistant, entity: string): Record<string, number> {
  return (hass.states[entity]?.attributes.preset_temperatures ?? {}) as Record<string, number>;
}

function label(language: string, value: string): string {
  if (value.startsWith("t:")) return degrees(language, Number(value.slice(2)));
  return presetName(language, value);
}

@element("heat-zones-schedule-editor")
export class HeatZonesScheduleEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property() entity = "";
  // Inside a sheet (as in the card) the day being edited is an inset panel rather than a glass sheet of its own.
  @property({ type: Boolean, reflect: true }) inset = false;
  @state() private schedule: Schedule | null = null;
  @state() private draft: Record<Day, DayBlock[]> | null = null;
  @state() private day: Day | null = null;
  @state() private copyTo: Day[] = [];
  @state() private message = "";
  private loadedFor = "";
  private stamp = "";

  static styles = [
    shared,
    css`
      .week {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: var(--hz-small-gap) var(--hz-gap);
        align-items: center;
      }
      .day {
        font-size: var(--hz-small-font-size);
        color: var(--hz-muted);
        cursor: pointer;
      }
      .day.selected {
        color: var(--hz-accent);
        font-weight: var(--hz-title-font-weight);
      }
      .bar {
        position: relative;
        height: var(--hz-bar-height);
        border-radius: var(--hz-bar-radius);
        overflow: hidden;
        background: var(--hz-track);
        cursor: pointer;
      }
      .bar.selected {
        outline: var(--hz-focus-width) solid var(--hz-accent);
      }
      .segment {
        position: absolute;
        top: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--hz-tiny-font-size);
        white-space: nowrap;
        overflow: hidden;
        color: var(--hz-schedule-text);
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
      .hours {
        display: flex;
        justify-content: space-between;
        font-size: var(--hz-tiny-font-size);
        color: var(--hz-muted);
        grid-column: 2;
      }
      .blocks {
        display: flex;
        flex-direction: column;
        gap: var(--hz-gap);
        margin-top: var(--hz-section-gap);
      }
      .block {
        display: flex;
        align-items: center;
        gap: var(--hz-small-gap);
      }
      .block select {
        flex: 1 1 auto;
        min-width: 0;
      }
      .block .muted {
        white-space: nowrap;
      }
    `,
  ];

  updated(): void {
    const st = this.hass?.states[this.entity];
    if (!st) return;
    // reload after a change of the zone, but never under the user's hands
    const stamp = st.last_updated;
    if (!this.draft && (this.loadedFor !== this.entity || stamp !== this.stamp)) {
      this.loadedFor = this.entity;
      this.stamp = stamp;
      fetchSchedule(this.hass, this.entity).then(
        (s) => (this.schedule = s),
        () => (this.schedule = null),
      );
    }
  }

  private get days(): Record<Day, DayBlock[]> {
    return this.draft ?? byDay(this.schedule?.weekly ?? []);
  }

  private edit(day: Day): void {
    if (!this.draft) this.draft = byDay(this.schedule?.weekly ?? []);
    this.day = day;
    this.copyTo = [];
    this.message = "";
  }

  private change(index: number, patch: Partial<DayBlock>): void {
    if (!this.draft || !this.day) return;
    const list = this.draft[this.day].map((b, i) => (i === index ? { ...b, ...patch } : b));
    this.draft = { ...this.draft, [this.day]: list };
  }

  private add(): void {
    if (!this.draft || !this.day) return;
    const list = this.draft[this.day];
    const last = list[list.length - 1];
    const next = last ? `${String(Math.min(23, Number(last.time.slice(0, 2)) + 2)).padStart(2, "0")}:00` : "06:00";
    this.draft = { ...this.draft, [this.day]: [...list, { time: next, value: "comfort" }] };
  }

  private removeBlock(index: number): void {
    if (!this.draft || !this.day) return;
    this.draft = { ...this.draft, [this.day]: this.draft[this.day].filter((_, i) => i !== index) };
  }

  private toggleCopy(day: Day): void {
    this.copyTo = this.copyTo.includes(day) ? this.copyTo.filter((d) => d !== day) : [...this.copyTo, day];
  }

  private cancel(): void {
    this.draft = null;
    this.day = null;
    this.copyTo = [];
  }

  private async save(): Promise<void> {
    if (!this.draft) return;
    const days = { ...this.draft };
    if (this.day) {
      const source = [...days[this.day]].sort((a, b) => a.time.localeCompare(b.time));
      days[this.day] = source;
      for (const d of this.copyTo) days[d] = source.map((b) => ({ ...b }));
    }
    try {
      await this.hass.callService("heat_zones", "set_schedule", { weekly: toWeekly(days) }, { entity_id: this.entity });
      this.message = t(lang(this.hass), "saved");
      this.draft = null;
      this.day = null;
      this.copyTo = [];
      this.stamp = "";
      this.requestUpdate();
    } catch (err) {
      this.message = `${t(lang(this.hass), "error")}: ${(err as Error).message ?? err}`;
    }
  }

  private renderBar(day: Day) {
    const language = lang(this.hass);
    const temps = presets(this.hass, this.entity);
    const bars = dayBars(this.days, day);
    const selected = this.day === day;
    return html`<div
      class="bar ${selected ? "selected" : ""}"
      part=${parts("day-bar", selected && "selected")}
      @click=${() => this.edit(day)}
    >
      ${bars.map((b) => {
        const temp = temperatureOf(b.value, temps);
        const { side, share } = tone(temp);
        const left = (b.from / 1440) * 100;
        const width = ((b.to - b.from) / 1440) * 100;
        const text = width > 9 ? label(language, b.value) : "";
        return html`<div
          class="segment ${side}"
          part=${parts("segment", side)}
          style="left:${left}%;width:${width}%;--hz-share:${Math.round(share * 100)}%"
          title="${label(language, b.value)} ${temp !== null ? degrees(language, temp) : ""}"
        >${text}</div>`;
      })}
    </div>`;
  }

  private renderDay() {
    if (!this.draft || !this.day) return nothing;
    const language = lang(this.hass);
    const temps = presets(this.hass, this.entity);
    const options = this.hass.states[this.entity]?.attributes.preset_modes?.filter((p: string) => p !== "none") ?? [];
    const day = this.day;
    return html`<div
      class="blocks ${this.inset ? "inset" : "glass sheet"}"
      part=${parts("blocks", this.inset ? "inset" : "sheet", !this.inset && "glass")}
    >
      <h3 part="sheet-title">${t(language, "edit_day")}: ${t(language, `day.${day}`)}</h3>
      ${this.draft[day].map(
        (b, i) => html`<div class="block" part="block">
          <input type="time" part="input" .value=${b.time} @change=${(e: Event) => this.change(i, { time: (e.target as HTMLInputElement).value })} />
          <select
            part="input"
            @change=${(e: Event) => {
              const v = (e.target as HTMLSelectElement).value;
              this.change(i, { value: v === "t" ? `t:${temps.comfort ?? 21}` : v });
            }}
          >
            ${options.map(
              (p: string) => html`<option value=${p} ?selected=${b.value === p}>${presetName(language, p)}</option>`,
            )}
            <option value="t" ?selected=${b.value.startsWith("t:")}>${t(language, "temperature")}</option>
          </select>
          ${b.value.startsWith("t:")
            ? html`<input
                type="number"
                part="input"
                min="5"
                max="30"
                step="0.5"
                .value=${String(blockValue(b.value).temperature)}
                @change=${(e: Event) => this.change(i, { value: `t:${(e.target as HTMLInputElement).value}` })}
              />`
            : html`<span class="muted">${degrees(language, temps[b.value])}</span>`}
          <button class="icon" part="button icon" @click=${() => this.removeBlock(i)} title=${t(language, "remove")}>✕</button>
        </div>`,
      )}
      <div class="row"><button part="button" @click=${this.add}>＋ ${t(language, "add_block")}</button></div>
      <div class="row copy">
        <span class="muted">${t(language, "copy_to")}:</span>
        ${DAYS.filter((d) => d !== day).map((d) => {
          const on = this.copyTo.includes(d);
          return html`<button class="icon ${on ? "active" : ""}" part=${parts("button", "icon", on && "active")} @click=${() => this.toggleCopy(d)}>
            ${t(language, `day.${d}`)}
          </button>`;
        })}
      </div>
      <div class="row actions">
        <button part="button" @click=${this.cancel}>${t(language, "cancel")}</button>
        <button class="primary" part="button primary" @click=${this.save}>${t(language, "save")}</button>
      </div>
    </div>`;
  }

  render() {
    if (!this.hass || !this.hass.states[this.entity]) return nothing;
    const language = lang(this.hass);
    const empty = !(this.schedule?.weekly.length ?? 0) && !this.draft;
    return html`
      <div class="week" part="week">
        ${DAYS.map(
          (d) => html`<div
              class="day ${this.day === d ? "selected" : ""}"
              part=${parts("day-label", this.day === d && "selected")}
              @click=${() => this.edit(d)}
            >
              ${t(language, `day.${d}`)}
            </div>
            ${this.renderBar(d)}`,
        )}
        <div class="hours" part="hours"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
      </div>
      ${empty ? html`<div class="muted spaced" part="message">${t(language, "no_blocks")}</div>` : nothing}
      ${this.renderDay()}
      ${this.message ? html`<div class="muted spaced" part="message">${this.message}</div>` : nothing}
    `;
  }
}

@element("heat-zones-overrides")
export class HeatZonesOverrides extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property() entity = "";
  // Inside a sheet the form is an inset panel and the buttons are not glass (no glass on glass).
  @property({ type: Boolean, reflect: true }) inset = false;
  @state() private schedule: Schedule | null = null;
  @state() private adding = false;
  @state() private from = "";
  @state() private to = "";
  @state() private value = "away";
  @state() private reason = "";
  @state() private message = "";
  private loadedFor = "";
  private stamp = "";

  static styles = [
    shared,
    css`
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: var(--hz-gap);
      }
      .form {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: var(--hz-gap);
        align-items: center;
        margin-top: var(--hz-section-gap);
      }
    `,
  ];

  updated(): void {
    const st = this.hass?.states[this.entity];
    if (!st) return;
    if (this.loadedFor !== this.entity || st.last_updated !== this.stamp) {
      this.loadedFor = this.entity;
      this.stamp = st.last_updated;
      fetchSchedule(this.hass, this.entity).then(
        (s) => (this.schedule = s),
        () => (this.schedule = null),
      );
    }
  }

  private open(): void {
    const now = new Date();
    this.from = localInput(now);
    this.to = localInput(new Date(now.getTime() + 3 * 3600 * 1000));
    this.adding = true;
    this.message = "";
  }

  private async add(): Promise<void> {
    const data: Record<string, unknown> = {
      start: new Date(this.from).toISOString(),
      end: new Date(this.to).toISOString(),
      reason: this.reason,
      source: "card",
      ...blockValue(this.value),
    };
    try {
      await this.hass.callService("heat_zones", "add_override", data, { entity_id: this.entity });
      this.adding = false;
      this.reason = "";
      this.stamp = "";
    } catch (err) {
      this.message = `${t(lang(this.hass), "error")}: ${(err as Error).message ?? err}`;
    }
  }

  private removeOverride(id: string): void {
    this.hass.callService("heat_zones", "remove_override", { override_id: id }, { entity_id: this.entity });
  }

  render() {
    if (!this.hass || !this.hass.states[this.entity]) return nothing;
    const language = lang(this.hass);
    const overrides = this.schedule?.overrides ?? [];
    const options = this.hass.states[this.entity].attributes.preset_modes?.filter((p: string) => p !== "none") ?? [];
    return html`
      ${overrides.length
        ? html`<ul part="list">
            ${overrides.map(
              (o) => html`<li class="row" part="override">
                <span class="grow">
                  <strong>${o.preset_mode ? presetName(language, o.preset_mode) : degrees(language, o.temperature)}</strong>
                  ${o.reason ? html`<div>${o.reason}</div>` : nothing}
                  <div class="muted">${clock(language, o.start, this.hass?.locale)} – ${clock(language, o.end, this.hass?.locale)}${o.source ? ` (${o.source})` : ""}</div>
                </span>
                <button
                  class="icon ${this.inset ? "" : "glass"}"
                  part=${parts("button", "icon", !this.inset && "glass")}
                  @click=${() => this.removeOverride(o.override_id)}
                  title=${t(language, "remove")}
                >
                  ✕
                </button>
              </li>`,
            )}
          </ul>`
        : html`<div class="muted" part="message">${t(language, "no_overrides")}</div>`}
      ${this.adding
        ? html`<div
            class="form ${this.inset ? "inset" : "glass sheet"}"
            part=${parts("form", this.inset ? "inset" : "sheet", !this.inset && "glass")}
          >
            <span>${t(language, "from")}</span>
            <input type="datetime-local" part="input" .value=${this.from} @change=${(e: Event) => (this.from = (e.target as HTMLInputElement).value)} />
            <span>${t(language, "to")}</span>
            <input type="datetime-local" part="input" .value=${this.to} @change=${(e: Event) => (this.to = (e.target as HTMLInputElement).value)} />
            <span>${t(language, "target")}</span>
            <div class="row">
              <select part="input" aria-label=${t(language, "target")} @change=${(e: Event) => (this.value = (e.target as HTMLSelectElement).value)}>
                ${options.map((p: string) => html`<option value=${p} ?selected=${this.value === p}>${presetName(language, p)}</option>`)}
                <option value="t:21" ?selected=${this.value.startsWith("t:")}>${t(language, "temperature")}</option>
              </select>
              ${this.value.startsWith("t:")
                ? html`<input
                    type="number"
                    part="input"
                    min="5"
                    max="30"
                    step="0.5"
                    .value=${this.value.slice(2)}
                    @change=${(e: Event) => (this.value = `t:${(e.target as HTMLInputElement).value}`)}
                  />`
                : nothing}
            </div>
            <span>${t(language, "reason")}</span>
            <input part="input" .value=${this.reason} maxlength="200" @input=${(e: Event) => (this.reason = (e.target as HTMLInputElement).value)} />
            <span></span>
            <div class="row actions">
              <button part="button" @click=${() => (this.adding = false)}>${t(language, "cancel")}</button>
              <button class="primary" part="button primary" @click=${this.add}>${t(language, "save")}</button>
            </div>
          </div>`
        : html`<div class="row spaced">
            <button class=${this.inset ? "" : "glass"} part=${parts("button", !this.inset && "glass")} @click=${this.open}>
              ＋ ${t(language, "add_override")}
            </button>
          </div>`}
      ${this.message ? html`<div class="muted spaced" part="message">${this.message}</div>` : nothing}
    `;
  }
}
