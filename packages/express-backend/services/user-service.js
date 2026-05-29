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
                      "favoriteRestaurants"
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
  addPersonalNote,
  addMood
};
