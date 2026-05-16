import React from "react";

function FabStack({ onAdd, onRandom }) {
  return (
    <div className="fab-stack">
      <button
        className="fab fab-primary"
        onClick={onAdd}
        title="Add restaurant"
        aria-label="Add restaurant"
      >
        +
      </button>
      <button
        className="fab"
        onClick={onRandom}
        title="Pick a random restaurant"
        aria-label="Pick a random restaurant"
      >
        🎲
      </button>
    </div>
  );
}

export default FabStack;
