/**
 * 80-responsive.spec.js — responsive layout integrity.
 *
 * No page may overflow the viewport horizontally (no horizontal scroll) at
 * either desktop or mobile widths. The mobile navigation must be present on
 * small screens and hidden on large screens.
 */

import { test, expect } from "@playwright/test";
import { PAGES, isMobileProject } from "../helpers/site.mjs";
import { openPage } from "../helpers/open.mjs";
import { expectClean } from "../helpers/quality.mjs";

async function overflowWidth(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
}

for (const entry of PAGES) {
  test(`${entry.name}: no horizontal overflow`, async ({ page }, testInfo) => {
    const quality = await openPage(page, entry.path);
    expectClean(quality.snapshot(), `${entry.path} (${testInfo.project.name})`);

    const overflow = await overflowWidth(page);
    expect(
      overflow,
      `${entry.path}: page overflows viewport horizontally by ${overflow}px`
    ).toBeLessThanOrEqual(1);
  });
}

test("desktop: full navigation is visible, hamburger is hidden", async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), "desktop behavior");
  await openPage(page, "index.html");
  await expect(page.locator(".site-nav")).toBeVisible();
  const toggleVisible = await page.locator("[data-menu-toggle]").isVisible().catch(() => false);
  expect(toggleVisible, "hamburger should be hidden on desktop").toBe(false);
});

test("mobile: hamburger is the primary navigation control", async ({ page }, testInfo) => {
  test.skip(!isMobileProject(testInfo.project.name), "mobile behavior");
  const quality = await openPage(page, "index.html");
  const toggle = page.locator("[data-menu-toggle]");
  await expect(toggle).toBeVisible();
  const navVisible = await page.locator(".site-nav").isVisible().catch(() => false);
  expect(navVisible, "full navigation should be hidden on mobile").toBe(false);
  expectClean(quality.snapshot(), "mobile nav control");
});

test("wide desktop: layout still contains the viewport", async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), "wide desktop behavior");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openPage(page, "projects.html");
  const overflow = await overflowWidth(page);
  expect(overflow).toBeLessThanOrEqual(1);
});
