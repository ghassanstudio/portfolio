/**
 * project.js — renders a single case study (project.html?id=…).
 * The page is an engineering document: a numbered table of contents,
 * sections in the order defined by data/projects.json, a spec-sheet
 * meta block, links and a gallery. Every label and string comes from
 * the JSON data files — nothing is hardcoded here.
 */

import { $, escapeHTML, getParam, renderInto, setMeta, setLink } from "./utils.js";
import { loadAll, getSettings, getProfile, getProjects, getProject } from "./data.js";
import { t, currentLang, initLang, localizedHref } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initComponents, renderFatal } from "./components.js";

/** Normalize a YouTube embed URL to a watch URL for linking out. */
function watchUrl(url) {
  const match = url?.match(/youtube\.com\/embed\/([^/?]+)/);
  return match ? `https://www.youtube.com/watch?v=${match[1]}` : url;
}

/** Render a block of the generic model: p, list or dl. Unknown types render nothing. */
function renderBlocks(blocks, lang) {
  return (blocks ?? [])
    .map((block) => {
      switch (block.type) {
        case "p":
          return `<p class="doc-block">${escapeHTML(block.text?.[lang] ?? "")}</p>`;
        case "list":
          return `<ul class="doc-list">${(block.items ?? [])
            .map((item) => `<li>${escapeHTML(item?.[lang] ?? "")}</li>`)
            .join("")}</ul>`;
        case "dl":
          return `<dl class="doc-dl">${(block.rows ?? [])
            .map(
              (row) => `
          <div class="doc-dl__row">
            <dt>${escapeHTML(row.term?.[lang] ?? "")}</dt>
            <dd>${escapeHTML(row.detail?.[lang] ?? "")}</dd>
          </div>`
            )
            .join("")}</dl>`;
        default:
          return "";
      }
    })
    .join("");
}

function techChips(tech) {
  return (tech ?? []).map((item) => `<li>${escapeHTML(item)}</li>`).join("");
}

/** Spec-sheet block: year, status, platform, role — from project data. */
function metaRows(project, lang) {
  const rows = [
    ["meta.year", project.year],
    ["meta.status", t(`status.${project.status ?? "draft"}`)],
    ["meta.platform", project.platform?.[lang]],
    ["meta.role", project.role?.[lang]],
  ];
  return rows
    .map(
      ([key, value]) =>
        value
          ? `<div class="case-study__meta-row"><dt>${escapeHTML(t(`projects.caseStudy.${key}`))}</dt><dd>${escapeHTML(String(value))}</dd></div>`
          : ""
    )
    .join("");
}

/** Numbered table of contents — shown once a document has enough sections. */
function tocHTML(project, lang) {
  const sections = project.caseStudy ?? [];
  if (sections.length < 3) return "";
  const items = sections
    .map(
      (section, index) => `
      <li><a href="#${escapeHTML(section.id)}">
        <span class="toc__num" aria-hidden="true">${escapeHTML(String(index + 1).padStart(2, "0"))}</span>
        <span>${escapeHTML(t(`projects.caseStudy.${section.id}`))}</span>
      </a></li>`
    )
    .join("");
  return `
    <nav class="toc" aria-label="${escapeHTML(t("project.toc"))}">
      <h2 class="toc__title">${escapeHTML(t("project.toc"))}</h2>
      <ol>${items}</ol>
    </nav>`;
}

function sectionsHTML(project, lang) {
  return (project.caseStudy ?? [])
    .map((section, index) => {
      const num = String(index + 1).padStart(2, "0");
      return `
      <section class="doc-section" id="${escapeHTML(section.id)}" aria-labelledby="${escapeHTML(section.id)}-title">
        <div class="doc-section__head">
          <span class="doc-section__num" aria-hidden="true">${num}</span>
          <h2 class="doc-section__title" id="${escapeHTML(section.id)}-title">${escapeHTML(t(`projects.caseStudy.${section.id}`))}</h2>
        </div>
        ${renderBlocks(section.blocks, lang)}
      </section>`;
    })
    .join("");
}

/** External links section — rendered only for links that exist in the data. */
function linksHTML(project, lang, num) {
  const entries = Object.entries(project.links ?? {}).filter(([, link]) => link && link.url);
  if (!entries.length) return "";
  const buttons = entries
    .map(([type, link]) => {
      const href = type === "video" ? watchUrl(link.url) : link.url;
      return `<a class="btn btn--ghost" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(link.label?.[lang] ?? href)}</a>`;
    })
    .join("");
  return `
    <section class="doc-section" id="links" aria-labelledby="links-title">
      <div class="doc-section__head">
        <span class="doc-section__num" aria-hidden="true">${num}</span>
        <h2 class="doc-section__title" id="links-title">${escapeHTML(t("projects.caseStudy.links"))}</h2>
      </div>
      <div class="doc-links">${buttons}</div>
    </section>`;
}

/**
 * Gallery — renders the screenshots declared in the data. The array is
 * kept empty until real files exist (checked by tools/check-assets.mjs),
 * so the document never ships broken or placeholder imagery.
 */
function galleryHTML(project, lang, num) {
  const items = project.gallery ?? [];
  if (!items.length) return "";
  const figures = items
    .map(
      (item) => `<figure class="gallery__item"><img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.alt?.[lang] ?? "")}" loading="lazy" decoding="async"></figure>`
    )
    .join("");
  return `
    <section class="doc-section" id="gallery" aria-labelledby="gallery-title">
      <div class="doc-section__head">
        <span class="doc-section__num" aria-hidden="true">${num}</span>
        <h2 class="doc-section__title" id="gallery-title">${escapeHTML(t("projects.caseStudy.gallery"))}</h2>
      </div>
      <div class="gallery">${figures}</div>
    </section>`;
}

/** Previous/next document navigation — rendered only when other projects exist. */
function docNavHTML(project, lang) {
  const all = getProjects()
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const index = all.findIndex((item) => item.id === project.id || item.slug === project.slug);
  if (all.length < 2 || index === -1) return "";
  const prev = all[index - 1];
  const next = all[index + 1];
  const link = (target, labelKey) =>
    target
      ? `<a class="doc-nav__link" href="${escapeHTML(localizedHref(`project.html?id=${encodeURIComponent(target.slug ?? target.id)}`))}">
          <span class="doc-nav__label">${escapeHTML(t(labelKey))}</span>
          <span class="doc-nav__title">${escapeHTML(target.title?.[lang] ?? "")}</span>
        </a>`
      : `<span class="doc-nav__link doc-nav__link--empty" aria-hidden="true"></span>`;
  return `
    <nav class="doc-nav" aria-label="${escapeHTML(t("aria.docNav"))}">
      ${link(prev, "project.prev")}
      ${link(next, "project.next")}
    </nav>`;
}

function renderDoc(project) {
  const lang = currentLang();
  const base = (project.caseStudy ?? []).length;
  const gallery = galleryHTML(project, lang, String(base + 2).padStart(2, "0"));
  const links = linksHTML(project, lang, String(base + 1).padStart(2, "0"));
  renderInto(
    $("#case-study"),
    `
    <header class="case-study__head">
      <div class="container">
        <p class="page-head__kicker">${escapeHTML(t("projects.caseStudy.label"))} · ${escapeHTML(project.year ?? "")} · ${escapeHTML(project.platform?.[lang] ?? "")}</p>
        <h1 id="doc-title">${escapeHTML(project.title?.[lang] ?? "")}</h1>
        <p class="case-study__summary">${escapeHTML(project.summary?.[lang] ?? "")}</p>
        <dl class="case-study__meta">${metaRows(project, lang)}</dl>
        <ul class="tech-list" aria-label="${escapeHTML(t("projects.caseStudy.meta.stack"))}">${techChips(project.tech)}</ul>
      </div>
    </header>
    <div class="container container--narrow case-study__body">
      ${tocHTML(project, lang)}
      ${sectionsHTML(project, lang)}
      ${links}
      ${gallery}
      ${docNavHTML(project, lang)}
    </div>
    `
  );
}

/** Structured data for search engines — rebuilt from the same JSON source. */
function setJsonLd(project, lang, profile, url) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title?.[lang],
    description: project.meta?.description?.[lang] ?? project.summary?.[lang],
    author: { "@type": "Person", name: profile.name?.[lang] },
    inLanguage: lang,
    datePublished: project.year,
    mainEntityOfPage: url,
  };
  let script = document.getElementById("ld-json");
  if (!script) {
    script = document.createElement("script");
    script.id = "ld-json";
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function setPageMeta(project) {
  const settings = getSettings();
  const lang = currentLang();
  const url = `${settings.url}/project.html?id=${encodeURIComponent(project.slug ?? project.id)}`;
  const title = `${project.title?.[lang]} — ${t("projects.caseStudy.label")}`;
  const description = project.meta?.description?.[lang] ?? project.summary?.[lang] ?? "";
  document.title = title;
  setMeta("name", "description", description);
  setLink("canonical", url);
  setMeta("property", "og:type", "article");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", settings.ogLocales?.[lang] ?? lang);
  setMeta("property", "og:url", url);
  setJsonLd(project, lang, getProfile(), url);
}

function setNotFoundMeta() {
  const lang = currentLang();
  const name = getProfile().name?.[lang] ?? "";
  document.title = `${t("project.notFoundTitle")} — ${name}`;
  setMeta("name", "description", t("project.notFoundLead"));
  setMeta("name", "robots", "noindex");
}

function renderNotFound() {
  renderInto(
    $("#case-study"),
    `
    <div class="container not-found">
      <p class="page-head__kicker">404</p>
      <h1 id="doc-title">${escapeHTML(t("project.notFoundTitle"))}</h1>
      <p class="not-found__lead">${escapeHTML(t("project.notFoundLead"))}</p>
      <a class="btn btn--primary" href="${escapeHTML(localizedHref("projects.html"))}">${escapeHTML(t("project.backToProjects"))}</a>
    </div>
    `
  );
}

async function main() {
  try {
    await loadAll();
  } catch (error) {
    console.error("[project] data load failed:", error);
    renderFatal(error.message);
    return;
  }
  initLang();
  initTheme();
  initComponents();
  $("#case-study")?.setAttribute("aria-label", t("aria.projectDoc"));
  const id = getParam("id") ?? getParam("slug");
  const project = id ? getProject(id) : null;
  if (project) {
    renderDoc(project);
    setPageMeta(project);
  } else {
    renderNotFound();
    setNotFoundMeta();
  }
  document.addEventListener("langchange", () => {
    if (project) {
      renderDoc(project);
      setPageMeta(project);
    } else {
      renderNotFound();
    }
  });
}

main();
