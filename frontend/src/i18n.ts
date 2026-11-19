// Card texts. Reasons and plan titles arrive already translated by the integration.
const TEXTS: Record<string, Record<string, string>> = {
  en: {
    schedule: "Schedule",
    schedule_off: "Schedule off — the zone keeps manual settings.",
    no_blocks: "No schedule yet. Choose a day and add blocks.",
    edit_day: "Edit",
    add_block: "Add block",
    copy_to: "Copy to",
    save: "Save",
    cancel: "Cancel",
    saved: "Saved",
    error: "Not saved",
    temperature: "Temperature",
    remove: "Remove",
    overrides: "Overrides",
    no_overrides: "No overrides.",
    add_override: "Add override",
    from: "From",
    to: "Until",
    reason: "Reason",
    next: "Next",
    resume: "Resume schedule",
    hold_until: "Hold until",
    hold_permanent: "Hold permanently",
    hold: "Hold",
    on: "On",
    off: "Off",
    unavailable: "Unavailable",
    "preset.none": "Manual",
    "preset.comfort": "Comfort",
    "preset.eco": "Eco",
    "preset.sleep": "Sleep",
    "preset.away": "Away",
    "day.mon": "Mon",
    "day.tue": "Tue",
    "day.wed": "Wed",
    "day.thu": "Thu",
    "day.fri": "Fri",
    "day.sat": "Sat",
    "day.sun": "Sun",
    pick_entity: "Choose a Heat Zones thermostat",
    show_controls: "Show controls",
    show_schedule: "Show schedule",
    show_overrides: "Show overrides",
  },
  pl: {
    schedule: "Harmonogram",
    schedule_off: "Harmonogram wyłączony — strefa trzyma ręczne ustawienia.",
    no_blocks: "Brak harmonogramu. Wybierz dzień i dodaj bloki.",
    edit_day: "Edytuj",
    add_block: "Dodaj blok",
    copy_to: "Kopiuj do",
    save: "Zapisz",
    cancel: "Anuluj",
    saved: "Zapisano",
    error: "Nie zapisano",
    temperature: "Temperatura",
    remove: "Usuń",
    overrides: "Nadpisania",
    no_overrides: "Brak nadpisań.",
    add_override: "Dodaj nadpisanie",
    from: "Od",
    to: "Do",
    reason: "Powód",
    next: "Następnie",
    resume: "Wróć do harmonogramu",
    hold_until: "Trzymaj do",
    hold_permanent: "Trzymaj na stałe",
    hold: "Trzymaj",
    on: "Wł.",
    off: "Wył.",
    unavailable: "Niedostępne",
    "preset.none": "Ręcznie",
    "preset.comfort": "Komfort",
    "preset.eco": "Eko",
    "preset.sleep": "Sen",
    "preset.away": "Poza domem",
    "day.mon": "Pn",
    "day.tue": "Wt",
    "day.wed": "Śr",
    "day.thu": "Cz",
    "day.fri": "Pt",
    "day.sat": "So",
    "day.sun": "Nd",
    pick_entity: "Wybierz termostat Stref ciepła",
    show_controls: "Pokaż sterowanie",
    show_schedule: "Pokaż harmonogram",
    show_overrides: "Pokaż nadpisania",
  },
};

export function lang(hass: { language?: string; locale?: { language: string } } | undefined): string {
  const l = (hass?.locale?.language ?? hass?.language ?? "en").split("-")[0];
  return l in TEXTS ? l : "en";
}

export function t(language: string, key: string): string {
  return TEXTS[language]?.[key] ?? TEXTS.en[key] ?? key;
}

export function presetName(language: string, preset: string): string {
  const key = `preset.${preset}`;
  return TEXTS[language]?.[key] ?? TEXTS.en[key] ?? preset;
}

export function degrees(language: string, value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toLocaleString(language, { maximumFractionDigits: 1 })} °C`;
}

export function clock(language: string, iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return time;
  return `${d.toLocaleDateString(language, { weekday: "short", day: "numeric", month: "numeric" })} ${time}`;
}
