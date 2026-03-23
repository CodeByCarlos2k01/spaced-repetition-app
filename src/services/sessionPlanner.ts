import { WordRepository } from "../repository/wordRepository";
import type { QuizMode } from "../engine/quizRules";

export type SessionPlan =
  | { startMode: "review"; follow: QuizMode[] }   // review -> forgotten -> learning
  | { startMode: "learning"; follow: QuizMode[] } // learning only
  | null;

export function buildPlanOnExitReading(repo: WordRepository): {
  hasDueReview: boolean;
  hasForgotten: boolean;
  hasLearning: boolean;
} {
  const due = repo.getDueReviews(1).length > 0;
  const forgotten = repo.getForgotten().length > 0;
  const learning = repo.getLearning().length > 0;

  return { hasDueReview: due, hasForgotten: forgotten, hasLearning: learning };
}

export function makePlanAfterAcceptReview(repo: WordRepository): SessionPlan {
  // Se aceitou revisão: após revisão, faz esquecidas (se tiver) e depois aprendizagem (se tiver)
  const follow: QuizMode[] = [];
  if (repo.getForgotten().length > 0) follow.push("forgotten");
  if (repo.getLearning().length > 0) follow.push("learning");
  return { startMode: "review", follow };
}

export function makePlanAfterAcceptLearningOnly(): SessionPlan {
  return { startMode: "learning", follow: [] };
}