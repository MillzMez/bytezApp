import UserModel from "../models/users.js";
import bcrypt from "bcryptjs";
<<<<<<< HEAD
import mongoose from "mongoose";
=======
>>>>>>> origin/main

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

function removeFavoriteRestaurant(userId, restaurantId) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $pull: {
        favoriteRestaurants: restaurantId
      }
    },
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

function removePersonalNote(userId, noteId) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $pull: {
        personalNotes: {
          _id: noteId
        }
      }
    },
    { new: true }
  )
    .populate("favoriteRestaurants")
    .populate("personalNotes.restaurant")
    .populate("moods.restaurant");
}

function updatePersonalNote(userId, noteId, note) {
  return UserModel.findOneAndUpdate(
    {
      _id: userId,
      "personalNotes._id": noteId
    },
    {
      $set: {
        "personalNotes.$.note": note
      }
    },
    { new: true }
  )
    .populate("favoriteRestaurants")
    .populate("personalNotes.restaurant")
    .populate("moods.restaurant");
}

function addMood(userId, restaurantId, mood) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $push: {
        moods: {
          restaurant: restaurantId,
          mood
        }
      }
    },
    { new: true }
  )
    .populate("favoriteRestaurants")
    .populate("personalNotes.restaurant")
    .populate("moods.restaurant");
}

function removeMood(userId, moodId) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $pull: {
        moods: {
          _id: moodId
        }
      }
    },
    { new: true }
  )
    .populate("favoriteRestaurants")
    .populate("personalNotes.restaurant")
    .populate("moods.restaurant");
}

async function addUserRestaurantData(
  restaurants,
  userId,
  sortBy,
  filterMood,
  hasNotes
) {
  const user = await UserModel.findById(userId);
  if (!user) {
    console.log(
      `User ${userId} not found in add_user_restaurant_data`
    );
    return restaurants;
  }
  const favIds = new Set(
    user.favoriteRestaurants.map((id) => id.toString())
  );
  const notesMap = new Map();
  const moodMap = new Map();

  for (const note of user.personalNotes) {
    notesMap.set(note.restaurant.toString(), note.note);
  }
  for (const mood of user.moods) {
    const resId = mood.restaurant.toString();

    if (!moodMap.has(resId)) {
      moodMap.set(resId, []);
    }
    moodMap.get(resId).push(mood.mood);
  }

  let result = restaurants.map((restaurant) => {
    const resId = restaurant._id.toString();

    return {
      ...restaurant.toObject(),
      favorite: favIds.has(resId),
      notes: notesMap.get(resId) || null,
      moods: moodMap.get(resId) || []
    };
  });

  result = filter_restaurant_data(
    result,
    sortBy,
    filterMood,
    hasNotes
  );
  return result;
}

function filter_restaurant_data(
  restaurants,
  sortBy,
  mood,
  hasNotes
) {
  let result = restaurants;

  if (mood?.length) {
    result = result.filter((r) =>
      r.moods.some((m) => mood.includes(m))
    );
  }

  if (hasNotes) {
    result = result.filter((r) => r.notes !== null);
  }

  if (sortBy === "favorites") {
    result = result.sort((a, b) => b.favorite - a.favorite);
  }

  return result;
}
function getSavedRestaurants(userId) {
  return UserModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $project: {
        favoriteRestaurants: 1,
        personalNotes: 1,
        moods: 1,

        allRestaurantIds: {
          $setUnion: [
            "$favoriteRestaurants",
            {
              $map: {
                input: "$personalNotes",
                as: "note",
                in: "$$note.restaurant"
              }
            },
            {
              $map: {
                input: "$moods",
                as: "mood",
                in: "$$mood.restaurant"
              }
            }
          ]
        }
      }
    },

    {
      $lookup: {
        from: "restaurants",
        localField: "allRestaurantIds",
        foreignField: "_id",
        as: "restaurants"
      }
    },
    {
      $project: {
        restaurants: {
          $map: {
            input: "$restaurants",
            as: "restaurant",
            in: {
              $mergeObjects: [
                "$$restaurant",
                {
                  favorite: {
                    $in: [
                      "$$restaurant._id",
                      "$favoriteRestaurants"
                    ]
                  },
                  notes: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$personalNotes",
                          as: "note",
                          cond: {
                            $eq: [
                              "$$note.restaurant",
                              "$$restaurant._id"
                            ]
                          }
                        }
                      },
                      as: "note",
                      in: "$$note.note"
                    }
                  },
                  moods: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$moods",
                          as: "mood",
                          cond: {
                            $eq: [
                              "$$mood.restaurant",
                              "$$restaurant._id"
                            ]
                          }
                        }
                      },
                      as: "mood",
                      in: "$$mood.mood"
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  ]);
}

export default {
  createUser,
  getUsers,
  findUserById,
  findUserByUsername,
  verifyUserPassword,
  addFavoriteRestaurant,
  removeFavoriteRestaurant,
  addPersonalNote,
  updatePersonalNote,
  removePersonalNote,
  addMood,
  removeMood,
  addUserRestaurantData,
  getSavedRestaurants
};
