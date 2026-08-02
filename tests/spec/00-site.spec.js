/**
 * 00-site.spec.js — smoke test: every page loads, mounts the shared chrome,
 * renders its primary content and a single <h1>, and never shows the fatal
 * error screen. Runs on every browser and viewport project.
 */

import { test, expect } from "@playwright/test";
import { PAGES, isMobileProject } from "../helpers/site.mjs";
import { openPage } from "../helpers/open.mjs";
import { expectClean } from "../helpers/quality.mjs";

/** Page-specific content markers: a selector that must be visible once mounted. */
const CONTENT_MARKER = {
  home: "#hero .hero__content h1",
  projects: "#project-list-rows .project-row",
  "project-detail": "#case-study h1",
  about: "#main h1",
  blog: "#main h1",
  contact: "#main h1",
  faq: "#main h1",
  privacy: "#main h1",
  terms: "#main h1",
  "not-found": "#main h1",
  offline: "#main h1",
};

for (const entry of PAGES) {
  test(`${entry.name}: page loads, renders, no fatal screen`, async ({ page }, testInfo) => {
    const quality = await openPage(page, entry.path);

    // Quality gates: zero console errors, zero failed requests.
    expectClean(quality.snapshot(), `${entry.path} (${testInfo.project.name})`);

    // No fatal error screen.
    await expect(page.locator(".fatal-note")).toHaveCount(0);

    // Shared chrome mounts: header with navigation and a populated footer.
    await expect(page.locator("#site-header .site-header__inner")).toBeVisible();
    await expect(page.locator("#site-footer")).toBeVisible();
    await expect(page.locator("#site-footer")).not.toBeEmpty();

    // Primary content marker is present.
    const marker = CONTENT_MARKER[entry.name];
    await expect(page.locator(marker).first()).toBeVisible();

    // Exactly one <h1> on the page.
    await expect(page.locator("h1")).toHaveCount(1);

    // Language/direction are declared on the root element.
    const lang = await page.locator("html").getAttribute("lang");
    const dir = await page.locator("html").getAttribute("dir");
    expect(lang).toBeTruthy();
    expect(dir).toBeTruthy();
  });
}

test("home: primary actions link to real pages", async ({ page }) => {
  const quality = await openPage(page, "index.html");
  await expect(page.locator(".hero__actions a[href*='projects.html']")).toBeVisible();
  await expect(page.locator(".hero__actions a[href*='contact.html']")).toBeVisible();
  expectClean(quality.snapshot(), "index.html actions");
});

test("projects: filters toggle the list and keep it functional", async ({ page }) => {
  const quality = await openPage(page, "projects.html");
  const filterAll = page.locator('[data-filter="all"]');
  const filterApp = page.locator('[data-filter="app"]');
  await expect(filterAll).toBeVisible();
  await filterApp.click();
  await expect(page.locator("#project-list-rows .project-row").first()).toBeVisible();
  await filterAll.click();
  await expect(page.locator("#project-list-rows .project-row").first()).toBeVisible();
  expectClean(quality.snapshot(), "projects filters");
});

test("project detail: unknown id renders the not-found state, not a crash", async ({ page }) => {
  const quality = await openPage(page, "project.html?id=definitely-not-real");
  await page.waitForTimeout(300);
  expectClean(quality.snapshot(), "project not-found");
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator(".fatal-note")).toHaveCount(0);
});

test("mobile: navigation menu opens and closes", async ({ page }, testInfo) => {
  test.skip(!isMobileProject(testInfo.project.name), "mobile behavior");
  const quality = await openPage(page, "index.html");
  const toggle = page.locator("[data-menu-toggle]");
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "false");
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "true");
  expectClean(quality.snapshot(), "mobile menu");
});
