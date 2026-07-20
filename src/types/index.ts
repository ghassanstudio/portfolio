/// <reference path="../.astro/types.d.ts" />

/**
 * Shared type definitions for the portfolio project.
 * All content structures are defined here so JSON files
 * stay type-safe and the template code is self-documenting.
 */

/* ── Utility ─────────────────────────────────────────────── */

/** Bilingual string — every user-facing piece of text supports Arabic and English. */
export type LocalizedString = {
  ar: string;
  en: string;
};

/* ── Site Config (site.json) ─────────────────────────────── */

export type SocialLinks = {
  whatsapp?: string;
  telegram?: string;
  github?: string;
  linkedin?: string;
};

export type SiteConfig = {
  name: LocalizedString;
  role: LocalizedString;
  email: string;
  phone: string;
  location: LocalizedString;
  socials: SocialLinks;
  seo: {
    title: LocalizedString;
    description: LocalizedString;
    ogImage: string;
  };
};

/* ── Skills (skills.json) ────────────────────────────────── */

export type Skill = {
  name: string;
  icon?: string;
  description?: LocalizedString;
};

export type SkillCategory = {
  id: string;
  label: LocalizedString;
  icon: string;
  skills: Skill[];
};

/* ── Projects (projects.json) ────────────────────────────── */

export type ProjectFeature = {
  title: LocalizedString;
  description: LocalizedString;
  icon: string;
};

export type ProjectGalleryImage = {
  src: string;
  alt: LocalizedString;
};

export type ProjectLinks = {
  live?: string | null;
  source?: string | null;
};

export type Project = {
  slug: string;
  title: LocalizedString;
  category: "web" | "mobile" | "design";
  featured: boolean;
  order: number;
  thumbnail: string;
  heroImage: string;
  year: number;
  status: LocalizedString;
  summary: LocalizedString;
  description: LocalizedString;
  problem: LocalizedString;
  solution: LocalizedString;
  features: ProjectFeature[];
  tech: string[];
  techDetails: {
    language: string[];
    ui: string[];
    tools: string[];
  };
  gallery: ProjectGalleryImage[];
  video?: string;
  links: ProjectLinks;
};

/* ── Home page sections (home.json) ──────────────────────── */

export type HeroSection = {
  greeting: LocalizedString;
  description: LocalizedString;
  typingTexts: string[];
  ctaPrimaryLabel: LocalizedString;
  ctaPrimaryLink: string;
  ctaSecondaryLabel: LocalizedString;
  ctaSecondaryLink: string;
};

export type AboutSection = {
  title: LocalizedString;
  subtitle: LocalizedString;
  bio: LocalizedString;
  image: string;
  codeBlock: string;
  infoItems: {
    label: LocalizedString;
    value: LocalizedString;
  }[];
  stats: {
    value: string;
    label: LocalizedString;
  }[];
};

export type SkillsSection = {
  title: LocalizedString;
  description: LocalizedString;
};

export type FeaturedProjectsSection = {
  title: LocalizedString;
  viewAllLabel: LocalizedString;
  count: number;
};

export type ContactSection = {
  title: LocalizedString;
  heading: LocalizedString;
  description: LocalizedString;
};

export type HomeContent = {
  hero: HeroSection;
  about: AboutSection;
  skills: SkillsSection;
  featuredProjects: FeaturedProjectsSection;
  contact: ContactSection;
};

/* ── i18n strings ────────────────────────────────────────── */

export type I18nStrings = {
  lang: "ar" | "en";
  dir: "rtl" | "ltr";
  nav: {
    home: string;
    about: string;
    skills: string;
    projects: string;
    contact: string;
    downloadCv: string;
  };
  hero: {
    scrollHint: string;
  };
  projectsPage: {
    title: string;
    subtitle: string;
    filterAll: string;
    filterWeb: string;
    filterMobile: string;
    filterDesign: string;
    viewCaseStudy: string;
    viewLive: string;
    viewSource: string;
  };
  projectDetail: {
    overview: string;
    features: string;
    gallery: string;
    techStack: string;
    video: string;
    backToProjects: string;
    previousProject: string;
    nextProject: string;
    problem: string;
    solution: string;
    visitLiveSite: string;
    viewSourceCode: string;
    builtWith: string;
  };
  contact: {
    title: string;
    nameLabel: string;
    emailLabel: string;
    subjectLabel: string;
    messageLabel: string;
    sendButton: string;
    sending: string;
    success: string;
    error: string;
    requiredField: string;
  };
  footer: {
    copyright: string;
    craftedWith: string;
  };
  backToTop: string;
  skipToContent: string;
};
