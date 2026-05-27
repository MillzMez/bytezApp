import UserModel from "../models/users.js";
import bcrypt from "bcrypt";

async function createUser(user) {
  const hashedPassword = await bcrypt.hash(user.password, 10);

  const userToAdd = new UserModel({
    username: user.username,
    hashedPassword,
    favoriteRestaurants: [],
    personalNotes: [],
    moods: []
  });

  return userToAdd.save();
}

function getUsers() {
  return UserModel.find()
    .populate("favoriteRestaurants")
    .populate("personalNotes.restaurant")
    .populate("moods.restaurant");
}

function findUserById(id) {
  return UserModel.findById(id)
    .populate("favoriteRestaurants")
    .populate("personalNotes.restaurant")
    .populate("moods.restaurant");
}

function findUserByUsername(username) {
  return UserModel.findOne({ username });
}

async function verifyUserPassword(username, password) {
  const user = await UserModel.findOne({ username });

  if (!user) {
    return null;
  }

  const passwordsMatch = await bcrypt.compare(
    password,
    user.hashedPassword
  );

  return passwordsMatch ? user : null;
}

function addFavoriteRestaurant(userId, restaurantId) {
  return UserModel.findByIdAndUpdate(
    userId,
    { $addToSet: { favoriteRestaurants: restaurantId } },
    { new: true }
  )
    .populate("favoriteRestaurants")
    .populate("personalNotes.restaurant")
    .populate("moods.restaurant");
}

function addPersonalNote(userId, restaurantId, note) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $push: {
        personalNotes: {
          restaurant: restaurantId,
          note
        }
      }
    },
    { new: true }
  )
    .populate("favoriteRestaurants")
    .populate("personalNotes.restaurant")
    .populate("moods.restaurant");
}

export default {
  createUser,
  getUsers,
  findUserById,
  findUserByUsername,
  verifyUserPassword,
  addFavoriteRestaurant,
  addPersonalNote
};
