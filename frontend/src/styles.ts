import { css } from "lit";

// Theming. Every look of the card and the editors comes from the Home Assistant theme, through the public
// `--heat-zones-*` variables (README → Theming). The private `--hz-*` variables below are the only place where
// defaults are chosen; the rest of the frontend names no colour, font, size, radius, shadow or spacing of its own.
// A theme (or a card embedding the editors) overrides a public variable; `::part` reaches what variables do not.
// The default look follows Liquid Glass, carried over to the web: content (temperatures, the week, the list of
// overrides) stays plain; the controls float over it in a translucent glass material, grouped in shared containers
// with concentric corners; the main action is prominent (filled); editing opens in a raised glass sheet.
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
    --hz-control-height: var(--heat-zones-control-height, var(--ha-space-10));
    --hz-control-padding: var(--heat-zones-control-padding, var(--ha-space-2) var(--ha-space-4));
    --hz-input-padding: var(--heat-zones-input-padding, var(--ha-space-1) var(--ha-space-2));
    --hz-group-padding: var(--heat-zones-group-padding, var(--ha-space-1));
    --hz-sheet-padding: var(--heat-zones-sheet-padding, var(--ha-space-3));
    --hz-bar-height: var(--heat-zones-bar-height, var(--ha-space-6));
    --hz-ribbon-height: var(--heat-zones-ribbon-height, var(--ha-space-3));

    --hz-border-width: var(--heat-zones-border-width, var(--ha-border-width-sm));
    --hz-focus-width: var(--heat-zones-focus-width, var(--ha-border-width-md));
    --hz-button-radius: var(--heat-zones-button-border-radius, var(--ha-border-radius-pill));
    --hz-icon-button-radius: var(--heat-zones-icon-button-border-radius, var(--ha-border-radius-pill));
    --hz-input-radius: var(--heat-zones-input-border-radius, var(--ha-border-radius-pill));
    --hz-group-radius: var(--heat-zones-group-border-radius, calc(var(--hz-control-height) / 2 + var(--hz-group-padding)));
    --hz-sheet-radius: var(--heat-zones-sheet-border-radius, calc(var(--hz-control-height) / 2 + var(--hz-sheet-padding)));
    --hz-bar-radius: var(--heat-zones-bar-border-radius, var(--ha-border-radius-md));
    --hz-ribbon-radius: var(--heat-zones-ribbon-border-radius, var(--ha-border-radius-pill));

    --hz-text: var(--heat-zones-text-color, var(--primary-text-color));
    --hz-muted: var(--heat-zones-secondary-text-color, var(--secondary-text-color));
    --hz-disabled: var(--heat-zones-disabled-text-color, var(--disabled-text-color));
    --hz-accent: var(--heat-zones-accent-color, var(--primary-color));
    --hz-on-accent: var(--heat-zones-on-accent-color, var(--text-primary-color));
    --hz-selected: var(--heat-zones-selected-color, color-mix(in srgb, var(--heat-zones-accent-color, var(--primary-color)) 18%, transparent));
    --hz-hover: var(--heat-zones-hover-color, var(--secondary-background-color));
    --hz-line: var(--heat-zones-divider-color, var(--divider-color));
    --hz-input-background: var(--heat-zones-input-background-color, var(--input-fill-color));
    --hz-track: var(--heat-zones-track-color, var(--secondary-background-color));
    --hz-inset: var(--heat-zones-inset-color, var(--secondary-background-color));
    --hz-past: var(--heat-zones-past-color, color-mix(in srgb, var(--card-background-color) 55%, transparent));
    --hz-switch-off: var(--heat-zones-switch-off-color, var(--disabled-color));
    --hz-switch-knob: var(--heat-zones-switch-knob-color, var(--text-primary-color));

    --hz-glass-color: var(--heat-zones-glass-color, var(--card-background-color));
    --hz-glass-opacity: var(--heat-zones-glass-opacity, 70%);
    --hz-glass-blur: var(--heat-zones-glass-blur, var(--ha-space-4));
    --hz-glass-edge: var(--heat-zones-glass-border-color, var(--divider-color));
    --hz-glass-highlight: var(--heat-zones-glass-highlight-color, color-mix(in srgb, var(--heat-zones-glass-border-color, var(--divider-color)), var(--ha-color-white) 40%));
    --hz-glass-shadow: var(--heat-zones-glass-shadow, var(--ha-box-shadow-s));
    --hz-sheet-shadow: var(--heat-zones-sheet-shadow, var(--ha-box-shadow-m));
    --hz-sheet-opacity: var(--heat-zones-sheet-opacity, 92%);
    --hz-scrim-filter: var(--heat-zones-scrim-filter, var(--ha-dialog-scrim-backdrop-filter));
    --hz-sheet-duration: var(--heat-zones-sheet-duration, var(--ha-animation-duration-normal));
    --hz-duration: var(--heat-zones-transition-duration, var(--ha-animation-duration-fast));
    --hz-press-scale: var(--heat-zones-press-scale, 0.97);

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

    /* the glass material of the controls, made of the tokens above */
    --hz-glass-fill: color-mix(in srgb, var(--hz-glass-color) var(--hz-glass-opacity), transparent);
    --hz-glass-filter: blur(var(--hz-glass-blur));
    --hz-sheet-fill: color-mix(in srgb, var(--hz-glass-color) var(--hz-sheet-opacity), transparent);
    --hz-press: scale(var(--hz-press-scale));
    --hz-switch-travel: calc(var(--ha-space-12) - var(--ha-space-6) - var(--ha-border-width-md) - var(--ha-border-width-md));

    display: block;
    color: var(--hz-text);
    font-family: var(--hz-font-family);
    font-size: var(--hz-font-size);
    line-height: var(--hz-line-height);
  }
  /* Accessibility, as Liquid Glass does it: solid material without translucency, clear edges with more contrast,
     no press animation with reduced motion (HA shortens its animation durations itself). */
  @media (prefers-reduced-transparency: reduce) {
    :host {
      --hz-glass-fill: var(--hz-glass-color);
      --hz-sheet-fill: var(--hz-glass-color);
      --hz-glass-filter: none;
    }
  }
  @media (prefers-contrast: more) {
    :host {
      --hz-glass-fill: var(--hz-glass-color);
      --hz-sheet-fill: var(--hz-glass-color);
      --hz-glass-filter: none;
      --hz-glass-edge: var(--hz-text);
      --hz-glass-highlight: var(--hz-text);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :host {
      --hz-press: none;
    }
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
  .actions {
    justify-content: flex-end;
  }
  /* Glass is only for controls floating over the content: groups of buttons, single buttons, sheets. */
  .glass {
    background: var(--hz-glass-fill);
    -webkit-backdrop-filter: var(--hz-glass-filter);
    backdrop-filter: var(--hz-glass-filter);
    border: var(--hz-border-width) solid var(--hz-glass-edge);
    border-top-color: var(--hz-glass-highlight);
    box-shadow: var(--hz-glass-shadow);
  }
  /* One glass container for controls that belong together; the buttons inside are not glass themselves. */
  .group {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--hz-small-gap);
    padding: var(--hz-group-padding);
    border-radius: var(--hz-group-radius);
    box-sizing: border-box;
  }
  .sheet {
    border-radius: var(--hz-sheet-radius);
    padding: var(--hz-sheet-padding);
    box-shadow: var(--hz-sheet-shadow);
  }
  button {
    font: inherit;
    color: inherit;
    background: transparent;
    border: var(--hz-border-width) solid transparent;
    border-radius: var(--hz-button-radius);
    padding: var(--hz-control-padding);
    min-height: var(--hz-control-height);
    cursor: pointer;
    transition:
      transform var(--hz-duration),
      background-color var(--hz-duration);
  }
  button:hover {
    background: var(--hz-hover);
  }
  button:active {
    transform: var(--hz-press);
  }
  button.active {
    background: var(--hz-selected);
    color: var(--hz-accent);
    font-weight: var(--hz-title-font-weight);
  }
  button.primary {
    background: var(--hz-accent);
    border-color: var(--hz-accent);
    color: var(--hz-on-accent);
    box-shadow: var(--hz-glass-shadow);
  }
  button.icon {
    border-radius: var(--hz-icon-button-radius);
    min-width: var(--hz-control-height);
    padding: 0;
  }
  /* A text button: opens a sheet, closes it, or undoes something small. */
  button.link {
    color: var(--hz-accent);
    font-weight: var(--hz-title-font-weight);
    padding: var(--hz-input-padding);
  }
  /* Inside a sheet: an inset panel instead of glass on glass. */
  .inset {
    background: var(--hz-inset);
    border-radius: var(--hz-group-radius);
    padding: var(--hz-sheet-padding);
  }
  button.switch,
  button.switch:hover {
    position: relative;
    flex: none;
    width: var(--ha-space-12);
    height: var(--ha-space-7);
    min-height: 0;
    padding: 0;
    border: 0;
    border-radius: var(--ha-border-radius-pill);
    background: var(--hz-switch-off);
  }
  button.switch::after {
    content: "";
    position: absolute;
    top: var(--ha-border-width-md);
    left: var(--ha-border-width-md);
    width: var(--ha-space-6);
    height: var(--ha-space-6);
    border-radius: var(--ha-border-radius-pill);
    background: var(--hz-switch-knob);
    box-shadow: var(--hz-glass-shadow);
    transition: transform var(--hz-duration);
  }
  button.switch[aria-checked="true"],
  button.switch[aria-checked="true"]:hover {
    background: var(--hz-accent);
  }
  button.switch[aria-checked="true"]::after {
    transform: translateX(var(--hz-switch-travel));
  }
  button:focus-visible {
    outline: var(--hz-focus-width) solid var(--hz-accent);
    outline-offset: var(--hz-border-width);
  }
  button:disabled {
    color: var(--hz-disabled);
    background: transparent;
    cursor: default;
    transform: none;
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
