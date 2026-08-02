/**
 * i18n.js — language state and lookups.
 * The language is resolved from, in order: ?lang= URL parameter,
 * localStorage, then the site default. Changing it updates <html lang>,
 * sets the correct text direction and notifies listeners.
 *
 * UI chrome strings come from data/i18n.json via `t(key)`.
 * Page content is read directly from its own data file with the
 * language as the key (e.g. project.title[lang]).
 */

import { get, getSettings } from "./data.js";
import { getParam } from "./utils.js";

/** Language -> text direction. Arabic is the only RTL language today. */
const DIRECTIONS = { ar: "rtl", en: "ltr" };

/** True when the given language exists in data/i18n.json. */
function isValid(lang) {
  const i18n = get("i18n");
  return Boolean(i18n && typeof i18n[lang] === "object");
}

function storedLang() {
  const key = getSettings().langStorageKey;
  if (!key) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Resolve the effective language without side effects. */
export function currentLang() {
  const candidates = [
    getParam("lang"),
    storedLang(),
    getSettings().defaultLang,
    "ar",
  ];
  return candidates.find(isValid) ?? "ar";
}

/** Apply a language to the document: <html lang> and direction. */
function applyLang(lang) {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = DIRECTIONS[lang] ?? "ltr";
}

/** Set the language, persist it, and notify the page. */
export function setLang(lang) {
  if (!isValid(lang) || lang === currentLang()) return;
  const key = getSettings().langStorageKey;
  if (key) {
    try {
      localStorage.setItem(key, lang);
    } catch {
      /* private mode — ignore */
    }
  }
  applyLang(lang);
  document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
}

/** Translate a dot-separated key from data/i18n.json. Falls back to Arabic, then the key itself. */
export function t(key, lang = currentLang()) {
  const i18n = get("i18n") ?? {};
  const table = i18n[lang] ?? i18n.ar ?? {};
  const value = key
    .split(".")
    .reduce((node, part) => (node == null ? node : node[part]), table);
  return value ?? key;
}

/** Text direction for a language. */
export const dirOf = (lang) => DIRECTIONS[lang] ?? "ltr";

/**
 * Append the current language to internal links when it differs from the
 * site default, so navigation keeps the visitor's language across pages.
 */
export function localizedHref(href) {
  if (!href || href.startsWith("#")) return href;
  const defaultLang = getSettings().defaultLang ?? "ar";
  const lang = currentLang();
  if (lang === defaultLang) return href;
  return href.includes("?") ? `${href}&lang=${lang}` : `${href}?lang=${lang}`;
}

/** Initialize the document language on page load. */
export function initLang() {
  applyLang(currentLang());
}
