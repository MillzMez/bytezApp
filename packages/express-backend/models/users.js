import mongoose from "mongoose";

const SavedRestaurantSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    notes: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    favoriteRestaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant"
      }
    ],
    addedRestaurants: [SavedRestaurantSchema]
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
