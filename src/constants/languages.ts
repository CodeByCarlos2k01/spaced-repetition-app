export type AppLanguage = "en" | "es" | "ita" | "fr" | "de";

export const LANGUAGES: { label: string; value: AppLanguage }[] = [
  { label: "Inglês", value: "en" },
  { label: "Espanhol", value: "es" },
  { label: "Italiano", value: "ita" },
  { label: "Francês", value: "fr" },
  { label: "Alemão", value: "de" },
];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: "Inglês",
  es: "Espanhol",
  ita: "Italiano",
  fr: "Francês",
  de: "Alemão",
};