// ===========================================================
// api.js — loads product data
// Fetches from the DummyJSON REST API and falls back to local
// data if the network request fails.
// ===========================================================

import { FALLBACK_PRODUCTS } from "../data/products.js";

const API_URL = "https://dummyjson.com/products?limit=100";
const USD_TO_INR = 83; // DummyJSON prices are in USD

let productCache = null;   // products kept in memory after the first load
let usingFallback = false;

// Convert one raw API product into the shape the app uses
function normalize(p) {
  const images = Array.isArray(p.images) && p.images.length ? p.images : [p.thumbnail];
  return {
    id: Number(p.id),
    title: p.title,
    description: p.description || "",
    category: p.category || "other",
    brand: p.brand || "Generic",
    price: Math.round(p.price * USD_TO_INR),
    discount: Math.round(p.discountPercentage || 0),
    rating: Number((p.rating || 0).toFixed(1)),
    stock: Number(p.stock ?? 0),
    thumbnail: p.thumbnail || "assets/placeholder.svg",
    images: images.filter(Boolean)
  };
}

// Fetch with a timeout so a slow network doesn't hang the page
async function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function getAllProducts() {
  if (productCache) return productCache;
  try {
    const data = await fetchWithTimeout(API_URL);
    productCache = data.products.map(normalize);
  } catch (err) {
    console.warn("API unavailable, using offline product data:", err.message);
    usingFallback = true;
    productCache = FALLBACK_PRODUCTS.map(normalize);
  }
  return productCache;
}

export async function getProductById(id) {
  const products = await getAllProducts();
  return products.find(p => p.id === Number(id)) || null;
}

export async function getCategories() {
  const products = await getAllProducts();
  return [...new Set(products.map(p => p.category))].sort();
}

export function isUsingFallback() {
  return usingFallback;
}

// Price after discount is the selling price; the "original" price is shown struck out
export function originalPrice(p) {
  if (!p.discount) return p.price;
  return Math.round(p.price / (1 - p.discount / 100));
}
