/**
 * blog.js — renders the blog index from data/articles.json.
 * Empty state first, ready for multiple articles later.
 */

import { $, escapeHTML, renderInto, setMeta, setLink } from "./utils.js";
import { loadAll, getSettings, getProfile, getArticles } from "./data.js";
import { t, currentLang, initLang, localizedHref } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initComponents, renderFatal } from "./components.js";

/** Title, description, canonical and Open Graph tags — all from JSON. */
function setPageMeta() {
  const settings = getSettings();
  const lang = currentLang();
  const title = `${t("blog.pageTitle")} — ${getProfile().name?.[lang] ?? ""}`;
  const description = t("blog.pageLead");
  document.title = title;
  setMeta("name", "description", description);
  setLink("canonical", `${settings.url}/blog.html`);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", settings.ogLocales?.[lang] ?? lang);
  setMeta("property", "og:url", `${settings.url}/blog.html`);
}

function renderBlog() {
  const lang = currentLang();
  const articles = getArticles();

  if (!articles.length) {
    renderInto(
      $("#blog-list"),
      `
      <div class="empty-state">
        <p>${escapeHTML(t("blog.empty"))}</p>
      </div>
      `
    );
    return;
  }

  const items = articles
    .map((article) => {
      const id = article.id || article.slug || "";
      const detail = localizedHref(`blog-post.html?id=${encodeURIComponent(id)}`);
      return `
        <article class="blog-post" id="article-${escapeHTML(id)}">
          <h2 class="blog-post__title">
            <a href="${escapeHTML(detail)}">${escapeHTML(article.title?.[lang] ?? "")}</a>
          </h2>
          <div class="blog-post__meta">
            <time datetime="${escapeHTML(article.published ?? article.date ?? "")}">${escapeHTML(article.published ?? article.date ?? "")}</time>
            <span>·</span>
            <span>${escapeHTML(String(article.readTime ?? article.readingMinutes ?? 0))} ${escapeHTML(t("blog.readingTime"))}</span>
          </div>
          <p class="blog-post__summary">${escapeHTML(article.summary?.[lang] ?? "")}</p>
          <a class="read-more" href="${escapeHTML(detail)}">${escapeHTML(t("actions.readMore"))}</a>
        </article>
      `;
    })
    .join("");

  renderInto(
    $("#blog-list"),
    `
    <div class="blog-entries">
      ${items}
    </div>
    `
  );
}

async function main() {
  try {
    await loadAll();
  } catch (error) {
    console.error("[blog] data load failed:", error);
    renderFatal(error.message);
    return;
  }
  initLang();
  initTheme();
  initComponents();
  $("#page-title").textContent = t("blog.pageTitle");
  $(".page-head__lead").textContent = t("blog.pageLead");
  renderBlog();
  setPageMeta();
  document.addEventListener("langchange", () => {
    $("#page-title").textContent = t("blog.pageTitle");
    $(".page-head__lead").textContent = t("blog.pageLead");
    renderBlog();
    setPageMeta();
  });
}

main();
