import React from "react";

function Header({ favoriteCount }) {
  return (
    <header className="header">
      <div className="header-title">
        <h1>Bytez</h1>
        <p>Compile your taste based on mood and budget</p>
      </div>
      <button className="favorites-btn">
        ♡ My Favorites{favoriteCount > 0 && ` (${favoriteCount})`}
      </button>
    </header>
  );
}

export default Header;