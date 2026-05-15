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
    priceRange: {
      type: String,
      required: true,
      trim: true
    },
    reviewStars: {
      type: Number,
      default: 0,
      min: [0, "review must be between 0 and 5 stars"],
      max: [5, "review must be between 0 and 5 stars"]
    },
    reviewCount: {
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
    },
    notes: {
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
