const express = require("express");
const { MongoClient } = require("mongodb");
const multer = require("multer");
const XLSX = require("xlsx");
require("dotenv").config();
const cors = require("cors");

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);
let restaurantsCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("bytezApp");
    restaurantsCollection = db.collection("restaurants");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/api/restaurants", async (req, res) => {
  try {
    const restaurants = await restaurantsCollection
      .find({})
      .toArray();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
