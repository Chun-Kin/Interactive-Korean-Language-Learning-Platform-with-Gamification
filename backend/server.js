const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");
const authRoutes = require("./routes/routes"); // ✅ Import Routes
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // ✅ Allow JSON request bodies
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(
  "/audio",
  express.static(path.join(__dirname, "audio"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".mp3")) {
        res.setHeader("Content-Type", "audio/mpeg");
      }
    },
  })
);

app.use("/images", express.static(path.join(__dirname, "images")));

// ✅ Register Routes
app.use("/api/auth", authRoutes); 

console.log("✅ Auth Routes Registered: /api/auth");

// Start Server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
