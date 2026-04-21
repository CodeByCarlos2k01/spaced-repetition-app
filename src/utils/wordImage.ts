import { ALIASES } from "../constants/aliases";
import { WORD_IMAGES } from "../constants/wordImages";

function normalizeWord(word?: string | null) {
  return (word ?? "").toLowerCase().trim();
}

export function getWordImageSource(word?: string | null): number | null {
  const normalized = normalizeWord(word);
  if (!normalized) return null;

  // 1. tenta alias
  const alias = ALIASES[normalized];

  if (alias && WORD_IMAGES[alias]) {
    return WORD_IMAGES[alias];
  }

  return null;
}