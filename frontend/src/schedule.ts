// The weekly schedule as the editor sees it: blocks per day, back to the service format, and day bars.
import type { Block, Day, DayBlock } from "./types";

export const DAYS: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function valueOf(block: { preset_mode?: string; temperature?: number }): string {
  return block.preset_mode !== undefined ? block.preset_mode : `t:${block.temperature}`;
}

export function blockValue(value: string): { preset_mode?: string; temperature?: number } {
  return value.startsWith("t:") ? { temperature: Number(value.slice(2)) } : { preset_mode: value };
}

export function byDay(weekly: Block[]): Record<Day, DayBlock[]> {
  const result = Object.fromEntries(DAYS.map((d) => [d, [] as DayBlock[]])) as Record<Day, DayBlock[]>;
  for (const block of weekly) {
    for (const d of block.days) result[d].push({ time: block.time, value: valueOf(block) });
  }
  for (const d of DAYS) result[d].sort((a, b) => a.time.localeCompare(b.time));
  return result;
}

export function toWeekly(days: Record<Day, DayBlock[]>): Block[] {
  const groups = new Map<string, Day[]>();
  for (const d of DAYS) {
    for (const b of days[d]) {
      const key = `${b.time}|${b.value}`;
      const list = groups.get(key) ?? [];
      if (!list.includes(d)) list.push(d);
      groups.set(key, list);
    }
  }
  const blocks: Block[] = [];
  for (const [key, list] of groups) {
    const [time, value] = [key.slice(0, 5), key.slice(6)];
    blocks.push({ days: list, time, ...blockValue(value) });
  }
  blocks.sort((a, b) => DAYS.indexOf(a.days[0]) - DAYS.indexOf(b.days[0]) || a.time.localeCompare(b.time));
  return blocks;
}

export function minutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export interface Bar {
  from: number; // minutes since midnight
  to: number;
  value: string;
}

// What a day looks like: the block carried over from earlier days, then the day's own blocks.
export function dayBars(days: Record<Day, DayBlock[]>, day: Day): Bar[] {
  const index = DAYS.indexOf(day);
  let carry: string | null = null;
  for (let back = 1; back <= 7 && carry === null; back++) {
    const list = days[DAYS[(index - back + 7) % 7]];
    if (list.length) carry = list[list.length - 1].value;
  }
  const own = days[day];
  if (carry === null && !own.length) return [];
  const bars: Bar[] = [];
  let from = 0;
  let value = carry ?? own[0].value;
  for (const b of own) {
    const at = minutes(b.time);
    if (at > from) bars.push({ from, to: at, value });
    from = at;
    value = b.value;
  }
  bars.push({ from, to: 24 * 60, value });
  return bars;
}

export function temperatureOf(value: string, presets: Record<string, number>): number | null {
  if (value.startsWith("t:")) return Number(value.slice(2));
  return presets[value] ?? null;
}

// Blue for cooler, orange for warmer targets; light around 19.5–20 °C, where cool turns warm.
const STOPS: [number, number[]][] = [
  [16, [43, 108, 176]],
  [18, [79, 155, 217]],
  [19.5, [163, 200, 234]],
  [20, [244, 194, 138]],
  [21, [239, 152, 72]],
  [23, [217, 83, 30]],
];

function rgb(temperature: number): number[] {
  if (temperature <= STOPS[0][0]) return STOPS[0][1];
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i];
    const [t0, c0] = STOPS[i - 1];
    if (temperature <= t1) {
      const share = (temperature - t0) / (t1 - t0);
      return c0.map((v, j) => Math.round(v + (c1[j] - v) * share));
    }
  }
  return STOPS[STOPS.length - 1][1];
}

export function color(temperature: number | null): string {
  if (temperature === null) return "var(--disabled-color, #bdbdbd)";
  return `rgb(${rgb(temperature).join(",")})`;
}

// Dark text on light colours, white on dark ones.
export function textColor(temperature: number | null): string {
  if (temperature === null) return "#fff";
  const [r, g, b] = rgb(temperature);
  return 0.299 * r + 0.587 * g + 0.114 * b > 170 ? "#1f2937" : "#fff";
}

export function localInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
