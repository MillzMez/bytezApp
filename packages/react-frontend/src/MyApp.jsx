import React, { useState, useEffect, useCallback } from "react";
import Header from "./Header";
import FilterSidebar from "./FilterSidebar";
import RestaurantList from "./RestaurantList";
import LoginPage from "./LoginPage";
import MoodSidebar from "./MoodSidebar";
import FabStack from "./FabStack";
import AddRestaurantModal from "./AddRestaurantModal";
import RandomPickModal from "./RandomPickModal";
import Toast from "./Toast";
import { fromBackend, toBackend } from "./restaurantAdapter";

const API_PREFIX = "http://localhost:3000";
const INVALID_TOKEN = "INVALID_TOKEN";
const TOKEN_STORAGE_KEY = "bytez.token";

function MyApp() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    cuisines: [],
    occasions: [],
    maxPrice: 4,
    minRating: 0,
    moods: [],
    hasNotes: false
  });
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem(TOKEN_STORAGE_KEY);
    return saved || INVALID_TOKEN;
  });
  const [loggedIn, setLoggedIn] = useState(() => {
    return !!localStorage.getItem(TOKEN_STORAGE_KEY);
  });
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [favorites, setFavorites] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [randomPick, setRandomPick] = useState(null);

  function saveToken(newToken) {
    setToken(newToken);
    setLoggedIn(true);
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
  }

  function logout() {
    setToken(INVALID_TOKEN);
    setLoggedIn(false);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setRestaurants([]);
    setFavorites([]);
    setFavoritesOnly(false);
    setMessage("Logged out");
  }

  function addAuthHeader(headers = {}) {
    if (token === INVALID_TOKEN) {
      return headers;
    }

    return {
      ...headers,
      Authorization: `Bearer ${token}`
    };
  }

  const clearMessage = useCallback(() => setMessage(""), []);

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_PREFIX}/restaurants`);
      if (!response.ok) {
        setMessage("Could not load restaurants");
        return;
      }
      const data = await response.json();
      setRestaurants(data.map(fromBackend));
    } catch (error) {
      setMessage(`Load error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      loadRestaurants();
    }
  }, [loggedIn, loadRestaurants]);

  async function loginUser(creds) {
    try {
      const response = await fetch(
        `${API_PREFIX}/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(creds)
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        saveToken(data.token);
        setMessage("Login successful");
      } else {
        setMessage("Invalid username or password");
      }
    } catch (error) {
      setMessage(`Login error: ${error.message}`);
    }
  }

  async function signupUser(creds) {
    try {
      const response = await fetch(
        `${API_PREFIX}/users/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(creds)
        }
      );

      if (response.status === 201) {
        const data = await response.json();
        saveToken(data.token);
        setMessage("Signup successful");
      } else {
        setMessage("Signup failed");
      }
    } catch (error) {
      setMessage(`Signup error: ${error.message}`);
    }
  }

  if (!loggedIn) {
    return (
      <LoginPage
        onLogin={loginUser}
        onSignup={signupUser}
        message={message}
      />
    );
  }

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMood(mood) {
    setFilters((prev) => ({
      ...prev,
      moods: prev.moods.includes(mood)
        ? prev.moods.filter((m) => m !== mood)
        : [...prev.moods, mood]
    }));
  }

  function toggleFavorite(id) {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id]
    );
  }

  async function addRestaurant(newR) {
    try {
      const response = await fetch(
        `${API_PREFIX}/restaurants`,
        {
          method: "POST",
          headers: addAuthHeader({
            "Content-Type": "application/json"
          }),
          body: JSON.stringify(toBackend(newR))
        }
      );

      if (response.status === 201 || response.status === 200) {
        const saved = await response.json();
        const adapted = fromBackend(saved);
        // Keep the mood and notes the user typed in the modal since the
        // backend Restaurant schema does not store them yet.
        setRestaurants((prev) => [
          ...prev,
          {
            ...adapted,
            mood: newR.mood || [],
            notes: newR.notes || ""
          }
        ]);
        setMessage("Restaurant added");
      } else if (response.status === 401) {
        setMessage("You must be logged in to add restaurants");
      } else {
        setMessage("Could not add restaurant");
      }
    } catch (error) {
      setMessage(`Add restaurant error: ${error.message}`);
    }
  }

  async function deleteRestaurant(id) {
    try {
      const response = await fetch(
        `${API_PREFIX}/restaurants/${id}`,
        {
          method: "DELETE",
          headers: addAuthHeader()
        }
      );

      if (response.status === 204 || response.ok) {
        setRestaurants((prev) =>
          prev.filter((r) => r.id !== id)
        );
        setFavorites((prev) => prev.filter((f) => f !== id));
        setMessage("Restaurant deleted");
      } else if (response.status === 401) {
        setMessage(
          "You must be logged in to delete restaurants"
        );
      } else {
        setMessage("Could not delete restaurant");
      }
    } catch (error) {
      setMessage(`Delete error: ${error.message}`);
    }
  }

  function updateRestaurant(id, changes) {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...changes } : r))
    );
  }

  const filtered = restaurants.filter((r) => {
    if (favoritesOnly && !favorites.includes(r.id))
      return false;
    if (
      filters.cuisines.length &&
      !filters.cuisines.some((c) => r.cuisine.includes(c))
    )
      return false;
    if (r.price > filters.maxPrice) return false;
    if (r.rating < filters.minRating) return false;
    if (
      filters.occasions.length &&
      !filters.occasions.some((o) => r.occasions.includes(o))
    )
      return false;
    if (
      filters.moods.length &&
      !filters.moods.some((m) => r.mood?.includes(m))
    )
      return false;
    if (filters.hasNotes && !(r.notes && r.notes.trim()))
      return false;
    if (
      searchQuery &&
      !r.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !r.cuisine
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "rating-desc") return b.rating - a.rating;
    if (sortBy === "rating-asc") return a.rating - b.rating;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  function pickRandom() {
    if (sorted.length === 0) return;
    setRandomPick(
      sorted[Math.floor(Math.random() * sorted.length)]
    );
  }

  return (
    <div className="app-wrapper">
      <Header
        favoriteCount={favorites.length}
        favoritesOnly={favoritesOnly}
        onToggleFavorites={() => setFavoritesOnly((v) => !v)}
        onLogout={logout}
      />
      <div className="app-body">
        <FilterSidebar
          filters={filters}
          onFilterChange={updateFilter}
        />
        <RestaurantList
          restaurants={sorted}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onUpdateRestaurant={updateRestaurant}
          onDeleteRestaurant={deleteRestaurant}
        />
        <MoodSidebar
          selectedMoods={filters.moods}
          onToggleMood={toggleMood}
        />
      </div>
      <FabStack
        onAdd={() => setShowAddModal(true)}
        onRandom={pickRandom}
      />
      {showAddModal && (
        <AddRestaurantModal
          onClose={() => setShowAddModal(false)}
          onSubmit={addRestaurant}
        />
      )}
      {randomPick && (
        <RandomPickModal
          restaurant={randomPick}
          onClose={() => setRandomPick(null)}
        />
      )}
      <Toast message={message} onDismiss={clearMessage} />
    </div>
  );
}

export default MyApp;
