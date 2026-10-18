const mongoose = require("mongoose");
const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

let spawnedMongod = null;

const ensureLocalMongoRunning = async () => {
  const commonPaths = [
    "C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe"
  ];

  let mongodBin = null;
  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      mongodBin = p;
      break;
    }
  }

  if (!mongodBin) {
    try {
      const output = execSync("where mongod", { encoding: "utf8" }).trim();
      if (output) mongodBin = output.split("\r\n")[0];
    } catch {
      // ignore
    }
  }

  if (!mongodBin) {
    return false;
  }

  const dbDir = path.join(__dirname, "..", "data", "db");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  try {
    spawnedMongod = spawn(
      mongodBin,
      ["--dbpath", dbDir, "--port", "27017", "--bind_ip", "127.0.0.1"],
      {
        detached: true,
        stdio: "ignore"
      }
    );
    spawnedMongod.unref();
    // Give it a brief moment to start
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return true;
  } catch (err) {
    console.warn("Failed to spawn local mongod:", err.message);
    return false;
  }
};

const connectDB = async () => {
  // If already connected (e.g. reused serverless lambda container), return immediately
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const primaryURI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/fleetpulse";

  // In Vercel serverless environment, directly connect to cloud MongoDB
  if (process.env.VERCEL) {
    try {
      await mongoose.connect(primaryURI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log("MongoDB connected successfully (Vercel Serverless)");
      return;
    } catch (vercelErr) {
      console.error("MongoDB Atlas connection failed on Vercel:", vercelErr.message);
      throw vercelErr;
    }
  }

  // Try primary URI
  try {
    await mongoose.connect(primaryURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log("MongoDB connected successfully");
    return;
  } catch (err) {
    console.warn(`Primary MongoDB connection failed (${err.message}). Attempting local fallback...`);
  }

  // Attempt local connection
  const localURI = "mongodb://127.0.0.1:27017/fleetpulse";
  try {
    await mongoose.connect(localURI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log("MongoDB connected successfully (local 127.0.0.1:27017)");
    return;
  } catch (localErr) {
    console.log("Local MongoDB not currently running. Starting mongod instance...");
    await ensureLocalMongoRunning();
    try {
      await mongoose.connect(localURI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log("MongoDB connected successfully");
    } catch (finalErr) {
      console.error("MongoDB connection failed:", finalErr.message);
      throw finalErr;
    }
  }
};

module.exports = connectDB;

