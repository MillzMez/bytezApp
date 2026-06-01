import React from "react";

function Header({ favoriteCount, favoritesOnly, onToggleFavorites, onLogout }) {
  return (
    <header className="header">
      <div className="header-title">
        <h1>Bytez</h1>
        <p>Compile your taste based on mood and budget</p>
      </div>
      <div className="header-actions">
        <button
          className={`favorites-btn ${favoritesOnly ? "favorites-btn--active" : ""}`}
          onClick={onToggleFavorites}
          title={favoritesOnly ? "Show all restaurants" : "Show favorites only"}
        >
          {favoritesOnly ? "♥" : "♡"} My Favorites
          {favoriteCount > 0 && ` (${favoriteCount})`}
        </button>
        <button className="logout-btn" onClick={onLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}

export default Header;
