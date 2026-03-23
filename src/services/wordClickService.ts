import { WordRepository } from "../repository/wordRepository";
import { createWord } from "../models/Word";
import { setForgotten } from "../engine/reviewEngine";

export function registrarCliqueEmPalavra(
  repo: WordRepository,
  palavra: string,
  traducoes: string[]
) {
  const all = repo.getAll();
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

  const w = createWord(palavra, traducoes ?? []);
  repo.add(w);
  return { action: "added_learning" as const, word: w };
}