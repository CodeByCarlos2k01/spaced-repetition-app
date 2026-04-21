import { Alert } from "react-native";
import { AppLanguage } from "../constants/languages";
import { db } from "../database/database";
import { getSelectedLanguage } from "../repository/appStateRepository";
import { WordRepository } from "../repository/wordRepository";

type LearnedHistoryPoint = {
  date: string;
  learnedCount: number;
};

const LEGACY_STUDY_TIME_MS_KEY = "study_time_ms";
const LEARNING_GOAL_KEY = "learning_goal_words";
const STUDY_GOAL_HOUR_KEY = "study_goal_hour";
const STUDY_GOAL_MINUTE_KEY = "study_goal_minute";
const DAILY_GOAL_ALERT_PREFIX = "daily_goal_alerted";
const DAILY_LEARNED_COUNT_PREFIX = "daily_learned_count";
const DAILY_STUDY_GOAL_ALERT_PREFIX = "daily_study_goal_alerted";
const DAILY_QUIZ_PROMPT_KEY = "daily_quiz_prompt";

function getLearnedHistoryKey(language: AppLanguage) {
  return `learned_history_${language}`;
}

function getDailyLearnedCountKey(language: AppLanguage, date: string) {
  return `${DAILY_LEARNED_COUNT_PREFIX}_${language}_${date}`;
}

function getDailyGoalAlertedKey(language: AppLanguage, date: string) {
  return `${DAILY_GOAL_ALERT_PREFIX}_${language}_${date}`;
}

function getDailyStudyGoalAlertedKey(date: string, language: AppLanguage) {
  return `${DAILY_STUDY_GOAL_ALERT_PREFIX}_${language}_${date}`;
}

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

function deleteAppStateValue(key: string) {
  db.runSync(`DELETE FROM app_state WHERE key = ?`, [key]);
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getStudyTimeMsKey(language: AppLanguage) {
  return `study_time_ms_${language}`;
}

export function shouldShowDailyQuizPrompt() {
  const today = getTodayKey();
  const last = getAppStateValue(DAILY_QUIZ_PROMPT_KEY);

  return last !== today;
}

export function markDailyQuizPromptShown() {
  const today = getTodayKey();
  setAppStateValue(DAILY_QUIZ_PROMPT_KEY, today);
}

export function addStudyTimeMs(ms: number, language?: AppLanguage) {
  const selectedLanguage = language ?? getSelectedLanguage();

  migrateLegacyStudyTimeIfNeeded(selectedLanguage);

  const key = getStudyTimeMsKey(selectedLanguage);
  const current = Number(getAppStateValue(key) ?? "0");
  const next = current + Math.max(0, ms);

  setAppStateValue(key, String(next));
  checkStudyGoalReached(selectedLanguage);
}

export function getStudyTimeMs(language?: AppLanguage) {
  const selectedLanguage = language ?? getSelectedLanguage();

  migrateLegacyStudyTimeIfNeeded(selectedLanguage);

  return Number(getAppStateValue(getStudyTimeMsKey(selectedLanguage)) ?? "0");
}

export function getStudyTimeHours(language?: AppLanguage) {
  return getStudyTimeMs(language) / (1000 * 60 * 60);
}

export function getLearningGoalWords() {
  return Number(getAppStateValue(LEARNING_GOAL_KEY) ?? "0");
}

export function getStudyGoalTime() {
  const rawHour = getAppStateValue(STUDY_GOAL_HOUR_KEY);
  const rawMinute = getAppStateValue(STUDY_GOAL_MINUTE_KEY);

  return {
    hour: Math.max(0, Math.floor(Number(rawHour) || 0)),
    minute: Math.max(0, Math.floor(Number(rawMinute) || 0)),
  };
}

export function setStudyGoalTime(hour?: number | null, minute?: number | null) {
  const nextHour = Math.max(0, Math.floor(Number(hour) || 0));
  const nextMinute = Math.max(0, Math.floor(Number(minute) || 0));

  if (nextHour === 0 && nextMinute === 0) {
    deleteAppStateValue(STUDY_GOAL_HOUR_KEY);
    deleteAppStateValue(STUDY_GOAL_MINUTE_KEY);
    return;
  }

  setAppStateValue(STUDY_GOAL_HOUR_KEY, String(nextHour));
  setAppStateValue(STUDY_GOAL_MINUTE_KEY, String(nextMinute));
}

export function getStudyGoalMs() {
  const { hour, minute } = getStudyGoalTime();
  return (hour * 60 + minute) * 60 * 1000;
}

export function checkStudyGoalReached(language?: AppLanguage) {
  const selectedLanguage = language ?? getSelectedLanguage();
  const studyGoalMs = getStudyGoalMs();

  if (studyGoalMs <= 0) return;

  const today = getTodayKey();
  const alertedKey = getDailyStudyGoalAlertedKey(today, selectedLanguage);
  const alreadyAlerted = getAppStateValue(alertedKey) === "1";

  if (alreadyAlerted) return;

  const totalStudyMs = getStudyTimeMs(selectedLanguage);

  if (totalStudyMs >= studyGoalMs) {
    setAppStateValue(alertedKey, "1");

    const { hour, minute } = getStudyGoalTime();
    const formatted = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    Alert.alert(
      "Meta de estudo batida!",
      `Você atingiu sua meta diária de estudo de ${formatted}.`
    );
  }
}

export function setLearningGoalWords(value?: number | null) {
  const next = Math.max(0, Math.floor(Number(value) || 0));

  if (next <= 0) {
    deleteAppStateValue(LEARNING_GOAL_KEY);
    return;
  }

  setAppStateValue(LEARNING_GOAL_KEY, String(next));
}

export function getTodayLearnedWords(language?: AppLanguage) {
  const selectedLanguage = language ?? getSelectedLanguage();
  const today = getTodayKey();
  return Number(getAppStateValue(getDailyLearnedCountKey(selectedLanguage, today)) ?? "0");
}

function migrateLegacyStudyTimeIfNeeded(language: AppLanguage) {
  const legacyValue = getAppStateValue(LEGACY_STUDY_TIME_MS_KEY);
  if (!legacyValue) return;

  const newKey = getStudyTimeMsKey(language);
  const currentLanguageValue = Number(getAppStateValue(newKey) ?? "0");
  const legacyNumber = Number(legacyValue ?? "0");

  if (legacyNumber > 0 && currentLanguageValue === 0) {
    setAppStateValue(newKey, String(legacyNumber));
  }

  deleteAppStateValue(LEGACY_STUDY_TIME_MS_KEY);
}

export function registerLearnedWordAndCheckGoal(language?: AppLanguage) {
  const selectedLanguage = language ?? getSelectedLanguage();
  const today = getTodayKey();

  const countKey = getDailyLearnedCountKey(selectedLanguage, today);
  const alertKey = getDailyGoalAlertedKey(selectedLanguage, today);

  const current = Number(getAppStateValue(countKey) ?? "0");
  const next = current + 1;

  setAppStateValue(countKey, String(next));

  const goal = getLearningGoalWords();
  const alreadyAlerted = getAppStateValue(alertKey) === "1";

  if (goal > 0 && next === goal && !alreadyAlerted) {
    setAppStateValue(alertKey, "1");
    Alert.alert(
      "Parabéns!",
      `Você bateu sua meta diária de aprendizado de ${goal} palavra${goal > 1 ? "s" : ""}.`
    );
  }

  return next;
}

export function saveTodayLearnedCount(language?: AppLanguage) {
  const selectedLanguage = language ?? getSelectedLanguage();
  const repo = new WordRepository();
  const learnedCount = repo
    .getAll(selectedLanguage)
    .filter((w) => w.status === "review").length;

  const raw = getAppStateValue(getLearnedHistoryKey(selectedLanguage));
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

  setAppStateValue(getLearnedHistoryKey(selectedLanguage), JSON.stringify(history));
}

export function getLearnedHistory(language?: AppLanguage): LearnedHistoryPoint[] {
  const selectedLanguage = language ?? getSelectedLanguage();
  const raw = getAppStateValue(getLearnedHistoryKey(selectedLanguage));

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