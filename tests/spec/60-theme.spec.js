/**
 * 60-theme.spec.js — light/dark theming: the data-theme attribute, persisted
 * preference, the in-page toggle, and that the computed background actually
 * changes to the theme's design token.
 */

import { test, expect } from "@playwright/test";
import { PAGES, THEMES, isMobileProject } from "../helpers/site.mjs";
import { openPage } from "../helpers/open.mjs";
import { expectClean } from "../helpers/quality.mjs";

/** Resolve the body background and the --color-bg token for the active theme. */
async function readThemeState(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const bg = getComputedStyle(document.body).backgroundColor;
    const token = getComputedStyle(root).getPropertyValue("--color-bg").trim();
    // Resolve the token through the same color pipeline the body uses
    // (hex/named/vars all come back as a computed rgb() string), so the
    // comparison below never trips on formatting differences.
    const probe = document.createElement("span");
    probe.style.color = token;
    probe.style.display = "none";
    document.body.appendChild(probe);
    const tokenRgb = getComputedStyle(probe).color;
    probe.remove();
    return {
      dataTheme: root.getAttribute("data-theme"),
      bodyBackground: bg,
      colorBgToken: tokenRgb,
    };
  });
}

test("light theme is applied by default on a light system", async ({ page }) => {
  const quality = await openPage(page, "index.html");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expectClean(quality.snapshot(), "index.html light");
});

for (const theme of THEMES) {
  test(`stored preference for "${theme}" is applied across the site`, async ({ page }) => {
    // Default language for brevity; theme is orthogonal to language.
    const quality = await openPage(page, "index.html", { theme });
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

    const state = await readThemeState(page);
    expect(state.colorBgToken).not.toBe("");
    expect(state.bodyBackground).toBeTruthy();
    expectClean(quality.snapshot(), `index.html theme ${theme}`);
  });
}

test("the theme toggle flips data-theme and persists the choice", async ({ page }) => {
  const quality = await openPage(page, "index.html", { theme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  const before = await readThemeState(page);
  await page.locator("[data-theme-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const stored = await page.evaluate(() => localStorage.getItem("portfolio.theme"));
  expect(stored).toBe("dark");

  const after = await readThemeState(page);
  expect(after.bodyBackground).not.toBe(before.bodyBackground);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("#site-header .site-header__inner").waitFor();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expectClean(quality.snapshot(), "theme toggle");
});

test("light and dark backgrounds differ and match their tokens", async ({ page }) => {
  const light = await openPage(page, "index.html", { theme: "light" });
  const lightState = await readThemeState(page);
  expect(lightState.dataTheme).toBe("light");

  await page.locator("[data-theme-toggle]").click();
  const darkState = await readThemeState(page);
  expect(darkState.dataTheme).toBe("dark");

  expect(darkState.bodyBackground).not.toBe(lightState.bodyBackground);
  expect(lightState.bodyBackground).toBe(lightState.colorBgToken);
  expect(darkState.bodyBackground).toBe(darkState.colorBgToken);
  expectClean(light.snapshot(), "theme tokens");
});

for (const entry of PAGES) {
  for (const theme of THEMES) {
    test(`${entry.name} [${theme}]: theme applied, no fatal`, async ({ page }, testInfo) => {
      if (isMobileProject(testInfo.project.name) && theme !== THEMES[0]) {
        test.skip(true, "mobile runs the default theme only");
      }
      const quality = await openPage(page, entry.path, { theme });
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator("h1").first()).toBeVisible();
      expectClean(quality.snapshot(), `${entry.path} [${theme}]`);
    });
  }
}
