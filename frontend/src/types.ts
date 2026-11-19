export interface HassEntity {
  entity_id: string;
  state: string;
  last_updated: string;
  attributes: Record<string, any>;
}

export interface HassEntityRegistry {
  entity_id: string;
  device_id?: string | null;
  platform?: string;
  translation_key?: string | null;
}

export interface HomeAssistant {
  language: string;
  locale?: { language: string };
  states: Record<string, HassEntity>;
  entities?: Record<string, HassEntityRegistry>;
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: Record<string, unknown>,
  ): Promise<unknown>;
}

export type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Block {
  days: Day[];
  time: string;
  preset_mode?: string;
  temperature?: number;
}

export interface Override {
  override_id: string;
  start: string;
  end: string;
  preset_mode?: string;
  temperature?: number;
  reason: string;
  source: string;
}

export interface Schedule {
  enabled: boolean;
  weekly: Block[];
  overrides: Override[];
}

// One block of one day in the editor: `value` is a preset name or "t:<temperature>".
export interface DayBlock {
  time: string;
  value: string;
}
