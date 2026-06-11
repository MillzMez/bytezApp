import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import restaurantService from "../services/restaurant-service.js";
import RestaurantModel from "../models/restaurants.js";

let mongoServer;
let testRestaurant;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
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

describe("restaurantService", () => {
  test("addRestaurant creates a restaurant", async () => {
    const restaurant = await restaurantService.addRestaurant({
      name: "Added Restaurant",
      address: "789 Test Street",
      cuisine: "Japanese",
      price: 4,
      rating: 4.8,
      reviews: 200,
      averagePriceSpent: 40,
      occasion: "Date Night"
    });

    expect(restaurant.name).toBe("Added Restaurant");
    expect(restaurant.cuisine).toBe("Japanese");
  });

  test("findRestaurantByID finds a restaurant by id", async () => {
    const restaurant = await restaurantService.findRestaurantByID(
      testRestaurant._id
    );

    expect(restaurant.name).toBe("Test Restaurant");
  });

  test("deleteRestaurantById deletes a restaurant", async () => {
    const deletedRestaurant = await restaurantService.deleteRestaurantById(
      testRestaurant._id
    );
    const foundRestaurant = await RestaurantModel.findById(testRestaurant._id);

    expect(deletedRestaurant.name).toBe("Test Restaurant");
    expect(foundRestaurant).toBeNull();
  });

  test("getRestaurants searches by name", async () => {
    const restaurants = await restaurantService.getRestaurants("Test");

    expect(restaurants).toHaveLength(1);
    expect(restaurants[0].name).toBe("Test Restaurant");
  });

  test("getRestaurants searches by cuisine", async () => {
    const restaurants = await restaurantService.getRestaurants("Mexican");

    expect(restaurants).toHaveLength(1);
    expect(restaurants[0].cuisine).toBe("Mexican");
  });

  test("getRestaurants searches by address", async () => {
    const restaurants = await restaurantService.getRestaurants("123");

    expect(restaurants).toHaveLength(1);
    expect(restaurants[0].address).toBe("123 Test Street");
  });

  test("getRestaurants filters by cuisine price rating reviews average price and occasion", async () => {
    const restaurants = await restaurantService.getRestaurants(
      undefined,
      "Mexican",
      "2",
      "4",
      "100",
      "18",
      "Casual"
    );

    expect(restaurants).toHaveLength(1);
    expect(restaurants[0].name).toBe("Test Restaurant");
  });

  test("getRestaurants ignores invalid price values", async () => {
    const restaurants = await restaurantService.getRestaurants(
      undefined,
      undefined,
      "abc,2"
    );

    expect(restaurants).toHaveLength(1);
    expect(restaurants[0].price).toBe(2);
  });

  test("getRestaurants sorts by rating descending", async () => {
    await RestaurantModel.create({
      name: "Lower Rated Restaurant",
      address: "456 Test Street",
      cuisine: "Mexican",
      price: 1,
      rating: 3,
      reviews: 10,
      averagePriceSpent: 10,
      occasion: "Casual"
    });

    const restaurants = await restaurantService.getRestaurants(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "rating-desc"
    );

    expect(restaurants).toHaveLength(2);
    expect(restaurants[0].rating).toBeGreaterThan(restaurants[1].rating);
  });

  test("getRestaurants sorts by rating ascending", async () => {
    await RestaurantModel.create({
      name: "Lower Rated Restaurant",
      address: "456 Test Street",
      cuisine: "Mexican",
      price: 1,
      rating: 3,
      reviews: 10,
      averagePriceSpent: 10,
      occasion: "Casual"
    });

    const restaurants = await restaurantService.getRestaurants(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "rating-asc"
    );

    expect(restaurants).toHaveLength(2);
    expect(restaurants[0].rating).toBeLessThan(restaurants[1].rating);
  });

  test("getRestaurants sorts by name", async () => {
    await RestaurantModel.create({
      name: "Alpha Restaurant",
      address: "456 Test Street",
      cuisine: "Italian",
      price: 3,
      rating: 4,
      reviews: 50,
      averagePriceSpent: 25,
      occasion: "Dinner"
    });

    const restaurants = await restaurantService.getRestaurants(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "name"
    );

    expect(restaurants[0].name).toBe("Alpha Restaurant");
  });

  test("getRestaurants sorts by average price low to high", async () => {
    await RestaurantModel.create({
      name: "Expensive Restaurant",
      address: "456 Test Street",
      cuisine: "Italian",
      price: 4,
      rating: 4,
      reviews: 50,
      averagePriceSpent: 50,
      occasion: "Dinner"
    });

    const restaurants = await restaurantService.getRestaurants(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "priceLow"
    );

    expect(restaurants[0].averagePriceSpent).toBeLessThan(
      restaurants[1].averagePriceSpent
    );
  });

  test("getRestaurants sorts by average price high to low", async () => {
    await RestaurantModel.create({
      name: "Expensive Restaurant",
      address: "456 Test Street",
      cuisine: "Italian",
      price: 4,
      rating: 4,
      reviews: 50,
      averagePriceSpent: 50,
      occasion: "Dinner"
    });

    const restaurants = await restaurantService.getRestaurants(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "priceHigh"
    );

    expect(restaurants[0].averagePriceSpent).toBeGreaterThan(
      restaurants[1].averagePriceSpent
    );
  });

  test("getRestaurants sorts by price rating low to high", async () => {
    await RestaurantModel.create({
      name: "Pricier Restaurant",
      address: "456 Test Street",
      cuisine: "Italian",
      price: 4,
      rating: 4,
      reviews: 50,
      averagePriceSpent: 50,
      occasion: "Dinner"
    });

    const restaurants = await restaurantService.getRestaurants(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "price-rating-low"
    );

    expect(restaurants[0].price).toBeLessThan(restaurants[1].price);
  });

  test("getRestaurants sorts by price rating high to low", async () => {
    await RestaurantModel.create({
      name: "Pricier Restaurant",
      address: "456 Test Street",
      cuisine: "Italian",
      price: 4,
      rating: 4,
      reviews: 50,
      averagePriceSpent: 50,
      occasion: "Dinner"
    });

    const restaurants = await restaurantService.getRestaurants(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "price-rating-high"
    );

    expect(restaurants[0].price).toBeGreaterThan(restaurants[1].price);
  });
});
