/**
 * open.mjs — a single routine for loading a page under a language and theme,
 * attaching the runtime quality monitors, and waiting for the app to mount.
 *
 * Language and theme are applied through localStorage BEFORE the page's own
 * pre-paint script runs (addInitScript), exactly like a returning visitor,
 * and the language is also reflected in the URL query so currentLang()
 * resolves deterministically.
 */

import { installQualityMonitor } from "./quality.mjs";

const STORAGE = { lang: "portfolio.lang", theme: "portfolio.theme" };

/**
 * Open a site page and wait for the shared chrome (header nav) to mount.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} path  page path relative to the site root, may include "?id=…"
 * @param {{ lang?: string, theme?: string, monitor?: boolean }} [options]
 * @returns {Promise<import("./quality.mjs").QualitySnapshot | null>} the monitor snapshot handle, or null when monitor:false
 */
export async function openPage(page, path, options = {}) {
  const { lang, theme, monitor = true } = options;

  if (lang || theme) {
    await page.addInitScript(
      ({ lang, theme }) => {
        try {
          // Seed the preference once per context only. Running on every
          // navigation (including reload) would overwrite a choice the page
          // itself just persisted.
          if (sessionStorage.getItem("portfolio.seeded")) return;
          if (lang) localStorage.setItem("portfolio.lang", lang);
          if (theme) localStorage.setItem("portfolio.theme", theme);
          sessionStorage.setItem("portfolio.seeded", "1");
        } catch {
          /* storage unavailable — ignore */
        }
      },
      { lang, theme }
    );
  }

  const quality = monitor ? installQualityMonitor(page) : null;

  const sep = path.includes("?") ? "&" : "?";
  const suffix = lang ? `${sep}lang=${encodeURIComponent(lang)}` : "";
  await page.goto(`/${path}${suffix}`, { waitUntil: "domcontentloaded" });

  // Wait for the JS app to mount the shared chrome. This is the strongest
  // signal that the data layer loaded and initComponents() ran. The wait is
  // intentionally non-fatal here so that downstream assertions produce clear
  // diagnostics when a page is genuinely broken.
  await page
    .locator("#site-header .site-header__inner")
    .first()
    .waitFor({ timeout: 20_000 })
    .catch(() => {});

  // Give any deferred work (fonts, observers) a beat to settle so the
  // quality snapshot reflects the stable page state.
  await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve())).catch(() => {});
  await page.waitForTimeout(150);

  return quality;
}
