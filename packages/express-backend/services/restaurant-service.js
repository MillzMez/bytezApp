import mongoose from "mongoose";
import restaurantModel from "../models/restaurants.js";

mongoose.set("debug", true);

mongoose
  .connect("mongodb://localhost:27017/restaurants", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch((error) => console.log(error));

function getRestaurants(name) {
  let promise;
  if (name === undefined) {
    promise = restaurantModel.find();
  }
  return promise;
}

function addRestaurant(restaurant) {
  const restaurantToAdd = new restaurantModel(restaurant);
  const promise = restaurantToAdd.save();
  return promise;
}

export default {
  getRestaurants,
  addRestaurant
};
