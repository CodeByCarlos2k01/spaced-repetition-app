import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("words.db");

let databaseInitialized = false;

export function initDatabase() {
  if (databaseInitialized) return;

  db.execSync(`
    CREATE TABLE IF NOT EXISTS words (
      word TEXT,
      language TEXT NOT NULL,
      translations_json TEXT NOT NULL,
      status TEXT,

      learningMultipleChoiceHits INTEGER,
      learningTypedHit INTEGER,

      reviewMultipleChoiceHits INTEGER,
      reviewTypedHit INTEGER,

      interval REAL,
      easeFactor REAL,
      nextReview INTEGER,
      PRIMARY KEY (word, language)
    );
  `);

  db.execSync(`
      CREATE TABLE IF NOT EXISTS app_state (
        key TEXT PRIMARY KEY,
        value TEXT
      );
  `);

  databaseInitialized = true;
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
