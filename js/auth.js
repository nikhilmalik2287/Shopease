// ===========================================================
// auth.js — login, signup and "My account" page
// DEMO ONLY: users live in localStorage and passwords are
// hashed in the browser. A real store needs a secure backend.
// ===========================================================

import { getUsers, saveUsers, getSession, setSession, clearSession, getOrders } from "./storage.js";
import { initPage, formatPrice, escapeHTML, showToast, stateBoxHTML } from "./ui.js";

initPage("account");

const DEMO_USER = { name: "Demo User", email: "demo@shopease.com", password: "demo123" };

const authView = document.getElementById("auth-view");
const accountView = document.getElementById("account-view");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");

// Where to go after logging in (e.g. login.html?redirect=checkout.html)
const redirect = new URLSearchParams(location.search).get("redirect");
const safeRedirect = redirect && /^[a-z-]+\.html$/.test(redirect) ? redirect : null;

/* ---------------- Password hashing ---------------- */

// SHA-256 using the browser's Web Crypto API (needs http://localhost or https)
async function hashPassword(password) {
  if (window.crypto?.subtle) {
    const data = new TextEncoder().encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  return "plain:" + btoa(password); // fallback when opened as a file
}

/* ---------------- Validation ---------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setError(id, message) {
  const box = document.getElementById(`${id}-error`);
  if (box) box.textContent = message;
  const input = document.getElementById(id);
  if (input) {
    input.closest(".form-group")?.classList.toggle("invalid", Boolean(message));
    input.setAttribute("aria-invalid", Boolean(message));
  }
  return !message;
}

function clearErrors(form) {
  form.querySelectorAll(".error-msg").forEach(e => (e.textContent = ""));
  form.querySelectorAll(".form-group").forEach(g => g.classList.remove("invalid"));
}

/* ---------------- Tabs ---------------- */

function showTab(which) {
  const isLogin = which === "login";
  tabLogin.classList.toggle("active", isLogin);
  tabSignup.classList.toggle("active", !isLogin);
  tabLogin.setAttribute("aria-selected", isLogin);
  tabSignup.setAttribute("aria-selected", !isLogin);
  loginForm.hidden = !isLogin;
  signupForm.hidden = isLogin;
  clearErrors(loginForm);
  clearErrors(signupForm);
}

tabLogin.addEventListener("click", () => showTab("login"));
tabSignup.addEventListener("click", () => showTab("signup"));

/* ---------------- Login ---------------- */

async function ensureDemoUser() {
  const users = getUsers();
  if (!users.some(u => u.email === DEMO_USER.email)) {
    users.push({ name: DEMO_USER.name, email: DEMO_USER.email, passwordHash: await hashPassword(DEMO_USER.password) });
    saveUsers(users);
  }
}

function finishLogin(user, message) {
  setSession(user);
  showToast(message);
  if (safeRedirect) {
    location.href = safeRedirect;
  } else {
    initPage("account"); // refresh header with the user's name
    renderAccount();
  }
}

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  clearErrors(loginForm);
  const email = loginForm.elements.email.value.trim().toLowerCase();
  const password = loginForm.elements.password.value;

  const ok = [
    setError("login-email", EMAIL_RE.test(email) ? "" : "Enter a valid email address"),
    setError("login-password", password ? "" : "Enter your password")
  ].every(Boolean);
  if (!ok) return;

  const user = getUsers().find(u => u.email === email);
  if (!user || user.passwordHash !== await hashPassword(password)) {
    document.getElementById("login-error").textContent = "Email or password is incorrect.";
    return;
  }
  finishLogin(user, `Welcome back, ${user.name.split(" ")[0]}`);
});

document.getElementById("demo-login").addEventListener("click", async () => {
  await ensureDemoUser();
  loginForm.elements.email.value = DEMO_USER.email;
  loginForm.elements.password.value = DEMO_USER.password;
  loginForm.requestSubmit();
});

/* ---------------- Signup ---------------- */

signupForm.addEventListener("submit", async e => {
  e.preventDefault();
  clearErrors(signupForm);
  const f = signupForm.elements;
  const name = f.name.value.trim();
  const email = f.email.value.trim().toLowerCase();
  const password = f.password.value;
  const confirm = f.confirm.value;

  const ok = [
    setError("signup-name", name.length >= 3 ? "" : "Enter your full name"),
    setError("signup-email", !EMAIL_RE.test(email) ? "Enter a valid email address"
      : getUsers().some(u => u.email === email) ? "An account with this email already exists" : ""),
    setError("signup-password", password.length < 6 ? "Use at least 6 characters"
      : !/[A-Za-z]/.test(password) || !/\d/.test(password) ? "Use at least one letter and one number" : ""),
    setError("signup-confirm", confirm === password ? "" : "Passwords don't match")
  ].every(Boolean);
  if (!ok) return;

  const user = { name, email, passwordHash: await hashPassword(password) };
  saveUsers([...getUsers(), user]);
  finishLogin(user, `Account created. Welcome, ${name.split(" ")[0]}`);
});

/* ---------------- Account view ---------------- */

function orderHTML(o) {
  const date = new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return `
    <div class="order-card">
      <div class="order-card-head">
        <span><span class="order-id">${escapeHTML(o.id)}</span> · ${date}</span>
        <strong>${formatPrice(o.totals.total)}</strong>
      </div>
      <p class="muted" style="margin:8px 0 0;font-size:.88rem">
        ${o.items.map(i => `${escapeHTML(i.title)} × ${i.qty}`).join(", ")}<br>
        ${escapeHTML(o.payment)} · Delivering to ${escapeHTML(o.address.city)}, ${escapeHTML(o.address.pincode)}
      </p>
    </div>`;
}

function renderAccount() {
  const session = getSession();
  authView.hidden = Boolean(session);
  accountView.hidden = !session;
  document.title = session ? "My account | ShopEase" : "Log in | ShopEase";
  if (!session) return;

  document.getElementById("avatar").textContent = session.name.charAt(0).toUpperCase();
  document.getElementById("account-name").textContent = session.name;
  document.getElementById("account-email").textContent = session.email;

  const orders = getOrders(session.email);
  document.getElementById("orders-list").innerHTML = orders.length
    ? orders.map(orderHTML).join("")
    : stateBoxHTML("📦", "No orders yet", "Your orders will show up here.",
        `<a class="btn btn-primary" href="products.html">Start shopping</a>`);
}

document.getElementById("logout-btn").addEventListener("click", () => {
  clearSession();
  showToast("You've been logged out");
  initPage("account");
  renderAccount();
  showTab("login");
});

renderAccount();
if (location.hash === "#signup") showTab("signup");
