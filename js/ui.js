// ===========================================================
// ui.js — shared UI used by every page
// Header, footer, theme toggle, toasts, product cards,
// skeleton loaders and helper functions.
// ===========================================================

import {
  getCartCount, getSession, getTheme, setTheme,
  addToCart, toggleWishlist, isInWishlist
} from "./storage.js";
import { originalPrice } from "./api.js";

/* ---------------- Helpers ---------------- */

export function formatPrice(amount) {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

// Escape text before putting it inside innerHTML (prevents XSS)
export function escapeHTML(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Wait until the user stops typing before running fn
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function formatCategory(cat = "") {
  return cat.replace(/-/g, " ");
}

export function starString(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

/* ---------------- Theme ---------------- */

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }
}

/* ---------------- Header and footer ---------------- */

function renderHeader(activePage) {
  const header = document.getElementById("site-header");
  if (!header) return;

  const session = getSession();
  const link = (href, label, key) =>
    `<a href="${href}" class="${activePage === key ? "active" : ""}">${label}</a>`;

  header.className = "site-header";
  header.innerHTML = `
    <div class="container header-inner">
      <button class="icon-btn menu-toggle" id="menu-toggle" aria-label="Open menu" aria-expanded="false">☰</button>
      <a href="index.html" class="logo">Shop<span>Ease</span></a>
      <nav class="main-nav" id="main-nav" aria-label="Main">
        ${link("index.html", "Home", "home")}
        ${link("products.html", "Shop", "shop")}
        ${link("wishlist.html", "Wishlist", "wishlist")}
      </nav>
      <form class="header-search" action="products.html" role="search">
        <label for="header-q" class="sr-only">Search products</label>
        <input id="header-q" name="q" type="search" placeholder="Search for products, brands…" autocomplete="off">
        <button class="btn btn-primary" type="submit" aria-label="Search">🔍</button>
      </form>
      <div class="header-actions">
        <button class="icon-btn" id="theme-toggle" type="button"></button>
        <a href="login.html" class="user-link" title="${session ? "My account" : "Log in"}">
          👤 <span class="user-name">${session ? escapeHTML(session.name.split(" ")[0]) : "Log in"}</span>
        </a>
        <a href="cart.html" class="icon-btn cart-link" aria-label="Cart">
          🛒<span class="cart-badge" id="cart-badge">0</span>
        </a>
      </div>
    </div>`;

  // Keep the search box filled when we're already on a search results page
  const q = new URLSearchParams(location.search).get("q");
  if (q) document.getElementById("header-q").value = q;

  // Mobile hamburger menu
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.textContent = open ? "✕" : "☰";
  });

  // Dark mode toggle
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = getTheme() === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  });
  applyTheme(getTheme());
}

function renderFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer) return;
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="index.html" class="logo">Shop<span>Ease</span></a>
          <p class="muted">A responsive e-commerce storefront built with HTML, CSS and vanilla JavaScript.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><a href="products.html">All products</a></li>
            <li><a href="products.html?sort=discount">Today's deals</a></li>
            <li><a href="wishlist.html">Wishlist</a></li>
          </ul>
        </div>
        <div>
          <h4>Account</h4>
          <ul>
            <li><a href="login.html">My account</a></li>
            <li><a href="cart.html">Cart</a></li>
            <li><a href="login.html#orders">My orders</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">© ${new Date().getFullYear()} ShopEase · Placement project · Product data from DummyJSON</div>
    </div>`;
}

export function updateCartBadge(animate = false) {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count > 99 ? "99+" : count;
  badge.style.display = count ? "grid" : "none";
  if (animate) {
    badge.classList.remove("bump");
    void badge.offsetWidth; // restart the animation
    badge.classList.add("bump");
  }
}

let badgeListenerAdded = false;

// Call at the top of every page script (safe to call again to refresh the header)
export function initPage(activePage) {
  renderHeader(activePage);
  renderFooter();
  updateCartBadge();
  if (!badgeListenerAdded) {
    document.addEventListener("cart:updated", () => updateCartBadge(true));
    badgeListenerAdded = true;
  }
}

/* ---------------- Toast notifications ---------------- */

export function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    container.setAttribute("role", "status");
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

/* ---------------- Product cards ---------------- */

export function productCardHTML(p) {
  const inWish = isInWishlist(p.id);
  const outOfStock = p.stock <= 0;
  const old = originalPrice(p);

  return `
    <article class="product-card">
      ${outOfStock
        ? `<span class="badge out">Out of stock</span>`
        : p.discount >= 10 ? `<span class="badge">${p.discount}% off</span>` : ""}
      <button class="wish-btn ${inWish ? "active" : ""}" data-action="wishlist" data-id="${p.id}"
        aria-label="${inWish ? "Remove from" : "Add to"} wishlist" aria-pressed="${inWish}">${inWish ? "♥" : "♡"}</button>
      <a href="product.html?id=${p.id}" class="card-img">
        <img src="${escapeHTML(p.thumbnail)}" alt="${escapeHTML(p.title)}" loading="lazy"
          onerror="this.onerror=null;this.src='assets/placeholder.svg'">
      </a>
      <div class="card-body">
        <span class="card-category">${escapeHTML(formatCategory(p.category))}</span>
        <a href="product.html?id=${p.id}" class="card-title">${escapeHTML(p.title)}</a>
        <span class="rating"><span class="stars" aria-hidden="true">${starString(p.rating)}</span> ${p.rating}</span>
        <div class="price-row">
          <span class="price">${formatPrice(p.price)}</span>
          ${p.discount ? `<span class="price-old">${formatPrice(old)}</span>` : ""}
        </div>
        <div class="card-actions">
          <button class="btn btn-primary btn-sm btn-block" data-action="add" data-id="${p.id}" ${outOfStock ? "disabled" : ""}>
            ${outOfStock ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>`;
}

export function skeletonCardsHTML(count = 8) {
  return Array.from({ length: count }, () => `
    <div class="product-card skeleton" aria-hidden="true">
      <div class="card-img"></div>
      <div class="card-body">
        <div class="sk-line w40"></div>
        <div class="sk-line"></div>
        <div class="sk-line w60"></div>
      </div>
    </div>`).join("");
}

export function stateBoxHTML(icon, title, text, actionHTML = "") {
  return `
    <div class="state-box">
      <div class="state-icon" aria-hidden="true">${icon}</div>
      <h3>${title}</h3>
      <p>${text}</p>
      ${actionHTML}
    </div>`;
}

// One click listener on the whole grid handles every card button (event delegation).
// getProducts returns the products currently shown, so we can look them up by id.
export function attachGridHandlers(grid, getProducts, onWishlistChange) {
  grid.addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const product = getProducts().find(p => p.id === id);
    if (!product) return;

    if (btn.dataset.action === "add") {
      const result = addToCart(product, 1);
      showToast(result.message, result.ok ? "success" : "error");
      if (result.ok) {
        btn.textContent = "Added ✓";
        setTimeout(() => (btn.textContent = "Add to cart"), 1200);
      }
    }

    if (btn.dataset.action === "wishlist") {
      const added = toggleWishlist(product);
      // The same product can appear in more than one grid, so update every heart for it
      document.querySelectorAll(`.wish-btn[data-id="${id}"]`).forEach(b => {
        b.classList.toggle("active", added);
        b.textContent = added ? "♥" : "♡";
        b.setAttribute("aria-pressed", added);
        b.setAttribute("aria-label", `${added ? "Remove from" : "Add to"} wishlist`);
      });
      showToast(added ? "Saved to wishlist" : "Removed from wishlist");
      if (onWishlistChange) onWishlistChange(product, added);
    }
  });
}
