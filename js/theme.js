/**
 * theme.js — light/dark theme state.
 * The initial theme is applied pre-paint by a tiny inline script in <head>
 * (to avoid a flash of the wrong theme); this module owns the toggle and
 * keeps the document consistent with the stored preference.
 */

import { getSettings } from "./data.js";

/** Storage key, configurable through data/settings.json. */
const storageKey = () => getSettings().theme?.storageKey ?? "portfolio.theme";

/** Resolve the effective theme: stored value, or the system preference. */
export function currentTheme() {
  let stored = null;
  try {
    stored = localStorage.getItem(storageKey());
  } catch {
    /* storage unavailable — fall through to system */
  }
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Flip between light and dark, persist the choice and notify the page. */
export function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(storageKey(), next);
  } catch {
    /* storage unavailable — session only */
  }
  document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
}

/** Re-apply the resolved theme (idempotent; also heals a missing attribute). */
export function initTheme() {
  document.documentElement.setAttribute("data-theme", currentTheme());
}
