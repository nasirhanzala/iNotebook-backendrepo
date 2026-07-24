require("dotenv").config();
const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Har request se pehle DB connect hona confirm karo
app.use(async (req, res, next) => {
  try {
    await connectToMongo();
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: "Database connection failed" });
  }
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.get("/", (req, res) => {
  res.send("iNotebook Backend is Running 🚀");
});

module.exports = app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
