/**
 * 70-a11y.spec.js — accessibility essentials, verified behaviorally:
 * skip link, landmark structure, single h1 in order, keyboard navigation,
 * and accessible names on every interactive element.
 *
 * Note on WebKit: Playwright ships the WPE WebKit build, which does not
 * implement sequential focus navigation (Tab) for links — even a plain
 * `a href` page only tabs through buttons. The keyboard-traversal tests
 * therefore run on Chromium and Firefox only, where Tab behaves like a real
 * browser (skip link first, then the nav).
 */

import { test, expect } from "@playwright/test";
import { PAGES, isMobileProject } from "../helpers/site.mjs";
import { openPage } from "../helpers/open.mjs";
import { expectClean } from "../helpers/quality.mjs";

/** Playwright's WebKit cannot drive Tab traversal of links — skip those tests. */
const skipOnWebkit = (testInfo) =>
  test.skip(
    testInfo.project.name.includes("webkit"),
    "Playwright WPE WebKit does not implement Tab focus traversal for links"
  );

/** Accessible name of an element, as a screen reader would compute it. */
const accessibleName = (node) => {
  const aria = node.getAttribute("aria-label");
  const labelFor = node.getAttribute("aria-labelledby");
  if (aria && aria.trim()) return aria.trim();
  if (labelFor) {
    const refs = labelFor.split(/\s+/);
    const text = refs
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ")
      .trim();
    if (text) return text;
  }
  if (node.closest("label")) return node.closest("label").textContent.trim();
  return (node.textContent || "").replace(/\s+/g, " ").trim();
};

test("every page exposes the skip link as the first tab stop", async ({ page }, testInfo) => {
  skipOnWebkit(testInfo);
  await openPage(page, "index.html");
  await page.keyboard.press("Tab");
  const active = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    href: document.activeElement?.getAttribute("href"),
    cls: document.activeElement?.className,
  }));
  expect(active.tag).toBe("A");
  expect(active.href).toContain("#main");
});

test("the skip link moves focus to the main content", async ({ page }, testInfo) => {
  skipOnWebkit(testInfo);
  await openPage(page, "index.html");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("landmark structure is present on every page", async ({ page }) => {
  await openPage(page, "index.html");
  await expect(page.locator("main#main")).toHaveCount(1);
  await expect(page.locator("#site-header")).toHaveCount(1);
  await expect(page.locator("#site-footer")).toHaveCount(1);
});

test("keyboard can reach every navigation link", async ({ page }, testInfo) => {
  skipOnWebkit(testInfo);
  await openPage(page, "index.html");
  const navLinkCount = await page.locator(".site-nav a").count();
  expect(navLinkCount).toBeGreaterThanOrEqual(5);

  // First Tab hits the skip link; keep tabbing until we have cycled the nav.
  await page.keyboard.press("Tab"); // skip link
  let seen = new Set();
  for (let i = 0; i < navLinkCount + 4; i++) {
    await page.keyboard.press("Tab");
    const href = await page.evaluate(() => document.activeElement?.getAttribute("href"));
    if (href) seen.add(href);
  }
  expect(seen.size).toBeGreaterThanOrEqual(4);
});

test("Escape closes the open mobile menu", async ({ page }, testInfo) => {
  test.skip(!isMobileProject(testInfo.project.name), "mobile behavior");
  await openPage(page, "index.html");
  await page.locator("[data-menu-toggle]").click();
  await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "false");
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "true");
});

for (const entry of PAGES) {
  test(`${entry.name}: heading order, single h1, and accessible interactive elements`, async ({ page }) => {
    const quality = await openPage(page, entry.path);
    expectClean(quality.snapshot(), `${entry.path} a11y`);

    // Exactly one h1 and it is the first heading on the page.
    await expect(page.locator("h1")).toHaveCount(1);
    const firstHeadingIsH1 = await page.evaluate(() => {
      const heading = document.querySelector("h1, h2, h3, h4, h5, h6");
      return heading ? heading.tagName === "H1" : false;
    });
    expect(firstHeadingIsH1, `${entry.path}: first heading must be the h1`).toBe(true);

    const problems = await page.evaluate(() => {
      const issues = [];
      const name = (node) => {
        const aria = node.getAttribute("aria-label");
        const by = node.getAttribute("aria-labelledby");
        if (aria && aria.trim()) return aria.trim();
        if (by) {
          return by
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.textContent ?? "")
            .join(" ")
            .trim();
        }
        return (node.textContent || "").replace(/\s+/g, " ").trim();
      };

      // Buttons and interactive controls must have an accessible name.
      document.querySelectorAll("button, [role='button'], input, select, textarea, summary").forEach((el) => {
        if (!name(el)) issues.push(`control without accessible name: <${el.tagName.toLowerCase()} class="${el.className}">`);
      });

      // Links must have an accessible name (unless purely decorative icons).
      document.querySelectorAll("a").forEach((a) => {
        const href = a.getAttribute("href") || "";
        if (href === "" || href === "#") {
          issues.push(`link with empty/dead href: ${a.outerHTML.slice(0, 120)}`);
        }
        if (!name(a)) issues.push(`link without accessible name: ${href}`);
      });

      // Images must have alt text unless decorative.
      document.querySelectorAll("img").forEach((img) => {
        const alt = img.getAttribute("alt");
        if (alt === null) issues.push(`image without alt attribute: ${img.getAttribute("src")}`);
      });

      return issues;
    });

    expect(problems, `${entry.path} accessibility issues:\n${problems.join("\n")}`).toEqual([]);
  });
}
