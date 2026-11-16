// ===========================================================
// storage.js — everything saved in the browser's localStorage
// Cart, wishlist, recently viewed, users, session, orders, theme.
// ===========================================================

const KEYS = {
  cart: "shopease_cart",
  wishlist: "shopease_wishlist",
  recent: "shopease_recent",
  users: "shopease_users",
  session: "shopease_session",
  orders: "shopease_orders",
  coupon: "shopease_coupon",
  theme: "shopease_theme"
};

// Safe read/write helpers (localStorage only stores strings)
function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Could not save to localStorage:", err);
  }
}

// Notify every part of the page that the cart changed
function emit(eventName) {
  document.dispatchEvent(new CustomEvent(eventName));
}

/* ---------------- Cart ---------------- */

export function getCart() {
  return read(KEYS.cart, []);
}

function saveCart(cart) {
  write(KEYS.cart, cart);
  emit("cart:updated");
}

// Returns { ok, message } so the caller can show the right toast
export function addToCart(product, qty = 1) {
  if (product.stock <= 0) return { ok: false, message: "This item is out of stock" };

  const cart = getCart();
  const item = cart.find(i => i.id === product.id);
  const currentQty = item ? item.qty : 0;
  const newQty = Math.min(currentQty + qty, product.stock);

  if (newQty === currentQty) {
    return { ok: false, message: `Only ${product.stock} in stock` };
  }

  if (item) {
    item.qty = newQty;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      stock: product.stock,
      qty: newQty
    });
  }
  saveCart(cart);
  return { ok: true, message: `${product.title} added to cart` };
}

export function updateQty(id, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, Math.min(qty, item.stock));
  saveCart(cart);
}

export function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

/* ---------------- Wishlist ---------------- */

export function getWishlist() {
  return read(KEYS.wishlist, []);
}

export function isInWishlist(id) {
  return getWishlist().some(p => p.id === id);
}

// Adds if missing, removes if present. Returns true when now in the wishlist.
export function toggleWishlist(product) {
  let list = getWishlist();
  const exists = list.some(p => p.id === product.id);
  list = exists ? list.filter(p => p.id !== product.id) : [...list, product];
  write(KEYS.wishlist, list);
  emit("wishlist:updated");
  return !exists;
}

/* ---------------- Recently viewed ---------------- */

export function addRecentlyViewed(product) {
  const list = read(KEYS.recent, []).filter(p => p.id !== product.id);
  list.unshift(product);
  write(KEYS.recent, list.slice(0, 8));
}

export function getRecentlyViewed() {
  return read(KEYS.recent, []);
}

/* ---------------- Coupon ---------------- */

export function getAppliedCoupon() {
  return read(KEYS.coupon, null);
}

export function setAppliedCoupon(code) {
  write(KEYS.coupon, code);
}

/* ---------------- Users and session (demo only) ---------------- */

export function getUsers() {
  return read(KEYS.users, []);
}

export function saveUsers(users) {
  write(KEYS.users, users);
}

export function getSession() {
  return read(KEYS.session, null);
}

export function setSession(user) {
  write(KEYS.session, { name: user.name, email: user.email });
}

export function clearSession() {
  localStorage.removeItem(KEYS.session);
}

/* ---------------- Orders ---------------- */

export function getOrders(email) {
  return read(KEYS.orders, []).filter(o => o.email === email);
}

export function saveOrder(order) {
  const orders = read(KEYS.orders, []);
  orders.unshift(order);
  write(KEYS.orders, orders);
}

/* ---------------- Theme ---------------- */

export function getTheme() {
  return localStorage.getItem(KEYS.theme) || "light";
}

export function setTheme(theme) {
  localStorage.setItem(KEYS.theme, theme);
}
