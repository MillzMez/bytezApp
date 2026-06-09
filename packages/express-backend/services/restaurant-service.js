import restaurantModel from "../models/restaurants.js";

function getRestaurants(
  search,
  cuisine,
  price,
  rating,
  reviews,
  averagePriceSpent,
  occasion,
  sortBy
) {
  const query = {};

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
  if (price) {
    query.price = {
      $in: String(price)
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => !Number.isNaN(value))
    };
  }
  if (rating) {
    query.rating = {
      $gte: Number(rating)
    };
  }
  if (reviews) {
    query.reviews = {
      $gte: Number(reviews)
    };
  }
  if (averagePriceSpent) {
    const averagePrice = Number(averagePriceSpent);

    query.averagePriceSpent = {
      $gte: Math.max(averagePrice - 2, 0),
      $lte: averagePrice + 2
    };
  }
  if (occasion) {
    query.occasion = {
      $in: occasion.split(",").map((value) => value.trim())
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
  if (sortBy === "price-rating-low") {
    sortQuery.price = 1;
  }
  if (sortBy === "price-rating-high") {
    sortQuery.price = -1;
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
