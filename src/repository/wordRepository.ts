import { db } from "../database/database";
import { Word } from "../models/Word";

function serializeTranslations(arr: string[]) {
  return JSON.stringify(arr ?? []);
}

function parseTranslations(s: any): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(String(s));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export class WordRepository {
  add(word: Word) {
    db.runSync(
      `
      INSERT OR REPLACE INTO words (
        word, language, translations_json, status,
        learningMultipleChoiceHits, learningTypedHit,
        reviewMultipleChoiceHits, reviewTypedHit,
        interval, easeFactor, nextReview
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        word.word,
        word.language,
        serializeTranslations(word.translations),
        word.status,
        word.learningMultipleChoiceHits,
        word.learningTypedHit,
        word.reviewMultipleChoiceHits,
        word.reviewTypedHit,
        word.interval,
        word.easeFactor,
        word.nextReview,
      ]
    );
  }

  getAll(language: string): Word[] {
    const rows = db.getAllSync<any>(`SELECT * FROM words WHERE language = ?`, [language]);
    return rows.map((r) => ({
      word: r.word,
      language: r.language,
      translations: parseTranslations(r.translations_json),
      status: r.status,

      learningMultipleChoiceHits: r.learningMultipleChoiceHits ?? 0,
      learningTypedHit: r.learningTypedHit ?? 0,

      reviewMultipleChoiceHits: r.reviewMultipleChoiceHits ?? 0,
      reviewTypedHit: r.reviewTypedHit ?? 0,

      interval: Number(r.interval ?? 1),
      easeFactor: Number(r.easeFactor ?? 1.75),
      nextReview: Number(r.nextReview ?? 0),
    }));
  }

  update(word: Word) {
    this.add(word);
  }

  getDueReviews(limit = 50, language: string): Word[] {
    const rows = db.getAllSync<any>(
      `
      SELECT * FROM words
      WHERE status = 'review' AND language = ? AND nextReview <= 0
      ORDER BY nextReview ASC
      LIMIT ?
      `,
      [language, limit]
    );
    return rows.map((r) => ({
      word: r.word,
      language: r.language,
      translations: parseTranslations(r.translations_json),
      status: r.status,
      learningMultipleChoiceHits: r.learningMultipleChoiceHits ?? 0,
      learningTypedHit: r.learningTypedHit ?? 0,
      reviewMultipleChoiceHits: r.reviewMultipleChoiceHits ?? 0,
      reviewTypedHit: r.reviewTypedHit ?? 0,
      interval: Number(r.interval ?? 1),
      easeFactor: Number(r.easeFactor ?? 1.75),
      nextReview: Number(r.nextReview ?? 0),
    }));
  }

  getForgotten(language: string): Word[] {
    const rows = db.getAllSync<any>(`SELECT * FROM words WHERE status = 'forgotten' AND language = ?`, [language]);
    return rows.map((r) => ({
      word: r.word,
      language: r.language,
      translations: parseTranslations(r.translations_json),
      status: r.status,
      learningMultipleChoiceHits: r.learningMultipleChoiceHits ?? 0,
      learningTypedHit: r.learningTypedHit ?? 0,
      reviewMultipleChoiceHits: r.reviewMultipleChoiceHits ?? 0,
      reviewTypedHit: r.reviewTypedHit ?? 0,
      interval: Number(r.interval ?? 1),
      easeFactor: Number(r.easeFactor ?? 1.75),
      nextReview: Number(r.nextReview ?? 0),
    }));
  }

  getLearning(language: string): Word[] {
    const rows = db.getAllSync<any>(`SELECT * FROM words WHERE status = 'learning' AND language = ?`, [language]);
    return rows.map((r) => ({
      word: r.word,
      language: r.language,
      translations: parseTranslations(r.translations_json),
      status: r.status,
      learningMultipleChoiceHits: r.learningMultipleChoiceHits ?? 0,
      learningTypedHit: r.learningTypedHit ?? 0,
      reviewMultipleChoiceHits: r.reviewMultipleChoiceHits ?? 0,
      reviewTypedHit: r.reviewTypedHit ?? 0,
      interval: Number(r.interval ?? 1),
      easeFactor: Number(r.easeFactor ?? 1.75),
      nextReview: Number(r.nextReview ?? 0),
    }));
  }

  getReviewedWords(language: string): Word[] {
    const rows = db.getAllSync<any>(
      `SELECT * FROM words WHERE status = 'review' AND language = ? ORDER BY word COLLATE NOCASE ASC`,
      [language]
    );

    return rows.map((r) => ({
      word: r.word,
      language: r.language,
      translations: parseTranslations(r.translations_json),
      status: r.status,
      learningMultipleChoiceHits: r.learningMultipleChoiceHits ?? 0,
      learningTypedHit: r.learningTypedHit ?? 0,
      reviewMultipleChoiceHits: r.reviewMultipleChoiceHits ?? 0,
      reviewTypedHit: r.reviewTypedHit ?? 0,
      interval: Number(r.interval ?? 1),
      easeFactor: Number(r.easeFactor ?? 1.75),
      nextReview: Number(r.nextReview ?? 0),
    }));
  }
}