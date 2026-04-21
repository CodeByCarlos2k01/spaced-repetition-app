import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { createAudioPlayer } from "expo-audio";
import { Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { initDatabase } from "../../src/database/database";
import { useSelectedLanguage } from "../../src/hooks/useSelectedLanguage";
import { Word } from "../../src/models/Word";
import { WordRepository } from "../../src/repository/wordRepository";
import { getWordAudioUri, hasWordAudio } from "../../src/services/wordAudioService";

export default function OuçaEAprendaScreen() {
  const insets = useSafeAreaInsets();
  const repoRef = useRef(new WordRepository());
  const audioPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const buttonsLockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [screenKey, setScreenKey] = useState(0);
  const [buttonsLocked, setButtonsLocked] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);

  const language = useSelectedLanguage();

  useFocusEffect(
    useCallback(() => {
      initDatabase();

      const reviewedWords = repoRef.current.getReviewedWords(language);

      let cancelled = false;

      void (async () => {
        const availability = await Promise.all(
          reviewedWords.map(async (word) => ({
            word,
            hasAudio: await hasWordAudio(word.word, language),
          }))
        );

        if (cancelled) return;

        const wordsWithAudio = availability
          .filter((entry) => entry.hasAudio)
          .map((entry) => entry.word);

        setWords(wordsWithAudio);
        setIdx(0);
      })();

      return () => {
        cancelled = true;
      };
    }, [language])
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        setScreenKey((prev) => prev + 1);
        if (buttonsLockTimeoutRef.current) {
          clearTimeout(buttonsLockTimeoutRef.current);
          buttonsLockTimeoutRef.current = null;
        }

        setButtonsLocked(false);
        stopAudioPlayback();
      };
    }, [])
  );

  useEffect(() => {
    const player = createAudioPlayer(null);
    audioPlayerRef.current = player;

    return () => {
      if (buttonsLockTimeoutRef.current) {
        clearTimeout(buttonsLockTimeoutRef.current);
        buttonsLockTimeoutRef.current = null;
      }

      try {
        player.pause();
        player.seekTo(0);
      } catch {}

      player.remove();
      audioPlayerRef.current = null;
    };
  }, []);

  const currentWord = useMemo(() => {
    if (!words.length) return null;
    return words[idx];
  }, [words, idx]);

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

  function lockButtonsBriefly(duration = 500) {
    if (buttonsLockTimeoutRef.current) {
      clearTimeout(buttonsLockTimeoutRef.current);
    }

    setButtonsLocked(true);

    buttonsLockTimeoutRef.current = setTimeout(() => {
      setButtonsLocked(false);
      buttonsLockTimeoutRef.current = null;
    }, duration);
  }

  async function playWordAudio(word?: string | null) {
    if (!word) return;

    const player = audioPlayerRef.current;
    if (!player) return;

    try {
      const uri = await getWordAudioUri(word, language);
      if (!uri) return;

      player.replace(uri);
      player.seekTo(0);
      player.play();
    } catch (error) {
      console.error("Erro ao tocar áudio:", error);
    }
  }

  function playCurrentWord() {
    if (!currentWord || buttonsLocked) return;

    lockButtonsBriefly();
    void playWordAudio(currentWord.word);
  }

  function goNext() {
    if (!words.length || buttonsLocked) return;

    stopAudioPlayback();
    lockButtonsBriefly();
    setIdx((prev) => (prev + 1) % words.length);
  }

  function goBack() {
    if (!words.length || buttonsLocked) return;

    stopAudioPlayback();
    lockButtonsBriefly();
    setIdx((prev) => (prev - 1 + words.length) % words.length);
  }

  useEffect(() => {
    if (!currentWord) return;
    void playWordAudio(currentWord.word);
  }, [currentWord]);

  if (!words.length) {
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
            title: "Ouça e Aprenda",
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
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#1E2432",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "#2A3142",
            }}
          >
            <Ionicons name="volume-high-outline" size={48} color="#475569" />
          </View>

          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 24,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Nenhum áudio disponível
          </Text>

          <Text
            style={{
              color: "#94A3B8",
              fontSize: 15,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Continue aprendendo novas palavras para desbloquear o modo de escuta
          </Text>
        </View>
      </View>
    );
  }

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
          title: "Ouça e Aprenda",
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
          paddingHorizontal: 24,
        }}
      >
        {/* Progresso */}
        <View
          style={{
            alignItems: "center",
            marginTop: 16,
            marginBottom: 32,
          }}
        >
          <View
            style={{
              backgroundColor: "#1E2432",
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#2A3142",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="book-outline" size={16} color="#3B82F6" />
            <Text
              style={{
                color: "#CBD5E1",
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              {idx + 1} de {words.length}
            </Text>
          </View>
        </View>

        {/* Área de conteúdo (palavra + tradução) */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={playCurrentWord}
            disabled={buttonsLocked}
            style={{
              marginBottom: 32,
              opacity: buttonsLocked ? 0.7 : 1,
            }}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "#1E2432",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "#3B82F6",
                marginBottom: 20,
              }}
            >
              <Ionicons name="volume-high" size={56} color="#3B82F6" />
            </View>
          </TouchableOpacity>

          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 56,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 16,
              letterSpacing: -0.5,
            }}
          >
            {currentWord?.word}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Ionicons name="language-outline" size={18} color="#64748B" />
            <Text
              style={{
                color: "#94A3B8",
                fontSize: 18,
                textAlign: "center",
                lineHeight: 26,
              }}
            >
              {currentWord?.translations?.join(" • ")}
            </Text>
          </View>
        </View>

        {/* Área dos botões de navegação */}
        <View
          style={{
            paddingBottom: 40,
            paddingTop: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={goBack}
              disabled={buttonsLocked}
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: "#1E2432",
                borderWidth: 1,
                borderColor: "#2A3142",
                alignItems: "center",
                justifyContent: "center",
                opacity: buttonsLocked ? 0.5 : 1,
              }}
            >
              <Ionicons name="play-skip-back" size={24} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={playCurrentWord}
              disabled={buttonsLocked}
              style={{
                backgroundColor: "#3B82F6",
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                opacity: buttonsLocked ? 0.7 : 1,
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons name="play" size={22} color="#FFFFFF" />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                Ouvir
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goNext}
              disabled={buttonsLocked}
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: "#1E2432",
                borderWidth: 1,
                borderColor: "#2A3142",
                alignItems: "center",
                justifyContent: "center",
                opacity: buttonsLocked ? 0.5 : 1,
              }}
            >
              <Ionicons name="play-skip-forward" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Dica */}
          <View
            style={{
              marginTop: 20,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: "#1A202C",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#2A3142",
            }}
          >
            <Text
              style={{
                color: "#64748B",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              💡 Toque no ícone de áudio ou no botão Ouvir para escutar a pronúncia
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}