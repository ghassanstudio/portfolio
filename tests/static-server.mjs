/**
 * static-server.mjs — a dependency-free static file server used by the
 * Playwright QA suite. Serves the repository root over HTTP so the site's
 * fetch()-based data layer (js/data.js) works exactly as it does in
 * production on GitHub Pages.
 *
 * Usage: node tests/static-server.mjs [--port 4173]
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".woff2": "font/woff2",
};

function contentType(pathname) {
  return MIME[extname(pathname).toLowerCase()] || "application/octet-stream";
}

/** Map a URL pathname to a safe file path below ROOT. */
function resolvePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  // Mirror GitHub Pages: a request without a file extension is offered .html.
  let candidate = decoded === "/" ? "/index.html" : decoded;
  const hasExt = extname(candidate) !== "";
  if (!hasExt) candidate = `${candidate}.html`;
  const target = normalize(join(ROOT, candidate));
  // Path traversal guard.
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return null;
  return target;
}

const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  try {
    const target = resolvePath(pathname);
    if (!target) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }
    const info = await stat(target);
    if (!info.isFile()) throw new Error("not a file");
    const body = await readFile(target);
    res.writeHead(200, {
      "Content-Type": contentType(target),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(body);
  } catch {
    // eslint-disable-next-line no-console
    console.error(`[static-server] 404 ${req.url}`);
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

const port = Number.parseInt(
  process.argv[process.argv.indexOf("--port") + 1],
  10
) || 4173;

server.listen(port, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(`[static-server] serving ${ROOT} at http://127.0.0.1:${port}`);
});
