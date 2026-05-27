import restaurantModel from "../models/restaurants.js";

function getRestaurants(
  name,
  address,
  cuisine,
  priceRange,
  reviewStars,
  reviewCount,
  averagePriceSpent,
  occasion,
  sortBy
) {
  const query = {};
  // Case-insensitive cuisine search
  if (cuisine) {
    query.cuisine = {
      $regex: cuisine,
      $options: "i"
    };
  }
  // Case-insensitive partial restaurant name search
  if (name) {
    query.name = {
      $regex: name,
      $options: "i"
    };
  }
  // Case-insensitive partial address search
  if (address) {
    query.address = {
      $regex: address,
      $options: "i"
    };
  }
  if (priceRange) {
    query.priceRange = priceRange;
  }
  if (reviewStars) {
    query.reviewStars = {
      $gte: reviewStars
    };
  }
  if (reviewCount) {
    query.reviewCount = {
      $gte: reviewCount
    };
  }
  if (averagePriceSpent) {
    query.averagePriceSpent = {
      $gte: Math.max(averagePriceSpent - 2, 0),
      $lte: averagePriceSpent + 2
    };
  }
  // Case-insensitive occasion search
  if (occasion) {
    query.occasion = {
      $regex: occasion,
      $options: "i"
    };
  }
  // Sorting options for restaurant results
  const sortQuery = {};

  if (sortBy === "rating") {
    sortQuery.reviewStars = -1;
  }

  if (sortBy === "reviews") {
    sortQuery.reviewCount = -1;
  }

  if (sortBy === "priceLow") {
    sortQuery.averagePriceSpent = 1;
  }

  if (sortBy === "priceHigh") {
    sortQuery.averagePriceSpent = -1;
  }

  return restaurantModel.find(query).sort(sortQuery);
}

function addRestaurant(restaurant) {
  const restaurantToAdd = new restaurantModel(restaurant);
  const promise = restaurantToAdd.save();
  return promise;
}

function findRestaurantByID(id) {
  return restaurantModel.findById(id);
}

function deleteRestaurantById(id) {
  return restaurantModel.findByIdAndDelete(id);
}

export default {
  getRestaurants,
  addRestaurant,
  findRestaurantByID,
  deleteRestaurantById
};
