import { Word } from "../models/Word";
import { getDueReviews, getForgotten } from "./scheduler";

export type SessionStep =
  | "review"
  | "forgotten"
  | "learning"
  | "none";

export function getNextStep(words: Word[]): SessionStep {
  const dueReviews = getDueReviews(words);
  if (dueReviews.length > 0) return "review";

  const forgotten = getForgotten(words);
  if (forgotten.length > 0) return "forgotten";

  const learning = words.filter(w => w.status === "learning");
  if (learning.length > 0) return "learning";

  return "none";
}