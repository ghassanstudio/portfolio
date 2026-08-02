#!/usr/bin/env node
/**
 * tools/check-assets.mjs — development-time integrity check.
 * Run before releasing: `node tools/check-assets.mjs`
 *
 * Verifies that every asset and internal page referenced by the JSON
 * data files actually exists on disk. The site never probes at runtime,
 * so this tool is the guard that keeps the published site free of
 * broken images and dead internal links. Exits non-zero on failure.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let failures = 0;

function fail(what, ref) {
  failures++;
  console.log(`MISSING  ${what}  (referenced in ${ref})`);
}

function readJSON(rel) {
  const file = path.join(ROOT, rel);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const settings = readJSON("data/settings.json");
const projects = readJSON("data/projects.json").projects ?? [];
const articles = readJSON("data/articles.json").articles ?? [];

/* -- Internal pages referenced by settings -------------------------------- */

for (const item of settings.nav ?? []) {
  if (!fs.existsSync(path.join(ROOT, item.href))) fail(item.href, "data/settings.json (nav)");
}
for (const href of [...(settings.footer?.quickLinks ?? []), ...(settings.footer?.legal ?? [])]) {
  if (!fs.existsSync(path.join(ROOT, href))) fail(href, "data/settings.json (footer)");
}

/* -- Project data ---------------------------------------------------------- */

for (const project of projects) {
  const ref = `data/projects.json (${project.id})`;
  if (!/^[a-z0-9-]+$/.test(project.id)) fail(`project id "${project.id}" must be [a-z0-9-]`, ref);
  for (const section of project.caseStudy ?? []) {
    if (!/^[a-z0-9-]+$/.test(section.id)) fail(`section id "${section.id}" must be [a-z0-9-]`, ref);
  }
  for (const [type, link] of Object.entries(project.links ?? {})) {
    if (link && !/^https?:\/\//.test(link.url)) fail(`links.${type} url "${link.url}" must be absolute http(s)`, ref);
  }
  for (const image of project.gallery ?? []) {
    if (!fs.existsSync(path.join(ROOT, image.src))) fail(image.src, ref);
  }
}

/* -- Articles --------------------------------------------------------------- */

for (const article of articles) {
  if (!/^[a-z0-9-]+$/.test(article.id)) fail(`article id "${article.id}" must be [a-z0-9-]`, `data/articles.json (${article.id})`);
}

/* -- Summary ---------------------------------------------------------------- */

if (failures) {
  console.log(`\n${failures} problem(s) found.`);
  process.exit(1);
}
console.log("All assets and internal references are present.");
