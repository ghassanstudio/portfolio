/**
 * 404.js — renders the 404 page from data/404.json.
 * Minimal, helpful, and fast — no illustrations or unnecessary animations.
 */

import { $, escapeHTML, renderInto, setMeta, setLink } from "./utils.js";
import { loadAll, getSettings, getProfile, getNotFound } from "./data.js";
import { t, currentLang, initLang, localizedHref } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initComponents, renderFatal } from "./components.js";

/** Title, description, canonical and Open Graph tags — all from JSON. */
function setPageMeta() {
  const settings = getSettings();
  const lang = currentLang();
  const title = `${getNotFound()[lang]?.pageTitle ?? ""} — ${getProfile().name?.[lang] ?? ""}`;
  const description = getNotFound()[lang]?.pageLead ?? "";
  document.title = title;
  setMeta("name", "description", description);
  setLink("canonical", `${settings.url}/404.html`);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", settings.ogLocales?.[lang] ?? lang);
  setMeta("property", "og:url", `${settings.url}/404.html`);
  setMeta("name", "robots", "noindex");
}

function renderNotFound() {
  const lang = currentLang();
  const notFound = getNotFound()[lang] ?? {};

  renderInto(
    $("#not-found-content"),
    `
    <p class="not-found__lead">${escapeHTML(notFound.pageLead ?? "")}</p>
    <div class="not-found-actions">
      <a href="${escapeHTML(localizedHref("index.html"))}" class="btn btn--primary">${escapeHTML(t("actions.backHome"))}</a>
      <a href="${escapeHTML(localizedHref("projects.html"))}" class="btn btn--ghost">${escapeHTML(t("actions.viewProjects"))}</a>
    </div>
    `
  );
}

async function main() {
  try {
    await loadAll();
  } catch (error) {
    console.error("[404] data load failed:", error);
    renderFatal(error.message);
    return;
  }
  initLang();
  initTheme();
  initComponents();
  $("#page-title").textContent = getNotFound()[currentLang()]?.pageTitle ?? "";
  $(".page-head__lead").textContent = getNotFound()[currentLang()]?.pageLead ?? "";
  renderNotFound();
  setPageMeta();
  document.addEventListener("langchange", () => {
    $("#page-title").textContent = getNotFound()[currentLang()]?.pageTitle ?? "";
    $(".page-head__lead").textContent = getNotFound()[currentLang()]?.pageLead ?? "";
    renderNotFound();
    setPageMeta();
  });
}

main();
