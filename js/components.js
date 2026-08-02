/**
 * components.js — shared chrome for every page: header, navigation, mobile
 * menu, language and theme toggles, footer. Rendered once from the data
 * files and re-rendered when the language changes. No page duplicates this
 * markup; every page calls initComponents().
 */

import { $, $$, escapeHTML, renderInto } from "./utils.js";
import { getSettings, getProfile } from "./data.js";
import { t, currentLang, setLang, localizedHref } from "./i18n.js";
import { currentTheme, toggleTheme } from "./theme.js";

/** Inline icons — hand-written SVG, no icon library. */
const ICONS = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
};

const pageName = () => window.location.pathname.split("/").pop() || "index.html";

/** Whether a nav item refers to the page currently open. */
function isActive(href) {
  const page = pageName();
  switch (href) {
    case "index.html":
      return page === "index.html";
    case "projects.html":
      return page === "projects.html" || page === "project.html";
    case "blog.html":
      return page === "blog.html" || page === "blog-post.html";
    default:
      return page === href;
  }
}

/**
 * On the home page the four content sections live on the same page, so the
 * nav links scroll to them instead of opening their own page. Everywhere
 * else the same links navigate to the matching page as before.
 */
const HOME_ANCHORS = {
  "projects.html": "#featured",
  "about.html": "#about-home",
  "blog.html": "#articles-home",
  "contact.html": "#contact-home",
};

function navHref(item) {
  if (pageName() === "index.html" && HOME_ANCHORS[item.href]) return HOME_ANCHORS[item.href];
  return item.href;
}

function navItems() {
  return getSettings().nav.map((item) => ({
    href: item.href,
    label: t(item.labelKey),
    current: isActive(item.href),
  }));
}

function themeIcon() {
  return currentTheme() === "dark" ? ICONS.moon : ICONS.sun;
}

function otherLanguage() {
  const langs = getSettings().langs ?? ["ar", "en"];
  return langs[(langs.indexOf(currentLang()) + 1) % langs.length] ?? "en";
}

function renderHeader() {
  const lang = currentLang();
  const profile = getProfile();
  const name = escapeHTML(profile.name?.[lang] ?? "");
  const desktopNav = navItems()
    .map(
      (item) =>
        `<li><a class="nav-link" href="${escapeHTML(localizedHref(navHref(item)))}"${item.current ? ' aria-current="page"' : ""}>${escapeHTML(item.label)}</a></li>`
    )
    .join("");
  const mobileNav = navItems()
    .map(
      (item) =>
        `<li><a href="${escapeHTML(localizedHref(navHref(item)))}"${item.current ? ' aria-current="page"' : ""}>${escapeHTML(item.label)}</a></li>`
    )
    .join("");

  renderInto(
    $("#site-header"),
    `
    <div class="container site-header__inner">
      <a class="logo" href="${escapeHTML(localizedHref("index.html"))}" aria-label="${t("aria.siteName")} ${name}">
        <span class="logo__mark" aria-hidden="true">${escapeHTML(profile.initials ?? "G")}</span>
        <span class="logo__name">${name}</span>
      </a>
      <nav class="site-nav" aria-label="${escapeHTML(t("aria.mainNav"))}">
        <ul>${desktopNav}</ul>
      </nav>
      <div class="header-actions">
        <button type="button" class="lang-btn" data-lang-toggle aria-label="${escapeHTML(t("aria.toggleLang"))}">${escapeHTML(t("langToggle"))}</button>
        <button type="button" class="icon-btn" data-theme-toggle aria-label="${escapeHTML(t("aria.toggleTheme"))}" title="${escapeHTML(t("aria.toggleTheme"))}">${themeIcon()}</button>
        <button type="button" class="icon-btn nav-toggle" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu" aria-label="${escapeHTML(t("aria.openMenu"))}">${ICONS.menu}</button>
      </div>
    </div>
    <div class="mobile-menu" id="mobile-menu" data-mobile-menu aria-hidden="true">
      <div class="mobile-menu__head">
        <span class="mobile-menu__title">${name}</span>
        <button type="button" class="icon-btn" data-menu-close aria-label="${escapeHTML(t("aria.closeMenu"))}">${ICONS.close}</button>
      </div>
      <nav class="mobile-menu__nav" aria-label="${escapeHTML(t("aria.mainNav"))}">
        <ul>${mobileNav}</ul>
      </nav>
    </div>
    `
  );
}

function renderFooter() {
  const lang = currentLang();
  const profile = getProfile();
  const settings = getSettings();
  const name = escapeHTML(profile.name?.[lang] ?? "");
  const year = new Date().getFullYear();

  const quickLinks = (settings.footer?.quickLinks ?? [])
    .map((href) => {
      const item = settings.nav.find((entry) => entry.href === href);
      return item
        ? `<li><a href="${escapeHTML(localizedHref(href))}">${escapeHTML(t(item.labelKey))}</a></li>`
        : "";
    })
    .join("");

  const legalLinks = (settings.footer?.legal ?? [])
    .map((href) => {
      const key = `nav.${href.replace(".html", "")}`;
      return `<li><a href="${escapeHTML(localizedHref(href))}">${escapeHTML(t(key))}</a></li>`;
    })
    .join("");

  const social = (profile.social ?? [])
    .map(
      (item) =>
        `<li><a href="${escapeHTML(item.url)}">${escapeHTML(t(`contact.direct.${item.type}`))} — ${escapeHTML(item.handle)}</a></li>`
    )
    .join("");

  renderInto(
    $("#site-footer"),
    `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="logo" href="${escapeHTML(localizedHref("index.html"))}">
            <span class="logo__mark" aria-hidden="true">${escapeHTML(profile.initials ?? "G")}</span>
            <span class="logo__name">${name}</span>
          </a>
          <p class="footer-brand__tagline">${escapeHTML(t("footer.tagline"))}</p>
        </div>
        <nav class="footer-links" aria-label="${escapeHTML(t("footer.quickLinks"))}">
          <h2 class="footer-title">${escapeHTML(t("footer.quickLinks"))}</h2>
          <ul>${quickLinks}${legalLinks}</ul>
        </nav>
        <div class="footer-contact">
          <h2 class="footer-title">${escapeHTML(t("footer.contact"))}</h2>
          <ul class="footer-contact__list">${social}</ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© ${year} ${name}. ${escapeHTML(t("footer.rights"))}</p>
        <p class="footer-bottom__built">${escapeHTML(t("footer.builtWith"))}</p>
      </div>
    </div>
    `
  );
}

function refreshThemeIcon() {
  const button = $("[data-theme-toggle]");
  if (button) button.innerHTML = themeIcon();
}

/** Sync static elements carrying a data-i18n key (e.g. the skip link). */
function syncStaticText() {
  $$("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.title = t("seo.defaultTitle");
}

function switchLanguage() {
  setLang(otherLanguage());
}

function menuIsOpen() {
  return $("#mobile-menu")?.classList.contains("is-open") ?? false;
}

function setMenu(open) {
  const menu = $("#mobile-menu");
  const button = $("[data-menu-toggle]");
  if (!menu) return;
  menu.classList.toggle("is-open", open);
  menu.setAttribute("aria-hidden", String(!open));
  if (button) button.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("nav-open", open);
  const target = open ? $("[data-menu-close]", menu) : button;
  target?.focus();
}

/** Shared failure state: shown when the JSON data cannot be loaded. */
export function renderFatal(message) {
  const main = $("#main");
  if (!main) return;
  renderInto(main, `<p class="fatal-note">تعذّر تحميل المحتوى — افتح الموقع عبر HTTP(S) وليس من الملفات المحلية.<br>Content failed to load — serve the site over HTTP(S).<br><code>${escapeHTML(message)}</code></p>`);
}

function renderChrome() {
  renderHeader();
  renderFooter();
  syncStaticText();
  refreshThemeIcon();
  document.body.classList.remove("nav-open");
}

function wireEvents() {
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-theme-toggle]")) {
      toggleTheme();
      refreshThemeIcon();
    } else if (event.target.closest("[data-lang-toggle]")) {
      switchLanguage();
    } else if (event.target.closest("[data-menu-toggle]")) {
      setMenu(!menuIsOpen());
    } else if (event.target.closest("[data-menu-close]")) {
      setMenu(false);
    } else if (event.target.closest(".mobile-menu a")) {
      setMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuIsOpen()) setMenu(false);
  });

  document.addEventListener("langchange", renderChrome);
  document.addEventListener("themechange", refreshThemeIcon);
}

export function initComponents() {
  renderChrome();
  wireEvents();
}
