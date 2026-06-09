import React, { useState } from "react";

const CUISINES = [
  "Italian",
  "Mexican",
  "Asian",
  "American",
  "Mediterranean",
  "Seafood",
  "Vegan",
  "Indian",
  "Other"
];
const OCCASIONS = [
  "Date Night",
  "Casual",
  "Game Day",
  "Family Dinner",
  "Special Occasion"
];
const MOODS = [
  "Happy",
  "Sad",
  "Angry",
  "Chill/Neutral",
  "Cozy",
  "Adventurous",
  "Romantic",
  "Energetic",
  "Comfort",
  "Celebratory"
];

function AddRestaurantModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cuisine, setCuisine] = useState(CUISINES[0]);
  const [price, setPrice] = useState(2);
  const [rating, setRating] = useState(4.0);
  const [reviews, setReviews] = useState(0);
  const [occasions, setOccasions] = useState([]);
  const [mood, setMood] = useState([]);
  const [notes, setNotes] = useState("");

  function toggleInList(value, list, setter) {
    setter(
      list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      address: address.trim(),
      cuisine,
      price: Number(price),
      rating: Number(rating),
      reviews: Number(reviews),
      occasions,
      mood,
      notes: notes.trim()
    });
    onClose();
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <h3>Add a restaurant</h3>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Cuisine</label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}>
              {CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Price ({"$".repeat(price)})</label>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={price}
              onChange={(e) =>
                setPrice(parseInt(e.target.value))
              }
            />
          </div>
          <div className="form-field">
            <label>Rating (0–5)</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Reviews count</label>
            <input
              type="number"
              min="0"
              step="1"
              value={reviews}
              onChange={(e) => setReviews(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Occasions</label>
            <div className="form-checkbox-group">
              {OCCASIONS.map((o) => (
                <label key={o}>
                  <input
                    type="checkbox"
                    checked={occasions.includes(o)}
                    onChange={() =>
                      toggleInList(o, occasions, setOccasions)
                    }
                  />
                  {o}
                </label>
              ))}
            </div>
          </div>
          <div className="form-field">
            <label>Mood</label>
            <div className="form-checkbox-group">
              {MOODS.map((m) => (
                <label key={m}>
                  <input
                    type="checkbox"
                    checked={mood.includes(m)}
                    onChange={() =>
                      toggleInList(m, mood, setMood)
                    }
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>
          <div className="form-field">
            <label>Notes</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Restaurant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRestaurantModal;
