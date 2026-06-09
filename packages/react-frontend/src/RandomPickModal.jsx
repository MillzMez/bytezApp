import React from "react";

function RandomPickModal({ restaurant, onClose, onRandomize }) {
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}>
      <div className="modal random-modal">
        <div className="modal-header">
          <h3>🎲 Your random pick</h3>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close">
            ×
          </button>
        </div>
        <div className="random-pick-card">
          <div className="random-pick-name">
            {restaurant.name}
          </div>
          <div className="random-pick-meta">
            {restaurant.cuisine} ·{" "}
            {"$".repeat(restaurant.price)} ·{" "}
            <span className="star">★</span>{" "}
            {restaurant.rating.toFixed(1)}
          </div>
          <div className="random-pick-address">
            📍 {restaurant.address}
          </div>
          {restaurant.notes && (
            <div className="random-pick-notes">
              📝 {restaurant.notes}
            </div>
          )}
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onRandomize}>
            🎲 Pick Again
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RandomPickModal;
