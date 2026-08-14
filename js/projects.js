/**
 * projects.js — renders the projects index (projects.html).
 * Every project is presented as a balanced portfolio card in a two-column
 * grid (one column on mobile). The toolbar above the grid offers type
 * filters, a name/description search, and newest/oldest sorting. Every
 * string, label and link comes from the JSON data files.
 */

import { $, escapeHTML, renderInto, setMeta, setLink } from "./utils.js";
import { loadAll, getSettings, getProfile, getProjects } from "./data.js";
import { t, currentLang, initLang, localizedHref } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initComponents, renderFatal } from "./components.js";

/** Filter buttons, in display order. "all" shows every project. */
const FILTERS = ["all", "app", "web", "games", "wordpress"];

/** Map a filter value to the project types it includes. */
const FILTER_TYPES = {
  all: () => true,
  app: (type) => type === "app" || type === "android",
  web: (type) => type === "web",
  games: (type) => type === "games",
  wordpress: (type) => type === "wordpress",
};

/** i18n key for a project type label (shared by filters and cards). */
function typeKey(type) {
  if (type === "app" || type === "android") return "projects.filterApp";
  if (type === "web") return "projects.filterWeb";
  if (type === "games") return "projects.filterGames";
  if (type === "wordpress") return "projects.filterWordPress";
  return null;
}

/** Active toolbar state. */
let currentFilter = "all";
let currentQuery = "";
let currentSort = "newest";

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

function renderSearch() {
  renderInto(
    $("#project-search"),
    `
    <label class="sr-only" for="project-search-input">${escapeHTML(t("projects.searchLabel"))}</label>
    <input type="search" id="project-search-input" class="project-search__input" value="${escapeHTML(currentQuery)}" placeholder="${escapeHTML(t("projects.searchPlaceholder"))}" aria-label="${escapeHTML(t("projects.searchLabel"))}" autocomplete="off">
    `
  );
}

function renderSort() {
  const options = [
    { value: "newest", label: t("projects.sortNewest") },
    { value: "oldest", label: t("projects.sortOldest") },
  ]
    .map(
      (option) =>
        `<option value="${option.value}"${option.value === currentSort ? " selected" : ""}>${escapeHTML(option.label)}</option>`
    )
    .join("");
  renderInto(
    $("#project-sort"),
    `
    <label class="sr-only" for="project-sort-select">${escapeHTML(t("projects.sortLabel"))}</label>
    <select id="project-sort-select" class="project-sort__select" aria-label="${escapeHTML(t("projects.sortLabel"))}">
      ${options}
    </select>
    `
  );
}

/** Normalized search haystack for a project in the current language. */
function searchText(project, lang) {
  return [
    project.title?.[lang] ?? "",
    project.summary?.[lang] ?? "",
    project.platform?.[lang] ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function matchesQuery(project, lang) {
  const query = currentQuery.trim().toLowerCase();
  if (!query) return true;
  return searchText(project, lang).includes(query);
}

function matchesFilter(project) {
  if (currentFilter === "all") return true;
  return FILTER_TYPES[currentFilter](project.type);
}

/** Sort projects: newest/oldest by year, then the data-file order. */
function sortProjects(list) {
  const direction = currentSort === "oldest" ? 1 : -1;
  return list.sort((a, b) => {
    const yearA = Number(a.year ?? 0) || 0;
    const yearB = Number(b.year ?? 0) || 0;
    if (yearA !== yearB) return (yearA - yearB) * direction;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

/** Cover: the project's own image, or a neutral placeholder at the same ratio. */
function coverHTML(project, lang) {
  const cover = project.cover?.[lang];
  if (cover) {
    return `<img class="project-card__cover" src="${escapeHTML(cover)}" alt="" loading="lazy" decoding="async">`;
  }
  const initial = (project.title?.[lang] ?? "؟").trim().charAt(0);
  return `<div class="project-card__cover project-card__cover--placeholder" aria-hidden="true">${escapeHTML(initial)}</div>`;
}

function projectCard(project, lang) {
  const detail = localizedHref(`project.html?id=${encodeURIComponent(project.slug ?? project.id)}`);
  const tech = (project.tech ?? []).slice(0, 4).map((item) => `<li>${escapeHTML(item)}</li>`).join("");
  const typeLabel = typeKey(project.type)
    ? t(typeKey(project.type))
    : (project.platform?.[lang] ?? project.type ?? "");
  return `
    <article class="project-row">
      <div class="project-card__media">${coverHTML(project, lang)}</div>
      <div class="project-row__body">
        <div class="project-row__head">
          <div class="project-row__title">
            <span class="project-row__num" aria-hidden="true">${escapeHTML(String(project.order ?? 0).padStart(2, "0"))}</span>
            <h2><a href="${escapeHTML(detail)}">${escapeHTML(project.title?.[lang] ?? "")}</a></h2>
          </div>
          <span class="badge badge--${escapeHTML(project.status ?? "draft")}">${escapeHTML(t(`status.${project.status ?? "draft"}`))}</span>
        </div>
        <p class="project-row__meta"><span class="project-card__type">${escapeHTML(typeLabel)}</span><span>${escapeHTML(project.year ?? "")}</span></p>
        <p class="project-row__summary">${escapeHTML(project.summary?.[lang] ?? "")}</p>
        <ul class="tech-list" aria-label="${escapeHTML(t("projects.caseStudy.meta.stack"))}">${tech}</ul>
        <a class="link-arrow" href="${escapeHTML(detail)}">${escapeHTML(t("projects.readCaseStudy"))}<span class="link-arrow__icon" aria-hidden="true">${escapeHTML(t("actions.arrow"))}</span></a>
      </div>
    </article>`;
}

function renderRows() {
  const lang = currentLang();
  const projects = sortProjects(
    getProjects()
      .slice()
      .filter(matchesFilter)
      .filter((project) => matchesQuery(project, lang))
  );
  let content;
  if (projects.length) {
    content = projects.map((project) => projectCard(project, lang)).join("");
  } else if (currentQuery.trim()) {
    content = `<p class="list-empty">${escapeHTML(t("projects.noResults"))}</p>`;
  } else {
    content = `<p class="list-empty">${escapeHTML(t("projects.empty"))}</p>`;
  }
  renderInto($("#project-list-rows"), content);
}

function renderTools() {
  $("#filter-bar")?.setAttribute("aria-label", t("aria.filters"));
  renderFilters();
  renderSearch();
  renderSort();
}

function wireEvents() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    currentFilter = button.dataset.filter;
    renderFilters();
    renderRows();
  });

  document.addEventListener("input", (event) => {
    if (event.target.id !== "project-search-input") return;
    currentQuery = event.target.value;
    renderRows();
  });

  document.addEventListener("change", (event) => {
    if (event.target.id !== "project-sort-select") return;
    currentSort = event.target.value;
    renderRows();
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
  renderTools();
  renderRows();
  setPageMeta();
  wireEvents();
  document.addEventListener("langchange", () => {
    renderHead();
    renderTools();
    renderRows();
    setPageMeta();
  });
}

main();
