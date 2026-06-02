import React, { useState } from "react";

const priceSymbol = (p) => "$".repeat(p);

const MOOD_OPTIONS = ["Happy", "Sad", "Angry", "Chill/Neutral"];

const MOOD_EMOJI = {
  Happy: "😊",
  Sad: "😢",
  Angry: "😠",
  "Chill/Neutral": "😌"
};

function RestaurantList({
  restaurants,
  loading,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  favorites,
  onToggleFavorite,
  onUpdateRestaurant,
  onDeleteRestaurant
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
              onChange={(e) => onSortChange(e.target.value)}>
              <option value="recommended">
                Sort by: Recommended
              </option>
              <option value="rating-desc">
                Rating: High to Low
              </option>
              <option value="rating-asc">
                Rating: Low to High
              </option>
              <option value="name">Name A–Z</option>
              <option value="price-asc">
                Price: Low to High
              </option>
              <option value="price-desc">
                Price: High to Low
              </option>
            </select>
          </div>
        </div>

        {loading ? (
          <SkeletonRows />
        ) : restaurants.length === 0 ? (
          <p className="no-results">
            No restaurants match your filters.
          </p>
        ) : (
          <table className="restaurant-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Cuisine</th>
                <th>Price Range</th>
                <th>Reviews</th>
                <th>Mood</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <RestaurantRow
                  key={r.id}
                  restaurant={r}
                  isFavorite={favorites.includes(r.id)}
                  onToggleFavorite={onToggleFavorite}
                  onUpdateRestaurant={onUpdateRestaurant}
                  onDeleteRestaurant={onDeleteRestaurant}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

function SkeletonRows() {
  return (
    <div className="skeleton-list">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-row" />
      ))}
    </div>
  );
}

function RestaurantRow({
  restaurant,
  isFavorite,
  onToggleFavorite,
  onUpdateRestaurant,
  onDeleteRestaurant
}) {
  const r = restaurant;
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notesDraft, setNotesDraft] = useState(r.notes || "");

  function saveNotes() {
    onUpdateRestaurant(r.id, { notes: notesDraft });
    setShowNotesModal(false);
  }

  function toggleMood(mood) {
    const current = r.mood || [];
    const updated = current.includes(mood)
      ? current.filter((m) => m !== mood)
      : [...current, mood];
    onUpdateRestaurant(r.id, { mood: updated });
  }

  const activeMoods = r.mood || [];

  return (
    <>
      <tr>
        <td>
          <button
            className={`heart-btn ${isFavorite ? "heart-btn--active" : ""}`}
            onClick={() => onToggleFavorite(r.id)}
            title={
              isFavorite
                ? "Remove from favorites"
                : "Add to favorites"
            }>
            {isFavorite ? "♥" : "♡"}
          </button>
        </td>
        <td>
          <div className="restaurant-name">{r.name}</div>
          <div className="restaurant-address">
            📍 {r.address}
          </div>
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
          <button
            className="tag-btn"
            onClick={() => setShowMoodModal(true)}
            title={
              activeMoods.length
                ? activeMoods.join(", ")
                : "Set mood"
            }>
            {activeMoods.length
              ? activeMoods
                  .map((m) => MOOD_EMOJI[m] || m)
                  .join(" ")
              : "+ Mood"}
          </button>
        </td>
        <td>
          <button
            className={`tag-btn ${r.notes ? "tag-btn--has-content" : ""}`}
            onClick={() => {
              setNotesDraft(r.notes || "");
              setShowNotesModal(true);
            }}
            title={r.notes || "Add notes"}>
            {r.notes ? "📝 Notes" : "+ Notes"}
          </button>
        </td>
        <td>
          <button
            className="row-delete-btn"
            onClick={() => setConfirmDelete(true)}
            title="Delete restaurant"
            aria-label="Delete restaurant">
            ×
          </button>
        </td>
      </tr>

      {showNotesModal && (
        <tr className="modal-row">
          <td
            colSpan={8}
            style={{ padding: 0, border: "none" }}>
            <div
              className="modal-backdrop"
              onClick={() => setShowNotesModal(false)}>
              <div
                className="modal"
                onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Notes — {r.name}</h3>
                  <button
                    className="modal-close"
                    onClick={() => setShowNotesModal(false)}>
                    ×
                  </button>
                </div>
                <div className="form-field">
                  <textarea
                    rows={4}
                    placeholder="Add your notes about this restaurant..."
                    value={notesDraft}
                    onChange={(e) =>
                      setNotesDraft(e.target.value)
                    }
                    style={{
                      resize: "vertical",
                      width: "100%"
                    }}
                    autoFocus
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setShowNotesModal(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={saveNotes}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}

      {showMoodModal && (
        <tr className="modal-row">
          <td
            colSpan={8}
            style={{ padding: 0, border: "none" }}>
            <div
              className="modal-backdrop"
              onClick={() => setShowMoodModal(false)}>
              <div
                className="modal"
                onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Mood — {r.name}</h3>
                  <button
                    className="modal-close"
                    onClick={() => setShowMoodModal(false)}>
                    ×
                  </button>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#666",
                    marginBottom: 14
                  }}>
                  Select all that apply:
                </p>
                <div className="mood-grid">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood}
                      className={`mood-chip ${activeMoods.includes(mood) ? "mood-chip--active" : ""}`}
                      onClick={() => toggleMood(mood)}>
                      {MOOD_EMOJI[mood]} {mood}
                    </button>
                  ))}
                </div>
                <div className="form-actions">
                  <button
                    className="btn-primary"
                    onClick={() => setShowMoodModal(false)}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}

      {confirmDelete && (
        <tr className="modal-row">
          <td
            colSpan={8}
            style={{ padding: 0, border: "none" }}>
            <div
              className="modal-backdrop"
              onClick={() => setConfirmDelete(false)}>
              <div
                className="modal"
                onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Delete {r.name}?</h3>
                  <button
                    className="modal-close"
                    onClick={() => setConfirmDelete(false)}>
                    ×
                  </button>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#666",
                    marginBottom: 14
                  }}>
                  This removes the restaurant from the database
                  for everyone.
                </p>
                <div className="form-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      setConfirmDelete(false);
                      onDeleteRestaurant(r.id);
                    }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default RestaurantList;
