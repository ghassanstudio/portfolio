/**
 * quality.mjs — runtime quality monitors.
 *
 * Attach before navigation to capture:
 *   - console errors      (page.on("console") with type "error")
 *   - uncaught exceptions (page.on("pageerror"))
 *   - failed HTTP requests (page.on("requestfailed"))
 *   - non-2xx responses    (page.on("response"))
 *
 * External requests (fonts, embeds) are excluded from "failed network"
 * assertions so the suite stays deterministic in offline CI runners, but are
 * still surfaced for diagnostics.
 */

/** Hosts that live outside the project and are allowed to be flaky offline. */
const EXTERNAL_HOSTS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
];

function isExternal(urlString) {
  try {
    const host = new URL(urlString).hostname;
    return EXTERNAL_HOSTS.some((external) => host === external || host.endsWith(`.${external}`));
  } catch {
    return true;
  }
}

/**
 * Install the monitors on a page. Returns a snapshot function that returns
 * { consoleErrors, pageErrors, failedRequests, badResponses } for the period
 * since the monitors were installed.
 */
export function installQualityMonitor(page) {
  const state = { consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [] };

  page.on("console", (message) => {
    if (message.type() === "error") {
      state.consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    state.pageErrors.push(`${error.name}: ${error.message}`);
  });

  page.on("requestfailed", (request) => {
    const url = request.url();
    if (isExternal(url)) return;
    state.failedRequests.push(`${request.method()} ${url} — ${request.failure()?.errorText ?? "unknown"}`);
  });

  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();
    if (isExternal(url)) return;
    if (status >= 400) {
      state.badResponses.push(`${response.request().method()} ${url} — HTTP ${status}`);
    }
  });

  return {
    snapshot() {
      return {
        consoleErrors: [...state.consoleErrors],
        pageErrors: [...state.pageErrors],
        failedRequests: [...state.failedRequests],
        badResponses: [...state.badResponses],
      };
    },
  };
}

/** Assert a quality snapshot is completely clean, with useful failure output. */
export function expectClean(snapshot, context = "page") {
  const problems = [
    ...snapshot.consoleErrors.map((text) => `console.error: ${text}`),
    ...snapshot.pageErrors.map((text) => `uncaught exception: ${text}`),
    ...snapshot.failedRequests.map((text) => `failed request: ${text}`),
    ...snapshot.badResponses.map((text) => `HTTP >= 400: ${text}`),
  ];
  if (problems.length > 0) {
    throw new Error(`${context} quality gates failed:\n${problems.join("\n")}`);
  }
}
