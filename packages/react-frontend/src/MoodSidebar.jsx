import React from "react";

const MOODS = [
  "Happy",
  "Cozy",
  "Adventurous",
  "Romantic",
  "Energetic",
  "Comfort",
  "Celebratory",
];

function MoodSidebar({ selectedMoods, onToggleMood }) {
  return (
    <aside className="sidebar sidebar-right">
      <p className="sidebar-toggle">Mood →</p>
      <div className="filter-section">
        <div className="filter-section-header">
          <h3>Mood</h3>
        </div>
        {MOODS.map((m) => (
          <label key={m} className="filter-label">
            <input
              type="checkbox"
              checked={selectedMoods.includes(m)}
              onChange={() => onToggleMood(m)}
            />
            {m}
          </label>
        ))}
      </div>
    </aside>
  );
}

export default MoodSidebar;
