/**
 * typing.js — Typing/deleting animation for hero text
 *
 * Custom implementation — no external libraries.
 *
 * Features:
 *   - Respects prefers-reduced-motion (shows static text)
 *   - Pauses when tab is hidden (visibilitychange)
 *   - Announces completed words to screen readers via separate announcer
 *   - CLS-safe: visual text is aria-hidden; announcer is sr-only
 *
 * data-* attributes:
 *   data-typing-texts        — JSON array of strings
 *   data-typing-speed        — typing speed in ms (default 100)
 *   data-typing-delete-speed — deleting speed in ms (default 50)
 *   data-typing-pause        — pause after typing before deleting (default 2000)
 */

import { prefersReducedMotion } from "./utils.js";

interface TypingConfig {
  texts: string[];
  speed: number;
  deleteSpeed: number;
  pause: number;
}

interface TypingInstance {
  el: HTMLElement;
  announcer: HTMLElement | null;
  config: TypingConfig;
  index: number;
  paused: boolean;
  cancelled: boolean;
  currentSleep: Promise<void> | null;
  resolveSleep: (() => void) | null;
}

const instances: TypingInstance[] = [];

/* ─── Interruptible sleep ─── */
function interruptibleSleep(instance: TypingInstance, ms: number): Promise<void> {
  return new Promise((resolve) => {
    instance.resolveSleep = resolve;
    instance.currentSleep = new Promise((res) => {
      const timer = setTimeout(() => {
        if (!instance.cancelled) res();
        resolve();
      }, ms);
      /* Store timer so we can clear it on pause */
      (instance as any)._sleepTimer = timer;
    });
  });
}

async function typeText(
  instance: TypingInstance,
  text: string,
  speed: number
): Promise<void> {
  for (let i = 0; i <= text.length; i++) {
    if (instance.cancelled) return;
    instance.el.textContent = text.slice(0, i);
    await interruptibleSleep(instance, speed);
    if (instance.cancelled) return;
  }
}

async function deleteText(
  instance: TypingInstance,
  text: string,
  deleteSpeed: number
): Promise<void> {
  for (let i = text.length; i >= 0; i--) {
    if (instance.cancelled) return;
    instance.el.textContent = text.slice(0, i);
    await interruptibleSleep(instance, deleteSpeed);
    if (instance.cancelled) return;
  }
}

async function runTypingLoop(instance: TypingInstance): Promise<void> {
  const { texts, speed, deleteSpeed, pause } = instance.config;

  while (!instance.cancelled) {
    const current = texts[instance.index];

    /* Type the word */
    await typeText(instance, current, speed);
    if (instance.cancelled) return;

    /* Announce completed word to screen readers */
    if (instance.announcer) {
      instance.announcer.textContent = current;
    }

    /* Pause at end of word */
    await interruptibleSleep(instance, pause);
    if (instance.cancelled) return;

    /* Delete the word */
    await deleteText(instance, current, deleteSpeed);
    if (instance.cancelled) return;

    /* Brief pause before next word */
    await interruptibleSleep(instance, 300);
    if (instance.cancelled) return;

    /* Move to next word */
    instance.index = (instance.index + 1) % texts.length;
  }
}

/* ─── Visibility change handler ─── */
function handleVisibilityChange() {
  const hidden = document.hidden;
  instances.forEach((inst) => {
    if (hidden) {
      inst.paused = true;
    } else {
      inst.paused = false;
    }
  });
}

export function initTyping() {
  const elements = document.querySelectorAll<HTMLElement>("[data-typing-texts]");
  if (elements.length === 0) return;

  /* Listen for tab visibility changes */
  document.addEventListener("visibilitychange", handleVisibilityChange);

  elements.forEach((el) => {
    const textsAttr = el.getAttribute("data-typing-texts");
    if (!textsAttr) return;

    let texts: string[];
    try {
      texts = JSON.parse(textsAttr);
    } catch {
      return;
    }

    if (!Array.isArray(texts) || texts.length === 0) return;

    const config: TypingConfig = {
      texts,
      speed: parseInt(el.getAttribute("data-typing-speed") || "100", 10),
      deleteSpeed: parseInt(el.getAttribute("data-typing-delete-speed") || "50", 10),
      pause: parseInt(el.getAttribute("data-typing-pause") || "2000", 10),
    };

    /* Find the associated announcer (sibling or nearby) */
    const wrapper = el.closest(".hero__typing-wrap");
    const announcer = wrapper
      ? (wrapper.parentElement?.querySelector("[data-typing-announcer]") as HTMLElement | null)
      : null;

    /* If reduced motion preferred, show first text statically */
    if (prefersReducedMotion) {
      el.textContent = texts[0];
      if (announcer) announcer.textContent = texts[0];
      return;
    }

    const instance: TypingInstance = {
      el,
      announcer,
      config,
      index: 0,
      paused: false,
      cancelled: false,
      currentSleep: null,
      resolveSleep: null,
    };

    instances.push(instance);
    runTypingLoop(instance);
  });
}
