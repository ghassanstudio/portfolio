/**
 * technologies.js — renders the technologies page from data/technologies.json.
 * Categories only: programming languages, platforms, tools, and databases.
 * No skill levels, no percentages — just the technologies actually used.
 */

import { $, escapeHTML, renderInto, setMeta, setLink } from "./utils.js";
import { loadAll, getSettings, getProfile, getTechnologies } from "./data.js";
import { t, currentLang, initLang } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initComponents, renderFatal } from "./components.js";

/** Title, description, canonical and Open Graph tags — all from JSON. */
function setPageMeta() {
  const settings = getSettings();
  const lang = currentLang();
  const title = `${t("technologies.pageTitle")} — ${getProfile().name?.[lang] ?? ""}`;
  const description = t("technologies.pageLead");
  document.title = title;
  setMeta("name", "description", description);
  setLink("canonical", `${settings.url}/technologies.html`);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", settings.ogLocales?.[lang] ?? lang);
  setMeta("property", "og:url", `${settings.url}/technologies.html`);
}

function renderTechnologies() {
  const lang = currentLang();
  const data = getTechnologies()?.[lang] ?? {};
  const categories = (data.categories ?? [])
    .map(
      (category, index) => `
      <section class="tech-category" aria-labelledby="tech-category-${index}">
        <h3 id="tech-category-${index}">${escapeHTML(category.title ?? "")}</h3>
        <ul>${(category.items ?? []).map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
      </section>`
    )
    .join("");

  renderInto($("#tech-content"), categories);
}

async function main() {
  try {
    await loadAll();
  } catch (error) {
    console.error("[technologies] data load failed:", error);
    renderFatal(error.message);
    return;
  }
  initLang();
  initTheme();
  initComponents();
  $("#page-title").textContent = t("technologies.pageTitle");
  $(".page-head__lead").textContent = t("technologies.pageLead");
  renderTechnologies();
  setPageMeta();
  document.addEventListener("langchange", () => {
    $("#page-title").textContent = t("technologies.pageTitle");
    $(".page-head__lead").textContent = t("technologies.pageLead");
    renderTechnologies();
    setPageMeta();
  });
}

main();
