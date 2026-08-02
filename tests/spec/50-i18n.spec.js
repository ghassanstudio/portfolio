/**
 * 50-i18n.spec.js — language system: default Arabic/RTL, English/LTR via the
 * ?lang= parameter, the in-page toggle, and persistence across navigation.
 */

import { test, expect } from "@playwright/test";
import { PAGES, LANGS, isMobileProject } from "../helpers/site.mjs";
import { openPage } from "../helpers/open.mjs";
import { expectClean } from "../helpers/quality.mjs";

// A brand-new visitor's language is detected from the browser locale
// (js/i18n.js browserLang()): Arabic browsers get Arabic, everyone else
// English. These tests run under an Arabic locale so the site's Arabic
// default is exercised deterministically; the browser-language detection
// itself is covered by the "first-visit detection" describe block below.
test.use({ locale: "ar-IQ" });

test("Arabic-locale first visit: default language is Arabic with RTL direction", async ({ page }) => {
  const quality = await openPage(page, "index.html");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator(".site-nav a", { hasText: "المشاريع" })).toHaveCount(1);
  expectClean(quality.snapshot(), "index.html default ar");
});

test("?lang=en switches to English and LTR", async ({ page }) => {
  const quality = await openPage(page, "index.html", { lang: "en" });
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator(".site-nav a", { hasText: "Projects" })).toHaveCount(1);
  await expect(page.locator("h1").first()).toContainText(/Digital products/i);
  expectClean(quality.snapshot(), "index.html?lang=en");
});

test("?lang=ar forces Arabic and RTL", async ({ page }) => {
  const quality = await openPage(page, "index.html", { lang: "ar" });
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("h1").first()).toContainText(/هندسة/i);
  expectClean(quality.snapshot(), "index.html?lang=ar");
});

test.describe("first-visit browser-language detection", () => {
  test.use({ locale: "en-US" });

  test("English-locale first visit resolves to English and LTR", async ({ page }) => {
    const quality = await openPage(page, "index.html");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator(".site-nav a", { hasText: "Projects" })).toHaveCount(1);
    await expect(page.locator("h1").first()).toContainText(/Digital products/i);
    expectClean(quality.snapshot(), "index.html first-visit en");
  });
});

test.describe("first-visit browser-language detection", () => {
  test.use({ locale: "fr-FR" });

  test("French-locale first visit falls back to English, not Arabic", async ({ page }) => {
    const quality = await openPage(page, "index.html");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    expectClean(quality.snapshot(), "index.html first-visit fr");
  });
});

test("the in-page toggle flips language, direction, and persists", async ({ page }) => {
  const quality = await openPage(page, "index.html");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");

  const toggle = page.locator("[data-lang-toggle]");
  await expect(toggle).toHaveText("English"); // shown in the other language
  await toggle.click();

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator(".site-nav a", { hasText: "Projects" })).toHaveCount(1);

  const stored = await page.evaluate(() => localStorage.getItem("portfolio-v.lang"));
  expect(stored).toBe("en");

  // Reloading keeps the English language.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("#site-header .site-header__inner").waitFor();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expectClean(quality.snapshot(), "lang toggle");
});

test("language persists across navigation via ?lang= links", async ({ page }) => {
  const quality = await openPage(page, "index.html", { lang: "en" });
  const aboutLink = page.locator(".site-footer a[href*='about.html']");
  await expect(aboutLink).toBeVisible();
  await aboutLink.click();

  await page.locator("#site-header .site-header__inner").waitFor();
  expect(new URL(page.url()).searchParams.get("lang")).toBe("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("#page-title").first()).toContainText(/About/i);
  expectClean(quality.snapshot(), "cross-page language");
});

for (const entry of PAGES) {
  for (const lang of LANGS) {
    test(`${entry.name} [${lang}]: language and direction applied, no fatal`, async ({ page }, testInfo) => {
      if (isMobileProject(testInfo.project.name) && lang !== LANGS[0]) {
        test.skip(true, "mobile runs the default language only");
      }
      const quality = await openPage(page, entry.path, { lang });
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.locator("html")).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr");
      await expect(page.locator("h1").first()).toBeVisible();
      expectClean(quality.snapshot(), `${entry.path} [${lang}]`);
    });
  }
}
