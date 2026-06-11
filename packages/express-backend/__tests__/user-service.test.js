import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import userService from "../services/user-service.js";
import UserModel from "../models/users.js";
import RestaurantModel from "../models/restaurants.js";

let mongoServer;
let testRestaurant;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  await UserModel.deleteMany({});
  await RestaurantModel.deleteMany({});

  testRestaurant = await RestaurantModel.create({
    name: "Test Restaurant",
    address: "123 Test Street",
    cuisine: "Mexican",
    price: 2,
    rating: 4.5,
    reviews: 120,
    averagePriceSpent: 18,
    occasion: "Casual"
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("userService", () => {
  test("createUser creates a user with a hashed password", async () => {
    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    expect(user.username).toBe("testuser");
    expect(user.hashedPassword).not.toBe("password123");
    expect(user.favoriteRestaurants).toEqual([]);
    expect(user.personalNotes).toEqual([]);
    expect(user.moods).toEqual([]);
  });

  test("verifyUserPassword returns the user when credentials are valid", async () => {
    await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    const user = await userService.verifyUserPassword(
      "testuser",
      "password123"
    );

    expect(user).not.toBeNull();
    expect(user.username).toBe("testuser");
  });

  test("verifyUserPassword returns null when the password is invalid", async () => {
    await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    const user = await userService.verifyUserPassword(
      "testuser",
      "wrongpassword"
    );

    expect(user).toBeNull();
  });

  test("verifyUserPassword returns null when the user does not exist", async () => {
    const user = await userService.verifyUserPassword(
      "missinguser",
      "password123"
    );

    expect(user).toBeNull();
  });

  test("findUserById finds a user by Mongo id", async () => {
    const createdUser = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    const foundUser = await userService.findUserById(createdUser._id);

    expect(foundUser.username).toBe("testuser");
  });

  test("findUserByUsername finds a user by username", async () => {
    await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    const user = await userService.findUserByUsername("testuser");

    expect(user.username).toBe("testuser");
  });

  test("getUsers returns all users with populated restaurant data", async () => {
    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    await userService.addFavoriteRestaurant(user._id, testRestaurant._id);
    await userService.addPersonalNote(
      user._id,
      testRestaurant._id,
      "Great tacos"
    );
    await userService.addMood(user._id, testRestaurant._id, "happy");

    const users = await userService.getUsers();

    expect(users).toHaveLength(1);
    expect(users[0].username).toBe("testuser");
    expect(users[0].favoriteRestaurants[0].name).toBe("Test Restaurant");
    expect(users[0].personalNotes[0].restaurant.name).toBe("Test Restaurant");
    expect(users[0].moods[0].restaurant.name).toBe("Test Restaurant");
  });

  test("addFavoriteRestaurant adds a restaurant to the user's favorites", async () => {
    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    const updatedUser = await userService.addFavoriteRestaurant(
      user._id,
      testRestaurant._id
    );

    expect(updatedUser.favoriteRestaurants).toHaveLength(1);
    expect(updatedUser.favoriteRestaurants[0]._id.toString()).toBe(
      testRestaurant._id.toString()
    );
    expect(updatedUser.favoriteRestaurants[0].name).toBe("Test Restaurant");
  });

  test("removeFavoriteRestaurant removes a restaurant from the user's favorites", async () => {
    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    await userService.addFavoriteRestaurant(user._id, testRestaurant._id);

    const updatedUser = await userService.removeFavoriteRestaurant(
      user._id,
      testRestaurant._id
    );

    expect(updatedUser.favoriteRestaurants).toHaveLength(0);
  });

  test("addPersonalNote adds a personal note for a restaurant", async () => {
    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    const updatedUser = await userService.addPersonalNote(
      user._id,
      testRestaurant._id,
      "Great tacos"
    );

    expect(updatedUser.personalNotes).toHaveLength(1);
    expect(updatedUser.personalNotes[0].note).toBe("Great tacos");
    expect(updatedUser.personalNotes[0].restaurant._id.toString()).toBe(
      testRestaurant._id.toString()
    );
    expect(updatedUser.personalNotes[0].restaurant.name).toBe("Test Restaurant");
  });

  test("updatePersonalNote updates an existing personal note", async () => {
    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    const userWithNote = await userService.addPersonalNote(
      user._id,
      testRestaurant._id,
      "Great tacos"
    );

    const noteId = userWithNote.personalNotes[0]._id;

    const updatedUser = await userService.updatePersonalNote(
      user._id,
      noteId,
      "Amazing tacos"
    );

    expect(updatedUser.personalNotes[0].note).toBe("Amazing tacos");
  });

  test("removePersonalNote removes an existing personal note", async () => {
    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    const userWithNote = await userService.addPersonalNote(
      user._id,
      testRestaurant._id,
      "Great tacos"
    );

    const noteId = userWithNote.personalNotes[0]._id;

    const updatedUser = await userService.removePersonalNote(
      user._id,
      noteId
    );

    expect(updatedUser.personalNotes).toHaveLength(0);
  });

  test("addMood adds a mood for a restaurant", async () => {
    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    const updatedUser = await userService.addMood(
      user._id,
      testRestaurant._id,
      "happy"
    );

    expect(updatedUser.moods).toHaveLength(1);
    expect(updatedUser.moods[0].mood).toBe("happy");
    expect(updatedUser.moods[0].restaurant._id.toString()).toBe(
      testRestaurant._id.toString()
    );
    expect(updatedUser.moods[0].restaurant.name).toBe("Test Restaurant");
  });

  test("removeMood removes an existing mood", async () => {
    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    const userWithMood = await userService.addMood(
      user._id,
      testRestaurant._id,
      "happy"
    );

    const moodId = userWithMood.moods[0]._id;

    const updatedUser = await userService.removeMood(user._id, moodId);

    expect(updatedUser.moods).toHaveLength(0);
  });

  test("addUserRestaurantData adds favorite notes and moods to restaurants", async () => {
    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    await userService.addFavoriteRestaurant(user._id, testRestaurant._id);
    await userService.addPersonalNote(
      user._id,
      testRestaurant._id,
      "Great tacos"
    );
    await userService.addMood(user._id, testRestaurant._id, "happy");

    const restaurants = await RestaurantModel.find({});
    const result = await userService.addUserRestaurantData(
      restaurants,
      user._id
    );

    expect(result).toHaveLength(1);
    expect(result[0].favorite).toBe(true);
    expect(result[0].notes).toBe("Great tacos");
    expect(result[0].moods).toEqual(["happy"]);
  });

  test("addUserRestaurantData returns restaurants unchanged when user is missing", async () => {
    const restaurants = await RestaurantModel.find({});
    const missingUserId = new mongoose.Types.ObjectId();

    const result = await userService.addUserRestaurantData(
      restaurants,
      missingUserId
    );

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Test Restaurant");
  });

  test("addUserRestaurantData filters restaurants by mood", async () => {
    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    await userService.addMood(user._id, testRestaurant._id, "happy");

    const restaurants = await RestaurantModel.find({});
    const result = await userService.addUserRestaurantData(
      restaurants,
      user._id,
      undefined,
      ["happy"]
    );

    expect(result).toHaveLength(1);
    expect(result[0].moods).toEqual(["happy"]);
  });

  test("addUserRestaurantData filters restaurants with notes", async () => {
    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    await userService.addPersonalNote(
      user._id,
      testRestaurant._id,
      "Great tacos"
    );

    const restaurants = await RestaurantModel.find({});
    const result = await userService.addUserRestaurantData(
      restaurants,
      user._id,
      undefined,
      undefined,
      true
    );

    expect(result).toHaveLength(1);
    expect(result[0].notes).toBe("Great tacos");
  });

  test("addUserRestaurantData sorts favorite restaurants first", async () => {
    const secondRestaurant = await RestaurantModel.create({
      name: "Second Restaurant",
      address: "456 Test Street",
      cuisine: "Italian",
      price: 3,
      rating: 4,
      reviews: 50,
      averagePriceSpent: 25,
      occasion: "Dinner"
    });

    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    await userService.addFavoriteRestaurant(user._id, secondRestaurant._id);

    const restaurants = await RestaurantModel.find({}).sort({ name: 1 });
    const result = await userService.addUserRestaurantData(
      restaurants,
      user._id,
      "favorites"
    );

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Second Restaurant");
    expect(result[0].favorite).toBe(true);
    expect(result[1].favorite).toBe(false);
  });

  test("getSavedRestaurants returns the user's saved favorite restaurants", async () => {
    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    await userService.addFavoriteRestaurant(user._id, testRestaurant._id);

    const savedRestaurants = await userService.getSavedRestaurants(user._id);

    expect(savedRestaurants).toHaveLength(1);
    expect(savedRestaurants[0].restaurants).toHaveLength(1);
    expect(savedRestaurants[0].restaurants[0].name).toBe("Test Restaurant");
    expect(savedRestaurants[0].restaurants[0].favorite).toBe(true);
  });

  test("getSavedRestaurants returns favorites notes and moods", async () => {
    const user = await userService.createUser({
      username: "testuser",
      password: "password123"
    });

    await userService.addFavoriteRestaurant(user._id, testRestaurant._id);
    await userService.addPersonalNote(
      user._id,
      testRestaurant._id,
      "Great tacos"
    );
    await userService.addMood(user._id, testRestaurant._id, "happy");

    const savedRestaurants = await userService.getSavedRestaurants(user._id);

    expect(savedRestaurants).toHaveLength(1);
    expect(savedRestaurants[0].restaurants[0].favorite).toBe(true);
    expect(savedRestaurants[0].restaurants[0].notes).toEqual(["Great tacos"]);
    expect(savedRestaurants[0].restaurants[0].moods).toEqual(["happy"]);
  });
});