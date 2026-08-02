/**
 * 30-links.spec.js — navigation integrity.
 *
 * 1. Every same-origin link found in the rendered DOM must resolve to a
 *    non-error page (no broken internal links, no dead anchors).
 * 2. Every external link that opens in a new tab must carry
 *    rel="noopener noreferrer".
 */

import { test, expect } from "@playwright/test";
import { PAGES, LANGS, isMobileProject } from "../helpers/site.mjs";
import { openPage } from "../helpers/open.mjs";
import { expectClean } from "../helpers/quality.mjs";

/** Extract all anchor references and their attributes from the rendered DOM. */
function collectAnchors(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("a")).map((a) => ({
      href: a.getAttribute("href") || "",
      rel: a.getAttribute("rel") || "",
      target: a.getAttribute("target") || "",
      text: (a.textContent || "").trim(),
      ariaLabel: a.getAttribute("aria-label") || "",
    }))
  );
}

for (const entry of PAGES) {
  for (const lang of LANGS) {
    test(`${entry.name} [${lang}]: internal links resolve, external links are safe`, async ({ page }, testInfo) => {
      if (isMobileProject(testInfo.project.name) && lang !== LANGS[0]) {
        test.skip(true, "mobile runs the default language only");
      }

      const quality = await openPage(page, entry.path, { lang });
      expectClean(quality.snapshot(), `${entry.path} [${lang}] (${testInfo.project.name})`);

      const anchors = await collectAnchors(page);
      expect(anchors.length, "expected at least one link on the page").toBeGreaterThan(0);

      const origin = new URL(page.url()).origin;
      const broken = [];
      const unsafeExternal = [];

      for (const anchor of anchors) {
        const href = anchor.href;
        if (!href || /^(mailto|tel|javascript|data):/.test(href)) continue;

        const target = new URL(href, page.url());

        // Internal links must resolve to a real document.
        if (target.origin === origin) {
          if (href.startsWith("#")) {
            // Fragment link: the target id must exist in the DOM.
            const exists = await page.locator(`[id="${href.slice(1)}"]`).count();
            if (exists === 0) broken.push(`${href} (dead anchor)`);
          } else {
            const response = await page.request.get(target.toString());
            if (response.status() >= 400) {
              broken.push(`${target.pathname} → HTTP ${response.status()}`);
            }
          }
        }

        // External links opening a new tab must be safely sandboxed.
        if (target.origin !== origin && anchor.target === "_blank") {
          const rel = (anchor.rel || "").split(/\s+/);
          if (!rel.includes("noopener")) unsafeExternal.push(`${href} (missing noopener)`);
          if (!rel.includes("noreferrer")) unsafeExternal.push(`${href} (missing noreferrer)`);
        }
      }

      expect(broken, `broken internal links on ${entry.path}:\n${broken.join("\n")}`).toEqual([]);
      expect(
        unsafeExternal,
        `external links without rel="noopener noreferrer" on ${entry.path}:\n${unsafeExternal.join("\n")}`
      ).toEqual([]);
    });
  }
}
