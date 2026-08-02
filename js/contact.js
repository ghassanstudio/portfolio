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
  const row = (label, href, handle) =>
    href
      ? `<li>
          <strong>${escapeHTML(label)}:</strong>
          <a href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(handle ?? href)}</a>
        </li>`
      : "";

  renderInto(
    $("#contact-content"),
    `
    <section class="contact-info">
      <h2>${escapeHTML(t("contact.direct.title"))}</h2>
      <div class="info-item">
        <strong>${escapeHTML(t("contact.direct.email"))}:</strong>
        <a href="mailto:${escapeHTML(contact.email ?? "")}">${escapeHTML(contact.email ?? "")}</a>
      </div>
      <div class="info-item">
        <strong>${escapeHTML(t("contact.direct.location"))}:</strong>
        ${escapeHTML(contact.location ?? "")}
      </div>
    </section>

    <section class="social-links">
      <h2>Social networks</h2>
      <ul>
        ${row("GitHub", social.github?.url, social.github?.handle)}
        ${row("LinkedIn", social.linkedin?.url, social.linkedin?.handle)}
        ${row("WhatsApp", social.whatsapp?.url, social.whatsapp?.handle)}
      </ul>
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
