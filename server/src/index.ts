import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import studentRoutes from "./routes/students.js";
import problemRoutes from "./routes/problems.js";
import submissionRoutes from "./routes/submissions.js";
import lessonContentRoutes from "./routes/lessonContent.js";
import analyticsRoutes from "./routes/analytics.js";
import { closeBrowser } from "./services/evaluator.js";
import { seedDatabase } from "./seed.js";

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/amypo-ai-learn";

import { MongoMemoryServer } from 'mongodb-memory-server';
let mongoServer: MongoMemoryServer | null = null;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/lesson-content", lessonContentRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
async function start() {
  try {
    let uri = MONGODB_URI;
    if (uri.includes("<cluster>") || uri.includes("localhost")) {
      console.log("Using MongoDB Memory Server since no real DB is provided...");
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    console.log(`Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully");

    if (mongoServer) {
      console.log("Auto-seeding memory database...");
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await closeBrowser();
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeBrowser();
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  process.exit(0);
});

start();
