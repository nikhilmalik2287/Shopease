// ===========================================================
// home.js — home page: categories, top rated, deals, recently viewed
// ===========================================================

import { getAllProducts, getCategories } from "./api.js";
import { getRecentlyViewed } from "./storage.js";
import {
  initPage, productCardHTML, skeletonCardsHTML, stateBoxHTML,
  attachGridHandlers, escapeHTML, formatCategory
} from "./ui.js";

initPage("home");

const trendingGrid = document.getElementById("trending-grid");
const dealsGrid = document.getElementById("deals-grid");
const recentGrid = document.getElementById("recent-grid");
const chipsBox = document.getElementById("category-chips");

let allProducts = [];

// Show loading skeletons while data loads
trendingGrid.innerHTML = skeletonCardsHTML(4);
dealsGrid.innerHTML = skeletonCardsHTML(4);

async function loadHome() {
  try {
    allProducts = await getAllProducts();
    const categories = await getCategories();

    chipsBox.innerHTML = categories
      .slice(0, 14)
      .map(c => `<a class="chip" href="products.html?category=${encodeURIComponent(c)}">${escapeHTML(formatCategory(c))}</a>`)
      .join("");

    const topRated = [...allProducts].sort((a, b) => b.rating - a.rating).slice(0, 8);
    const deals = [...allProducts].sort((a, b) => b.discount - a.discount).slice(0, 4);

    trendingGrid.innerHTML = topRated.map(productCardHTML).join("");
    dealsGrid.innerHTML = deals.map(productCardHTML).join("");

    const recent = getRecentlyViewed().slice(0, 4);
    if (recent.length) {
      document.getElementById("recent-section").hidden = false;
      recentGrid.innerHTML = recent.map(productCardHTML).join("");
    }
  } catch (err) {
    console.error(err);
    trendingGrid.innerHTML = stateBoxHTML("⚠️", "Couldn't load products", "Check your connection and try again.",
      `<button class="btn btn-primary" onclick="location.reload()">Retry</button>`);
    dealsGrid.innerHTML = "";
  }
}

// Every grid on the page shares the same product lookup
const lookup = () => [...allProducts, ...getRecentlyViewed()];
[trendingGrid, dealsGrid, recentGrid].forEach(grid => attachGridHandlers(grid, lookup));

loadHome();
