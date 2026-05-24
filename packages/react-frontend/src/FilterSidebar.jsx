import React from "react";

const CUISINES = [
	  "All Cuisines", "Italian", "Mexican", "Asian",
	  "American", "Mediterranean", "Seafood", "Vegan", "Indian", "Other",
];
const OCCASIONS = [
	  "Date Night", "Casual", "Game Day", "Family Dinner", "Special Occasion",
];
const RATINGS = [
	  { label: "Any rating", value: 0 },
	  { label: "4.0+", value: 4.0 },
	  { label: "4.3+", value: 4.3 },
	  { label: "4.5+", value: 4.5 },
];

function FilterSidebar({ filters, onFilterChange }) {
  function toggleCuisine(value) {
      const current = filters.cuisines || [];
       if (value === "All") {
            onFilterChange("cuisines", []);
       } else {
            const updated = current.includes(value)		
		     ? current.filter((c) => c !== value)
		     : [...current, value];
		     onFilterChange("cuisines", updated);
      }
  }

function toggleOccasion(value) {
  const current = filters.occasions || [];
  const updated = current.includes(value)
	          ? current.filter((o) => o !== value)
	          : [...current, value];
	          onFilterChange("occasions", updated);
}

  const activeCuisines = filters.cuisines || [];
  const activeOccasions = filters.occasions || [];

	return (
		      <aside className="sidebar">
		        <p className="sidebar-toggle">← Filters</p>

		        {/* Cuisine — multi-select checkboxes */}
		        <div className="filter-section">
		          <div className="filter-section-header">
		            <h3>Cuisine</h3>
		          </div>
		          <label className="filter-label">
		            <input
		              type="checkbox"
		              checked={activeCuisines.length === 0}
		              onChange={() => toggleCuisine("All")}
		            />
		            All Cuisines
		          </label>
		          {CUISINES.filter((c) => c !== "All Cuisines").map((c) => (
			            <label key={c} className="filter-label">
		                     <input
		                     type="checkbox"
		                      checked={activeCuisines.includes(c)}
		                      onChange={() => toggleCuisine(c)}
		                    />
	                         {c}
	                  </label>
	                ))}
	              </div>

		        {/* Price */}
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

		        {/* Occasion — multi-select checkboxes (like Cuisine) */}
		        <div className="filter-section">
		          <div className="filter-section-header">
		            <h3>Occasion</h3>
		          </div>
		          <label className="filter-label">
		            <input
		              type="checkbox"
		              checked={activeOccasions.length === 0}
		              onChange={() => onFilterChange("occasions", [])}
		            />
		            All
		          </label>
		          {OCCASIONS.map((o) => (
			          <label key={o} className="filter-label">
		                   <input
		                   type="checkbox"
		                    checked={activeOccasions.includes(o)}
		                    onChange={() => toggleOccasion(o)}
		                  />
		               {o}
		           </label>
		         ))}
		        </div>

		        {/* Ratings */}
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

		        {/* Other */}
		        <div className="filter-section">
		          <div className="filter-section-header">
		            <h3>Other</h3>
		          </div>
		          <label className="filter-label">
		            <input
		              type="checkbox"
		              checked={filters.hasNotes}
		              onChange={(e) => onFilterChange("hasNotes", e.target.checked)}
		            />
		            Has notes
		          </label>
		        </div>
		      </aside>
		    );
}

export default FilterSidebar;
