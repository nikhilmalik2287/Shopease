// ===========================================================
// wishlist.js — saved products
// ===========================================================

import { getWishlist, addToCart } from "./storage.js";
import { initPage, productCardHTML, stateBoxHTML, attachGridHandlers, showToast } from "./ui.js";

initPage("wishlist");

const grid = document.getElementById("wishlist-grid");
const moveAllBtn = document.getElementById("move-all");

function render() {
  const list = getWishlist();
  moveAllBtn.hidden = list.length === 0;
  grid.innerHTML = list.length
    ? list.map(productCardHTML).join("")
    : stateBoxHTML("♡", "Your wishlist is empty",
        "Tap the heart on any product to save it for later.",
        `<a class="btn btn-primary" href="products.html">Explore products</a>`);
}

// Removing an item from the wishlist removes its card from this page
attachGridHandlers(grid, getWishlist, (product, added) => {
  if (!added) render();
});

moveAllBtn.addEventListener("click", () => {
  const added = getWishlist().filter(p => addToCart(p, 1).ok).length;
  showToast(added ? `${added} item(s) added to cart` : "Nothing new to add", added ? "success" : "error");
});

render();
