import React, { useState } from "react";
import Header from "./Header";
import FilterSidebar from "./FilterSidebar";
import RestaurantList from "./RestaurantList";
import LoginPage from "./LoginPage";
import MoodSidebar from "./MoodSidebar";
import FabStack from "./FabStack";
import AddRestaurantModal from "./AddRestaurantModal";
import RandomPickModal from "./RandomPickModal";

const INITIAL_RESTAURANTS = [
  { id: 1, name: "Casa Marina", address: "Downtown SLO", cuisine: "Seafood & Italian", price: 2, rating: 4.5, reviews: 324, occasions: ["Date Night", "Special Occasion"], mood: ["Romantic", "Cozy"], notes: "Try the linguine vongole — best in town." },
  { id: 2, name: "Luna Trattoria", address: "Higuera St.", cuisine: "Italian", price: 3, rating: 4.7, reviews: 456, occasions: ["Date Night", "Special Occasion"], mood: ["Romantic", "Celebratory"], notes: "Reservation recommended on weekends." },
  { id: 3, name: "Olive & Thyme", address: "SLO Farmers Market", cuisine: "Mediterranean", price: 2, rating: 4.3, reviews: 189, occasions: ["Casual", "Family Dinner"], mood: ["Happy", "Comfort"], notes: "" },
  { id: 4, name: "Sakura Sushi", address: "Foothill Blvd", cuisine: "Asian", price: 2, rating: 4.6, reviews: 512, occasions: ["Date Night", "Casual"], mood: ["Adventurous", "Romantic"], notes: "Omakase on Thursdays only." },
  { id: 5, name: "The Burger Barn", address: "Osos St.", cuisine: "American", price: 1, rating: 4.2, reviews: 789, occasions: ["Casual", "Game Day"], mood: ["Happy", "Energetic"], notes: "" },
  { id: 6, name: "Taqueria Santa Cruz", address: "Broad St.", cuisine: "Mexican", price: 1, rating: 4.4, reviews: 631, occasions: ["Casual", "Game Day", "Family Dinner"], mood: ["Energetic", "Happy"], notes: "" },
  { id: 7, name: "The Steakhouse SLO", address: "Monterey St.", cuisine: "American", price: 4, rating: 4.8, reviews: 203, occasions: ["Special Occasion", "Date Night"], mood: ["Celebratory", "Romantic"], notes: "Dry-aged ribeye is the move." },
  { id: 8, name: "Green Leaf Cafe", address: "Marsh St.", cuisine: "Vegan", price: 2, rating: 4.1, reviews: 145, occasions: ["Casual", "Family Dinner"], mood: ["Comfort", "Happy"], notes: "" },
  { id: 9, name: "Spice of India", address: "Santa Rosa St.", cuisine: "Indian", price: 2, rating: 4.5, reviews: 267, occasions: ["Family Dinner", "Date Night"], mood: ["Adventurous", "Comfort"], notes: "Spice levels are no joke — order mild first." },
  { id: 10, name: "Pacific Catch", address: "Higuera St.", cuisine: "Seafood", price: 3, rating: 4.6, reviews: 388, occasions: ["Date Night", "Special Occasion"], mood: ["Romantic", "Celebratory"], notes: "Patio seats book up fast at sunset." },
  { id: 11, name: "Firestone Grill", address: "Los Osos Valley Rd", cuisine: "American", price: 1, rating: 4.3, reviews: 1024, occasions: ["Casual", "Game Day", "Family Dinner"], mood: ["Energetic", "Happy"], notes: "" },
  { id: 12, name: "Noodle House", address: "Johnson Ave.", cuisine: "Asian", price: 1, rating: 4.0, reviews: 298, occasions: ["Casual"], mood: ["Comfort", "Cozy"], notes: "" },
];

function MyApp() {
  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS);
  const [filters, setFilters] = useState({
    cuisine: "All",
    occasion: "All",
    maxPrice: 4,
    minRating: 0,
    moods: [],
    hasNotes: false,
  });
  const [loggedIn, setLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [favorites, setFavorites] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [randomPick, setRandomPick] = useState(null);

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
  }

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMood(mood) {
    setFilters((prev) => ({
      ...prev,
      moods: prev.moods.includes(mood)
        ? prev.moods.filter((m) => m !== mood)
        : [...prev.moods, mood],
    }));
  }

  function toggleFavorite(id) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  function addRestaurant(newR) {
    setRestaurants((prev) => [
      ...prev,
      { ...newR, id: Math.max(0, ...prev.map((r) => r.id)) + 1 },
    ]);
  }

  const filtered = restaurants.filter((r) => {
    if (filters.cuisine !== "All" && !r.cuisine.includes(filters.cuisine))
      return false;
    if (r.price > filters.maxPrice) return false;
    if (r.rating < filters.minRating) return false;
    if (
      filters.occasion !== "All" &&
      !r.occasions.includes(filters.occasion)
    )
      return false;
    if (
      filters.moods.length &&
      !filters.moods.some((m) => r.mood?.includes(m))
    )
      return false;
    if (filters.hasNotes && !(r.notes && r.notes.trim())) return false;
    if (
      searchQuery &&
      !r.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
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
    setRandomPick(sorted[Math.floor(Math.random() * sorted.length)]);
  }

  return (
    <div className="app-wrapper">
      <Header favoriteCount={favorites.length} />
      <div className="app-body">
        <FilterSidebar filters={filters} onFilterChange={updateFilter} />
        <RestaurantList
          restaurants={sorted}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
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
    </div>
  );
}

export default MyApp;
