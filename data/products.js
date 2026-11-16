// Offline fallback data.
// Used only when the DummyJSON API cannot be reached (no internet, API down).
// Same shape as the API response; prices are in USD and converted to INR in api.js.

const IMG = "assets/placeholder.svg";

export const FALLBACK_PRODUCTS = [
  { id: 1, title: "Galaxy Nova 5G Smartphone", description: "6.5-inch AMOLED display, 128 GB storage, 50 MP triple camera and an all-day 5000 mAh battery.", category: "smartphones", price: 299.99, discountPercentage: 12.5, rating: 4.5, stock: 42, brand: "Nova", thumbnail: IMG, images: [IMG] },
  { id: 2, title: "Pixel Lite Phone", description: "Clean software, great low-light photos and three years of updates.", category: "smartphones", price: 249.0, discountPercentage: 8.0, rating: 4.3, stock: 18, brand: "Pixel", thumbnail: IMG, images: [IMG] },
  { id: 3, title: "AirBook 14 Laptop", description: "14-inch thin and light laptop with 16 GB RAM, 512 GB SSD and a 12-hour battery.", category: "laptops", price: 799.0, discountPercentage: 10.0, rating: 4.6, stock: 9, brand: "AirBook", thumbnail: IMG, images: [IMG] },
  { id: 4, title: "ProBook Gaming Laptop", description: "RTX graphics, 144 Hz screen and RGB keyboard for serious gaming.", category: "laptops", price: 1199.0, discountPercentage: 15.0, rating: 4.4, stock: 4, brand: "ProBook", thumbnail: IMG, images: [IMG] },
  { id: 5, title: "Wireless Earbuds Pro", description: "Active noise cancellation, 30-hour total playback and a compact charging case.", category: "mobile-accessories", price: 49.99, discountPercentage: 20.0, rating: 4.2, stock: 120, brand: "SoundPeak", thumbnail: IMG, images: [IMG] },
  { id: 6, title: "Smart Fitness Watch", description: "Heart-rate tracking, sleep insights, GPS and a 7-day battery.", category: "mobile-accessories", price: 79.0, discountPercentage: 18.0, rating: 4.1, stock: 0, brand: "FitPulse", thumbnail: IMG, images: [IMG] },
  { id: 7, title: "Classic Cotton T-Shirt", description: "100% cotton, regular fit, breathable everyday tee.", category: "mens-shirts", price: 9.99, discountPercentage: 5.0, rating: 4.0, stock: 200, brand: "Basics", thumbnail: IMG, images: [IMG] },
  { id: 8, title: "Denim Casual Shirt", description: "Soft washed denim with a button-down collar.", category: "mens-shirts", price: 24.5, discountPercentage: 10.0, rating: 4.2, stock: 35, brand: "UrbanWear", thumbnail: IMG, images: [IMG] },
  { id: 9, title: "Running Shoes Air", description: "Lightweight mesh upper and cushioned sole for daily runs.", category: "mens-shoes", price: 59.0, discountPercentage: 25.0, rating: 4.5, stock: 27, brand: "Stride", thumbnail: IMG, images: [IMG] },
  { id: 10, title: "Floral Summer Dress", description: "Flowy midi dress in a breezy floral print.", category: "womens-dresses", price: 34.0, discountPercentage: 15.0, rating: 4.3, stock: 22, brand: "Bloom", thumbnail: IMG, images: [IMG] },
  { id: 11, title: "Leather Handbag", description: "Structured vegan-leather tote with a zip pocket.", category: "womens-bags", price: 45.0, discountPercentage: 12.0, rating: 4.4, stock: 15, brand: "Carry", thumbnail: IMG, images: [IMG] },
  { id: 12, title: "Vitamin C Face Serum", description: "Brightening serum with 15% vitamin C and hyaluronic acid.", category: "skin-care", price: 14.99, discountPercentage: 10.0, rating: 4.6, stock: 60, brand: "Glow", thumbnail: IMG, images: [IMG] },
  { id: 13, title: "Ocean Breeze Perfume", description: "Fresh aquatic fragrance, 100 ml eau de parfum.", category: "fragrances", price: 39.0, discountPercentage: 9.0, rating: 4.2, stock: 3, brand: "Aura", thumbnail: IMG, images: [IMG] },
  { id: 14, title: "Ceramic Table Lamp", description: "Warm-light bedside lamp with a linen shade.", category: "home-decoration", price: 29.0, discountPercentage: 14.0, rating: 4.1, stock: 19, brand: "Nest", thumbnail: IMG, images: [IMG] },
  { id: 15, title: "Non-Stick Cookware Set", description: "5-piece induction-friendly set with glass lids.", category: "kitchen-accessories", price: 54.0, discountPercentage: 22.0, rating: 4.3, stock: 11, brand: "ChefLine", thumbnail: IMG, images: [IMG] },
  { id: 16, title: "Organic Green Tea", description: "100 tea bags of pure Darjeeling green tea.", category: "groceries", price: 6.5, discountPercentage: 5.0, rating: 4.7, stock: 90, brand: "LeafCo", thumbnail: IMG, images: [IMG] }
];
