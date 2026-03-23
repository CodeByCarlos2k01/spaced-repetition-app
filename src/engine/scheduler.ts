import { Word } from "../models/Word";

export function advanceDay(words: Word[]) {
  words.forEach(word => {
    if (word.status === "review") {
      word.nextReview -= 1;
    }
  });
}

export function getDueReviews(words: Word[]): Word[] {
  return words
    .filter(w => w.status === "review" && w.nextReview <= 0)
    .sort((a, b) => a.nextReview - b.nextReview)
    .slice(0, 50);
}

export function getForgotten(words: Word[]): Word[] {
  return words.filter(w => w.status === "forgotten");
}