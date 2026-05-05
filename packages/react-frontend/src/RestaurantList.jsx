import React from "react";

const priceSymbol = (p) => "$".repeat(p);

function RestaurantList({
  restaurants,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  favorites,
  onToggleFavorite,
}) {
  return (
    <main className="main-content">
      <div className="restaurant-card">
        <div className="restaurant-card-header">
          <h2>Restaurants</h2>
          <div className="controls">
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="recommended">Sort by: Recommended</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
              <option value="name">Name A–Z</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {restaurants.length === 0 ? (
          <p className="no-results">No restaurants match your filters.</p>
        ) : (
          <table className="restaurant-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Cuisine</th>
                <th>Price Range</th>
                <th>Reviews</th>
                <th>Occasion</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <RestaurantRow
                  key={r.id}
                  restaurant={r}
                  isFavorite={favorites.includes(r.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

function RestaurantRow({ restaurant, isFavorite, onToggleFavorite }) {
  const r = restaurant;
  return (
    <tr>
      <td>
        <div className="restaurant-name">{r.name}</div>
        <div className="restaurant-address">📍 {r.address}</div>
      </td>
      <td>{r.cuisine}</td>
      <td className="price-range">{priceSymbol(r.price)}</td>
      <td>
        <div className="reviews">
          <span className="star">★</span>
          <span>{r.rating.toFixed(1)}</span>
          <span className="count">({r.reviews})</span>
        </div>
      </td>
      <td>
        <button className="tag-btn">+ Occasion</button>
      </td>
      <td>
        <button className="tag-btn">+ Notes</button>
      </td>
    </tr>
  );
}

export default RestaurantList;