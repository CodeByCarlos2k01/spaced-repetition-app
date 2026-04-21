import { AppLanguage } from "../constants/languages";
import { setForgotten } from "../engine/reviewEngine";
import { createWord } from "../models/Word";
import { WordRepository } from "../repository/wordRepository";

export function registrarCliqueEmPalavra(
  repo: WordRepository,
  palavra: string,
  traducoes: string[],
  language: AppLanguage
) {
  const all = repo.getAll(language);
  const existing = all.find((w) => w.word.toLowerCase() === palavra.toLowerCase());

  if (existing && existing.status === "review") {
    setForgotten(existing);
    // se vierem traduções novas, mescla
    const set = new Set([...(existing.translations ?? []), ...(traducoes ?? [])]);
    existing.translations = Array.from(set);
    repo.update(existing);
    return { action: "forgotten" as const, word: existing };
  }

  if (existing) {
    const set = new Set([...(existing.translations ?? []), ...(traducoes ?? [])]);
    existing.translations = Array.from(set);
    repo.update(existing);
    return { action: "existing" as const, word: existing };
  }

  const w = createWord(palavra, language, traducoes ?? []);
  repo.add(w);
  return { action: "added_learning" as const, word: w };
}