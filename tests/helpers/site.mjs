/**
 * site.mjs — a single source of truth for the QA matrix.
 *
 * Every page, language, theme and viewport the suite cares about is declared
 * here. The spec files iterate over these arrays, so adding a page to the
 * site means adding one entry here and every test picks it up automatically.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** The two supported languages. Arabic is RTL, English is LTR. */
export const LANGS = ["ar", "en"];

/** The two supported color themes. */
export const THEMES = ["light", "dark"];

/** The two viewports, driven by the Playwright project matrix. */
export const VIEWPORTS = { desktop: { width: 1280, height: 800 }, mobile: { width: 390, height: 844 } };

/**
 * Every page served by the site. `path` is relative to the site root and may
 * include a query string (e.g. project detail). `name` is used in test
 * titles and screenshot file names.
 */
export const PAGES = [
  { path: "index.html", name: "home" },
  { path: "projects.html", name: "projects" },
  { path: "project.html?id=calc-voice", name: "project-detail" },
  { path: "about.html", name: "about" },
  { path: "blog.html", name: "blog" },
  { path: "contact.html", name: "contact" },
  { path: "faq.html", name: "faq" },
  { path: "privacy.html", name: "privacy" },
  { path: "terms.html", name: "terms" },
  { path: "404.html", name: "not-found" },
  { path: "offline.html", name: "offline" },
];

/** Pages that are expected to carry a `noindex` robots directive. */
export const NOINDEX_PAGES = new Set(["404.html"]);

/** The production domain used in canonical/OG URLs (data/settings.json `url`). */
export const PROD_HOST = "ghassanabdulkhaliq92-commits.github.io";

/** Read and parse a JSON data file from disk (test-side copy of the data). */
export async function readData(name) {
  const raw = await readFile(join(process.cwd(), "data", `${name}.json`), "utf8");
  return JSON.parse(raw);
}

/** Resolve a page path to an absolute URL on the test server. */
export function pageUrl(page) {
  const base = process.env.BASE_URL || "http://127.0.0.1:4173";
  return `${base}/${page.path}`;
}

/** Stable file name for screenshots, e.g. `ar__light__home__desktop.png`. */
export function shotName(lang, theme, page, viewport) {
  return `${lang}__${theme}__${page.name}__${viewport}.png`;
}

/** True when the current test belongs to a mobile viewport project. */
export function isMobileProject(projectName) {
  return String(projectName).includes("mobile");
}
