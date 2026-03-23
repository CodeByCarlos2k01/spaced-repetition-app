import { db } from "../database/database";
import { WordRepository } from "../repository/wordRepository";

type LearnedHistoryPoint = {
  date: string; // YYYY-MM-DD
  learnedCount: number;
};

const STUDY_TIME_MS_KEY = "study_time_ms";
const LEARNED_HISTORY_KEY = "learned_history";

function getAppStateValue(key: string): string | null {
  const rows = db.getAllSync<{ value: string }>(
    `SELECT value FROM app_state WHERE key = ? LIMIT 1`,
    [key]
  );

  if (!rows || rows.length === 0) return null;
  return rows[0].value ?? null;
}

function setAppStateValue(key: string, value: string) {
  db.runSync(
    `
    INSERT OR REPLACE INTO app_state (key, value)
    VALUES (?, ?)
    `,
    [key, value]
  );
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function addStudyTimeMs(ms: number) {
  const current = Number(getAppStateValue(STUDY_TIME_MS_KEY) ?? "0");
  const next = current + Math.max(0, ms);
  setAppStateValue(STUDY_TIME_MS_KEY, String(next));
}

export function getStudyTimeMs() {
  return Number(getAppStateValue(STUDY_TIME_MS_KEY) ?? "0");
}

export function getStudyTimeHours() {
  return getStudyTimeMs() / (1000 * 60 * 60);
}

export function saveTodayLearnedCount() {
  const repo = new WordRepository();
  const learnedCount = repo.getAll().filter((w) => w.status === "review").length;

  const raw = getAppStateValue(LEARNED_HISTORY_KEY);
  let history: LearnedHistoryPoint[] = [];

  try {
    history = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }

  const today = getTodayKey();
  const existingIndex = history.findIndex((item) => item.date === today);

  if (existingIndex >= 0) {
    history[existingIndex].learnedCount = learnedCount;
  } else {
    history.push({
      date: today,
      learnedCount,
    });
  }

  history.sort((a, b) => a.date.localeCompare(b.date));

  setAppStateValue(LEARNED_HISTORY_KEY, JSON.stringify(history));
}

export function getLearnedHistory(): LearnedHistoryPoint[] {
  const raw = getAppStateValue(LEARNED_HISTORY_KEY);

  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.date === "string" &&
          typeof item.learnedCount === "number"
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}