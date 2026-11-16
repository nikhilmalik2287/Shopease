// ===========================================================
// checkout.js — checkout page
// Login check, form validation with regular expressions,
// order summary, placing the order and confirmation.
// ===========================================================

import {
  getCart, clearCart, getSession, saveOrder,
  getAppliedCoupon, setAppliedCoupon
} from "./storage.js";
import { calculateTotals } from "./pricing.js";
import { initPage, formatPrice, escapeHTML, showToast } from "./ui.js";

// ---- Guards: must be logged in and have something in the cart ----
const session = getSession();
const cart = getCart();
// (the guard itself runs at the bottom of this file, after everything is defined)

// ---- Validation rules: each returns an error message or "" ----
const rules = {
  name: v => v.trim().length < 3 ? "Enter your full name (at least 3 letters)"
    : !/^[a-zA-Z\s.'-]+$/.test(v.trim()) ? "Name can only contain letters and spaces" : "",
  phone: v => !/^[6-9]\d{9}$/.test(v.trim()) ? "Enter a valid 10-digit mobile number" : "",
  email: v => !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "Enter a valid email address" : "",
  address: v => v.trim().length < 10 ? "Enter your full address (at least 10 characters)" : "",
  city: v => v.trim().length < 2 ? "Enter your city" : "",
  pincode: v => !/^[1-9]\d{5}$/.test(v.trim()) ? "Enter a valid 6-digit PIN code" : "",
  state: v => !v ? "Select your state" : ""
};

function validateField(input) {
  const message = rules[input.name](input.value);
  input.closest(".form-group").classList.toggle("invalid", Boolean(message));
  input.setAttribute("aria-invalid", Boolean(message));
  document.getElementById(`${input.name}-error`).textContent = message;
  return !message;
}

function setup() {
  const form = document.getElementById("checkout-form");
  const coupon = getAppliedCoupon();
  const totals = calculateTotals(cart, coupon);

  renderSummary(totals, coupon);

  // Pre-fill what we already know about the user
  form.elements.name.value = session.name;
  form.elements.email.value = session.email;

  // Only digits allowed in phone and PIN code
  [form.elements.phone, form.elements.pincode].forEach(input =>
    input.addEventListener("input", () => (input.value = input.value.replace(/\D/g, "")))
  );

  // Validate a field when the user leaves it, and re-check while they fix it
  Object.keys(rules).forEach(name => {
    const input = form.elements[name];
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.closest(".form-group").classList.contains("invalid")) validateField(input);
    });
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const inputs = Object.keys(rules).map(name => form.elements[name]);
    const allValid = inputs.map(validateField).every(Boolean);

    if (!allValid) {
      inputs.find(i => i.getAttribute("aria-invalid") === "true").focus();
      showToast("Please fix the highlighted fields", "error");
      return;
    }

    const btn = document.getElementById("place-order");
    btn.disabled = true;
    btn.textContent = "Placing order…";

    // Simulate a short network request
    setTimeout(() => placeOrder(form, totals, coupon), 900);
  });
}

function renderSummary(totals, coupon) {
  document.getElementById("order-summary").innerHTML = `
    <h3>Order summary</h3>
    ${cart.map(i => `
      <div class="mini-item">
        <span>${escapeHTML(i.title)} × ${i.qty}</span>
        <span>${formatPrice(i.price * i.qty)}</span>
      </div>`).join("")}
    <div class="summary-row" style="border-top:1px solid var(--border);margin-top:8px;padding-top:10px">
      <span>Subtotal</span><span>${formatPrice(totals.subtotal)}</span>
    </div>
    ${totals.discount ? `<div class="summary-row discount"><span>Coupon (${escapeHTML(coupon)})</span><span>−${formatPrice(totals.discount)}</span></div>` : ""}
    <div class="summary-row"><span>Delivery</span><span>${totals.delivery ? formatPrice(totals.delivery) : "Free"}</span></div>
    <div class="summary-row total"><span>Total</span><span>${formatPrice(totals.total)}</span></div>
    <a href="cart.html" class="btn btn-outline btn-block" style="margin-top:12px">Edit cart</a>`;
}

function placeOrder(form, totals, coupon) {
  const order = {
    id: "SE" + Date.now().toString().slice(-8),
    email: session.email,
    date: new Date().toISOString(),
    items: cart.map(({ id, title, price, qty }) => ({ id, title, price, qty })),
    totals,
    coupon,
    payment: form.elements.payment.value,
    address: {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      line: form.elements.address.value.trim(),
      city: form.elements.city.value.trim(),
      state: form.elements.state.value,
      pincode: form.elements.pincode.value.trim()
    }
  };

  saveOrder(order);
  clearCart();
  setAppliedCoupon(null);
  showSuccess(order);
}

function showSuccess(order) {
  const delivery = new Date();
  delivery.setDate(delivery.getDate() + 4);
  const deliveryText = delivery.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  document.getElementById("checkout-view").hidden = true;
  const view = document.getElementById("success-view");
  view.hidden = false;
  view.innerHTML = `
    <div class="check" aria-hidden="true">✓</div>
    <h1>Order placed</h1>
    <p>Thank you, ${escapeHTML(order.address.name.split(" ")[0])}. Your order <span class="order-id">${order.id}</span> is confirmed.</p>
    <p class="muted">${order.totals.itemCount} item(s) · ${formatPrice(order.totals.total)} · ${escapeHTML(order.payment)}<br>
      Expected delivery by <strong>${deliveryText}</strong> to ${escapeHTML(order.address.city)}, ${escapeHTML(order.address.pincode)}.</p>
    <div class="hero-actions" style="justify-content:center;margin-top:20px">
      <a href="products.html" class="btn btn-primary">Continue shopping</a>
      <a href="login.html#orders" class="btn btn-outline">View my orders</a>
    </div>`;
  document.title = "Order placed | ShopEase";
  window.scrollTo({ top: 0 });
}

// ---- Start: must be logged in and have something in the cart ----
if (!session) {
  location.replace("login.html?redirect=checkout.html");
} else if (!cart.length) {
  location.replace("cart.html");
} else {
  initPage("cart");
  setup();
}
