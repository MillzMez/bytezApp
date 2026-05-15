import restaurantModel from "../models/restaurants.js";

function getRestaurants(
  name,
  address,
  cuisine,
  priceRange,
  reviewStars,
  reviewCount,
  averagePriceSpent,
  occasion
) {
  // TODO implement number filters
  const query = {};
  if (cuisine) {
    query.cuisine = cuisine;
  }
  if (name) {
    query.name = name;
  }
  if (address) {
    query.address = address;
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
  if (occasion) {
    query.occasion = occasion;
  }
  return restaurantModel.find(query);
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
