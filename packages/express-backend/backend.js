import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import restaurantService from "./services/restaurant-service.js";
import userService from "./services/user-service.js";
import Restaurant from "./models/restaurants.js";
import multer from "multer";
import XLSX from "xlsx";
import fs from "fs/promises";

import {
  generateAccessToken,
  authenticateUser,
  requireDeveloperUploadKey
} from "./auth.js";

dotenv.config();
const { MONGODB_URI } = process.env;

mongoose.set("debug", process.env.NODE_ENV !== "production");
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.log(error));

const app = express();
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter(req, file, callback) {
    const allowedMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
      "text/plain"
    ];

    const isCsv = file.originalname
      .toLowerCase()
      .endsWith(".csv");

    const isXlsx = file.originalname
      .toLowerCase()
      .endsWith(".xlsx");

    if (
      allowedMimeTypes.includes(file.mimetype) ||
      isCsv ||
      isXlsx
    ) {
      return callback(null, true);
    }

    return callback(
      new Error("Only Excel or CSV files are allowed")
    );
  }
});

const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Protected route for the currently logged-in user.
// 1. authenticateUser reads the JWT from the Authorization header.
// 2. The JWT is verified and its payload is stored in req.user.
// 3. req.user.id contains the user's MongoDB _id from the token.
// 4. findUserById() loads the full user document from MongoDB.
// 5. The populated user data is returned to the frontend.
app.get("/users/me", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userService.findUserById(userId);

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get(
  "/users/me/favorites",
  authenticateUser,
  async (req, res) => {
    const user = await userService.findUserById(req.user.id);
    res.status(200).send(user.favoriteRestaurants);
  }
);

app.get(
  "/users/me/notes",
  authenticateUser,
  async (req, res) => {
    const user = await userService.findUserById(req.user.id);
    res.status(200).send(user.personalNotes);
  }
);

app.get(
  "/users/me/moods",
  authenticateUser,
  async (req, res) => {
    const user = await userService.findUserById(req.user.id);
    res.status(200).send(user.moods);
  }
);

app.get("/users/me/saved", authenticateUser, (req, res) => {
  const userId = req.user.id;
  userService
    .getSavedRestaurants(userId)
    .then((restaurant) => {
      res.status(200).send(restaurant);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/restaurants", authenticateUser, (req, res) => {
  const cuisine = req.query.cuisine;
  const search = req.query.search;
  const sortBy = req.query.sortBy;
  const price = req.query.price;
  const rating = req.query.rating;
  const occasion = req.query.occasion;
  const reviews = req.query.reviews;
  const averagePriceSpent = req.query.averagePriceSpent;
  const moods = req.query.moods;
  const hasNotes = req.query.hasNotes;
  const userId = req.user.id;

  restaurantService
    .getRestaurants(
      search,
      cuisine,
      price,
      rating,
      reviews,
      averagePriceSpent,
      occasion,
      sortBy
    )
    .then((restaurant) => {
      userService
        .addUserRestaurantData(
          restaurant,
          userId,
          sortBy,
          moods,
          hasNotes
        )
        .then((restaurant) => {
          res.status(200).send(restaurant);
        })
        .catch((error) => {
          console.log(error);
          res.status(404).send("resource not found.");
        });
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
  "/users/me/favorites/:restaurantId",
  authenticateUser,
  (req, res) => {
    const restaurantId = req.params.restaurantId;
    const userId = req.user.id;

    userService
      .addFavoriteRestaurant(userId, restaurantId)
      .then((user) => {
        res.status(201).send(user);
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send(error.message);
      });
  }
);

app.delete(
  "/users/me/favorites/:restaurantId",
  authenticateUser,
  (req, res) => {
    const restaurantId = req.params.restaurantId;
    const userId = req.user.id;

    userService
      .removeFavoriteRestaurant(userId, restaurantId)
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send(error.message);
      });
  }
);

app.post("/users/me/moods", authenticateUser, (req, res) => {
  const userId = req.user.id;
  const { restaurantId, mood } = req.body;

  userService
    .addMood(userId, restaurantId, mood)
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send(error.message);
    });
});

app.delete(
  "/users/me/moods/:moodId",
  authenticateUser,
  (req, res) => {
    const userId = req.user.id;
    const moodId = req.params.moodId;

    userService
      .removeMood(userId, moodId)
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send(error.message);
      });
  }
);

app.post("/users/me/notes", authenticateUser, (req, res) => {
  const userId = req.user.id;
  const { restaurantId, note } = req.body;

  userService
    .addPersonalNote(userId, restaurantId, note)
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send(error.message);
    });
});

app.put(
  "/users/me/notes/:noteId",
  authenticateUser,
  (req, res) => {
    const userId = req.user.id;
    const noteId = req.params.noteId;
    const { note } = req.body;

    userService
      .updatePersonalNote(userId, noteId, note)
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send(error.message);
      });
  }
);

app.delete(
  "/users/me/notes/:noteId",
  authenticateUser,
  (req, res) => {
    const userId = req.user.id;
    const noteId = req.params.noteId;

    userService
      .removePersonalNote(userId, noteId)
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send(error.message);
      });
  }
);

app.post(
  "/api/restaurants/upload",
  authenticateUser,
  requireDeveloperUploadKey,
  upload.single("file"),
  async (req, res) => {
    let uploadedFilePath;

    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "No file uploaded" });
      }

      uploadedFilePath = req.file.path;

      const workbook = XLSX.readFile(uploadedFilePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      if (!rows.length) {
        return res.status(400).json({
          error: "Uploaded spreadsheet must contain at least one restaurant"
        });
      }

      const requiredColumns = ["name", "address", "cuisine"];
      const missingColumns = requiredColumns.filter(
        (column) => !Object.prototype.hasOwnProperty.call(rows[0], column)
      );

      if (missingColumns.length) {
        return res.status(400).json({
          error: `Missing required columns: ${missingColumns.join(", ")}`
        });
      }

      const restaurants = rows.map((row) => ({
        name: String(row.name || "").trim(),
        address: String(row.address || "").trim(),
        cuisine: String(row.cuisine || "").trim(),
        price: row.price
          ? Number(row.price)
          : String(row.priceRange || "").length,
        rating: Number(row.rating ?? row.reviewStars ?? 0),
        reviews: Number(row.reviews ?? row.reviewCount ?? 0),
        averagePriceSpent: Number(row.averagePriceSpent ?? 0),
        occasion: String(
          row.occasion || row.occasions || ""
        ).trim()
      }));

      const invalidRestaurant = restaurants.find(
        (restaurant) =>
          !restaurant.name ||
          !restaurant.address ||
          !restaurant.cuisine ||
          Number.isNaN(restaurant.price) ||
          Number.isNaN(restaurant.rating) ||
          Number.isNaN(restaurant.reviews) ||
          Number.isNaN(restaurant.averagePriceSpent)
      );

      if (invalidRestaurant) {
        return res.status(400).json({
          error:
            "Uploaded spreadsheet contains invalid restaurant data"
        });
      }

      await Restaurant.deleteMany({});
      const result = await Restaurant.insertMany(restaurants);

      res.json({
        message: "Restaurants uploaded successfully",
        insertedCount: result.length
      });
    } catch (err) {
      console.error("Restaurant upload failed", err);
      res.status(500).json({
        error: "Restaurant upload failed"
      });
    } finally {
      if (uploadedFilePath) {
        await fs.unlink(uploadedFilePath).catch(() => {});
      }
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

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
