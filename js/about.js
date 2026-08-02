/**
 * about.js — renders the about page from data/about.json.
 * Presents an engineering profile, not a marketing bio. All content
 * comes from the JSON data files; nothing is hardcoded here.
 */

import { $, escapeHTML, renderInto, setMeta, setLink } from "./utils.js";
import { loadAll, getSettings, getProfile, getAbout } from "./data.js";
import { t, currentLang, initLang } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initComponents, renderFatal } from "./components.js";

/** Title, description, canonical and Open Graph tags — all from JSON. */
function setPageMeta() {
  const settings = getSettings();
  const lang = currentLang();
  const title = `${t("about.pageTitle")} — ${getProfile().name?.[lang] ?? ""}`;
  const description = t("about.pageLead");
  document.title = title;
  setMeta("name", "description", description);
  setLink("canonical", `${settings.url}/about.html`);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", settings.ogLocales?.[lang] ?? lang);
  setMeta("property", "og:url", `${settings.url}/about.html`);
}

function renderAbout() {
  const lang = currentLang();
  const about = getAbout()[lang] ?? {};
  const list = (items) => (items ?? []).map((item) => `<li>${escapeHTML(item)}</li>`).join("");
  const tech = about.technologies ?? {};

  renderInto(
    $("#about-content"),
    `
    <section class="about-section" id="who">
      <h2 class="about-section__title">Who I am</h2>
      <p class="about-section__content">${escapeHTML(about.who ?? "")}</p>
    </section>

    <section class="about-section" id="how">
      <h2 class="about-section__title">How I think</h2>
      <p class="about-section__content">${escapeHTML(about.how ?? "")}</p>
    </section>

    <section class="about-section" id="principles">
      <h2 class="about-section__title">Engineering Principles</h2>
      <ul class="principles-list">${list(about.principles)}</ul>
    </section>

    <section class="about-section" id="philosophy">
      <h2 class="about-section__title">Working Philosophy</h2>
      <p class="about-section__content">${escapeHTML(about.philosophy ?? "")}</p>
    </section>

    <section class="about-section" id="tech">
      <h2 class="about-section__title">Technologies I Actually Use</h2>
      <div class="tech-stack">
        <div class="tech-category">
          <h3>Frontend</h3>
          <ul>${list(tech.frontend)}</ul>
        </div>
        <div class="tech-category">
          <h3>Tools</h3>
          <ul>${list(tech.tools)}</ul>
        </div>
        <div class="tech-category">
          <h3>Platforms</h3>
          <ul>${list(tech.platforms)}</ul>
        </div>
      </div>
    </section>

    <section class="about-section" id="workflow">
      <h2 class="about-section__title">Development Workflow</h2>
      <ul class="workflow-list">${list(about.workflow)}</ul>
    </section>

    <section class="about-section" id="why-complexity">
      <h2 class="about-section__title">Why I Avoid Unnecessary Complexity</h2>
      <p class="about-section__content">${escapeHTML(about.whyAvoidComplexity ?? "")}</p>
    </section>

    <section class="about-section" id="learning">
      <h2 class="about-section__title">Currently Learning</h2>
      <p class="about-section__content">${escapeHTML(about.learning ?? "")}</p>
    </section>
    `
  );
}

async function main() {
  try {
    await loadAll();
  } catch (error) {
    console.error("[about] data load failed:", error);
    renderFatal(error.message);
    return;
  }
  initLang();
  initTheme();
  initComponents();
  $("#page-title").textContent = t("about.pageTitle");
  $(".page-head__lead").textContent = t("about.pageLead");
  renderAbout();
  setPageMeta();
  document.addEventListener("langchange", () => {
    $("#page-title").textContent = t("about.pageTitle");
    $(".page-head__lead").textContent = t("about.pageLead");
    renderAbout();
    setPageMeta();
  });
}

main();
