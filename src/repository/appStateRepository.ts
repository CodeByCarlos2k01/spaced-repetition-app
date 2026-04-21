import { AppLanguage } from "../constants/languages";
import { db } from "../database/database";

type LanguageListener = (language: AppLanguage) => void;

const languageListeners = new Set<LanguageListener>();
let cachedSelectedLanguage: AppLanguage | null = null;

function readSelectedLanguageFromDb(): AppLanguage {
  const row = db.getFirstSync<{ value: string }>(
    "SELECT value FROM app_state WHERE key = ?",
    ["selectedLanguage"]
  );

  if (row?.value === "es") return "es";
  if (row?.value === "ita") return "ita";
  if (row?.value === "fr") return "fr";
  if (row?.value === "de") return "de";
  return "en";
}

export function getSelectedLanguage(): AppLanguage {
  if (cachedSelectedLanguage) return cachedSelectedLanguage;

  cachedSelectedLanguage = readSelectedLanguageFromDb();
  return cachedSelectedLanguage;
}

export function setSelectedLanguage(language: AppLanguage) {
  db.runSync(
    "INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)",
    ["selectedLanguage", language]
  );

  cachedSelectedLanguage = language;

  for (const listener of languageListeners) {
    try {
      listener(language);
    } catch (error) {
      console.error("Erro ao notificar troca de idioma:", error);
    }
  }
}

export function subscribeSelectedLanguage(listener: LanguageListener) {
  languageListeners.add(listener);
  return () => {
    languageListeners.delete(listener);
  };
}

export function refreshSelectedLanguageCache() {
  cachedSelectedLanguage = readSelectedLanguageFromDb();
  return cachedSelectedLanguage;
}
