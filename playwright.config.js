// @ts-check
/**
 * playwright.config.js — production-grade QA configuration.
 *
 * Runs the full suite across three browser engines (Chromium, Firefox,
 * WebKit) and two viewports (desktop + mobile). Every page is exercised in
 * Arabic and English, light and dark. Screenshots are captured for every
 * page; traces and videos are retained only on failure so the main run stays
 * fast and CI artifacts stay small.
 *
 * The site is served from the repository root by tests/static-server.mjs
 * (a dependency-free node:http server), so no build step is required.
 */

const { defineConfig, devices } = require("@playwright/test");

const PORT = process.env.PORT || 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 390, height: 844 };

/** Shared per-browser settings. */
function browserProject(browserName, name, viewport) {
  return {
    name,
    use: {
      browserName,
      viewport,
      baseURL: BASE_URL,
      ...(browserName === "webkit" && viewport.width <= 500
        ? devices["iPhone 12"]
        : {}),
    },
  };
}

module.exports = defineConfig({
  testDir: "./tests/spec",
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],

  webServer: {
    command: `node tests/static-server.mjs --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "en-US",
    colorScheme: "light",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    browserProject("chromium", "chromium-desktop", DESKTOP),
    browserProject("chromium", "chromium-mobile", MOBILE),
    browserProject("firefox", "firefox-desktop", DESKTOP),
    browserProject("firefox", "firefox-mobile", MOBILE),
    browserProject("webkit", "webkit-desktop", DESKTOP),
    browserProject("webkit", "webkit-mobile", MOBILE),
  ],
});
