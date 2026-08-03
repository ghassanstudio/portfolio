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
  const title = (key) => escapeHTML(about[key] ?? "");
  const list = (items) => (items ?? []).map((item) => `<li>${escapeHTML(item)}</li>`).join("");
  const tech = (about.techCategories ?? [])
    .map(
      (category) => `
        <div class="tech-category">
          <h3>${escapeHTML(category.title ?? "")}</h3>
          <ul>${list(category.items)}</ul>
        </div>`
    )
    .join("");
  const journey = (about.journey ?? [])
    .map(
      (item) => `
        <li><strong>${escapeHTML(item.year ?? "")}</strong><span>${escapeHTML(item.text ?? "")}</span></li>`
    )
    .join("");

  renderInto(
    $("#about-content"),
    `
    <section class="about-section" id="who">
      <h2 class="about-section__title">${title("whoTitle")}</h2>
      <p class="about-section__content">${escapeHTML(about.who ?? "")}</p>
    </section>

    <section class="about-section" id="how">
      <h2 class="about-section__title">${title("howTitle")}</h2>
      <p class="about-section__content">${escapeHTML(about.how ?? "")}</p>
    </section>

    <section class="about-section" id="principles">
      <h2 class="about-section__title">${title("principlesTitle")}</h2>
      <ul class="principles-list">${list(about.principles)}</ul>
    </section>

    <section class="about-section" id="tech">
      <h2 class="about-section__title">${title("technologiesTitle")}</h2>
      <div class="tech-stack">${tech}</div>
    </section>

    <section class="about-section" id="journey">
      <h2 class="about-section__title">${title("journeyTitle")}</h2>
      <ol class="workflow-list">${journey}</ol>
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
