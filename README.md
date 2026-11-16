# ShopEase — E-Commerce Website Frontend

A responsive online store built with **only HTML, CSS and vanilla JavaScript** — no frameworks, no libraries.
Users can browse products, search and filter, view product details, manage a cart and wishlist,
apply coupons, sign up / log in, and place a (simulated) order.

**Live demo:** _add your GitHub Pages / Netlify link here_

## Features

- **7 pages:** Home, Shop, Product detail, Cart, Checkout, Login / My account, Wishlist
- **Live product data** from the [DummyJSON](https://dummyjson.com/docs/products) REST API using `fetch()` + async/await, with an **offline fallback** if the API is unreachable
- **Search, filters and sorting** — debounced search, category, price range, rating, in-stock only, 6 sort options, pagination
- **Filters saved in the URL** (`products.html?category=laptops&sort=price-asc`) so results can be bookmarked and shared
- **Persistent cart** in `localStorage`, shared across pages, with stock limits and a live navbar badge
- **Coupons:** `SAVE10` (10% off), `FLAT200` (₹200 off above ₹1,500), `WELCOME5` (5% off); free delivery above ₹999
- **Checkout validation** with regular expressions (Indian mobile number, 6-digit PIN code, email) and inline error messages
- **Login / signup** with password rules, SHA-256 hashing (Web Crypto API), protected checkout and redirect back after login
- **My orders** history, **wishlist**, **recently viewed** products and **related products**
- **Dark mode** that remembers your choice
- **Loading skeletons**, empty states, error states with retry, and toast notifications
- **Responsive** layout (Flexbox + Grid + media queries) with a mobile hamburger menu
- **Accessibility:** semantic HTML, labels on every input, ARIA attributes, keyboard focus styles, reduced-motion support

## Tech stack

| Layer | Technology |
| --- | --- |
| Structure | HTML5 (semantic tags, forms) |
| Styling | CSS3 (variables, Flexbox, Grid, media queries, animations) |
| Logic | JavaScript ES6+ (ES modules, async/await, event delegation, DOM APIs) |
| Data | Fetch API + DummyJSON |
| Storage | localStorage |

## How to run

The JavaScript uses **ES modules**, which browsers block when you double-click an HTML file (`file://`).
Run it through a local server instead — pick one:

1. **VS Code (easiest):** install the **Live Server** extension → right-click `index.html` → **Open with Live Server**.
2. **Python:** open a terminal in this folder and run `python -m http.server 5500`, then visit `http://localhost:5500`.
3. **Node:** `npx serve .`

**Demo account:** click **Use demo account** on the login page (demo@shopease.com / demo123), or sign up with any email.

## Folder structure

```
shopease/
├── index.html          Home page
├── products.html       Shop: search, filters, sort, pagination
├── product.html        Product detail (product.html?id=5)
├── cart.html           Cart and coupons
├── checkout.html       Address form, payment choice, order confirmation
├── login.html          Login / signup / my account and orders
├── wishlist.html       Saved products
├── css/
│   └── style.css       All styles, light and dark themes, responsive rules
├── js/
│   ├── api.js          Fetches products, normalises data, offline fallback
│   ├── storage.js      localStorage: cart, wishlist, users, session, orders, theme
│   ├── pricing.js      Coupon rules and order totals
│   ├── ui.js           Shared header/footer, product cards, toasts, helpers
│   ├── home.js         Home page
│   ├── products.js     Shop page
│   ├── product.js      Product detail page
│   ├── cart.js         Cart page
│   ├── checkout.js     Checkout page
│   ├── auth.js         Login / signup / account page
│   └── wishlist.js     Wishlist page
├── data/
│   └── products.js     Offline fallback products
└── assets/
    └── placeholder.svg Fallback product image
```

## How it works

1. **Data:** `api.js` fetches 100 products once, converts USD prices to INR, and caches them in memory.
2. **Rendering:** each page script builds HTML with template literals and inserts it into the page.
   All text from the API passes through `escapeHTML()` to prevent XSS.
3. **Events:** one click listener per product grid handles every card's buttons (**event delegation**).
4. **State:** the cart, wishlist, session and orders are stored as JSON in `localStorage`.
   A custom `cart:updated` event keeps the navbar badge in sync.
5. **Shop page:** the full product list stays in memory; `filter()` and `sort()` produce what's shown,
   and the current filters are written to the URL with `history.replaceState()`.

## Deploy (free)

- **Netlify:** go to app.netlify.com/drop and drag this folder in.
- **GitHub Pages:** push to a repo → Settings → Pages → deploy from the `main` branch.

## Limitations and future scope

- Login is a **client-side demo** — a real store needs a backend (e.g. Node.js + Express + MongoDB) with server-side authentication.
- No real payments — a gateway like Razorpay (test mode) could be added.
- Future ideas: admin dashboard, product reviews, PWA offline support.

## Screenshots

_Add screenshots of the home, shop, product, cart and checkout pages here._
