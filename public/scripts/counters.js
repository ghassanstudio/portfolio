/**
 * counters.js — Animated stat counters
 *
 * Counts up from 0 to target value when element enters viewport.
 * Fires once per element. Respects prefers-reduced-motion
 * (shows final value immediately, no animation).
 */

import { prefersReducedMotion } from "./utils.js";

function animateCount(el: HTMLElement, target: number, suffix: string, duration: number) {
  const start = performance.now();

  function update(now: number) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);

    /* Ease out cubic */
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

export function initCounters() {
  const elements = document.querySelectorAll<HTMLElement>("[data-count-to]");
  if (elements.length === 0) return;

  if (prefersReducedMotion) {
    /* Show final values immediately */
    elements.forEach((el) => {
      const target = parseInt(el.getAttribute("data-count-to") || "0", 10);
      const suffix = el.getAttribute("data-count-suffix") || "";
      el.textContent = target + suffix;
    });
    return;
  }

  /* Use IntersectionObserver to trigger once */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target as HTMLElement;
        const target = parseInt(el.getAttribute("data-count-to") || "0", 10);
        const suffix = el.getAttribute("data-count-suffix") || "";

        animateCount(el, target, suffix, 1500);
        observer.unobserve(el);
      });
    },
    { threshold: 0.3 }
  );

  elements.forEach((el) => observer.observe(el));
}
