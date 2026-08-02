/**
 * privacy.js — renders the privacy policy page from data/privacy.json.
 * Professional and minimal, focused on legal compliance.
 */

import { $, escapeHTML, renderInto, setMeta, setLink } from "./utils.js";
import { loadAll, getSettings, getProfile, getPrivacy } from "./data.js";
import { t, currentLang, initLang } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initComponents, renderFatal } from "./components.js";

/** Title, description, canonical and Open Graph tags — all from JSON. */
function setPageMeta() {
  const settings = getSettings();
  const lang = currentLang();
  const title = `${t("privacy.pageTitle")} — ${getProfile().name?.[lang] ?? ""}`;
  const description = t("privacy.pageLead");
  document.title = title;
  setMeta("name", "description", description);
  setLink("canonical", `${settings.url}/privacy.html`);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", settings.ogLocales?.[lang] ?? lang);
  setMeta("property", "og:url", `${settings.url}/privacy.html`);
}

function renderPrivacy() {
  const lang = currentLang();
  const privacy = getPrivacy()[lang] ?? {};

  renderInto(
    $("#legal-content"),
    `
    <section class="legal-section">
      <h2>${escapeHTML(t("privacy.pageTitle"))}</h2>
      <p>${escapeHTML(privacy.pageLead ?? "")}</p>
    </section>
    `
  );
}

async function main() {
  try {
    await loadAll();
  } catch (error) {
    console.error("[privacy] data load failed:", error);
    renderFatal(error.message);
    return;
  }
  initLang();
  initTheme();
  initComponents();
  $("#page-title").textContent = t("privacy.pageTitle");
  $(".page-head__lead").textContent = t("privacy.pageLead");
  renderPrivacy();
  setPageMeta();
  document.addEventListener("langchange", () => {
    $("#page-title").textContent = t("privacy.pageTitle");
    $(".page-head__lead").textContent = t("privacy.pageLead");
    renderPrivacy();
    setPageMeta();
  });
}

main();
