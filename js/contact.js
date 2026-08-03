/**
 * contact.js — renders the contact page from data/contact.json.
 * No forms — only direct communication channels.
 */

import { $, escapeHTML, renderInto, setMeta, setLink } from "./utils.js";
import { loadAll, getSettings, getProfile, getContact } from "./data.js";
import { t, currentLang, initLang } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initComponents, renderFatal } from "./components.js";

/** Title, description, canonical and Open Graph tags — all from JSON. */
function setPageMeta() {
  const settings = getSettings();
  const lang = currentLang();
  const title = `${t("contact.pageTitle")} — ${getProfile().name?.[lang] ?? ""}`;
  const description = t("contact.pageLead");
  document.title = title;
  setMeta("name", "description", description);
  setLink("canonical", `${settings.url}/contact.html`);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", settings.ogLocales?.[lang] ?? lang);
  setMeta("property", "og:url", `${settings.url}/contact.html`);
}

function renderContact() {
  const lang = currentLang();
  const contact = getContact()[lang] ?? {};
  const social = contact.social ?? {};
  const socialList = Object.values(social)
    .filter((item) => item?.url)
    .map(
      (item) => `
        <li>
          <span class="social-links__name">${escapeHTML(item.label ?? "")}</span>
          <a href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.handle ?? item.url)}</a>
        </li>`
    )
    .join("");

  renderInto(
    $("#contact-content"),
    `
    <section class="contact-info">
      <h2>${escapeHTML(t("contact.direct.title"))}</h2>
      <div class="info-item">
        <span class="info-item__label">${escapeHTML(t("contact.direct.email"))}</span>
        <a class="info-item__value" href="mailto:${escapeHTML(contact.email ?? "")}">${escapeHTML(contact.email ?? "")}</a>
      </div>
      <div class="info-item">
        <span class="info-item__label">${escapeHTML(t("contact.direct.location"))}</span>
        <span class="info-item__value">${escapeHTML(contact.location ?? "")}</span>
      </div>
    </section>

    <section class="social-links">
      <h2>${escapeHTML(contact.socialTitle ?? "")}</h2>
      <ul>${socialList}</ul>
    </section>
    `
  );
}

async function main() {
  try {
    await loadAll();
  } catch (error) {
    console.error("[contact] data load failed:", error);
    renderFatal(error.message);
    return;
  }
  initLang();
  initTheme();
  initComponents();
  $("#page-title").textContent = t("contact.pageTitle");
  $(".page-head__lead").textContent = t("contact.pageLead");
  renderContact();
  setPageMeta();
  document.addEventListener("langchange", () => {
    $("#page-title").textContent = t("contact.pageTitle");
    $(".page-head__lead").textContent = t("contact.pageLead");
    renderContact();
    setPageMeta();
  });
}

main();
