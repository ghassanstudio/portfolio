/**
 * 90-screenshots.spec.js — visual documentation.
 *
 * Captures a screenshot of every page in every language and theme on the
 * desktop Chromium project, and every page at mobile width. Images are saved
 * to test-results/screenshots/ and exported as CI artifacts.
 */

import { test, expect } from "@playwright/test";
import { mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { PAGES, LANGS, THEMES, isMobileProject, shotName } from "../helpers/site.mjs";
import { openPage } from "../helpers/open.mjs";

const OUT = join(process.cwd(), "test-results", "screenshots");

/** Only the Chromium projects record screenshots (one engine is enough). */
const onlyChromium = (projectName) =>
  !["chromium-desktop", "chromium-mobile"].includes(String(projectName));

for (const entry of PAGES) {
  test(`desktop: screenshot ${entry.name}`, async ({ page }, testInfo) => {
    test.skip(onlyChromium(testInfo.project.name) || isMobileProject(testInfo.project.name), "desktop Chromium only");
    for (const lang of LANGS) {
      for (const theme of THEMES) {
        await openPage(page, entry.path, { lang, theme, monitor: false });
        mkdirSync(OUT, { recursive: true });
        const file = join(OUT, shotName(lang, theme, entry, "desktop"));
        await page.screenshot({ path: file, fullPage: true });
        expect(statSync(file).size, `${file} should not be empty`).toBeGreaterThan(0);
      }
    }
  });

  test(`mobile: screenshot ${entry.name}`, async ({ page }, testInfo) => {
    test.skip(onlyChromium(testInfo.project.name) || !isMobileProject(testInfo.project.name), "mobile Chromium only");
    await openPage(page, entry.path, { monitor: false });
    mkdirSync(OUT, { recursive: true });
    const file = join(OUT, shotName(LANGS[0], THEMES[0], entry, "mobile"));
    await page.screenshot({ path: file, fullPage: true });
    expect(statSync(file).size, `${file} should not be empty`).toBeGreaterThan(0);
  });
}
