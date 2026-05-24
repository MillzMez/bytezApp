import React, { useState } from "react";

function Header({ favoriteCount, favorites, restaurants }) {
	  const [showPanel, setShowPanel] = useState(false);
	  const favoriteRestaurants = restaurants.filter((r) => favorites.includes(r.id));

	  return (
		      <header className="header">
		        <div className="header-title">
		          <h1>Bytez</h1>
		          <p>Compile your taste based on mood and budget</p>
		        </div>
		        <button className="favorites-btn" onClick={() => setShowPanel(true)}>
		          ♡ My Favorites{favoriteCount > 0 && ` (${favoriteCount})`}
		        </button>

		        {showPanel && (
			        <div className="modal-backdrop" onClick={() => setShowPanel(false)}>
			          <div className="modal" onClick={(e) => e.stopPropagation()}>
			            <div className="modal-header">
			              <h3>My Favorites</h3>
			              <button className="modal-close" onClick={() => setShowPanel(false)}>×</button>
			            </div>
			            {favoriteRestaurants.length === 0 ? (
			                  <p style={{ fontSize: 13, color: "#aaa", padding: "16px 0" }}>
			                    No favorites yet — click ♡ next to a restaurant to save it.
			                  </p>
		                     ) : (
		                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
			                {favoriteRestaurants.map((r) => (
			                  <li key={r.id} style={{
		                            padding: "10px 0",
		                            borderBottom: "1px solid #f2f2f2",
			                    display: "flex",
			                    flexDirection: "column",
		                            gap: 2
		                    }}>
		                  <span style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</span>
		                   <span style={{ fontSize: 12, color: "#888" }}>
	                            {r.cuisine} · {"$".repeat(r.price)} · ★ {r.rating.toFixed(1)}
		                     </span>
		                  <span style={{ fontSize: 11, color: "#bbb" }}>📍 {r.address}</span>
		                   </li>
		                  ))}
		              </ul>
		            )}
		         </div>
		       </div>
		     )}
	        </header>
	 );
}

export default Header;
