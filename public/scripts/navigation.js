/**
 * navigation.js — Navbar behavior module
 *
 * Handles:
 *   1. Scroll-based navbar background (opaque after 50px)
 *   2. Active section highlighting via IntersectionObserver
 *   3. Mobile menu open/close with focus trap + focus restore
 *   4. Back-to-top button visibility
 *   5. Smooth scroll for anchor links (respects fixed navbar height)
 *   6. Screen reader live region announcements
 *
 * RTL/LTR: IntersectionObserver is direction-agnostic. Scroll offsets
 * use CSS scroll-margin-top on sections (set in CSS) so manual
 * JS offset calculation is unnecessary.
 */

/* ─── DOM references ─── */
let navbar: HTMLElement | null = null;
let mobileMenu: HTMLElement | null = null;
let mobileOverlay: HTMLElement | null = null;
let toggleBtn: HTMLButtonElement | null = null;
let backToTopBtn: HTMLElement | null = null;
let navLinks: NodeListOf<HTMLElement> = [];
let mobileLinks: NodeListOf<HTMLElement> = [];
let liveRegion: HTMLElement | null = null;
let focusableInsideMenu: HTMLElement[] = [];

/* ─── State ─── */
let menuOpen = false;
let scrollTicking = false;

/* ─── Constants ─── */
const SCROLL_THRESHOLD = 50;
const BACK_TO_TOP_THRESHOLD = 400;

/* ═══════════════════════════════════════════════════════════
   0. Screen reader announcements
   ═══════════════════════════════════════════════════════════ */

function announce(message: string) {
  if (!liveRegion) return;
  liveRegion.textContent = "";
  /* Force reflow so screen readers pick up the change */
  requestAnimationFrame(() => {
    liveRegion!.textContent = message;
  });
}

/* ═══════════════════════════════════════════════════════════
   1. Scroll — Navbar background + back-to-top
      Throttled via rAF to minimize repaint/reflow.
   ═══════════════════════════════════════════════════════════ */

function onScroll() {
  if (scrollTicking) return;
  scrollTicking = true;

  requestAnimationFrame(() => {
    const y = window.scrollY;

    if (navbar) {
      navbar.classList.toggle("navbar--scrolled", y > SCROLL_THRESHOLD);
    }

    if (backToTopBtn) {
      backToTopBtn.classList.toggle("back-to-top--visible", y > BACK_TO_TOP_THRESHOLD);
    }

    scrollTicking = false;
  });
}

/* ═══════════════════════════════════════════════════════════
   2. Active section tracking
      IntersectionObserver is direction-agnostic — works in
      both RTL and LTR without any offset adjustment.
      Sections use CSS scroll-margin-top for navbar offset.
   ═══════════════════════════════════════════════════════════ */

let sectionObserver: IntersectionObserver | null = null;

function initActiveSection() {
  const sections = document.querySelectorAll<HTMLElement>("[data-section]");
  if (sections.length === 0) return;

  sectionObserver = new IntersectionObserver(
    (entries) => {
      /* Find the most visible intersecting entry */
      let bestEntry: IntersectionObserverEntry | null = null;
      let bestRatio = 0;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
          bestRatio = entry.intersectionRatio;
          bestEntry = entry;
        }
      });

      if (bestEntry) {
        const id = bestEntry.target.getAttribute("data-section");
        navLinks.forEach((link) => {
          link.classList.toggle("navbar__link--active", link.dataset.section === id);
        });
      }
    },
    {
      /* Top 20% to bottom 60% of viewport — accounts for fixed navbar */
      rootMargin: "-80px 0px -40% 0px",
      threshold: [0, 0.25, 0.5],
    }
  );

  sections.forEach((s) => sectionObserver!.observe(s));
}

/* ═══════════════════════════════════════════════════════════
   3. Mobile menu — open / close / focus trap / focus restore
   ═══════════════════════════════════════════════════════════ */

function openMenu() {
  menuOpen = true;
  mobileMenu?.setAttribute("aria-hidden", "false");
  mobileOverlay?.setAttribute("aria-hidden", "false");
  toggleBtn?.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";

  /* Build focus trap list */
  focusableInsideMenu = mobileMenu
    ? Array.from(
        mobileMenu.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
    : [];

  if (focusableInsideMenu.length > 0) {
    focusableInsideMenu[0].focus();
  }

  announce("Menu opened");
}

function closeMenu() {
  menuOpen = false;
  mobileMenu?.setAttribute("aria-hidden", "true");
  mobileOverlay?.setAttribute("aria-hidden", "true");
  toggleBtn?.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";

  /* Restore focus to hamburger button (accessibility requirement) */
  toggleBtn?.focus();

  announce("Menu closed");
}

function toggleMenu() {
  menuOpen ? closeMenu() : openMenu();
}

function handleMenuKeydown(e: KeyboardEvent) {
  if (!menuOpen) return;

  /* Close on Escape */
  if (e.key === "Escape") {
    closeMenu();
    return;
  }

  /* Trap focus with Tab */
  if (e.key === "Tab" && focusableInsideMenu.length > 0) {
    const first = focusableInsideMenu[0];
    const last = focusableInsideMenu[focusableInsideMenu.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   4. Smooth scroll — accounts for fixed navbar height
   ═══════════════════════════════════════════════════════════ */

function initSmoothScroll() {
  document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href) return;

      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;

      const hash = href.slice(hashIndex);
      const target = document.querySelector<HTMLElement>(hash);

      if (target) {
        e.preventDefault();

        /* Calculate offset for fixed navbar using scroll-margin-top
           or fallback to CSS variable --header-height */
        const navbarHeight = navbar
          ? navbar.offsetHeight
          : parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 80;

        const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

        window.scrollTo({ top: targetTop, behavior: "smooth" });

        /* Update URL hash without jumping */
        if (history.pushState) {
          history.pushState(null, "", hash);
        }

        /* Close mobile menu if open */
        if (menuOpen) closeMenu();
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   5. Theme toggle — light / dark with localStorage
   ═══════════════════════════════════════════════════════════ */

function initThemeToggle() {
  const themeToggleBtn = document.querySelector<HTMLElement>("[data-theme-toggle]");
  if (!themeToggleBtn) return;

  function getTheme(): string {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function setTheme(theme: string) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    const label = theme === "dark"
      ? (document.documentElement.lang === "ar" ? "تبديل إلى الفاتح" : "Switch to light mode")
      : (document.documentElement.lang === "ar" ? "تبديل إلى الداكن" : "Switch to dark mode");
    themeToggleBtn!.setAttribute("aria-label", label);
  }

  themeToggleBtn.addEventListener("click", () => {
    setTheme(getTheme() === "dark" ? "light" : "dark");
  });

  /* Respect system preference changes in real time */
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      setTheme(e.matches ? "light" : "dark");
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   6. Initialize
   ═══════════════════════════════════════════════════════════ */

export function initNavigation() {
  navbar = document.querySelector(".navbar");
  mobileMenu = document.querySelector("[data-mobile-menu]");
  mobileOverlay = document.querySelector("[data-mobile-overlay]");
  toggleBtn = document.querySelector("[data-menu-toggle]");
  backToTopBtn = document.querySelector("[data-back-to-top]");
  navLinks = document.querySelectorAll(".navbar__link");
  mobileLinks = document.querySelectorAll("[data-mobile-link]");

  /* Create live region for screen reader announcements */
  liveRegion = document.createElement("div");
  liveRegion.setAttribute("role", "status");
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("aria-atomic", "true");
  liveRegion.className = "sr-only";
  document.body.appendChild(liveRegion);

  /* Scroll listener (passive + rAF throttled for performance) */
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  toggleBtn?.addEventListener("click", toggleMenu);
  mobileOverlay?.addEventListener("click", closeMenu);
  document.addEventListener("keydown", handleMenuKeydown);

  /* Close menu on mobile link click */
  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  /* Back to top */
  backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* Active section tracking */
  initActiveSection();

  /* Smooth scroll */
  initSmoothScroll();

  /* Theme toggle */
  initThemeToggle();
}
