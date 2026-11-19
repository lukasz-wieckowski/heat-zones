import { css } from "lit";

// Theming. Every look of the card and the editors comes from the Home Assistant theme, through the public
// `--heat-zones-*` variables (README → Theming). The private `--hz-*` variables below are the only place where
// defaults are chosen; the rest of the frontend names no colour, font, size, radius, shadow or spacing of its own.
// A theme (or a card embedding the editors) overrides a public variable; `::part` reaches what variables do not.
export const shared = css`
  :host {
    /* tokens:start */
    --hz-font-family: var(--heat-zones-font-family, var(--ha-font-family-body));
    --hz-font-size: var(--heat-zones-font-size, var(--ha-font-size-m));
    --hz-small-font-size: var(--heat-zones-small-font-size, var(--ha-font-size-s));
    --hz-tiny-font-size: var(--heat-zones-tiny-font-size, var(--ha-font-size-xs));
    --hz-title-font-size: var(--heat-zones-title-font-size, var(--ha-font-size-l));
    --hz-title-font-weight: var(--heat-zones-title-font-weight, var(--ha-font-weight-medium));
    --hz-temperature-font-size: var(--heat-zones-temperature-font-size, var(--ha-font-size-4xl));
    --hz-temperature-font-weight: var(--heat-zones-temperature-font-weight, var(--ha-font-weight-light));
    --hz-target-font-size: var(--heat-zones-target-font-size, var(--ha-font-size-xl));
    --hz-line-height: var(--heat-zones-line-height, var(--ha-line-height-normal));
    --hz-condensed-line-height: var(--heat-zones-condensed-line-height, var(--ha-line-height-condensed));

    --hz-padding: var(--heat-zones-card-padding, var(--ha-space-4));
    --hz-gap: var(--heat-zones-gap, var(--ha-space-2));
    --hz-small-gap: var(--heat-zones-small-gap, var(--ha-space-1));
    --hz-section-gap: var(--heat-zones-section-gap, var(--ha-space-4));
    --hz-control-height: var(--heat-zones-control-height, var(--ha-space-8));
    --hz-control-padding: var(--heat-zones-control-padding, var(--ha-space-1) var(--ha-space-3));
    --hz-input-padding: var(--heat-zones-input-padding, var(--ha-space-1) var(--ha-space-2));
    --hz-bar-height: var(--heat-zones-bar-height, var(--ha-space-6));

    --hz-border-width: var(--heat-zones-border-width, var(--ha-border-width-sm));
    --hz-focus-width: var(--heat-zones-focus-width, var(--ha-border-width-md));
    --hz-button-radius: var(--heat-zones-button-border-radius, var(--ha-border-radius-pill));
    --hz-icon-button-radius: var(--heat-zones-icon-button-border-radius, var(--ha-border-radius-md));
    --hz-input-radius: var(--heat-zones-input-border-radius, var(--ha-border-radius-md));
    --hz-bar-radius: var(--heat-zones-bar-border-radius, var(--ha-border-radius-md));
    --hz-button-shadow: var(--heat-zones-button-box-shadow, none);

    --hz-text: var(--heat-zones-text-color, var(--primary-text-color));
    --hz-muted: var(--heat-zones-secondary-text-color, var(--secondary-text-color));
    --hz-disabled: var(--heat-zones-disabled-text-color, var(--disabled-text-color));
    --hz-accent: var(--heat-zones-accent-color, var(--primary-color));
    --hz-on-accent: var(--heat-zones-on-accent-color, var(--text-primary-color));
    --hz-line: var(--heat-zones-divider-color, var(--divider-color));
    --hz-button-background: var(--heat-zones-button-background-color, var(--card-background-color));
    --hz-input-background: var(--heat-zones-input-background-color, var(--input-fill-color));
    --hz-track: var(--heat-zones-track-color, var(--secondary-background-color));

    --hz-heating: var(--heat-zones-heating-color, var(--state-climate-heat-color));
    --hz-window: var(--heat-zones-window-color, var(--state-binary_sensor-window-on-color, var(--info-color)));
    --hz-problem: var(--heat-zones-problem-color, var(--state-binary_sensor-problem-on-color, var(--error-color)));

    --hz-cold: var(--heat-zones-cold-color, var(--state-climate-cool-color));
    --hz-warm: var(--heat-zones-warm-color, var(--state-climate-heat-color));
    --hz-unknown: var(--heat-zones-unknown-color, var(--disabled-color));
    --hz-schedule-base: var(--heat-zones-schedule-base-color, var(--card-background-color));
    --hz-schedule-text: var(--heat-zones-schedule-text-color, var(--primary-text-color));
    --hz-schedule-strength: var(--heat-zones-schedule-strength, 70%);
    /* tokens:end */

    display: block;
    color: var(--hz-text);
    font-family: var(--hz-font-family);
    font-size: var(--hz-font-size);
    line-height: var(--hz-line-height);
  }
  .muted {
    color: var(--hz-muted);
    font-size: var(--hz-small-font-size);
  }
  .row {
    display: flex;
    align-items: center;
    gap: var(--hz-gap);
    flex-wrap: wrap;
  }
  .grow {
    flex: 1;
    min-width: 0;
  }
  .spaced {
    margin-top: var(--hz-gap);
  }
  button {
    font: inherit;
    border: var(--hz-border-width) solid var(--hz-line);
    background: var(--hz-button-background);
    color: inherit;
    border-radius: var(--hz-button-radius);
    box-shadow: var(--hz-button-shadow);
    padding: var(--hz-control-padding);
    cursor: pointer;
    min-height: var(--hz-control-height);
  }
  button:hover {
    border-color: var(--hz-accent);
  }
  button.primary {
    background: var(--hz-accent);
    border-color: var(--hz-accent);
    color: var(--hz-on-accent);
  }
  button.active {
    border-color: var(--hz-accent);
    color: var(--hz-accent);
    font-weight: var(--hz-title-font-weight);
  }
  button.icon {
    border-radius: var(--hz-icon-button-radius);
  }
  button:disabled {
    color: var(--hz-disabled);
    border-color: var(--hz-line);
    cursor: default;
  }
  input,
  select {
    font: inherit;
    color: inherit;
    background: var(--hz-input-background);
    border: var(--hz-border-width) solid var(--hz-line);
    border-radius: var(--hz-input-radius);
    padding: var(--hz-input-padding);
    min-height: var(--hz-control-height);
    box-sizing: border-box;
  }
  input[type="number"] {
    width: 8ch;
  }
  h3 {
    margin: 0;
    font-size: var(--hz-title-font-size);
    font-weight: var(--hz-title-font-weight);
  }
  section + section {
    margin-top: var(--hz-section-gap);
    padding-top: var(--hz-section-gap);
    border-top: var(--hz-border-width) solid var(--hz-line);
  }
`;

// `part` attribute value from part names, leaving out the ones that do not apply (e.g. `parts("button", on && "active")`).
export function parts(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}
