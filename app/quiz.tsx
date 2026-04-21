import { Ionicons } from "@expo/vector-icons";
import { createAudioPlayer } from "expo-audio";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  QuestionType,
  QuizMode,
  applyEaseFactor,
  chooseQuestionType,
  finalizeWordAfterDone,
  getProgress,
  incrementProgress,
  isWordDone,
  thresholdsFor,
} from "../src/engine/quizRules";
import { useSelectedLanguage } from "../src/hooks/useSelectedLanguage";
import { Word } from "../src/models/Word";
import { WordRepository } from "../src/repository/wordRepository";
import { registerLearnedWordAndCheckGoal, saveTodayLearnedCount } from "../src/services/progressService";
import { obterLinhasDeTraducaoAleatorias } from "../src/services/translationService";
import { getWordAudioUri } from "../src/services/wordAudioService";
import { getWordImageSource } from "../src/utils/wordImage";

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
  const uniq = Array.from(
    new Set((translations ?? []).map((t) => t.trim()).filter(Boolean))
  );
  return uniq.join(", ");
}

function formatTranslationsLimited(translations: string[], limit: number) {
  const uniq = Array.from(
    new Set((translations ?? []).map((t) => t.trim()).filter(Boolean))
  );

  return uniq.slice(0, limit).join(", ");
}

function formatarPercentual(parte: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((100 * parte) / total);
}

function montarDicaDaPalavra(word: string) {
  const limpa = word.trim();

  if (limpa.length <= 1) return limpa;
  if (limpa.length === 2) return `${limpa[0]} ${limpa[1]}`;

  const meio = Array.from({ length: limpa.length - 2 }, () => "_").join(" ");
  return `${limpa[0]} ${meio} ${limpa[limpa.length - 1]}`;
}

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<Params>();

  const mode = (params.mode ?? "learning") as QuizMode;

  const [screenKey, setScreenKey] = useState(0);

  const followModes = useMemo(() => {
    const raw = params.follow ?? "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as QuizMode[];
  }, [params.follow]);

  type PreparedQuestion = {
    word: Word;
    qType: QuestionType;
    options: string[];
  };

  const language = useSelectedLanguage();

  const preparedNextRef = useRef<PreparedQuestion | null>(null);
  const preparingNextTokenRef = useRef(0);

  const audioPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const repoRef = useRef(new WordRepository());

  const isMountedRef = useRef(true);

  const [optionsLoading, setOptionsLoading] = useState(false);

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

  const [totalAtStart, setTotalAtStart] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const [mostrarImagem, setMostrarImagem] = useState(true);
  const [mostrarDica, setMostrarDica] = useState(false);

  function stopAudioPlayback() {
    const player = audioPlayerRef.current;
    if (!player) return;

    try {
      player.pause();
      player.seekTo(0);
    } catch (error) {
      console.error("Erro ao parar áudio:", error);
    }
  }

  function isOriginalWordCorrect(answer: string, originalWord: string) {
    return normalize(answer) === normalize(originalWord);
  }

  const thresholds = thresholdsFor(mode);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      preparingNextTokenRef.current += 1;
      preparedNextRef.current = null;
      stopAudioPlayback();
    };
  }, []);

  useEffect(() => {
    const player = createAudioPlayer(null);
    audioPlayerRef.current = player;

    return () => {
      try {
        player.pause();
        player.seekTo(0);
      } catch {}

      player.remove();
      audioPlayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    preparedNextRef.current = null;
    preparingNextTokenRef.current += 1;
    stopAudioPlayback();

    const repo = repoRef.current;

    let words: Word[] = [];
    if (mode === "review") words = repo.getDueReviews(50, language);
    if (mode === "forgotten") words = repo.getForgotten(language);
    if (mode === "learning") words = repo.getLearning(language);

    setCompletedCount(0);
    setTotalAtStart(words.length);

    if (!words.length) {
      goNextModeOrExit();
      return;
    }

    const shuffled = shuffle(words);

    setSessionWords(shuffled);
    setActiveIds(shuffled.map((w) => w.word));
    setIdx(0);

    setCurrentWord(null);
    setOptions([]);
    setOptionsLoading(false);
    setTyped("");
    setFeedback("");
  }, [mode, language, screenKey]);

  useEffect(() => {
    if (!activeIds.length) return;

    const id = activeIds[idx % activeIds.length];
    const w = sessionWords.find((x) => x.word === id) ?? null;
    if (!w) {
      setCurrentWord(null);
      setOptions([]);
      setOptionsLoading(false);
      return;
    }

    const usarPrecarregado =
      preparedNextRef.current &&
      preparedNextRef.current.word.word === w.word;

    if (usarPrecarregado && preparedNextRef.current) {
      applyPreparedQuestion(preparedNextRef.current);
      preparedNextRef.current = null;
      void preloadNextQuestion(idx + 1);
      return;
    }

    let cancelled = false;

    async function loadCurrent() {
      setOptions([]);
      setOptionsLoading(true);

      try {
        const prepared = await prepareQuestion(w as Word);
        if (cancelled || !isMountedRef.current) return;

        applyPreparedQuestion(prepared);
        void preloadNextQuestion(idx + 1);
      } catch (error) {
        console.error("Erro ao preparar questão atual:", error);
        if (cancelled || !isMountedRef.current) return;
        setOptions([]);
        setOptionsLoading(false);
      }
    }

    void loadCurrent();

    return () => {
      cancelled = true;
    };
  }, [idx, activeIds, sessionWords, mode]);

  async function playAudioForWord(word?: string | null) {
    const player = audioPlayerRef.current;
    if (!player || !word) return;

    try {
      const uri = await getWordAudioUri(word, language);
      if (!uri) return;

      player.replace(uri);
      player.seekTo(0);
      player.play();
    } catch (error) {
      console.error("Erro ao tocar áudio da palavra:", error);
    }
  }

  async function buildMCOptionsForWord(w: Word): Promise<string[]> {
    const correct = formatTranslations(w.translations);

    const poolSessao = sessionWords
      .filter((x) => x.word !== w.word)
      .map((x) => formatTranslations(x.translations))
      .filter((s) => s.length > 0 && s !== correct);

    const uniquePoolSessao = Array.from(new Set(poolSessao));
    const distractorsSessao = shuffle(uniquePoolSessao).slice(0, 3);

    const set = new Set<string>([correct, ...distractorsSessao]);

    if (set.size < 4) {
      try {
        const faltam = 4 - set.size;

        const extras = await obterLinhasDeTraducaoAleatorias(
          faltam,
          Array.from(set),
          language
        );

        extras.forEach((x) => set.add(x));
      } catch (error) {
        console.error("Erro ao obter distratores:", error);
      }
    }

    return shuffle(Array.from(set)).slice(0, 4);
  }

  async function prepareQuestion(w: Word): Promise<PreparedQuestion> {
    const qt = chooseQuestionType(w, mode);

    let preparedOptions: string[] = [];
    if (qt === "mc") {
      preparedOptions = await buildMCOptionsForWord(w);
    }

    return {
      word: w,
      qType: qt,
      options: preparedOptions,
    };
  }

  async function preloadNextQuestion(nextIdx: number) {
    if (!activeIds.length) {
      preparedNextRef.current = null;
      return;
    }

    const nextId = activeIds[nextIdx % activeIds.length];
    const nextWord = sessionWords.find((x) => x.word === nextId) ?? null;
    if (!nextWord) {
      preparedNextRef.current = null;
      return;
    }

    const token = ++preparingNextTokenRef.current;

    try {
      const prepared = await prepareQuestion(nextWord);

      if (!isMountedRef.current) return;
      if (token !== preparingNextTokenRef.current) return;

      preparedNextRef.current = prepared;
    } catch (error) {
      console.error("Erro ao pré-carregar próxima questão:", error);
    }
  }

  function applyPreparedQuestion(prepared: PreparedQuestion) {
    stopAudioPlayback();
    const w = prepared.word;

    setCurrentWord(w);
    setQType(prepared.qType);

    setTyped("");
    setFeedback("");
    setSelectedOption(null);
    setMcLockedByFirstError(false);
    setTypedLocked(false);
    setTypedSolved(false);
    setTypedWrongCounted(false);
    setMostrarDica(false);

    const progressoAtual = getProgress(w, mode);
    const semAcertos =
      progressoAtual.mc === 0 && progressoAtual.typed === 0;

    setMostrarImagem(semAcertos);

    if (prepared.qType === "mc") {
      setOptions(prepared.options);
      setOptionsLoading(false);
      void playAudioForWord(w.word);
    } else {
      setOptions([]);
      setOptionsLoading(false);
    }
  }

  function removeIfDoneAndAdvance(updatedWord: Word) {
    setSessionWords((prev) =>
      prev.map((w) => (w.word === updatedWord.word ? updatedWord : w))
    );

    const willBeDone = isWordDone(updatedWord, mode);

    const remainingCount = willBeDone
      ? activeIds.length - 1
      : activeIds.length;

    if (remainingCount <= 1) {
      preparedNextRef.current = null;
      preparingNextTokenRef.current += 1;
    }

    if (willBeDone) {
      const wasLearningDone = mode === "learning";

      finalizeWordAfterDone(updatedWord, mode);
      repoRef.current.update(updatedWord);

      if (wasLearningDone) {
        registerLearnedWordAndCheckGoal(language);
        saveTodayLearnedCount(language);
      }

      setCompletedCount((prev) => prev + 1);
      setActiveIds((prev) => prev.filter((id) => id !== updatedWord.word));
      return;
    }

    repoRef.current.update(updatedWord);
    setIdx((x) => x + 1);
  }

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function responderMC(option: string) {
    if (!currentWord) return;

    const w = { ...currentWord };
    const correctLine = formatTranslations(w.translations);

    setSelectedOption(option);

    if (option === correctLine) {
      incrementProgress(w, mode, "mc");

      if (!mcLockedByFirstError) {
        applyEaseFactor(w, "correct_mc");
      }

      await sleep(2);
      removeIfDoneAndAdvance(w);
      return;
    }

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
      void playAudioForWord(currentWord.word);
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
    void playAudioForWord(w.word);
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

    setIdx((x) => x + 1);
  }

  function pular() {
    setIdx((x) => x + 1);
  }

  function goNextModeOrExit() {
    stopAudioPlayback();

    const repo = repoRef.current;

    const forgottenWords = repo.getForgotten(language);
    const learningWords = repo.getLearning(language);

    if (mode === "review") {
      Alert.alert("Parabéns!", "Você revisou todas as palavras.");

      if (forgottenWords.length > 0) {
        router.replace({
          pathname: "/quiz",
          params: { mode: "forgotten" },
        });
        return;
      }

      if (learningWords.length > 0) {
        router.replace({
          pathname: "/quiz",
          params: { mode: "learning" },
        });
        return;
      }

      router.back();
      return;
    }

    if (mode === "forgotten") {
      Alert.alert("Parabéns!", "Você lembrou todas as palavras.")

      if (learningWords.length > 0) {
        router.replace({
          pathname: "/quiz",
          params: { mode: "learning" },
        });
        return;
      }

      router.back();
      return;
    }

    if (mode === "learning") {
      Alert.alert("Parabéns!", "Você aprendeu todas as palavras.");

      router.back();
      return;
    }

    if (followModes.length) {
      const [next, ...rest] = followModes;
      router.replace({
        pathname: "/quiz",
        params: { mode: next, follow: rest.join(",") },
      });
      return;
    }

    router.back();
  }

  useEffect(() => {
    if (!activeIds.length && sessionWords.length) {
      goNextModeOrExit();
    }
  }, [activeIds, sessionWords.length]);

  const getTituloModo = () => {
    if (mode === "learning") return "Aprendizado";
    if (mode === "forgotten") return "Revisão de Esquecidas";
    return "Revisão";
  };

  const getCorModo = () => {
    if (mode === "learning") return "#F59E0B";
    if (mode === "forgotten") return "#EF4444";
    return "#3B82F6";
  };

  if (!currentWord) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0A0E17",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <Stack.Screen
          options={{
            title: getTituloModo(),
            headerStyle: {
              backgroundColor: "#0A0E17",
            },
            headerTintColor: "#FFFFFF",
            headerTitleStyle: {
              fontWeight: "700",
              fontSize: 20,
            },
            headerShadowVisible: false,
          }}
        />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ color: "#94A3B8", fontSize: 14, marginTop: 16 }}>
            Carregando...
          </Text>
        </View>
      </View>
    );
  }

  const progress = getProgress(currentWord, mode);
  const percentualConcluido = formatarPercentual(completedCount, totalAtStart);

  const resumoSuperior =
    mode === "learning"
      ? `${completedCount}/${totalAtStart} palavras aprendidas`
      : `${completedCount}/${totalAtStart} palavras revisadas`;

  const palavraBaseParaImagem =
    qType === "mc"
      ? currentWord.word.toLowerCase().trim()
      : currentWord.word.toLowerCase().trim();

  const imagemDaPalavra = getWordImageSource(palavraBaseParaImagem);
  const dicaDaPalavra = montarDicaDaPalavra(currentWord.word);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#0A0E17",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <Stack.Screen
          options={{
            title: getTituloModo(),
            headerStyle: {
              backgroundColor: "#0A0E17",
            },
            headerTintColor: "#FFFFFF",
            headerTitleStyle: {
              fontWeight: "700",
              fontSize: 20,
            },
            headerShadowVisible: false,
          }}
        />

        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          {/* Barra de Progresso */}
          <View
            style={{
              marginTop: 16,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    backgroundColor: `${getCorModo()}15`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={mode === "learning" ? "school-outline" : mode === "forgotten" ? "alert-circle-outline" : "time-outline"}
                    size={14}
                    color={getCorModo()}
                  />
                </View>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {resumoSuperior}
                </Text>
              </View>
              <Text
                style={{
                  color: getCorModo(),
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                {percentualConcluido}%
              </Text>
            </View>

            <View
              style={{
                height: 6,
                backgroundColor: "#1E2432",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${percentualConcluido}%`,
                  height: "100%",
                  backgroundColor: getCorModo(),
                  borderRadius: 3,
                }}
              />
            </View>
          </View>

          {/* Área da Palavra - FIXA */}
          <View
            style={{
              alignItems: "center",
              paddingTop: 20,
            }}
          >
            {/* Palavra/Tradução */}
            <Text
              style={{
                fontSize: 45,
                fontWeight: "800",
                color: "#FFFFFF",
                textAlign: "center",
                marginBottom: 8,
                letterSpacing: -0.5,
              }}
            >
              {qType === "mc"
                ? currentWord.word
                : formatTranslationsLimited(currentWord.translations, 3)}
            </Text>

            {/* Botão de Áudio */}
            <TouchableOpacity
              onPress={() => playAudioForWord(currentWord.word)}
              style={{
                marginBottom: 16,
                padding: 8,
              }}
            >
              <Ionicons name="volume-medium-outline" size={24} color="#64748B" />
            </TouchableOpacity>

            {/* Progresso Detalhado */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
                backgroundColor: "#1E2432",
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#2A3142",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="grid-outline" size={14} color="#3B82F6" />
                <Text style={{ color: "#94A3B8", fontSize: 13 }}>
                  {progress.mc}/{thresholds.mc}
                </Text>
              </View>
              <View style={{ width: 1, height: 16, backgroundColor: "#2A3142" }} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="keypad-outline" size={14} color="#10B981" />
                <Text style={{ color: "#94A3B8", fontSize: 13 }}>
                  {progress.typed}/{thresholds.typed}
                </Text>
              </View>
            </View>
          </View>

          {/* Container com posição relativa para imagem sobreposta */}
          <View style={{ position: "relative", flex: 1 }}>
            {/* Imagem - Posicionada absolutamente sobre o conteúdo */}
            {imagemDaPalavra && mostrarImagem && (
              <View
                style={{
                  position: "absolute",
                  top: -20,
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => setMostrarImagem(false)}
                  activeOpacity={0.9}
                  style={{
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: getCorModo(),
                    overflow: "hidden",
                    backgroundColor: "#0A0E17",
                  }}
                >
                  <Image
                    source={imagemDaPalavra}
                    style={{
                      width: 160,
                      height: 160,
                      resizeMode: "cover",
                    }}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Botão Mostrar Imagem (quando oculta) */}
            {imagemDaPalavra && !mostrarImagem && (
              <TouchableOpacity
                onPress={() => setMostrarImagem(true)}
                style={{
                  alignSelf: "center",
                  backgroundColor: "#1E2432",
                  borderWidth: 1,
                  borderColor: "#2A3142",
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    color: "#94A3B8",
                    fontWeight: "500",
                    fontSize: 14,
                  }}
                >
                  Mostrar Imagem
                </Text>
              </TouchableOpacity>
            )}

            {/* Conteúdo das questões */}
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                paddingBottom: 20,
              }}
            >
              {qType === "mc" ? (
                optionsLoading || options.length < 4 ? (
                  <View style={{ marginTop: 20, alignItems: "center" }}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text style={{ color: "#64748B", fontSize: 13, marginTop: 8 }}>
                      Carregando opções...
                    </Text>
                  </View>
                ) : (
                  <View style={{ width: "100%", gap: 8 }}>
                    {options.map((opt) => {
                      const correctLine = formatTranslations(currentWord.translations);
                      const isSelected = selectedOption === opt;

                      let backgroundColor = "#1E2432";
                      let borderColor = "#2A3142";
                      let textColor = "#fff";

                      if (isSelected) {
                        if (opt === correctLine) {
                          backgroundColor = "#1A2E1A";
                          borderColor = "#10B981";
                          textColor = "#10B981";
                        } else {
                          backgroundColor = "#2E1A1A";
                          borderColor = "#EF4444";
                          textColor = "#EF4444";
                        }
                      }

                      return (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => responderMC(opt)}
                          style={{
                            padding: 10,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor,
                            backgroundColor,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 18,
                              textAlign: "center",
                              color: textColor,
                              fontWeight: isSelected ? "600" : "400",
                            }}
                          >
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                    <TouchableOpacity
                      onPress={pular}
                      style={{
                        paddingVertical: 12,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "#2A3142",
                        backgroundColor: "#555555",
                        marginTop: 8,
                      }}
                    >
                      <Text style={{ color: "#fff", textAlign: "center", fontSize: 14 }}>
                        Pular
                      </Text>
                    </TouchableOpacity>
                  </View>
                )
              ) : (
                <View style={{ width: "100%", gap: 12 }}>
                  {/* Dica */}
                  {!imagemDaPalavra && (
                    mostrarDica ? (
                      <View
                        style={{
                          alignSelf: "center",
                          backgroundColor: "#1E2432",
                          borderWidth: 1,
                          borderColor: getCorModo(),
                          borderRadius: 12,
                          paddingVertical: 12,
                          paddingHorizontal: 18,
                          minWidth: 200,
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: "#FFFFFF",
                            fontWeight: "600",
                            textAlign: "center",
                            fontSize: 18,
                            letterSpacing: 2,
                          }}
                        >
                          {dicaDaPalavra}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setMostrarDica(true)}
                        style={{
                          alignSelf: "center",
                          backgroundColor: "#1E2432",
                          borderWidth: 1,
                          borderColor: "#2A3142",
                          borderRadius: 10,
                          paddingVertical: 10,
                          paddingHorizontal: 20,
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: "#94A3B8",
                            fontWeight: "500",
                            fontSize: 14,
                          }}
                        >
                          Mostrar Dica
                        </Text>
                      </TouchableOpacity>
                    )
                  )}

                  <TextInput
                    value={typed}
                    onChangeText={onChangeTyped}
                    editable={!typedLocked}
                    placeholder="Digite a palavra original"
                    placeholderTextColor="#475569"
                    textAlign="center"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      borderWidth: 1,
                      borderColor: typedLocked ? (typedSolved ? "#10B981" : "#EF4444") : "#2A3142",
                      borderRadius: 10,
                      padding: 14,
                      backgroundColor: "#1E2432",
                      color: "#FFFFFF",
                      fontSize: 17,
                    }}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 8,
                      gap: 10,
                    }}
                  >
                    {!typedLocked ? (
                      <>
                        <TouchableOpacity
                          onPress={onDontKnow}
                          style={{
                            flex: 1,
                            backgroundColor: "#2E1A1A",
                            paddingVertical: 12,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: "#4A2A2A",
                          }}
                        >
                          <Text style={{ color: "#EF4444", fontWeight: "600", textAlign: "center", fontSize: 14 }}>
                            Não Sei
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={pular}
                          style={{
                            flex: 1,
                            backgroundColor: "#555555",
                            paddingVertical: 12,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: "#2A3142",
                          }}
                        >
                          <Text style={{ color: "#fff", textAlign: "center", fontSize: 14 }}>
                            Pular
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        onPress={onSubmitTyped}
                        style={{
                          flex: 1,
                          backgroundColor: typedSolved ? "#10B981" : "#3B82F6",
                          paddingVertical: 14,
                          borderRadius: 12,
                          shadowColor: typedSolved ? "#10B981" : "#3B82F6",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.2,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                      >
                        <Text style={{ color: "#FFFFFF", fontWeight: "700", textAlign: "center", fontSize: 15 }}>
                          Continuar
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}