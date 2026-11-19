import { css } from "lit";

export const shared = css`
  :host {
    display: block;
    --hz-gap: 12px;
    --hz-radius: 10px;
    --hz-muted: var(--secondary-text-color, #727272);
    --hz-line: var(--divider-color, rgba(127, 127, 127, 0.25));
    --hz-accent: var(--primary-color, #03a9f4);
    color: var(--primary-text-color);
  }
  .muted {
    color: var(--hz-muted);
    font-size: 0.9em;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .grow {
    flex: 1;
    min-width: 0;
  }
  button {
    font: inherit;
    border: 1px solid var(--hz-line);
    background: var(--card-background-color, transparent);
    color: inherit;
    border-radius: 999px;
    padding: 6px 12px;
    cursor: pointer;
    min-height: 32px;
  }
  button:hover {
    border-color: var(--hz-accent);
  }
  button.primary {
    background: var(--hz-accent);
    border-color: var(--hz-accent);
    color: var(--text-primary-color, #fff);
  }
  button.active {
    border-color: var(--hz-accent);
    color: var(--hz-accent);
    font-weight: 600;
  }
  button.icon {
    padding: 4px 10px;
    border-radius: 8px;
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  input,
  select {
    font: inherit;
    color: inherit;
    background: var(--secondary-background-color, transparent);
    border: 1px solid var(--hz-line);
    border-radius: 8px;
    padding: 6px 8px;
    min-height: 32px;
    box-sizing: border-box;
  }
  input[type="number"] {
    width: 5.5em;
  }
  h3 {
    margin: 0;
    font-size: 1em;
    font-weight: 600;
  }
  section + section {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--hz-line);
  }
`;
