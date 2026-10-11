import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store database.db inside the backend directory
const DB_PATH = path.resolve(__dirname, "../../database.db");

const verboseSqlite = sqlite3.verbose();
export const sqliteDb = new verboseSqlite.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ Failed to connect to SQLite database:", err.message);
  } else {
    console.log(`📦 SQLite database connected at: ${DB_PATH}`);
  }
});

// Initialize Schema according to Blueprint
sqliteDb.serialize(() => {
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      handle TEXT PRIMARY KEY,
      name TEXT,
      bio TEXT,
      avatar_url TEXT
    )
  `);

  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS tweets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handle TEXT,
      content TEXT,
      timestamp TEXT,
      parent_id INTEGER
    )
  `);

  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handle TEXT,
      tweet_id INTEGER,
      timestamp TEXT,
      UNIQUE(handle, tweet_id)
    )
  `);
});

export default sqliteDb;
