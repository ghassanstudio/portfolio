/**
 * home.js — renders the home page from the data files.
 * Sections: hero, selected projects, about excerpt, latest articles,
 * contact strip. A section whose data is empty (e.g. no articles yet)
 * is not rendered at all — a section that adds nothing has no reason
 * to exist on the page.
 */

import { $, escapeHTML, formatDate, renderInto, setMeta, setLink } from "./utils.js";
import { loadAll, getSettings, getProfile, getProjects, getArticles } from "./data.js";
import { t, currentLang, initLang, localizedHref } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initComponents, renderFatal } from "./components.js";

/** Shared section header: numbered mono kicker + h2. */
function sectionHead(id, kicker, title) {
  return `<p class="section-head__kicker">${escapeHTML(kicker)}</p><h2 id="${id}">${escapeHTML(title)}</h2>`;
}

/**
 * Rotating job title: every title occupies the same grid cell, so the element
 * keeps the width of the widest title and nothing else shifts (CLS = 0).
 */
function rotatingTitles() {
  const lang = currentLang();
  const titles = Array.isArray(t("home.rotatingTitles"))
    ? t("home.rotatingTitles")
    : [];
  if (!titles.length) return "";
  const items = titles
    .map(
      (title, index) =>
        `<span class="rotating-title__item${index === 0 ? " is-active" : ""}" aria-hidden="true">${escapeHTML(title)}</span>`
    )
    .join("");
  const sep = lang === "ar" ? "، " : ", ";
  return `<span class="rotating-title">${items}</span><span class="sr-only">${escapeHTML(titles.join(sep))}</span>`;
}

let rotatingTimer = null;

/** Rotate titles every 3s with a smooth crossfade; static when motion is reduced. */
function startRotatingTitles() {
  if (rotatingTimer) {
    clearInterval(rotatingTimer);
    rotatingTimer = null;
  }
  const items = Array.from(document.querySelectorAll(".rotating-title__item"));
  if (items.length < 2) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;
  let current = 0;
  rotatingTimer = setInterval(() => {
    items[current]?.classList.remove("is-active");
    current = (current + 1) % items.length;
    items[current]?.classList.add("is-active");
  }, 3000);
}

function projectCard(project, lang) {
  const detail = localizedHref(`project.html?id=${encodeURIComponent(project.slug ?? project.id)}`);
  const tech = (project.tech ?? []).map((item) => `<li>${escapeHTML(item)}</li>`).join("");
  return `
    <article class="project-card">
      <div class="project-card__head">
        <h3><a href="${escapeHTML(detail)}">${escapeHTML(project.title?.[lang] ?? "")}</a></h3>
        <span class="badge badge--${escapeHTML(project.status ?? "draft")}">${escapeHTML(t(`status.${project.status ?? "draft"}`))}</span>
      </div>
      <p class="project-card__summary">${escapeHTML(project.summary?.[lang] ?? "")}</p>
      <ul class="tech-list" aria-label="${escapeHTML(t("projects.caseStudy.meta.stack"))}">${tech}</ul>
      <div class="project-card__meta">
        <span>${escapeHTML(project.year ?? "")}</span>
        <span>${escapeHTML(project.platform?.[lang] ?? "")}</span>
      </div>
      <a class="link-arrow" href="${escapeHTML(detail)}">${escapeHTML(t("home.readCaseStudy"))}<span class="link-arrow__icon" aria-hidden="true">${escapeHTML(t("actions.arrow"))}</span></a>
    </article>`;
}

function renderHero() {
  const lang = currentLang();
  const profile = getProfile();
  const hero = profile.hero?.[lang] ?? {};
  const status = profile.status;
  const stats = profile.stats ?? [];
  const rotatingAreas = rotatingTitles();

  const specRows = [
    stats[0]
      ? { key: t("home.specCard.experience"), value: `${stats[0].value} ${stats[0].label?.[lang] ?? ""}` }
      : null,
    { key: t("home.specCard.location"), value: profile.location?.[lang] ?? "" },
    rotatingAreas
      ? { key: t("home.specCard.areas"), html: rotatingAreas }
      : { key: t("home.specCard.areas"), value: profile.role?.[lang] ?? "" },
  ];
  if (status?.active) {
    specRows.push({ key: t("home.specCard.status"), value: status.label?.[lang] ?? "", dot: true });
  }

  const specCard = `
    <aside class="spec-card" aria-label="${escapeHTML(t("home.specCard.title"))}">
      <p class="spec-card__title">${escapeHTML(t("home.specCard.title"))}</p>
      <dl class="spec-card__rows">
        ${specRows
          .filter(Boolean)
          .map(
            (row) => `
          <div class="spec-card__row">
            <dt>${escapeHTML(row.key)}</dt>
            <dd>${row.dot ? '<span class="status-dot" aria-hidden="true"></span>' : ""}${row.html ?? escapeHTML(row.value ?? "")}</dd>
          </div>`
          )
          .join("")}
      </dl>
    </aside>`;

  renderInto(
    $("#hero"),
    `
    <div class="container hero__grid">
      <div class="hero__content">
        ${status?.active ? `<p class="hero__status"><span class="status-dot" aria-hidden="true"></span>${escapeHTML(status.label?.[lang] ?? "")}</p>` : ""}
        <p class="hero__kicker">${escapeHTML(hero.kicker ?? "")}</p>
        <h1 id="hero-title">${escapeHTML(hero.headline ?? "")}</h1>
        <p class="hero__sub">${escapeHTML(hero.subheadline ?? "")}</p>
        <p class="hero__evidence">${escapeHTML(hero.evidence ?? "")}</p>
        <div class="hero__actions">
          <a class="btn btn--primary btn--lg" href="${escapeHTML(localizedHref("projects.html"))}">${escapeHTML(t("actions.viewProjects"))}</a>
          <a class="btn btn--ghost btn--lg" href="${escapeHTML(localizedHref("contact.html"))}">${escapeHTML(t("actions.contactMe"))}</a>
        </div>
      </div>
      ${specCard}
    </div>
    `
  );
}

function renderFeatured() {
  const lang = currentLang();
  const projects = getProjects()
    .filter((project) => project.featured)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 3);
  const root = $("#featured");
  if (!root) return;
  if (!projects.length) {
    root.remove();
    return;
  }
  const cards = projects.map((project) => projectCard(project, lang)).join("");
  const viewAll = `<a class="section-head__link" href="${escapeHTML(localizedHref("projects.html"))}">${escapeHTML(t("actions.viewAllProjects"))} <span class="link-arrow__icon" aria-hidden="true">${escapeHTML(t("actions.arrow"))}</span></a>`;
  renderInto(
    root,
    `
    <div class="container">
      <div class="section-head">${sectionHead("featured-title", t("home.kickers.projects"), t("home.sections.projects"))}${viewAll}</div>
      <div class="card-grid">${cards}</div>
    </div>
    `
  );
}

function renderAbout() {
  const lang = currentLang();
  const profile = getProfile();
  const about = profile.about?.[lang] ?? {};
  const stats = (profile.stats ?? [])
    .map(
      (stat) => `
      <div class="stat">
        <span class="stat__value">${escapeHTML(stat.value)}</span>
        <span class="stat__label">${escapeHTML(stat.label?.[lang] ?? "")}</span>
      </div>`
    )
    .join("");
  renderInto(
    $("#about-home"),
    `
    <div class="container container--narrow">
      <div class="section-head">${sectionHead("about-title", t("home.kickers.about"), t("home.sections.about"))}</div>
      <p class="about-home__intro">${escapeHTML(about.intro ?? "")}</p>
      <p class="about-home__text">${escapeHTML(about.paragraphs?.[0] ?? "")}</p>
      <div class="stats">${stats}</div>
      <p class="about-home__more">
        <a class="link-arrow" href="${escapeHTML(localizedHref("about.html"))}">${escapeHTML(t("home.moreAbout"))}<span class="link-arrow__icon" aria-hidden="true">${escapeHTML(t("actions.arrow"))}</span></a>
      </p>
    </div>
    `
  );
}

function renderArticles() {
  const lang = currentLang();
  const articles = getArticles()
    .slice()
    .sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")))
    .slice(0, 3);
  const root = $("#articles-home");
  if (!root) return;
  if (!articles.length) {
    root.remove();
    return;
  }
  const locale = getSettings().localeMap?.[lang] ?? lang;
  const items = articles
    .map(
      (article) => `
      <article class="article-card">
        <h3><a href="${escapeHTML(localizedHref(`blog-post.html?id=${encodeURIComponent(article.slug ?? article.id)}`))}">${escapeHTML(article.title?.[lang] ?? "")}</a></h3>
        <p class="article-card__meta">${escapeHTML(formatDate(article.date, locale))} · ${escapeHTML(String(article.readingMinutes ?? 0))} ${escapeHTML(t("blog.readingTime"))}</p>
        <p class="article-card__summary">${escapeHTML(article.summary?.[lang] ?? "")}</p>
      </article>`
    )
    .join("");
  const viewAll = `<a class="section-head__link" href="${escapeHTML(localizedHref("blog.html"))}">${escapeHTML(t("actions.viewAllArticles"))} <span class="link-arrow__icon" aria-hidden="true">${escapeHTML(t("actions.arrow"))}</span></a>`;
  renderInto(
    root,
    `
    <div class="container container--narrow">
      <div class="section-head">${sectionHead("articles-title", t("home.kickers.articles"), t("home.sections.articles"))}${viewAll}</div>
      <div class="article-list">${items}</div>
    </div>
    `
  );
}

function renderContact() {
  const lang = currentLang();
  const profile = getProfile();
  const items = (profile.social ?? [])
    .map(
      (item) => `
      <a class="contact-item" href="${escapeHTML(item.url)}">
        <span class="contact-item__label">${escapeHTML(t(`contact.direct.${item.type}`))}</span>
        <span class="contact-item__value">${escapeHTML(item.handle ?? item.url)}</span>
      </a>`
    )
    .join("");
  renderInto(
    $("#contact-home"),
    `
    <div class="container container--narrow">
      <div class="contact-strip">
        <div class="contact-strip__head">
          <p class="section-head__kicker">${escapeHTML(t("home.kickers.contact"))}</p>
          <h2 id="contact-title">${escapeHTML(t("home.sections.contact"))}</h2>
          <p class="contact-strip__lead">${escapeHTML(t("home.contactLead"))}</p>
        </div>
        <div class="contact-strip__grid">${items}</div>
        <div class="contact-strip__actions">
          <a class="btn btn--primary" href="${escapeHTML(localizedHref("contact.html"))}">${escapeHTML(t("home.contactCta"))}</a>
          ${profile.contact?.whatsapp ? `<a class="btn btn--ghost" href="${escapeHTML(profile.contact.whatsapp)}">${escapeHTML(t("home.whatsappCta"))}</a>` : ""}
        </div>
      </div>
    </div>
    `
  );
}

/** Title, description, canonical and Open Graph tags — all from JSON. */
function setPageMeta() {
  const settings = getSettings();
  const lang = currentLang();
  const title = t("seo.defaultTitle");
  const description = t("seo.defaultDescription");
  document.title = title;
  setMeta("name", "description", description);
  setLink("canonical", `${settings.url}/`);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", settings.ogLocales?.[lang] ?? lang);
  setMeta("property", "og:url", `${settings.url}/`);
}

function renderHome() {
  renderHero();
  renderFeatured();
  renderAbout();
  renderArticles();
  renderContact();
}

async function main() {
  try {
    await loadAll();
  } catch (error) {
    console.error("[home] data load failed:", error);
    renderFatal(error.message);
    return;
  }
  initLang();
  initTheme();
  initComponents();
  renderHome();
  setPageMeta();
  startRotatingTitles();
  document.addEventListener("langchange", () => {
    renderHome();
    setPageMeta();
    startRotatingTitles();
  });
}

main();
