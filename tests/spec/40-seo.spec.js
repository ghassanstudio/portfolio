/**
 * 40-seo.spec.js — structured metadata integrity.
 *
 * Every page must declare, per requested language:
 *   - a single, non-empty, correctly-localized <title>
 *   - a non-empty, correctly-localized meta description
 *   - exactly one canonical link pointing at the production domain
 *   - a robots directive (noindex only where expected)
 *   - Open Graph title/description/url/type/locale
 *   - JSON-LD structured data on document pages
 *   - a single <h1>
 */

import { test, expect } from "@playwright/test";
import { PAGES, LANGS, PROD_HOST, BASE_PATH, NOINDEX_PAGES, isMobileProject } from "../helpers/site.mjs";
import { openPage } from "../helpers/open.mjs";
import { expectClean } from "../helpers/quality.mjs";

const HAS_ARABIC = /[\u0600-\u06FF]/;

/** Read every SEO-relevant node in one pass. */
function readSeo(page) {
  return page.evaluate(() => {
    const meta = (name) => document.head.querySelector(`meta[name="${name}"]`)?.content ?? "";
    const og = (prop) => document.head.querySelector(`meta[property="${prop}"]`)?.content ?? "";
    const link = (rel) => document.head.querySelector(`link[rel="${rel}"]`)?.href ?? "";
    const jsonLd = () => {
      const node = document.head.querySelector('script[type="application/ld+json"]');
      if (!node) return null;
      try {
        return JSON.parse(node.textContent || "null");
      } catch {
        return null;
      }
    };
    return {
      title: document.title.trim(),
      description: meta("description"),
      robots: meta("robots"),
      canonical: link("canonical"),
      ogTitle: og("og:title"),
      ogDescription: og("og:description"),
      ogUrl: og("og:url"),
      ogType: og("og:type"),
      ogLocale: og("og:locale"),
      jsonLd: jsonLd(),
      h1Count: document.querySelectorAll("h1").length,
      htmlLang: document.documentElement.lang,
      htmlDir: document.documentElement.dir,
    };
  });
}

function canonicalPathname(canonical) {
  try {
    return new URL(canonical).pathname;
  } catch {
    return null;
  }
}

for (const entry of PAGES) {
  for (const lang of LANGS) {
    test(`${entry.name} [${lang}]: SEO metadata is complete and consistent`, async ({ page }, testInfo) => {
      if (isMobileProject(testInfo.project.name) && lang !== LANGS[0]) {
        test.skip(true, "mobile runs the default language only");
      }

      const quality = await openPage(page, entry.path, { lang });
      expectClean(quality.snapshot(), `${entry.path} [${lang}] (${testInfo.project.name})`);

      const seo = await readSeo(page);
      const label = `${entry.path} [${lang}]`;

      // Title: present, single, correctly localized.
      expect(seo.title, `${label}: <title> must not be empty`).not.toBe("");
      if (lang === "ar") {
        expect(seo.title, `${label}: Arabic title should contain Arabic script`).toMatch(HAS_ARABIC);
      } else {
        expect(seo.title, `${label}: English title should not contain Arabic script`).not.toMatch(HAS_ARABIC);
      }

      // Description: present and localized.
      expect(seo.description, `${label}: meta description must not be empty`).not.toBe("");
      if (lang === "ar") {
        expect(seo.description, `${label}: Arabic description should contain Arabic script`).toMatch(HAS_ARABIC);
      } else {
        expect(seo.description, `${label}: English description should not contain Arabic script`).not.toMatch(HAS_ARABIC);
      }

      // Canonical: exactly one, on the production domain, pointing at this page.
      expect(seo.canonical, `${label}: canonical is missing`).not.toBe("");
      const host = (() => {
        try {
          return new URL(seo.canonical).host;
        } catch {
          return "";
        }
      })();
      expect(host, `${label}: canonical host must be ${PROD_HOST} (got "${host}")`).toBe(PROD_HOST);
      const canonicalPath = canonicalPathname(seo.canonical);
      const pagePath = new URL(page.url()).pathname;
      const expectedPaths =
        pagePath === "/index.html"
          ? [`${BASE_PATH}/`, `${BASE_PATH}/index.html`]
          : [`${BASE_PATH}${pagePath}`];
      expect(
        expectedPaths.includes(canonicalPath),
        `${label}: canonical path "${canonicalPath}" should match "${expectedPaths.join(" or ")}"`
      ).toBe(true);

      // Robots: noindex exactly where expected.
      expect(seo.robots, `${label}: robots meta is missing`).not.toBe("");
      const shouldNoindex = NOINDEX_PAGES.has(entry.path);
      if (shouldNoindex) {
        expect(seo.robots.toLowerCase(), `${label}: robots should be noindex`).toContain("noindex");
      } else {
        expect(seo.robots.toLowerCase(), `${label}: robots should allow indexing`).toContain("index");
      }

      // Open Graph.
      expect(seo.ogTitle, `${label}: og:title missing`).not.toBe("");
      expect(seo.ogDescription, `${label}: og:description missing`).not.toBe("");
      expect(seo.ogUrl, `${label}: og:url missing`).not.toBe("");
      expect(seo.ogType, `${label}: og:type missing`).not.toBe("");
      expect(seo.ogLocale, `${label}: og:locale missing`).not.toBe("");
      const ogHost = (() => {
        try {
          return new URL(seo.ogUrl).host;
        } catch {
          return "";
        }
      })();
      expect(ogHost, `${label}: og:url host must be ${PROD_HOST}`).toBe(PROD_HOST);

      // Document language and direction.
      expect(seo.htmlLang, `${label}: html lang must equal requested language`).toBe(lang);
      expect(seo.htmlDir, `${label}: direction must match language`).toBe(lang === "ar" ? "rtl" : "ltr");

      // Exactly one <h1>.
      expect(seo.h1Count, `${label}: exactly one h1 expected`).toBe(1);

      // JSON-LD on document pages.
      if (entry.name === "project-detail" || entry.name === "blog-post-detail") {
        expect(seo.jsonLd, `${label}: JSON-LD structured data missing`).toBeTruthy();
        expect(seo.jsonLd["@type"]).toBe("Article");
        expect(seo.jsonLd.headline, `${label}: JSON-LD headline empty`).toBeTruthy();
      }
    });
  }
}

test("project detail with an unknown id: robots noindex, no JSON-LD", async ({ page }) => {
  const quality = await openPage(page, "project.html?id=does-not-exist", { lang: "en" });
  await page.waitForTimeout(250);
  expectClean(quality.snapshot(), "project not-found meta");
  const seo = await readSeo(page);
  expect(seo.robots.toLowerCase()).toContain("noindex");
  expect(seo.jsonLd).toBeNull();
});
