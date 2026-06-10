// Translates between the backend Restaurant document and the shape the
// frontend components expect. Backend and frontend now both use
// price/rating/reviews. Occasion is stored as one string.

function parsePrice(price) {
  const asNumber = Number(price);
  if (asNumber >= 1 && asNumber <= 4) return asNumber;
  return 1;
}

export function fromBackend(doc) {
  return {
    id: doc._id,
    name: doc.name,
    address: doc.address || "",
    cuisine: doc.cuisine,
    price: parsePrice(doc.price ?? doc.priceRange),
    rating: Number(doc.rating ?? doc.reviewStars) || 0,
    reviews: Number(doc.reviews ?? doc.reviewCount) || 0,
    occasion: doc.occasion || "",
    favorite: Boolean(doc.favorite),
    moods: Array.isArray(doc.moods)
      ? doc.moods
      : Array.isArray(doc.mood)
        ? doc.mood
        : [],
    notes: doc.notes || ""
  };
}

export function toBackend(r) {
  return {
    name: r.name,
    address: r.address || "",
    cuisine: r.cuisine,
    price: parsePrice(r.price),
    rating: Number(r.rating) || 0,
    reviews: Number(r.reviews) || 0,
    averagePriceSpent: Number(r.averagePriceSpent) || 0,
    occasion: r.occasion || ""
  };
}
