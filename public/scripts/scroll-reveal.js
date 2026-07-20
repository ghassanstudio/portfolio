/**
 * scroll-reveal.js — IntersectionObserver-based scroll animations
 *
 * Watches all elements with [data-reveal] and adds .revealed
 * when they enter the viewport. Supports staggered delays
 * via data-reveal-delay="100|200|300|...".
 *
 * No external libraries. Pure vanilla JS.
 */

const REVEAL_SELECTOR = "[data-reveal]";
const REVEAL_CLASS = "revealed";
const DELAY_ATTR = "data-reveal-delay";

/**
 * Creates and returns an IntersectionObserver that reveals
 * elements as they scroll into view.
 */
export function initScrollReveal() {
  const elements = document.querySelectorAll(REVEAL_SELECTOR);

  if (elements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.getAttribute(DELAY_ATTR);

          if (delay) {
            setTimeout(() => {
              el.classList.add(REVEAL_CLASS);
            }, parseInt(delay, 10));
          } else {
            el.classList.add(REVEAL_CLASS);
          }

          observer.unobserve(el);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  elements.forEach((el) => observer.observe(el));
}
