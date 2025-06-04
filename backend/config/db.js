const mysql = require("mysql2/promise"); // ✅ Use promise-based connection
const dotenv = require("dotenv");

dotenv.config();


const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "korean_learning",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


(async () => {
  try {
    const connection = await db.getConnection(); // ✅ Correct async method
    console.log("✅ Database connected successfully.");
    connection.release(); // ✅ Release the connection properly
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

module.exports = db;
