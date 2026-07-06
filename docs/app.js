/*
 * docs/app.js
 * Fetches builds.json + badge-colors.json and renders a searchable,
 * filterable card grid. No dependencies, no build step.
 * Connects to: docs/index.html, docs/data/builds.json, docs/data/badge-colors.json
 * Created: 2026-07-06
 */

const state = {
  entries: [],
  badgeColors: null,
  search: "",
  technology: "",
  category: "",
  depth: "",
};

/**
 * Resolves the badge color for a technology, mirroring the server-side
 * resolveTechnologyBadgeColor logic (exact match, then Python family
 * fallback, then a neutral default).
 *
 * @param {string} technology - The technology label.
 * @returns {string} The hex color, without a leading #.
 */
function resolveTechnologyColor(technology) {
  const colors = state.badgeColors;
  if (colors.technology[technology]) {
    return colors.technology[technology];
  }
  if (technology.startsWith("Python")) {
    return colors.technology_python_default;
  }
  return colors.technology_default;
}

/**
 * Resolves the badge color for a category, with a neutral default fallback.
 *
 * @param {string} category - The category label.
 * @returns {string} The hex color, without a leading #.
 */
function resolveCategoryColor(category) {
  return state.badgeColors.category[category] || state.badgeColors.category_default;
}

/**
 * Resolves the badge color for a depth label, defaulting to Standard's color.
 *
 * @param {string} depth - The depth label.
 * @returns {string} The hex color, without a leading #.
 */
function resolveDepthColor(depth) {
  return state.badgeColors.depth[depth] || state.badgeColors.depth.Standard;
}

/**
 * Escapes text for safe HTML insertion.
 *
 * @param {string} value - The raw text.
 * @returns {string} The HTML-escaped text.
 */
function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

/**
 * Creates a badge span's HTML.
 *
 * @param {string} label - The badge text.
 * @param {string} color - The hex color, without a leading #.
 * @returns {string} The badge HTML.
 */
function badgeHtml(label, color) {
  return `<span class="badge" style="background:#${color}">${escapeHtml(label)}</span>`;
}

/**
 * Renders the headline stat pills.
 *
 * @returns {void}
 */
function renderStats() {
  const entries = state.entries;
  const technologies = new Set(entries.map((entry) => entry.technology));
  const deepCount = entries.filter((entry) => entry.depth === "Deep").length;
  const latest = entries.length > 0
    ? entries.reduce((a, b) => (a.build_number > b.build_number ? a : b))
    : null;

  const stats = document.getElementById("stats");
  stats.innerHTML = [
    `<span class="stat-pill">Builds: <strong>${entries.length}</strong></span>`,
    `<span class="stat-pill">Latest: <strong>${latest ? "#" + latest.build_number : "None yet"}</strong></span>`,
    `<span class="stat-pill">Languages: <strong>${technologies.size}</strong></span>`,
    `<span class="stat-pill">Deep Builds: <strong>${deepCount}</strong></span>`,
  ].join("");
}

/**
 * Populates the filter <select> elements with distinct, sorted values.
 *
 * @returns {void}
 */
function populateFilters() {
  const fillSelect = (id, values) => {
    const select = document.getElementById(id);
    [...values].sort().forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  };

  fillSelect("technology-filter", new Set(state.entries.map((entry) => entry.technology)));
  fillSelect("category-filter", new Set(state.entries.map((entry) => entry.category)));
  fillSelect("depth-filter", new Set(state.entries.map((entry) => entry.depth)));
}

/**
 * Applies the current search/filter state to the full entry list.
 *
 * @returns {Array<object>} The matching entries, sorted by build number descending.
 */
function getFilteredEntries() {
  const query = state.search.trim().toLowerCase();

  return state.entries
    .filter((entry) => {
      if (state.technology && entry.technology !== state.technology) return false;
      if (state.category && entry.category !== state.category) return false;
      if (state.depth && entry.depth !== state.depth) return false;
      if (!query) return true;
      return (
        entry.project_name.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => b.build_number - a.build_number);
}

/**
 * Creates one build card's HTML.
 *
 * @param {object} entry - The build entry.
 * @returns {string} The card HTML.
 */
function cardHtml(entry) {
  const badges = [
    badgeHtml(entry.technology, resolveTechnologyColor(entry.technology)),
    badgeHtml(entry.category, resolveCategoryColor(entry.category)),
    badgeHtml(entry.depth, resolveDepthColor(entry.depth)),
  ].join(" ");

  return `
    <article class="build-card">
      <h2><a href="${entry.repo_url}" target="_blank" rel="noopener noreferrer">#${entry.build_number} — ${escapeHtml(entry.project_name)}</a></h2>
      <div class="badge-row">${badges}<span class="build-date">${entry.date}</span></div>
      <p class="build-description">${escapeHtml(entry.description)}</p>
      <a class="build-repo-link" href="${entry.repo_url}" target="_blank" rel="noopener noreferrer">Repo →</a>
    </article>
  `;
}

/**
 * Renders the card grid and result count for the current filter state.
 *
 * @returns {void}
 */
function render() {
  const filtered = getFilteredEntries();
  const grid = document.getElementById("card-grid");
  const emptyState = document.getElementById("empty-state");
  const resultCount = document.getElementById("result-count");

  resultCount.textContent = `Showing ${filtered.length} of ${state.entries.length} builds`;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  grid.innerHTML = filtered.map(cardHtml).join("");
}

/**
 * Wires up search/filter/clear controls to update state and re-render.
 *
 * @returns {void}
 */
function bindControls() {
  document.getElementById("search-input").addEventListener("input", (event) => {
    state.search = event.target.value;
    render();
  });
  document.getElementById("technology-filter").addEventListener("change", (event) => {
    state.technology = event.target.value;
    render();
  });
  document.getElementById("category-filter").addEventListener("change", (event) => {
    state.category = event.target.value;
    render();
  });
  document.getElementById("depth-filter").addEventListener("change", (event) => {
    state.depth = event.target.value;
    render();
  });
  document.getElementById("clear-filters").addEventListener("click", () => {
    state.search = "";
    state.technology = "";
    state.category = "";
    state.depth = "";
    document.getElementById("search-input").value = "";
    document.getElementById("technology-filter").value = "";
    document.getElementById("category-filter").value = "";
    document.getElementById("depth-filter").value = "";
    render();
  });
}

/**
 * Loads build + badge-color data and boots the page.
 *
 * @returns {Promise<void>}
 */
async function init() {
  const [entriesResponse, badgeColorsResponse] = await Promise.all([
    fetch("data/builds.json"),
    fetch("data/badge-colors.json"),
  ]);

  state.entries = await entriesResponse.json();
  state.badgeColors = await badgeColorsResponse.json();

  renderStats();
  populateFilters();
  bindControls();
  render();
}

init();
