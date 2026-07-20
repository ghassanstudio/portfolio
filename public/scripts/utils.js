/**
 * Shared utilities — avoid duplication across modules.
 */

/** Check user's reduced-motion preference once at load. */
export const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
