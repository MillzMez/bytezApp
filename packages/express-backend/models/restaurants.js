import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    cuisine: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: [1, "price must be between 1 and 4"],
      max: [4, "price must be between 1 and 4"]
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "rating must be between 0 and 5 stars"],
      max: [5, "rating must be between 0 and 5 stars"]
    },
    reviews: {
      type: Number,
      default: 0
    },
    averagePriceSpent: {
      type: Number,
      default: 0
    },
    occasion: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

const Restaurant = mongoose.model(
  "Restaurant",
  RestaurantSchema
);

export default Restaurant;
