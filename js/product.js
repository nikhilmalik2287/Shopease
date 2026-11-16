// ===========================================================
// product.js — product detail page (product.html?id=5)
// Image gallery, quantity selector, add to cart / buy now,
// wishlist, related products and recently viewed.
// ===========================================================

import { getAllProducts, getProductById, originalPrice } from "./api.js";
import {
  addToCart, toggleWishlist, isInWishlist,
  addRecentlyViewed, getRecentlyViewed
} from "./storage.js";
import {
  initPage, productCardHTML, stateBoxHTML, attachGridHandlers,
  formatPrice, escapeHTML, formatCategory, starString, showToast
} from "./ui.js";

initPage("shop");

const container = document.getElementById("product-detail");
const breadcrumb = document.getElementById("breadcrumb");

function stockInfo(stock) {
  if (stock <= 0) return { cls: "out", text: "Out of stock" };
  if (stock <= 5) return { cls: "low", text: `Only ${stock} left — order soon` };
  return { cls: "in", text: "In stock" };
}

function renderProduct(p) {
  const stock = stockInfo(p.stock);
  const out = p.stock <= 0;
  const inWish = isInWishlist(p.id);
  const old = originalPrice(p);

  document.title = `${p.title} | ShopEase`;
  breadcrumb.innerHTML = `
    <a href="index.html">Home</a> ›
    <a href="products.html">Shop</a> ›
    <a href="products.html?category=${encodeURIComponent(p.category)}"><span>${escapeHTML(formatCategory(p.category))}</span></a> ›
    ${escapeHTML(p.title)}`;

  container.innerHTML = `
    <div class="detail-layout">
      <div>
        <div class="gallery-main">
          <img id="main-img" src="${escapeHTML(p.images[0])}" alt="${escapeHTML(p.title)}"
            onerror="this.onerror=null;this.src='assets/placeholder.svg'">
        </div>
        ${p.images.length > 1 ? `
          <div class="gallery-thumbs" id="thumbs">
            ${p.images.map((src, i) => `
              <button type="button" class="${i === 0 ? "active" : ""}" data-src="${escapeHTML(src)}" aria-label="Show image ${i + 1}">
                <img src="${escapeHTML(src)}" alt="" loading="lazy">
              </button>`).join("")}
          </div>` : ""}
      </div>

      <div class="detail-info">
        <span class="brand">${escapeHTML(p.brand)}</span>
        <h1>${escapeHTML(p.title)}</h1>
        <p class="rating"><span class="stars" aria-hidden="true">${starString(p.rating)}</span> ${p.rating} out of 5</p>

        <div class="price-row">
          <span class="price">${formatPrice(p.price)}</span>
          ${p.discount ? `
            <span class="price-old">${formatPrice(old)}</span>
            <span class="price-off">${p.discount}% off</span>` : ""}
        </div>
        <p class="muted" style="font-size:.85rem;margin-top:0">Inclusive of all taxes</p>

        <p class="stock ${stock.cls}">${stock.text}</p>
        <p class="desc">${escapeHTML(p.description)}</p>

        ${out ? "" : `
          <label for="qty" style="font-weight:600;display:block;margin-bottom:6px">Quantity</label>
          <div class="qty-control">
            <button type="button" id="qty-minus" aria-label="Decrease quantity">−</button>
            <input type="number" id="qty" value="1" min="1" max="${p.stock}">
            <button type="button" id="qty-plus" aria-label="Increase quantity">+</button>
          </div>`}

        <div class="detail-actions">
          <button class="btn btn-primary" id="add-btn" ${out ? "disabled" : ""}>🛒 Add to cart</button>
          <button class="btn btn-accent" id="buy-btn" ${out ? "disabled" : ""}>Buy now</button>
          <button class="btn btn-outline" id="wish-btn" aria-pressed="${inWish}">${inWish ? "♥ Wishlisted" : "♡ Wishlist"}</button>
        </div>

        <ul class="detail-meta">
          <li>🚚 Free delivery on orders above ₹999</li>
          <li>↩️ 7-day easy returns</li>
          <li>🏷️ Category: <span style="text-transform:capitalize">${escapeHTML(formatCategory(p.category))}</span></li>
        </ul>
      </div>
    </div>`;

  attachDetailHandlers(p);
}

function attachDetailHandlers(p) {
  const qtyInput = document.getElementById("qty");
  const minus = document.getElementById("qty-minus");
  const plus = document.getElementById("qty-plus");

  // Keep quantity between 1 and the available stock
  function setQty(value) {
    const q = Math.max(1, Math.min(Number(value) || 1, p.stock));
    qtyInput.value = q;
    minus.disabled = q <= 1;
    plus.disabled = q >= p.stock;
  }

  if (qtyInput) {
    setQty(1);
    minus.addEventListener("click", () => setQty(Number(qtyInput.value) - 1));
    plus.addEventListener("click", () => setQty(Number(qtyInput.value) + 1));
    qtyInput.addEventListener("change", () => setQty(qtyInput.value));
  }

  const getQty = () => (qtyInput ? Number(qtyInput.value) : 1);

  document.getElementById("add-btn").addEventListener("click", () => {
    const result = addToCart(p, getQty());
    showToast(result.message, result.ok ? "success" : "error");
  });

  document.getElementById("buy-btn").addEventListener("click", () => {
    addToCart(p, getQty()); // may already be in the cart at max stock; go to cart either way
    location.href = "cart.html";
  });

  const wishBtn = document.getElementById("wish-btn");
  wishBtn.addEventListener("click", () => {
    const added = toggleWishlist(p);
    wishBtn.textContent = added ? "♥ Wishlisted" : "♡ Wishlist";
    wishBtn.setAttribute("aria-pressed", added);
    showToast(added ? "Saved to wishlist" : "Removed from wishlist");
  });

  // Image gallery: click a thumbnail to show it as the main image
  const thumbs = document.getElementById("thumbs");
  if (thumbs) {
    thumbs.addEventListener("click", e => {
      const btn = e.target.closest("button[data-src]");
      if (!btn) return;
      document.getElementById("main-img").src = btn.dataset.src;
      thumbs.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
    });
  }
}

function renderExtras(p, allProducts) {
  const related = allProducts.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
  const recent = getRecentlyViewed().filter(x => x.id !== p.id).slice(0, 4);

  const relatedGrid = document.getElementById("related-grid");
  const recentGrid = document.getElementById("recent-grid");

  if (related.length) {
    document.getElementById("related-section").hidden = false;
    relatedGrid.innerHTML = related.map(productCardHTML).join("");
  }
  if (recent.length) {
    document.getElementById("recent-section").hidden = false;
    recentGrid.innerHTML = recent.map(productCardHTML).join("");
  }

  const lookup = () => [...related, ...recent];
  attachGridHandlers(relatedGrid, lookup);
  attachGridHandlers(recentGrid, lookup);
}

async function init() {
  const id = new URLSearchParams(location.search).get("id");

  try {
    const product = id ? await getProductById(id) : null;

    if (!product) {
      container.innerHTML = stateBoxHTML("📦", "Product not found",
        "This product doesn't exist or may have been removed.",
        `<a class="btn btn-primary" href="products.html">Browse products</a>`);
      return;
    }

    renderProduct(product);
    renderExtras(product, await getAllProducts());
    addRecentlyViewed(product); // saved after rendering so it doesn't show itself
  } catch (err) {
    console.error(err);
    container.innerHTML = stateBoxHTML("⚠️", "Couldn't load this product", "Check your connection and try again.",
      `<button class="btn btn-primary" onclick="location.reload()">Retry</button>`);
  }
}

init();
