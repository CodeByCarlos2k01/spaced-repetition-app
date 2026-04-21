import { AppLanguage } from "../constants/languages";
export type WordStatus = "learning" | "review" | "forgotten";

export type Word = {
  word: string;
  language: AppLanguage;
  translations: string[];

  status: WordStatus;

  learningMultipleChoiceHits: number;
  learningTypedHit: number;

  reviewMultipleChoiceHits: number;
  reviewTypedHit: number;

  interval: number;
  easeFactor: number;
  nextReview: number;
};

export function createWord(word: string, language: AppLanguage, translations: string[]): Word {
  return {
    word,
    language,
    translations,
    status: "learning",
    learningMultipleChoiceHits: 0,
    learningTypedHit: 0,
    reviewMultipleChoiceHits: 0,
    reviewTypedHit: 0,
    interval: 1,
    easeFactor: 1.75,
    nextReview: 0
  };
}