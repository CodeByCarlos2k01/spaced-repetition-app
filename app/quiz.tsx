import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { obterLinhasDeTraducaoAleatorias } from "../src/services/translationService";
import { initDatabase } from "../src/database/database";
import { WordRepository } from "../src/repository/wordRepository";
import { Word } from "../src/models/Word";

import {
  QuizMode,
  QuestionType,
  applyEaseFactor,
  chooseQuestionType,
  finalizeWordAfterDone,
  getProgress,
  isWordDone,
  thresholdsFor,
  incrementProgress,
} from "../src/engine/quizRules";

type Params = {
  mode?: QuizMode;
  follow?: string;
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTranslations(translations: string[]) {
  const uniq = Array.from(new Set((translations ?? []).map((t) => t.trim()).filter(Boolean)));
  return uniq.join(", ");
}

function isAnyTranslationCorrect(answer: string, translations: string[]) {
  const a = normalize(answer);
  return (translations ?? []).some((t) => normalize(t) === a);
}

export default function QuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();

  const mode = (params.mode ?? "learning") as QuizMode;

  const followModes = useMemo(() => {
    const raw = params.follow ?? "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as QuizMode[];
  }, [params.follow]);

  const repoRef = useRef(new WordRepository());

  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);

  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [qType, setQType] = useState<QuestionType>("mc");

  const [options, setOptions] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState("");

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [mcLockedByFirstError, setMcLockedByFirstError] = useState(false);

  const [typedLocked, setTypedLocked] = useState(false);
  const [typedSolved, setTypedSolved] = useState(false);
  const [typedWrongCounted, setTypedWrongCounted] = useState(false);

  function isOriginalWordCorrect(answer: string, originalWord: string) {
    return normalize(answer) === normalize(originalWord);
  }

  const titulo =
    mode === "review"
      ? "Revisão"
      : mode === "forgotten"
      ? "Palavras esquecidas"
      : "Aprendizagem";

  const thresholds = thresholdsFor(mode);

  useEffect(() => {
    initDatabase();
    const repo = repoRef.current;

    let words: Word[] = [];
    if (mode === "review") words = repo.getDueReviews(50);
    if (mode === "forgotten") words = repo.getForgotten();
    if (mode === "learning") words = repo.getLearning();

    if (!words.length) {
      goNextModeOrExit();
      return;
    }

    const shuffled = shuffle(words);
    setSessionWords(shuffled);
    setActiveIds(shuffled.map((w) => w.word));
    setIdx(0);
    setFeedback("");
  }, [mode]);

  useEffect(() => {
    if (!activeIds.length) return;

    const id = activeIds[idx % activeIds.length];
    const w = sessionWords.find((x) => x.word === id) ?? null;
    if (!w) return;

    setCurrentWord(w);

    const qt = chooseQuestionType(w, mode);
    setQType(qt);

    setTyped("");
    setFeedback("");
    setSelectedOption(null);
    setMcLockedByFirstError(false);
    setTypedLocked(false);
    setTypedSolved(false);
    setTypedWrongCounted(false);

    if (qt === "mc") {
      buildMCOptionsAsync(w);
    } else {
      setOptions([]);
    }
  }, [idx, activeIds, sessionWords, mode]);

  async function buildMCOptionsAsync(w: Word) {
  const correct = formatTranslations(w.translations);

  // pool de distratores dentro da sessão
  const poolSessao = sessionWords
    .filter((x) => x.word !== w.word)
    .map((x) => formatTranslations(x.translations))
    .filter((s) => s.length > 0 && s !== correct);

  const uniquePoolSessao = Array.from(new Set(poolSessao));
  const distractorsSessao = shuffle(uniquePoolSessao).slice(0, 3);

  const set = new Set<string>([correct, ...distractorsSessao]);

  // Se faltou para chegar em 4, completa com aleatórias do dataset OMW
  if (set.size < 4) {
    const faltam = 4 - set.size;

    const extras = await obterLinhasDeTraducaoAleatorias(
      faltam,
      Array.from(set) // exclui correta e as já escolhidas
    );

    extras.forEach((x) => set.add(x));
  }

  // Garantia final (muito raro falhar, mas por segurança)
  const final = shuffle(Array.from(set)).slice(0, 4);
  setOptions(final);
}

  function removeIfDoneAndAdvance(updatedWord: Word) {
    setSessionWords((prev) =>
      prev.map((w) => (w.word === updatedWord.word ? updatedWord : w))
    );

    if (isWordDone(updatedWord, mode)) {
      finalizeWordAfterDone(updatedWord, mode);
      repoRef.current.update(updatedWord);

      setActiveIds((prev) => prev.filter((id) => id !== updatedWord.word));
      return;
    }

    repoRef.current.update(updatedWord);
    setIdx((x) => x + 1);
  }

  // ✅ Responde automaticamente ao clicar
  function responderMC(option: string) {
    if (!currentWord) return;

    const w = { ...currentWord };
    const correctLine = formatTranslations(w.translations);

    setSelectedOption(option);

    if (option === correctLine) {
      incrementProgress(w, mode, "mc");

      // Só altera easeFactor se ainda não houve erro nesta mesma palavra
      if (!mcLockedByFirstError) {
        applyEaseFactor(w, "correct_mc");
      }

      removeIfDoneAndAdvance(w);
      return;
    }

    // Errou: permanece na mesma palavra
    if (!mcLockedByFirstError) {
      applyEaseFactor(w, "wrong");
      repoRef.current.update(w);
      setMcLockedByFirstError(true);
    }

    setCurrentWord(w);
  }

  function onChangeTyped(value: string) {
    if (!currentWord || typedLocked) return;

    setTyped(value);

    const correta = isOriginalWordCorrect(value, currentWord.word);

    if (correta) {
      setTyped(currentWord.word);
      setTypedLocked(true);
      setTypedSolved(true);
    } else {
      setTypedSolved(false);
      setFeedback("");
    }
  }

  function onDontKnow() {
    if (!currentWord || typedLocked) return;

    const w = { ...currentWord };

    if (!typedWrongCounted) {
      applyEaseFactor(w, "wrong");
      repoRef.current.update(w);
      setCurrentWord(w);
      setTypedWrongCounted(true);
    }

    setTyped(w.word);
    setTypedLocked(true);
    setTypedSolved(false);
  }

  function onSubmitTyped() {
    if (!currentWord || !typedLocked) return;

    const w = { ...currentWord };

    if (typedSolved) {
      incrementProgress(w, mode, "typed");
      applyEaseFactor(w, "correct_typed");
      removeIfDoneAndAdvance(w);
      return;
    }

    // Caso tenha vindo do botão "não sei", apenas avança
    setIdx((x) => x + 1);
  }

  // ✅ Botão pular: não conta como erro/acerto
  function pular() {
    setIdx((x) => x + 1);
  }

  function goNextModeOrExit() {
    if (followModes.length) {
      const [next, ...rest] = followModes;
      router.replace({
        pathname: "/quiz",
        params: { mode: next, follow: rest.join(",") },
      });
    } else {
      router.back();
    }
  }

  useEffect(() => {
    if (!activeIds.length && sessionWords.length) {
      goNextModeOrExit();
    }
  }, [activeIds, sessionWords.length]);

  if (!currentWord) {
    return (
      <View style={{ marginTop: 60, padding: 20 }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  const progress = getProgress(currentWord, mode);

  return (
    <View style={{ marginTop: 60, padding: 20, gap: 14 }}>
      <Text style={{ fontSize: 22 }}>{titulo}</Text>

      <Text style={{ fontSize: 28, fontWeight: "bold" }}>
        {qType === "mc" ? currentWord.word : formatTranslations(currentWord.translations)}
      </Text>

      <Text style={{ fontSize: 12, opacity: 0.8 }}>
        Progresso: {progress.mc}/{thresholds.mc} múltipla escolha •{" "}
        {progress.typed}/{thresholds.typed} digitação
      </Text>

      {/* ✅ Botão pular */}
      <TouchableOpacity
        onPress={pular}
        style={{
          alignSelf: "flex-start",
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "#bbb",
          backgroundColor: "#fff",
        }}
      >
         <Text>Pular</Text>
      </TouchableOpacity>

      {qType === "mc" ? (
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 16 }}>Escolha o significado:</Text>

          {options.map((opt) => {
            const correctLine = formatTranslations(currentWord.translations);
            const isSelected = selectedOption === opt;

            let backgroundColor = "#fff";

            if (isSelected) {
              backgroundColor = opt === correctLine ? "#c8f7c5" : "#f8c5c5";
            }

            return (
              <TouchableOpacity
                key={opt}
                onPress={() => responderMC(opt)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  backgroundColor,
                }}
              >
                <Text style={{ fontSize: 15 }}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 16 }}>Digite a Palavra:</Text>

          <TextInput
            value={typed}
            onChangeText={onChangeTyped}
            editable={!typedLocked}
            placeholder="Digite na Língua Original"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              padding: 12,
              backgroundColor: typedLocked ? "#f2f2f2" : "#fff",
            }}
          />

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            {!typedLocked && (
              <TouchableOpacity
                onPress={onDontKnow}
                style={{
                  backgroundColor: "#b00020",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                }}
              >
                 <Text style={{ color: "#fff", fontWeight: "600" }}>Não sei</Text>
              </TouchableOpacity>
            )}

            {typedLocked && (
              <TouchableOpacity
                onPress={onSubmitTyped}
                style={{
                  backgroundColor: "#4CAF50",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#f1f1f1", fontWeight: "600" }}>Confirmar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {!!feedback && (
        <Text style={{ marginTop: 10, fontSize: 14 }}>{feedback}</Text>
      )}
    </View>
  );
}