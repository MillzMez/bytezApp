import UserModel from "../models/users.js";
import bcrypt from "bcryptjs";

async function createUser(user) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(user.password, saltRounds);

  const userToAdd = new UserModel({
    ...user,
    password: hashedPassword
  });

  return userToAdd.save();
}

function getUsers() {
  return UserModel.find()
    .populate("favoriteRestaurants")
    .populate("addedRestaurants.restaurant");
}

function findUserById(id) {
  return UserModel.findById(id)
    .populate("favoriteRestaurants")
    .populate("addedRestaurants.restaurant");
}

function findUserByUsername(username) {
  return UserModel.findOne({ username });
}

async function verifyUserPassword(username, password) {
  const user = await UserModel.findOne({ username });

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    return null;
  }

  return user;
}

function addFavoriteRestaurant(userId, restaurantId) {
  return UserModel.findByIdAndUpdate(
    userId,
    { $addToSet: { favoriteRestaurants: restaurantId } },
    { new: true }
  )
    .populate("favoriteRestaurants")
    .populate("addedRestaurants.restaurant");
}

function addRestaurantWithNotes(userId, restaurantId, notes) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $push: {
        addedRestaurants: {
          restaurant: restaurantId,
          notes
        }
      }
    },
    { new: true }
  )
    .populate("favoriteRestaurants")
    .populate("addedRestaurants.restaurant");
}

export default {
  createUser,
  getUsers,
  findUserById,
  findUserByUsername,
  verifyUserPassword,
  addFavoriteRestaurant,
  addRestaurantWithNotes
};
