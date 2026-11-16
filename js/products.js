// ===========================================================
// products.js — shop page
// Search, category / price / rating / stock filters, sorting,
// pagination. All filter values are kept in the URL so a
// filtered page can be bookmarked or shared.
// ===========================================================

import { getAllProducts, getCategories } from "./api.js";
import {
  initPage, productCardHTML, skeletonCardsHTML, stateBoxHTML,
  attachGridHandlers, debounce, formatCategory, escapeHTML
} from "./ui.js";

initPage("shop");

const PER_PAGE = 12;

const el = {
  grid: document.getElementById("product-grid"),
  pagination: document.getElementById("pagination"),
  count: document.getElementById("result-count"),
  heading: document.getElementById("page-heading"),
  search: document.getElementById("f-search"),
  category: document.getElementById("f-category"),
  min: document.getElementById("f-min"),
  max: document.getElementById("f-max"),
  rating: document.getElementById("f-rating"),
  stock: document.getElementById("f-stock"),
  sort: document.getElementById("f-sort"),
  clear: document.getElementById("clear-filters"),
  filters: document.getElementById("filters"),
  filterToggle: document.getElementById("filter-toggle")
};

let allProducts = [];
let visibleProducts = []; // products on the current page (used by card buttons)

// ---------- State <-> URL ----------

function readStateFromURL() {
  const params = new URLSearchParams(location.search);
  return {
    q: params.get("q") || "",
    category: params.get("category") || "",
    min: params.get("min") || "",
    max: params.get("max") || "",
    rating: params.get("rating") || "",
    stock: params.get("stock") === "1",
    sort: params.get("sort") || "",
    page: Math.max(1, Number(params.get("page")) || 1)
  };
}

let state = readStateFromURL();

function writeStateToURL() {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.category) params.set("category", state.category);
  if (state.min) params.set("min", state.min);
  if (state.max) params.set("max", state.max);
  if (state.rating) params.set("rating", state.rating);
  if (state.stock) params.set("stock", "1");
  if (state.sort) params.set("sort", state.sort);
  if (state.page > 1) params.set("page", state.page);
  const query = params.toString();
  history.replaceState(null, "", query ? `?${query}` : location.pathname);
}

function fillInputsFromState() {
  el.search.value = state.q;
  el.category.value = state.category;
  el.min.value = state.min;
  el.max.value = state.max;
  el.rating.value = state.rating;
  el.stock.checked = state.stock;
  el.sort.value = state.sort;
}

// ---------- Filtering and sorting ----------

function getFilteredProducts() {
  const q = state.q.trim().toLowerCase();
  const min = state.min === "" ? 0 : Number(state.min);
  const max = state.max === "" ? Infinity : Number(state.max);
  const minRating = Number(state.rating) || 0;

  let list = allProducts.filter(p =>
    (!q || p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.includes(q)) &&
    (!state.category || p.category === state.category) &&
    p.price >= min && p.price <= max &&
    p.rating >= minRating &&
    (!state.stock || p.stock > 0)
  );

  const sorters = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    discount: (a, b) => b.discount - a.discount,
    name: (a, b) => a.title.localeCompare(b.title)
  };
  if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);

  return list;
}

// ---------- Rendering ----------

function render() {
  const list = getFilteredProducts();
  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  if (state.page > totalPages) state.page = totalPages;

  const start = (state.page - 1) * PER_PAGE;
  visibleProducts = list.slice(start, start + PER_PAGE);

  el.heading.textContent = state.category
    ? formatCategory(state.category).replace(/^\w/, c => c.toUpperCase())
    : state.q ? `Results for “${state.q}”` : "All products";
  document.title = `${el.heading.textContent} | ShopEase`;

  el.count.textContent = list.length
    ? `Showing ${start + 1}–${start + visibleProducts.length} of ${list.length} products`
    : "No products found";

  el.grid.innerHTML = visibleProducts.length
    ? visibleProducts.map(productCardHTML).join("")
    : stateBoxHTML("🔍", "No products match your filters", "Try a different search or clear some filters.",
        `<button class="btn btn-primary" data-clear>Clear all filters</button>`);

  renderPagination(totalPages);
  writeStateToURL();
}

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    el.pagination.innerHTML = "";
    return;
  }
  let html = `<button data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="Previous page">‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button data-page="${i}" class="${i === state.page ? "active" : ""}" ${i === state.page ? 'aria-current="page"' : ""}>${i}</button>`;
  }
  html += `<button data-page="${state.page + 1}" ${state.page === totalPages ? "disabled" : ""} aria-label="Next page">›</button>`;
  el.pagination.innerHTML = html;
}

// ---------- Events ----------

// Any filter change resets to page 1
function updateState(changes) {
  state = { ...state, ...changes, page: 1 };
  render();
}

function clearFilters() {
  state = { q: "", category: "", min: "", max: "", rating: "", stock: false, sort: "", page: 1 };
  fillInputsFromState();
  render();
}

el.search.addEventListener("input", debounce(() => updateState({ q: el.search.value }), 300));
el.category.addEventListener("change", () => updateState({ category: el.category.value }));
el.min.addEventListener("input", debounce(() => updateState({ min: el.min.value }), 400));
el.max.addEventListener("input", debounce(() => updateState({ max: el.max.value }), 400));
el.rating.addEventListener("change", () => updateState({ rating: el.rating.value }));
el.stock.addEventListener("change", () => updateState({ stock: el.stock.checked }));
el.sort.addEventListener("change", () => updateState({ sort: el.sort.value }));
el.clear.addEventListener("click", clearFilters);

el.grid.addEventListener("click", e => {
  if (e.target.closest("[data-clear]")) clearFilters();
});

el.pagination.addEventListener("click", e => {
  const btn = e.target.closest("button[data-page]");
  if (!btn || btn.disabled) return;
  state.page = Number(btn.dataset.page);
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Mobile: show / hide the filter panel
el.filterToggle.addEventListener("click", () => {
  const open = el.filters.classList.toggle("open");
  el.filterToggle.setAttribute("aria-expanded", open);
});

attachGridHandlers(el.grid, () => visibleProducts);

// ---------- Start ----------

async function init() {
  el.grid.innerHTML = skeletonCardsHTML(8);
  try {
    const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
    allProducts = products;
    el.category.innerHTML += categories
      .map(c => `<option value="${escapeHTML(c)}">${escapeHTML(formatCategory(c))}</option>`)
      .join("");
    fillInputsFromState();
    render();
  } catch (err) {
    console.error(err);
    el.count.textContent = "";
    el.grid.innerHTML = stateBoxHTML("⚠️", "Couldn't load products", "Check your connection and try again.",
      `<button class="btn btn-primary" onclick="location.reload()">Retry</button>`);
  }
}

init();
