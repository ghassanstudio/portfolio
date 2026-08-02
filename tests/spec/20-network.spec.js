/**
 * 20-network.spec.js — every resource the site actually requests must return
 * a 2xx response. This includes stylesheets, scripts, JSON data files,
 * images and fonts (same-origin). It runs for every page in both languages.
 */

import { test, expect } from "@playwright/test";
import { PAGES, LANGS, isMobileProject } from "../helpers/site.mjs";
import { openPage } from "../helpers/open.mjs";
import { expectClean } from "../helpers/quality.mjs";

for (const entry of PAGES) {
  for (const lang of LANGS) {
    test(`${entry.name} [${lang}]: all requested resources return 2xx`, async ({ page }, testInfo) => {
      if (isMobileProject(testInfo.project.name) && lang !== LANGS[0]) {
        test.skip(true, "mobile runs the default language only");
      }

      const quality = await openPage(page, entry.path, { lang });

      // 1) Any failed or non-2xx same-origin request during load.
      expectClean(quality.snapshot(), `${entry.path} [${lang}] (${testInfo.project.name})`);

      // 2) Explicitly verify every same-origin static reference resolves.
      const references = await page.evaluate(() => {
        const urls = new Set();
        const collect = (nodes) =>
          nodes.forEach((node) => {
            const href = node.getAttribute("href");
            const src = node.getAttribute("src");
            if (href) urls.add(href);
            if (src) urls.add(src);
          });
        collect(document.querySelectorAll('link[href], a[href], script[src], img[src]'));
        return Array.from(urls);
      });

      const origin = page.url().split("/").slice(0, 3).join("/");
      for (const ref of references) {
        if (ref.startsWith("#") || /^(mailto|tel|javascript|data):/.test(ref)) continue;
        const absolute = new URL(ref, page.url()).toString();
        if (!absolute.startsWith(origin)) continue; // external links checked elsewhere
        const response = await page.request.get(absolute);
        expect(
          response.status(),
          `expected ${absolute} to resolve (got HTTP ${response.status()})`
        ).toBeLessThan(400);
      }
    });
  }
}
