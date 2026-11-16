// ===========================================================
// cart.js — cart page
// Change quantity, remove items, apply coupons, see totals.
// ===========================================================

import {
  getCart, updateQty, removeFromCart,
  getAppliedCoupon, setAppliedCoupon, getSession
} from "./storage.js";
import { calculateTotals, validateCoupon, COUPONS, FREE_DELIVERY_ABOVE } from "./pricing.js";
import { initPage, formatPrice, escapeHTML, stateBoxHTML, showToast } from "./ui.js";

initPage("cart");

const root = document.getElementById("cart-root");

function cartItemHTML(item) {
  return `
    <div class="cart-item" data-id="${item.id}">
      <a href="product.html?id=${item.id}">
        <img src="${escapeHTML(item.thumbnail)}" alt="${escapeHTML(item.title)}"
          onerror="this.onerror=null;this.src='assets/placeholder.svg'">
      </a>
      <div>
        <a href="product.html?id=${item.id}" class="cart-item-title">${escapeHTML(item.title)}</a>
        <div class="muted" style="font-size:.88rem">${formatPrice(item.price)} each</div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button type="button" data-action="dec" ${item.qty <= 1 ? "disabled" : ""} aria-label="Decrease quantity">−</button>
            <input type="number" value="${item.qty}" min="1" max="${item.stock}" data-action="set" aria-label="Quantity">
            <button type="button" data-action="inc" ${item.qty >= item.stock ? "disabled" : ""} aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="remove-btn" data-action="remove">Remove</button>
        </div>
      </div>
      <div class="cart-item-total">${formatPrice(item.price * item.qty)}</div>
    </div>`;
}

function summaryHTML(totals, coupon) {
  const toFree = FREE_DELIVERY_ABOVE - (totals.subtotal - totals.discount);
  return `
    <aside class="panel summary" aria-label="Order summary">
      <h3>Order summary</h3>
      <div class="summary-row"><span>Items (${totals.itemCount})</span><span>${formatPrice(totals.subtotal)}</span></div>
      ${totals.discount ? `<div class="summary-row discount"><span>Coupon (${escapeHTML(coupon)})</span><span>−${formatPrice(totals.discount)}</span></div>` : ""}
      <div class="summary-row"><span>Delivery</span><span>${totals.delivery ? formatPrice(totals.delivery) : "Free"}</span></div>
      <div class="summary-row total"><span>Total</span><span>${formatPrice(totals.total)}</span></div>
      <p class="summary-note">${totals.delivery
        ? `Add ${formatPrice(toFree)} more for free delivery.`
        : "You get free delivery on this order."}</p>

      <form class="coupon-form" id="coupon-form" novalidate>
        <label for="coupon-input" class="sr-only">Coupon code</label>
        <input id="coupon-input" placeholder="Coupon code" value="${coupon ? escapeHTML(coupon) : ""}" autocomplete="off">
        ${coupon
          ? `<button type="button" class="btn btn-outline" id="remove-coupon">Remove</button>`
          : `<button type="submit" class="btn btn-outline">Apply</button>`}
      </form>
      <div class="coupon-msg" id="coupon-msg" aria-live="polite"></div>
      <p class="coupon-hint">Try: ${Object.keys(COUPONS).join(", ")}</p>

      <button class="btn btn-primary btn-block" id="checkout-btn" style="margin-top:12px">Proceed to checkout</button>
      <a href="products.html" class="btn btn-outline btn-block" style="margin-top:8px">Continue shopping</a>
    </aside>`;
}

function render() {
  const cart = getCart();

  if (!cart.length) {
    setAppliedCoupon(null);
    root.innerHTML = stateBoxHTML("🛒", "Your cart is empty",
      "Looks like you haven't added anything yet.",
      `<a class="btn btn-primary" href="products.html">Start shopping</a>`);
    return;
  }

  // Drop a saved coupon that no longer applies (e.g. order dropped below the minimum)
  let coupon = getAppliedCoupon();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (coupon && !validateCoupon(coupon, subtotal).valid) {
    showToast(`${coupon} was removed: ${validateCoupon(coupon, subtotal).message}`, "error");
    setAppliedCoupon(null);
    coupon = null;
  }

  const totals = calculateTotals(cart, coupon);

  root.innerHTML = `
    <div class="cart-layout">
      <section class="panel" id="cart-items" aria-label="Cart items">
        ${cart.map(cartItemHTML).join("")}
      </section>
      ${summaryHTML(totals, coupon)}
    </div>`;

  bindSummary(subtotal);
}

function bindSummary(subtotal) {
  const form = document.getElementById("coupon-form");
  const input = document.getElementById("coupon-input");
  const msg = document.getElementById("coupon-msg");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const code = input.value.trim().toUpperCase();
    if (!code) {
      msg.className = "coupon-msg err";
      msg.textContent = "Enter a coupon code first";
      return;
    }
    const result = validateCoupon(code, subtotal);
    if (!result.valid) {
      msg.className = "coupon-msg err";
      msg.textContent = result.message;
      return;
    }
    setAppliedCoupon(code);
    render();
    showToast(result.message);
  });

  document.getElementById("remove-coupon")?.addEventListener("click", () => {
    setAppliedCoupon(null);
    render();
  });

  document.getElementById("checkout-btn").addEventListener("click", () => {
    // Checkout needs a logged-in user; come back here after login
    location.href = getSession() ? "checkout.html" : "login.html?redirect=checkout.html";
  });
}

// Event delegation: one listener handles every cart row
root.addEventListener("click", e => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const row = btn.closest(".cart-item");
  const id = Number(row.dataset.id);
  const item = getCart().find(i => i.id === id);
  if (!item) return;

  if (btn.dataset.action === "inc") updateQty(id, item.qty + 1);
  if (btn.dataset.action === "dec") updateQty(id, item.qty - 1);
  if (btn.dataset.action === "remove") {
    removeFromCart(id);
    showToast(`${item.title} removed from cart`);
  }
  render();
});

root.addEventListener("change", e => {
  if (e.target.dataset.action !== "set") return;
  const id = Number(e.target.closest(".cart-item").dataset.id);
  updateQty(id, Number(e.target.value) || 1);
  render();
});

render();
