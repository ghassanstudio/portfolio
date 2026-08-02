/**
 * terms.js — renders the terms of use page from data/terms.json.
 * Professional and minimal, focused on legal compliance.
 */

import { $, escapeHTML, renderInto, setMeta, setLink } from "./utils.js";
import { loadAll, getSettings, getProfile, getTerms } from "./data.js";
import { t, currentLang, initLang } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initComponents, renderFatal } from "./components.js";

/** Title, description, canonical and Open Graph tags — all from JSON. */
function setPageMeta() {
  const settings = getSettings();
  const lang = currentLang();
  const title = `${t("terms.pageTitle")} — ${getProfile().name?.[lang] ?? ""}`;
  const description = t("terms.pageLead");
  document.title = title;
  setMeta("name", "description", description);
  setLink("canonical", `${settings.url}/terms.html`);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", settings.ogLocales?.[lang] ?? lang);
  setMeta("property", "og:url", `${settings.url}/terms.html`);
}

function renderTerms() {
  const lang = currentLang();
  const terms = getTerms()[lang] ?? {};

  renderInto(
    $("#legal-content"),
    `
    <section class="legal-section">
      <h2>${escapeHTML(t("terms.pageTitle"))}</h2>
      <p>${escapeHTML(terms.pageLead ?? "")}</p>
    </section>
    `
  );
}

async function main() {
  try {
    await loadAll();
  } catch (error) {
    console.error("[terms] data load failed:", error);
    renderFatal(error.message);
    return;
  }
  initLang();
  initTheme();
  initComponents();
  $("#page-title").textContent = t("terms.pageTitle");
  $(".page-head__lead").textContent = t("terms.pageLead");
  renderTerms();
  setPageMeta();
  document.addEventListener("langchange", () => {
    $("#page-title").textContent = t("terms.pageTitle");
    $(".page-head__lead").textContent = t("terms.pageLead");
    renderTerms();
    setPageMeta();
  });
}

main();
