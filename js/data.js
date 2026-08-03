/**
 * data.js — the data layer.
 * Loads every JSON document once, caches it in memory, and exposes
 * typed accessors. Pages import `get` / `getProject` / `getArticle`
 * instead of fetching files themselves.
 */

import { fetchJSON } from "./utils.js";

/** The JSON documents that make up the site's content. */
const FILES = ["settings", "i18n", "profile", "projects", "articles", "faq", "about", "contact", "technologies", "privacy", "terms", "offline", "404"];

/** In-memory cache: file name -> parsed document. */
const cache = new Map();

/** Load every document in parallel. Idempotent — safe to call repeatedly. */
export async function loadAll() {
  const pending = FILES.filter((name) => !cache.has(name)).map(async (name) => {
    cache.set(name, await fetchJSON(`data/${name}.json`));
  });
  await Promise.all(pending);
  return cache;
}

/** Get a loaded document by file name (without extension). */
export function get(name) {
  return cache.get(name);
}

/** Convenience accessors. */
export const getSettings = () => get("settings") ?? {};
export const getProfile = () => get("profile") ?? {};
export const getProjects = () => get("projects")?.projects ?? [];
export const getArticles = () => get("articles")?.articles ?? [];
export const getFaqs = () => get("faq")?.faqs ?? [];
export const getAbout = () => get("about") ?? {};
export const getContact = () => get("contact") ?? {};
export const getTechnologies = () => get("technologies") ?? {};
export const getPrivacy = () => get("privacy") ?? {};
export const getTerms = () => get("terms") ?? {};
export const getOffline = () => get("offline") ?? {};
export const getNotFound = () => get("404") ?? {};

/** Find a project by id or slug. */
export function getProject(idOrSlug) {
  return getProjects().find(
    (project) => project.id === idOrSlug || project.slug === idOrSlug
  );
}

/** Find an article by id or slug. */
export function getArticle(idOrSlug) {
  return getArticles().find(
    (article) => article.id === idOrSlug || article.slug === idOrSlug
  );
}
