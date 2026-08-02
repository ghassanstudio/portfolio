/**
 * blog-post.js — renders an individual blog article.
 * Modular rendering based on article data from data/articles.json.
 */

import { $, escapeHTML, getParam, renderInto, setMeta, setLink } from "./utils.js";
import { loadAll, getSettings, getProfile, getArticle } from "./data.js";
import { t, currentLang, initLang, localizedHref } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initComponents, renderFatal } from "./components.js";

/** Title, description, canonical and Open Graph tags — all from JSON. */
function setPageMeta(article) {
  const settings = getSettings();
  const lang = currentLang();
  const title = article.title?.[lang] ?? "";
  const description = article.summary?.[lang] ?? article.meta?.description?.[lang] ?? "";
  const url = `${settings.url}/blog-post.html?id=${encodeURIComponent(article.slug ?? article.id)}`;
  document.title = title;
  setMeta("name", "description", description);
  setLink("canonical", url);
  setMeta("property", "og:type", "article");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", settings.ogLocales?.[lang] ?? lang);
  setMeta("property", "og:url", url);
}

function renderBlogPost(article) {
  const lang = currentLang();
  const content = article.content?.[lang] ?? article.content ?? "";

  $("#blog-post-title").textContent = article.title?.[lang] ?? "";
  $("#blog-post-published").textContent = article.published ?? "";
  $("#blog-post-published").setAttribute("datetime", article.published ?? "");
  $("#blog-post-read-time").textContent = `${article.readTime ?? article.readingMinutes ?? 0} ${t("blogPost.readingTime")}`;

  renderInto(
    $("#blog-post-content"),
    `
    <article class="blog-post-body">
      <div class="blog-post-content">${escapeHTML(content)}</div>
    </article>
    `
  );
}

async function main() {
  try {
    await loadAll();
  } catch (error) {
    console.error("[blog-post] data load failed:", error);
    renderFatal(error.message);
    return;
  }
  initLang();
  initTheme();
  initComponents();

  const id = getParam("id") ?? getParam("slug");
  const article = id ? getArticle(id) : null;
  if (!article) {
    window.location.href = localizedHref("404.html");
    return;
  }

  renderBlogPost(article);
  setPageMeta(article);
  document.addEventListener("langchange", () => {
    renderBlogPost(article);
    setPageMeta(article);
  });
}

main();
