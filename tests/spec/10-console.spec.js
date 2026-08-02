/**
 * 10-console.spec.js — zero JavaScript console errors, zero uncaught
 * exceptions, and zero failed network requests across every page, language
 * and theme. The full matrix runs on desktop viewports; mobile viewports
 * cover every page in the default language and theme.
 */

import { test, expect } from "@playwright/test";
import { PAGES, LANGS, THEMES, isMobileProject } from "../helpers/site.mjs";
import { openPage } from "../helpers/open.mjs";
import { expectClean } from "../helpers/quality.mjs";

for (const entry of PAGES) {
  for (const lang of LANGS) {
    for (const theme of THEMES) {
      test(`${entry.name} [${lang}/${theme}]: zero console errors and zero failed requests`, async ({ page }, testInfo) => {
        // Mobile projects run the default combination only, to bound runtime.
        if (isMobileProject(testInfo.project.name) && !(lang === LANGS[0] && theme === THEMES[0])) {
          test.skip(true, "mobile runs the default language/theme only");
        }

        const quality = await openPage(page, entry.path, { lang, theme });

        // A moment for any late observers/promises to flush.
        await page.waitForTimeout(200);

        expectClean(quality.snapshot(), `${entry.path} [${lang}/${theme}] (${testInfo.project.name})`);

        // The page must not be in the fatal error state.
        await expect(page.locator(".fatal-note")).toHaveCount(0);
        await expect(page.locator("h1").first()).toBeVisible();
      });
    }
  }
}
