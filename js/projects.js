/**
 * projects.js — renders the projects index (projects.html).
 * Each project is an entry in a document-style index, not a marketing
 * card. Filters group entries by type; every string, label and link
 * comes from the JSON data files.
 */

import { $, escapeHTML, renderInto, setMeta, setLink } from "./utils.js";
import { loadAll, getSettings, getProfile, getProjects } from "./data.js";
import { t, currentLang, initLang, localizedHref } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initComponents, renderFatal } from "./components.js";

const FILTERS = ["all", "app", "web"];

/** Active type filter; "all" shows every project. */
let currentFilter = "all";

/** "المشاريع — غسان عبدالخالق" style page title. */
function pageTitle() {
  const lang = currentLang();
  const name = getProfile().name?.[lang] ?? "";
  return `${t("projects.pageTitle")} — ${name}`;
}

/** Title, description, canonical and Open Graph tags — all from JSON. */
function setPageMeta() {
  const settings = getSettings();
  const lang = currentLang();
  const title = pageTitle();
  document.title = title;
  setMeta("name", "description", t("projects.pageLead"));
  setLink("canonical", `${settings.url}/projects.html`);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", t("projects.pageLead"));
  setMeta("property", "og:locale", settings.ogLocales?.[lang] ?? lang);
  setMeta("property", "og:url", `${settings.url}/projects.html`);
}

function renderHead() {
  renderInto(
    $("#page-head"),
    `
    <div class="container">
      <p class="page-head__kicker">${escapeHTML(t("projects.indexKicker"))}</p>
      <h1 id="page-title">${escapeHTML(t("projects.pageTitle"))}</h1>
      <p class="page-head__lead">${escapeHTML(t("projects.pageLead"))}</p>
    </div>
    `
  );
}

function renderFilters() {
  const buttons = FILTERS.map((type) => {
    const key = `projects.filter${type[0].toUpperCase()}${type.slice(1)}`;
    const pressed = type === currentFilter;
    return `<button type="button" class="filter-btn" data-filter="${type}" aria-pressed="${pressed}">${escapeHTML(t(key))}</button>`;
  }).join("");
  renderInto(
    $("#filter-bar"),
    `
    <span class="filter-bar__label">${escapeHTML(t("projects.filterLabel"))}</span>
    ${buttons}
    `
  );
}

function projectRow(project, lang) {
  const detail = localizedHref(`project.html?id=${encodeURIComponent(project.slug ?? project.id)}`);
  const tech = (project.tech ?? []).map((item) => `<li>${escapeHTML(item)}</li>`).join("");
  const cover = project.cover?.[lang];
  const coverHTML = cover
    ? `<img class="project-row__cover" src="${escapeHTML(cover)}" alt="" loading="lazy" decoding="async">`
    : "";
  return `
    <article class="project-row">
      <span class="project-row__num" aria-hidden="true">${escapeHTML(String(project.order ?? 0).padStart(2, "0"))}</span>
      ${coverHTML}
      <div class="project-row__body">
        <div class="project-row__head">
          <h2><a href="${escapeHTML(detail)}">${escapeHTML(project.title?.[lang] ?? "")}</a></h2>
          <span class="badge badge--${escapeHTML(project.status ?? "draft")}">${escapeHTML(t(`status.${project.status ?? "draft"}`))}</span>
        </div>
        <p class="project-row__meta">${escapeHTML(project.year ?? "")} · ${escapeHTML(project.platform?.[lang] ?? "")}</p>
        <p class="project-row__summary">${escapeHTML(project.summary?.[lang] ?? "")}</p>
        <ul class="tech-list" aria-label="${escapeHTML(t("projects.caseStudy.meta.stack"))}">${tech}</ul>
        <a class="link-arrow" href="${escapeHTML(detail)}">${escapeHTML(t("projects.readCaseStudy"))}<span class="link-arrow__icon" aria-hidden="true">${escapeHTML(t("actions.arrow"))}</span></a>
      </div>
    </article>`;
}

function renderRows() {
  const lang = currentLang();
  const projects = getProjects()
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((project) => currentFilter === "all" || project.type === currentFilter);
  const content = projects.length
    ? projects.map((project) => projectRow(project, lang)).join("")
    : `<p class="list-empty">${escapeHTML(t("projects.empty"))}</p>`;
  renderInto($("#project-list-rows"), content);
}

function renderSection() {
  $("#filter-bar")?.setAttribute("aria-label", t("aria.filters"));
  renderFilters();
  renderRows();
}

function wireEvents() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    currentFilter = button.dataset.filter;
    renderSection();
  });
}

async function main() {
  try {
    await loadAll();
  } catch (error) {
    console.error("[projects] data load failed:", error);
    renderFatal(error.message);
    return;
  }
  initLang();
  initTheme();
  initComponents();
  $("#project-list")?.setAttribute("aria-label", t("projects.pageTitle"));
  renderHead();
  renderSection();
  setPageMeta();
  wireEvents();
  document.addEventListener("langchange", () => {
    renderHead();
    renderSection();
    setPageMeta();
  });
}

main();
