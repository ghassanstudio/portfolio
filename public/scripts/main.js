/**
 * main.js — Page-level orchestrator
 *
 * Imports and initializes only the modules needed for the current page.
 * Each module early-exits if its DOM elements are not present.
 */

import { initNavigation } from "./navigation.js";
import { initScrollReveal } from "./scroll-reveal.js";
import { initTyping } from "./typing.js";
import { initCounters } from "./counters.js";

document.addEventListener("DOMContentLoaded", () => {
  /* Navigation — present on every page */
  initNavigation();

  /* Scroll reveal — present on pages with [data-reveal] elements */
  initScrollReveal();

  /* Typing animation — present on homepage hero */
  initTyping();

  /* Stat counters — present on pages with [data-count-to] elements */
  initCounters();
});
