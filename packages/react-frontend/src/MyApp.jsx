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

const API_PREFIX =
  "https://bytez-api-fwgsard0b8h0bjcf.westus3-01.azurewebsites.net";
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
    if (token === INVALID_TOKEN) return;

    setLoading(true);
    try {
      const [restRes, notesRes, moodsRes] = await Promise.all([
        fetch(`${API_PREFIX}/restaurants`, {
          headers: addAuthHeader()
        }),
        fetch(`${API_PREFIX}/users/me/notes`, {
          headers: addAuthHeader()
        }),
        fetch(`${API_PREFIX}/users/me/moods`, {
          headers: addAuthHeader()
        })
      ]);

      if (restRes.status === 401) {
        logout();
        setMessage("Session expired. Please log in again.");
        return;
      }

      if (!restRes.ok) {
        setMessage("Could not load restaurants");
        return;
      }

      const data = await restRes.json();
      const notes = notesRes.ok ? await notesRes.json() : [];
      const moods = moodsRes.ok ? await moodsRes.json() : [];

      const noteIdByRestaurant = {};
      for (const n of notes) {
        const rid = n.restaurant?._id || n.restaurant;
        noteIdByRestaurant[rid] = n._id;
      }

      const moodEntriesByRestaurant = {};
      for (const m of moods) {
        const rid = m.restaurant?._id || m.restaurant;
        if (!moodEntriesByRestaurant[rid]) {
          moodEntriesByRestaurant[rid] = [];
        }
        moodEntriesByRestaurant[rid].push({
          id: m._id,
          mood: m.mood
        });
      }

      const list = data.map((doc) => {
        const r = fromBackend(doc);
        return {
          ...r,
          noteId: noteIdByRestaurant[r.id] || null,
          moodEntries: moodEntriesByRestaurant[r.id] || []
        };
      });

      setRestaurants(list);
      setFavorites(
        list.filter((r) => r.favorite).map((r) => r.id)
      );
    } catch (error) {
      setMessage(`Load error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Returns the _id of the most recent personalNotes/moods subdocument
  // belonging to a restaurant, used after a POST to capture the new id.
  function latestSubdocId(list, restaurantId) {
    const matches = (list || []).filter((item) => {
      const rid = item.restaurant?._id || item.restaurant;
      return rid === restaurantId;
    });
    const last = matches[matches.length - 1];
    return last ? last._id : null;
  }

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

  async function toggleFavorite(id) {
    const wasFavorite = favorites.includes(id);

    // Optimistically update, then revert if the request fails.
    setFavorites((prev) =>
      wasFavorite ? prev.filter((f) => f !== id) : [...prev, id]
    );

    try {
      const response = await fetch(
        `${API_PREFIX}/users/me/favorites/${id}`,
        {
          method: wasFavorite ? "DELETE" : "POST",
          headers: addAuthHeader()
        }
      );

      if (!response.ok) {
        throw new Error("request failed");
      }
    } catch (error) {
      setFavorites((prev) =>
        wasFavorite
          ? [...prev, id]
          : prev.filter((f) => f !== id)
      );
      setMessage(`Favorite error: ${error.message}`);
    }
  }

  // Create, update, or delete the logged-in user's note for a restaurant.
  async function saveNote(restaurantId, text) {
    const restaurant = restaurants.find(
      (r) => r.id === restaurantId
    );
    const noteId = restaurant?.noteId || null;
    const trimmed = (text || "").trim();

    try {
      if (!trimmed && noteId) {
        const response = await fetch(
          `${API_PREFIX}/users/me/notes/${noteId}`,
          { method: "DELETE", headers: addAuthHeader() }
        );
        if (!response.ok) throw new Error("request failed");
        updateRestaurant(restaurantId, {
          notes: "",
          noteId: null
        });
        setMessage("Note removed");
        return;
      }

      if (!trimmed) return;

      if (noteId) {
        const response = await fetch(
          `${API_PREFIX}/users/me/notes/${noteId}`,
          {
            method: "PUT",
            headers: addAuthHeader({
              "Content-Type": "application/json"
            }),
            body: JSON.stringify({ note: trimmed })
          }
        );
        if (!response.ok) throw new Error("request failed");
        updateRestaurant(restaurantId, { notes: trimmed });
      } else {
        const response = await fetch(
          `${API_PREFIX}/users/me/notes`,
          {
            method: "POST",
            headers: addAuthHeader({
              "Content-Type": "application/json"
            }),
            body: JSON.stringify({
              restaurantId,
              note: trimmed
            })
          }
        );
        if (!response.ok) throw new Error("request failed");
        const user = await response.json();
        updateRestaurant(restaurantId, {
          notes: trimmed,
          noteId: latestSubdocId(
            user.personalNotes,
            restaurantId
          )
        });
      }

      setMessage("Note saved");
    } catch (error) {
      setMessage(`Note error: ${error.message}`);
    }
  }

  // Add or remove one of the logged-in user's moods for a restaurant.
  async function toggleRestaurantMood(restaurantId, mood) {
    const restaurant = restaurants.find(
      (r) => r.id === restaurantId
    );
    if (!restaurant) return;

    const entry = (restaurant.moodEntries || []).find(
      (m) => m.mood === mood
    );

    try {
      if (entry) {
        const response = await fetch(
          `${API_PREFIX}/users/me/moods/${entry.id}`,
          { method: "DELETE", headers: addAuthHeader() }
        );
        if (!response.ok) throw new Error("request failed");
        updateRestaurant(restaurantId, {
          moods: restaurant.moods.filter((m) => m !== mood),
          moodEntries: restaurant.moodEntries.filter(
            (m) => m.mood !== mood
          )
        });
      } else {
        const response = await fetch(
          `${API_PREFIX}/users/me/moods`,
          {
            method: "POST",
            headers: addAuthHeader({
              "Content-Type": "application/json"
            }),
            body: JSON.stringify({ restaurantId, mood })
          }
        );
        if (!response.ok) throw new Error("request failed");
        const user = await response.json();
        updateRestaurant(restaurantId, {
          moods: [...restaurant.moods, mood],
          moodEntries: [
            ...(restaurant.moodEntries || []),
            {
              id: latestSubdocId(user.moods, restaurantId),
              mood
            }
          ]
        });
      }
    } catch (error) {
      setMessage(`Mood error: ${error.message}`);
    }
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

        setRestaurants((prev) => [
          ...prev,
          { ...adapted, noteId: null, moodEntries: [] }
        ]);

        // Moods and notes are per-user, so persist any the user typed in
        // the modal, then reload to pick up their generated ids.
        const moodsToAdd = newR.mood || [];
        const noteToAdd = (newR.notes || "").trim();
        if (moodsToAdd.length || noteToAdd) {
          await Promise.all([
            ...moodsToAdd.map((mood) =>
              fetch(`${API_PREFIX}/users/me/moods`, {
                method: "POST",
                headers: addAuthHeader({
                  "Content-Type": "application/json"
                }),
                body: JSON.stringify({
                  restaurantId: adapted.id,
                  mood
                })
              })
            ),
            noteToAdd
              ? fetch(`${API_PREFIX}/users/me/notes`, {
                  method: "POST",
                  headers: addAuthHeader({
                    "Content-Type": "application/json"
                  }),
                  body: JSON.stringify({
                    restaurantId: adapted.id,
                    note: noteToAdd
                  })
                })
              : Promise.resolve()
          ]);
          await loadRestaurants();
        }

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
      !filters.occasions.some((o) =>
        (r.occasion || "").includes(o)
      )
    )
      return false;
    if (
      filters.moods.length &&
      !filters.moods.some((m) => r.moods?.includes(m))
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
          onSaveNote={saveNote}
          onToggleRestaurantMood={toggleRestaurantMood}
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
          onRandomize={pickRandom}
        />
      )}
      <Toast message={message} onDismiss={clearMessage} />
    </div>
  );
}

export default MyApp;
