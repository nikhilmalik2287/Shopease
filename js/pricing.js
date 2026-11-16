// ===========================================================
// pricing.js — coupon rules and order totals
// Shared by the cart page and the checkout page.
// ===========================================================

export const FREE_DELIVERY_ABOVE = 999;
export const DELIVERY_FEE = 49;

export const COUPONS = {
  SAVE10: { type: "percent", value: 10, label: "10% off your order" },
  FLAT200: { type: "flat", value: 200, minOrder: 1500, label: "₹200 off on orders above ₹1,500" },
  WELCOME5: { type: "percent", value: 5, label: "5% off for new shoppers" }
};

// Returns { valid, message }
export function validateCoupon(code, subtotal) {
  const coupon = COUPONS[code];
  if (!coupon) return { valid: false, message: "That coupon code isn't valid" };
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return { valid: false, message: `Add ₹${(coupon.minOrder - subtotal).toLocaleString("en-IN")} more to use ${code}` };
  }
  return { valid: true, message: `${code} applied: ${coupon.label}` };
}

export function calculateTotals(cart, couponCode) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  let discount = 0;
  if (couponCode && validateCoupon(couponCode, subtotal).valid) {
    const c = COUPONS[couponCode];
    discount = c.type === "percent" ? Math.round(subtotal * c.value / 100) : c.value;
  }

  const afterDiscount = subtotal - discount;
  const delivery = subtotal === 0 || afterDiscount >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total = afterDiscount + delivery;
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return { subtotal, discount, delivery, total, itemCount };
}
