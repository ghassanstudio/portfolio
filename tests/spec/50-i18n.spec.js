/**
 * 50-i18n.spec.js — language system: default Arabic/RTL, English/LTR via the
 * ?lang= parameter, the in-page toggle, and persistence across navigation.
 */

import { test, expect } from "@playwright/test";
import { PAGES, LANGS, isMobileProject } from "../helpers/site.mjs";
import { openPage } from "../helpers/open.mjs";
import { expectClean } from "../helpers/quality.mjs";

test("default language is Arabic with RTL direction", async ({ page }) => {
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
