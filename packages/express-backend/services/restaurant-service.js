import restaurantModel from "../models/restaurants.js";

function getRestaurants(
  search,
  cuisine,
  priceRange,
  reviewStars,
  reviewCount,
  averagePriceSpent,
  occasion,
  sortBy
) {
  // TODO implement number filters
  const query = {};
  const prices = ["$", "$$", "$$$", "$$$$"];

  if (search) {
    query.$or = [
      {
        name: {
          $regex: search,
          $options: "i"
        }
      },
      {
        cuisine: {
          $regex: search,
          $options: "i"
        }
      },
      {
        address: {
          $regex: search,
          $options: "i"
        }
      }
    ];
  }
  if (cuisine) {
    query.cuisine = {
      $in: cuisine.split(",")
    };
  }
  if (priceRange) {
    query.priceRange = {
      $in: prices[priceRange]
    };
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
    query.occasion = {
      $in: occasion.split(",")
    };
  }
  const sortQuery = {};
  if (sortBy === "rating-desc") {
    sortQuery.rating = -1;
  }
  if (sortBy === "rating-asc") {
    sortQuery.rating = 1;
  }
  if (sortBy === "name") {
    sortQuery.name = 1;
  }
  if (sortBy === "priceLow") {
    sortQuery.averagePriceSpent = 1;
  }
  if (sortBy === "priceHigh") {
    sortQuery.averagePriceSpent = -1;
  }
  // TODO figure out how to sort by price
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
