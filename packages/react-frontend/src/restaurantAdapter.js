// Translates between the backend Restaurant document and the shape the
// frontend components expect. Backend uses priceRange/reviewStars/etc.,
// frontend uses price/rating/reviews/occasions.

const PRICE_TO_NUMBER = { $: 1, $$: 2, $$$: 3, $$$$: 4 };
const NUMBER_TO_PRICE = {
  1: "$",
  2: "$$",
  3: "$$$",
  4: "$$$$"
};

function parsePrice(priceRange) {
  if (priceRange in PRICE_TO_NUMBER)
    return PRICE_TO_NUMBER[priceRange];
  const asNumber = Number(priceRange);
  if (asNumber >= 1 && asNumber <= 4) return asNumber;
  return 1;
}

function splitOccasions(occasion) {
  if (!occasion) return [];
  return occasion
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function fromBackend(doc) {
  return {
    id: doc._id,
    name: doc.name,
    address: doc.address || "",
    cuisine: doc.cuisine,
    price: parsePrice(doc.priceRange),
    rating: Number(doc.reviewStars) || 0,
    reviews: Number(doc.reviewCount) || 0,
    occasions: splitOccasions(doc.occasion),
    mood: Array.isArray(doc.mood) ? doc.mood : [],
    notes: doc.notes || ""
  };
}

export function toBackend(r) {
  return {
    name: r.name,
    address: r.address || "",
    cuisine: r.cuisine,
    priceRange: NUMBER_TO_PRICE[r.price] || "$",
    reviewStars: Number(r.rating) || 0,
    reviewCount: Number(r.reviews) || 0,
    averagePriceSpent: 0,
    occasion: Array.isArray(r.occasions)
      ? r.occasions.join(", ")
      : ""
  };
}
