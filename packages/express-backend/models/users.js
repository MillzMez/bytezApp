import mongoose from "mongoose";

// Way to save user's personal notes about restaurants
const RestaurantNoteSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    note: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

// Way to save user's restaurant mood choices
const RestaurantMoodSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    mood: {
      type: String,
      trim: true,
      required: true
    }
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    hashedPassword: {
      type: String,
      required: true
    },
    favoriteRestaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant"
      }
    ],
    personalNotes: [RestaurantNoteSchema],
    moods: [RestaurantMoodSchema]
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
