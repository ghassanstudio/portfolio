/**
 * faq.js — renders the FAQ page from data/faq.json.
 * Questions are presented in a clean, accessible format with proper
 * heading hierarchy.
 */

import { $, escapeHTML, renderInto, setMeta, setLink } from "./utils.js";
import { loadAll, getSettings, getProfile, get } from "./data.js";
import { t, currentLang, initLang } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initComponents, renderFatal } from "./components.js";

/** Title, description, canonical and Open Graph tags — all from JSON. */
function setPageMeta() {
  const settings = getSettings();
  const lang = currentLang();
  const title = `${t("faq.pageTitle")} — ${getProfile().name?.[lang] ?? ""}`;
  const description = t("faq.pageLead");
  document.title = title;
  setMeta("name", "description", description);
  setLink("canonical", `${settings.url}/faq.html`);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", settings.ogLocales?.[lang] ?? lang);
  setMeta("property", "og:url", `${settings.url}/faq.html`);
}

function renderFAQ() {
  const lang = currentLang();
  const questions = get("faq")?.[lang]?.questions ?? [];

  if (!questions.length) {
    renderInto(
      $("#faq-list"),
      `
      <div class="empty-state">
        <p>${escapeHTML(t("faq.noResults"))}</p>
      </div>
      `
    );
    return;
  }

  const items = questions
    .map((q) => {
      const id = q.id || "";
      return `
        <div class="faq-item" id="faq-${escapeHTML(id)}">
          <h3 class="faq-question" id="q-${escapeHTML(id)}">${escapeHTML(q.question ?? "")}</h3>
          <div class="faq-answer" aria-labelledby="q-${escapeHTML(id)}">
            <p>${escapeHTML(q.answer ?? "")}</p>
          </div>
        </div>
      `;
    })
    .join("");

  renderInto(
    $("#faq-list"),
    `
    <div class="faq-grid">
      ${items}
    </div>
    `
  );
}

async function main() {
  try {
    await loadAll();
  } catch (error) {
    console.error("[faq] data load failed:", error);
    renderFatal(error.message);
    return;
  }
  initLang();
  initTheme();
  initComponents();
  $("#page-title").textContent = t("faq.pageTitle");
  $(".page-head__lead").textContent = t("faq.pageLead");
  renderFAQ();
  setPageMeta();
  document.addEventListener("langchange", () => {
    $("#page-title").textContent = t("faq.pageTitle");
    $(".page-head__lead").textContent = t("faq.pageLead");
    renderFAQ();
    setPageMeta();
  });
}

main();
