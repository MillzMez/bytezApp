import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import restaurantService from "./services/restaurant-service.js";
import userService from "./services/user-service.js";
import Restaurant from "./models/restaurants.js";
import multer from "multer";
import XLSX from "xlsx";

import {
  generateAccessToken,
  authenticateUser
} from "./auth.js";

dotenv.config();
const { MONGODB_URI } = process.env;

mongoose.set("debug", true);
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.log(error));

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/restaurants", (req, res) => {
  const cuisine = req.query.cuisine;
  const search = req.query.search;
  const sortBy = req.query.sortBy;
  const priceRange = req.query.priceRange;
  const reviewStars = req.query.reviewStars;
  const occasion = req.query.occasion;
  const reviewCount = req.query.reviewCount;
  const averagePriceSpent = req.query.averagePriceSpent;

  restaurantService
    .getRestaurants(
      search,
      cuisine,
      priceRange,
      reviewStars,
      reviewCount,
      averagePriceSpent,
      occasion,
      sortBy
    )
    .then((restaurant) => {
      res.status(200).send(restaurant);
    })
    .catch((error) => {
      console.log(error);
      res.status(404).send("resource not found.");
    });
});

app.get("/restaurants/:id", (req, res) => {
  const id = req.params.id;
  restaurantService
    .findRestaurantByID(id)
    .then((restaurant) => {
      res.send(restaurant);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send(error.message);
    });
});

app.post("/restaurants", authenticateUser, (req, res) => {
  const restaurantToAdd = req.body;
  restaurantService
    .addRestaurant(restaurantToAdd)
    .then((restaurant) => {
      res.status(201).send(restaurant);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.post(
  "/api/restaurants/upload",
  authenticateUser,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "No file uploaded" });
      }

      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      const restaurants = rows.map((row) => ({
        name: row.name,
        address: row.address,
        cuisine: row.cuisine,
        priceRange: row.priceRange,
        reviewStars: Number(row.reviewStars),
        reviewCount: Number(row.reviewCount),
        averagePriceSpent: Number(row.averagePriceSpent),
        occasion: row.occasion
      }));

      await Restaurant.deleteMany({});
      const result = await Restaurant.insertMany(restaurants);

      res.json({
        message: "Restaurants uploaded successfully",
        insertedCount: result.insertedCount
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete("/restaurants/:id", authenticateUser, (req, res) => {
  const id = req.params.id;
  restaurantService
    .deleteRestaurantById(id)
    .then(() => {
      res.status(204).send();
    })
    .catch((error) => {
      console.log(error);
      res.status(404).send("Resource not found.");
    });
});

app.post("/users/signup", async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    const token = generateAccessToken(newUser);

    res.status(201).send({
      message: "User created successfully",
      token,
      user: {
        _id: newUser._id,
        username: newUser.username
      }
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

app.post("/users/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await userService.verifyUserPassword(
      username,
      password
    );

    if (!user) {
      return res.status(401).send({
        message: "Invalid username or password"
      });
    }

    const token = generateAccessToken(user);

    res.status(200).send({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
