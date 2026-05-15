import UserModel from "../models/users.js";

function createUser(user) {
  const userToAdd = new UserModel(user);
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
  addFavoriteRestaurant,
  addRestaurantWithNotes
};
