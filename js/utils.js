/**
 * utils.js — small, dependency-free helpers shared across the site.
 * Every function here is pure or DOM-scoped; no state lives in this module.
 */

/** Query a single element. */
export const $ = (selector, root = document) => root.querySelector(selector);

/** Query all matches as a real array. */
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/** Escape a value for safe insertion into HTML text context. */
export const escapeHTML = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

/** Read a URL query parameter, or null when absent. */
export const getParam = (name) => new URLSearchParams(window.location.search).get(name);

/** Fetch and parse JSON, throwing a descriptive error on failure. */
export async function fetchJSON(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Failed to load ${url} — HTTP ${response.status}`);
  }
  return response.json();
}

/** Set or create a <meta> tag identified by an attribute pair (e.g. name, content). */
export function setMeta(attribute, key, content) {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

/** Set or create a <link> tag identified by its rel (e.g. rel="canonical"). */
export function setLink(rel, href) {
  if (!href) return;
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

/** True when the user prefers reduced motion. */
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Format an ISO date in the given locale. */
export const formatDate = (iso, locale) =>
  new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));

/** Replace a container's content with generated HTML. */
export function renderInto(container, html) {
  if (container) container.innerHTML = html;
}

/** Replace inner text of a single node. */
export function setText(node, text) {
  if (node) node.textContent = text;
}
