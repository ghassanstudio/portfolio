#!/usr/bin/env node
/**
 * tools/generate-og.mjs — renders the site's Open Graph share card.
 *
 * A single 1200×630 PNG (og-default.png) is produced from an HTML template
 * via headless Chromium, so the card always matches the site's visual
 * identity without hand-editing pixels. Run: node tools/generate-og.mjs
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "assets", "images", "og");
const OUT = path.join(OUT_DIR, "og-default.png");
const WIDTH = 1200;
const HEIGHT = 630;

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    font-family: "Segoe UI", "Tajawal", Tahoma, Arial, sans-serif;
    color: #e8edf5;
    background: linear-gradient(135deg, #0d1526 0%, #16233d 60%, #0d1526 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 64px 72px;
  }
  .brand { display: flex; flex-direction: column; gap: 10px; }
  .name { font-size: 36px; font-weight: 700; }
  .name span { color: #7fd1ae; }
  .role { font-size: 26px; color: #aab6c8; }
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 20px;
    color: #7e8ba0;
  }
  .url { font-family: Consolas, "Courier New", monospace; letter-spacing: 0.5px; }
  .accent { color: #7fd1ae; }
</style>
</head>
<body>
  <div class="brand">
    <div class="name">غسان عبدالخالق <span>·</span> Ghassan Abdulkhaliq</div>
    <div class="role">مطوّر ويب وتطبيقات — Web &amp; App Developer</div>
  </div>
  <div class="footer">
    <div>دراسات حالة هندسية موثقة — Engineering case studies</div>
    <div class="url accent">ghassanstudio.github.io/portfolio</div>
  </div>
</body>
</html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  await page.setContent(html, { waitUntil: "load" });
  mkdirSync(OUT_DIR, { recursive: true });
  await page.screenshot({ path: OUT, fullPage: false });
} finally {
  await browser.close();
}
console.log(`Wrote ${path.relative(ROOT, OUT)} (${WIDTH}×${HEIGHT})`);
