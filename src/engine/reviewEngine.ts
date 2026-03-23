import { Word } from "../models/Word";

export function setForgotten(word: Word) {
  word.status = "forgotten";

  word.easeFactor -= 0.2;
  if (word.easeFactor < 1.3) {
    word.easeFactor = 1.3;
  }
}

export function completeReview(word: Word) {
  word.reviewMultipleChoiceHits = 0;
  word.reviewTypedHit = 0;

  word.interval = word.interval * word.easeFactor;
  word.nextReview = Math.round(word.interval);
}

export function completeForgotten(word: Word) {
  word.status = "review";

  word.reviewMultipleChoiceHits = 0;
  word.reviewTypedHit = 0;

  word.interval = 1;
  word.nextReview = 1;
}