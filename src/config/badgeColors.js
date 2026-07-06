/*
 * src/config/badgeColors.js
 * Single source of truth for badge colors, shared by the README generator
 * and the docs/ GitHub Pages site so both render builds identically.
 * Connects to: src/services/readmeService.js, src/services/buildExportService.js
 * Created: 2026-07-06
 */

// GitHub Linguist's per-language colors, so tech badges match the color
// dot GitHub already shows next to each language elsewhere on the site.
const TECHNOLOGY_BADGE_COLORS = {
  "C#": "178600",
  "ES Modules": "F1E05A",
  Go: "00ADD8",
  Java: "B07219",
  "JS async": "F1E05A",
  "JS testing": "F1E05A",
  Kotlin: "A97BFF",
  Lua: "000080",
  PHP: "4F5D95",
  Ruby: "701516",
  Rust: "DEA584",
  Shell: "89E051",
  Swift: "F05138",
  TypeScript: "3178C6",
  "Vanilla JS": "F1E05A",
};
const PYTHON_BADGE_COLOR = "3572A5";
const DEFAULT_TECHNOLOGY_BADGE_COLOR = "334155";

const CATEGORY_BADGE_COLORS = {
  "CLI Tools": "0f766e",
  "Web Frontend": "2563eb",
  "Backend & Networking": "be185d",
  "Data & Analytics": "ca8a04",
  "Libraries & Packages": "4d7c0f",
  "Desktop & Console Apps": "c2410c",
  "Mobile Apps": "0891b2",
  "Automation & DevOps": "78350f",
};
const DEFAULT_CATEGORY_BADGE_COLOR = "0f766e";

const DEPTH_BADGE_COLORS = {
  Standard: "6b7280",
  Expanded: "0284c7",
  Deep: "7c3aed",
};

module.exports = {
  CATEGORY_BADGE_COLORS,
  DEFAULT_CATEGORY_BADGE_COLOR,
  DEFAULT_TECHNOLOGY_BADGE_COLOR,
  DEPTH_BADGE_COLORS,
  PYTHON_BADGE_COLOR,
  TECHNOLOGY_BADGE_COLORS,
};
