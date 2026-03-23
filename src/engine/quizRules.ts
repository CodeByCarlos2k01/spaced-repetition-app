import { Word } from "../models/Word";

export type QuizMode = "learning" | "review" | "forgotten";
export type QuestionType = "mc" | "typed";

export function applyEaseFactor(word: Word, outcome: "correct_typed" | "correct_mc" | "wrong") {
  if (outcome === "correct_typed") word.easeFactor += 0.1;
  if (outcome === "correct_mc") word.easeFactor += 0.03;
  if (outcome === "wrong") word.easeFactor -= 0.15;

  if (word.easeFactor < 1.3) word.easeFactor = 1.3;
}

export function thresholdsFor(mode: QuizMode) {
  if (mode === "learning") return { mc: 7, typed: 1 };
  // review e forgotten seguem mesma exigência
  return { mc: 3, typed: 1 };
}

export function getProgress(word: Word, mode: QuizMode) {
  if (mode === "learning") {
    return {
      mc: word.learningMultipleChoiceHits,
      typed: word.learningTypedHit,
    };
  }
  // review ou forgotten
  return {
    mc: word.reviewMultipleChoiceHits,
    typed: word.reviewTypedHit,
  };
}

export function incrementProgress(word: Word, mode: QuizMode, kind: "mc" | "typed") {
  if (mode === "learning") {
    if (kind === "mc") word.learningMultipleChoiceHits += 1;
    if (kind === "typed") word.learningTypedHit = 1;
    return;
  }
  if (kind === "mc") word.reviewMultipleChoiceHits += 1;
  if (kind === "typed") word.reviewTypedHit = 1;
}

export function isWordDone(word: Word, mode: QuizMode) {
  const th = thresholdsFor(mode);
  const p = getProgress(word, mode);
  return p.mc >= th.mc && p.typed >= th.typed;
}

// Decide o tipo da próxima pergunta para a palavra:
// - Se já bateu MC mas falta digitação: força digitada
// - Se já bateu digitada mas falta MC: força MC
// - Se falta os dois: mistura (prioriza MC, mas deixa digitação aparecer)
export function chooseQuestionType(word: Word, mode: QuizMode): QuestionType {
  const th = thresholdsFor(mode);
  const p = getProgress(word, mode);

  const mcDone = p.mc >= th.mc;
  const typedDone = p.typed >= th.typed;

  if (mcDone && !typedDone) return "typed";
  if (!mcDone && typedDone) return "mc";

  // falta ambos: 1 em 4 chance de digitação, senão múltipla
  return Math.random() < 0.25 ? "typed" : "mc";
}

// Finalização da palavra quando conclui no modo
export function finalizeWordAfterDone(word: Word, mode: QuizMode) {
  if (mode === "learning") {
    // vira review e entra no ciclo normal
    word.status = "review";
    word.interval = 1;
    word.nextReview = 1;

    // limpa contadores de review e (opcionalmente) zera learning
    word.reviewMultipleChoiceHits = 0;
    word.reviewTypedHit = 0;
    // manter learning como histórico não é necessário; zera para não confundir
    word.learningMultipleChoiceHits = 0;
    word.learningTypedHit = 0;
    return;
  }

  if (mode === "forgotten") {
    // volta pro ciclo normal (conforme você definiu)
    word.status = "review";
    word.interval = 1;
    word.nextReview = 1;

    word.reviewMultipleChoiceHits = 0;
    word.reviewTypedHit = 0;
    return;
  }

  // mode === "review"
  word.interval = word.interval * word.easeFactor;
  word.nextReview = Math.round(word.interval);

  word.reviewMultipleChoiceHits = 0;
  word.reviewTypedHit = 0;
}