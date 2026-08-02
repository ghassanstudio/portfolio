/**
 * offline.js — renders the offline page from data/offline.json.
 * Very lightweight, explains offline unavailability.
 */

import { $, escapeHTML, renderInto, setMeta, setLink } from "./utils.js";
import { loadAll, getSettings, getProfile, getOffline } from "./data.js";
import { t, currentLang, initLang, localizedHref } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initComponents, renderFatal } from "./components.js";

/** Title, description, canonical and Open Graph tags — all from JSON. */
function setPageMeta() {
  const settings = getSettings();
  const lang = currentLang();
  const title = `${getOffline()[lang]?.pageTitle ?? ""} — ${getProfile().name?.[lang] ?? ""}`;
  const description = getOffline()[lang]?.pageLead ?? "";
  document.title = title;
  setMeta("name", "description", description);
  setLink("canonical", `${settings.url}/offline.html`);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", settings.ogLocales?.[lang] ?? lang);
  setMeta("property", "og:url", `${settings.url}/offline.html`);
}

function renderOffline() {
  const lang = currentLang();
  const offline = getOffline()[lang] ?? {};

  renderInto(
    $("#offline-content"),
    `
    <p class="offline-page__lead">${escapeHTML(offline.pageLead ?? "")}</p>
    <div class="offline-content">
      <section>
        <h2>${escapeHTML(t("offline.title"))}</h2>
        <p>${escapeHTML(t("offline.message"))}</p>
      </section>
    </div>
    <a href="${escapeHTML(localizedHref("index.html"))}" class="btn btn--primary">${escapeHTML(t("actions.backHome"))}</a>
    `
  );
}

async function main() {
  try {
    await loadAll();
  } catch (error) {
    console.error("[offline] data load failed:", error);
    renderFatal(error.message);
    return;
  }
  initLang();
  initTheme();
  initComponents();
  $("#page-title").textContent = getOffline()[currentLang()]?.pageTitle ?? "";
  $(".page-head__lead").textContent = getOffline()[currentLang()]?.pageLead ?? "";
  renderOffline();
  setPageMeta();
  document.addEventListener("langchange", () => {
    $("#page-title").textContent = getOffline()[currentLang()]?.pageTitle ?? "";
    $(".page-head__lead").textContent = getOffline()[currentLang()]?.pageLead ?? "";
    renderOffline();
    setPageMeta();
  });
}

main();
