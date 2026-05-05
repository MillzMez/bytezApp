import React from "react";

const CUISINES = [
  "All Cuisines", "Italian", "Mexican", "Asian",
  "American", "Mediterranean", "Seafood", "Vegan", "Indian", "Other",
];
const OCCASIONS = [
  "All", "Date Night", "Casual", "Game Day", "Family Dinner", "Special Occasion",
];
const RATINGS = [
  { label: "Any rating", value: 0 },
  { label: "4.0+", value: 4.0 },
  { label: "4.3+", value: 4.3 },
  { label: "4.5+", value: 4.5 },
];

function FilterSidebar({ filters, onFilterChange }) {
  return (
    <aside className="sidebar">
      <p className="sidebar-toggle">← Filters</p>

      <div className="filter-section">
        <div className="filter-section-header">
          <h3>Cuisine</h3>
        </div>
        {CUISINES.map((c) => {
          const value = c === "All Cuisines" ? "All" : c;
          return (
            <label key={c} className="filter-label">
              <input
                type="checkbox"
                checked={filters.cuisine === value}
                onChange={() => onFilterChange("cuisine", value)}
              />
              {c}
            </label>
          );
        })}
      </div>

      <div className="filter-section">
        <div className="filter-section-header">
          <h3>Price</h3>
        </div>
        <div className="price-slider-wrapper">
          <input
            type="range"
            className="price-slider"
            min="1"
            max="4"
            step="1"
            value={filters.maxPrice}
            onChange={(e) =>
              onFilterChange("maxPrice", parseInt(e.target.value))
            }
          />
          <div className="price-labels">
            <span>$</span>
            <span>{"$".repeat(filters.maxPrice)}</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-section-header">
          <h3>Occasion</h3>
        </div>
        {OCCASIONS.map((o) => (
          <label key={o} className="filter-label">
            <input
              type="radio"
              name="occasion"
              checked={filters.occasion === o}
              onChange={() => onFilterChange("occasion", o)}
            />
            {o}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <div className="filter-section-header">
          <h3>Ratings</h3>
        </div>
        {RATINGS.map((r) => (
          <label key={r.value} className="filter-label">
            <input
              type="radio"
              name="rating"
              checked={filters.minRating === r.value}
              onChange={() => onFilterChange("minRating", r.value)}
            />
            {"★".repeat(Math.round(r.value)) || "Any"} {r.label}
          </label>
        ))}
      </div>
    </aside>
  );
}

export default FilterSidebar;