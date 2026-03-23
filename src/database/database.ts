import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("words.db");

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS words (
      word TEXT PRIMARY KEY,
      translations_json TEXT NOT NULL,
      status TEXT,

      learningMultipleChoiceHits INTEGER,
      learningTypedHit INTEGER,

      reviewMultipleChoiceHits INTEGER,
      reviewTypedHit INTEGER,

      interval REAL,
      easeFactor REAL,
      nextReview INTEGER
    );
  `);

  db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_state (
        key TEXT PRIMARY KEY,
        value TEXT
      );
  `);
}

export async function getReviewWords() {
  const result = await db.getAllAsync(`
    SELECT * FROM words
    WHERE status = 'review'
      AND nextReview <= 0
    ORDER BY nextReview ASC
    LIMIT 50
  `);

  return result;
}

