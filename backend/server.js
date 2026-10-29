
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import Internship from "./models/Internship.js";
import Application from "./models/Application.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Frontend origin:", origin);
      callback(null, true);
    },
  })
);
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Student Internship Portal API is running",
  });
});

// Get all internships from MongoDB
app.get("/api/internships", async (req, res) => {
  try {
    const internships = await Internship.find().sort({
      createdAt: -1,
    });

    res.json(internships);
  } catch (error) {
    console.error("Error fetching internships:", error);
    res.status(500).json({
      message: "Failed to fetch internships",
    });
  }
});

// Get one internship by MongoDB ID
app.get("/api/internships/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid internship ID",
      });
    }

    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
      });
    }

    res.json(internship);
  } catch (error) {
    console.error("Error fetching internship:", error);
    res.status(500).json({
      message: "Failed to fetch internship",
    });
  }
});

// Submit a student application
app.post("/api/applications", async (req, res) => {
  try {
    const { name, email, rollNumber, internship } = req.body;

    if (!name || !email || !rollNumber || !internship) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    const application = await Application.create({
      name,
      email,
      rollNumber,
      internship,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Error submitting application:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to submit application",
    });
  }
});

// Get all student applications
app.get("/api/applications", async (req, res) => {
  try {
    const applications = await Application.find().sort({
      createdAt: -1,
    });

    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      message: "Failed to fetch applications",
    });
  }
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

// Connect to MongoDB before starting the server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the backend .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
