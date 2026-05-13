import MongoClient from "mongodb";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import restaurantService from "./services/restaurant-service.js";
import multer from "multer";
import XLSX from "xlsx";

dotenv.config();
const { MONGODB_URI } = process.env;

mongoose.set("debug", true);
mongoose
  .connect(MONGODB_URI)
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
  const name = req.query.name;
  const address = req.query.address;
  const cuisine = req.query.cuisine;
  const priceRange = req.query.priceRange;
  const reviewStars = req.query.reviewStars;
  const reviewCount = req.query.reviewCount;
  const averagePriceSpent = req.query.averagePriceSpent;
  const occasion = req.query.occasion;

  restaurantService
    .getRestaurants(
      name,
      address,
      cuisine,
      priceRange,
      reviewStars,
      reviewCount,
      averagePriceSpent,
      occasion
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
    });
});

app.post("/restaurants", (req, res) => {
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
        name: row["Name"],
        address: row["Address"],
        cuisine: row["Cuisine"],
        priceRange: row["Price Range"],
        reviewStars: Number(row["Review Stars (out of 5)"]),
        reviewCount: Number(row["Review Count"]),
        averagePriceSpent: Number(row["Average Price Spent"]),
        occasion: row["Occasion"],
        notes: row["Notes"] || ""
      }));

      await restaurantsCollection.deleteMany({});
      const result =
        await restaurantsCollection.insertMany(restaurants);

      res.json({
        message: "Restaurants uploaded successfully",
        insertedCount: result.insertedCount
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete("/restaurants/:id", (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
