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
  setJsonLd(article, lang, url);
}

/** Structured data for search engines — rebuilt from the same JSON source. */
function setJsonLd(article, lang, url) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title?.[lang],
    description: article.summary?.[lang] ?? article.meta?.description?.[lang],
    author: { "@type": "Person", name: getProfile().name?.[lang] },
    inLanguage: lang,
    datePublished: article.published ?? article.date,
    mainEntityOfPage: url,
  };
  let script = document.getElementById("ld-json");
  if (!script) {
    script = document.createElement("script");
    script.id = "ld-json";
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

/** Render a block of the article model: p, h2/h3, ul, code, quote. */
function renderBlocks(blocks, lang) {
  return (blocks ?? [])
    .map((block) => {
      switch (block.type) {
        case "p":
          return `<p class="doc-block">${escapeHTML(block.text?.[lang] ?? "")}</p>`;
        case "h2":
          return `<h2 class="blog-post-heading">${escapeHTML(block.text?.[lang] ?? "")}</h2>`;
        case "h3":
          return `<h3 class="blog-post-heading">${escapeHTML(block.text?.[lang] ?? "")}</h3>`;
        case "ul":
          return `<ul class="doc-list">${(block.items ?? [])
            .map((item) => `<li>${escapeHTML(typeof item === "string" ? item : item?.[lang] ?? "")}</li>`)
            .join("")}</ul>`;
        case "code":
          return `<pre class="doc-code"><code>${escapeHTML(block.code ?? "")}</code></pre>`;
        case "quote":
          return `<blockquote class="doc-quote">${escapeHTML(block.text?.[lang] ?? "")}</blockquote>`;
        default:
          return "";
      }
    })
    .join("");
}

function renderBlogPost(article) {
  const lang = currentLang();
  const published = article.published ?? article.date ?? "";

  $("#blog-post-title").textContent = article.title?.[lang] ?? "";
  $("#blog-post-published").textContent = published;
  $("#blog-post-published").setAttribute("datetime", published);
  $("#blog-post-read-time").textContent = `${article.readTime ?? article.readingMinutes ?? 0} ${t("blogPost.readingTime")}`;

  renderInto(
    $("#blog-post-content"),
    `
    <article class="blog-post-body">
      <div class="blog-post-content">${renderBlocks(article.body?.[lang], lang)}</div>
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
