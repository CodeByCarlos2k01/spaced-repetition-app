import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { initDatabase } from "../../src/database/database";
import { Word } from "../../src/models/Word";
import { WordRepository } from "../../src/repository/wordRepository";

import { useSelectedLanguage } from "../../src/hooks/useSelectedLanguage";

type Filtro = "learning" | "forgotten" | "due_review";

function formatarTraducoesUmaLinha(traducoes: string[]) {
  const uniq = Array.from(new Set((traducoes ?? []).map(t => t.trim()).filter(Boolean)));
  return uniq.join(", ");
}

export default function MinhasPalavrasScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    initDatabase();
  }, []);

  const language = useSelectedLanguage();
  const repo = useMemo(() => new WordRepository(), []);

  const [screenKey, setScreenKey] = useState(0);
  const [filtro, setFiltro] = useState<Filtro>("due_review");
  const [palavras, setPalavras] = useState<Word[]>([]);
  const [contLearning, setContLearning] = useState(0);
  const [contForgotten, setContForgotten] = useState(0);
  const [contDue, setContDue] = useState(0);

  const carregar = useCallback(() => {
    const learning = repo.getLearning(language);
    const forgotten = repo.getForgotten(language);
    const due = repo.getDueReviews(50, language);

    setContLearning(learning.length);
    setContForgotten(forgotten.length);
    setContDue(due.length);

    if (filtro === "learning") setPalavras(learning);
    if (filtro === "forgotten") setPalavras(forgotten);
    if (filtro === "due_review") setPalavras(due);
  }, [repo, filtro, language]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar, screenKey])
  );

  function iniciarQuiz() {
    const mode =
      filtro === "due_review" ? "review" : filtro === "forgotten" ? "forgotten" : "learning";

    if (palavras.length === 0) {
      Alert.alert(
        "Nada para estudar",
        "Não há palavras nesta categoria no momento."
      );
      return;
    }

    router.push({
      pathname: "/quiz",
      params: { mode },
    });

    setScreenKey(prev => prev + 1);
  }

  function getTituloLista() {
    if (filtro === "learning") return "Palavras Desconhecidas";
    if (filtro === "forgotten") return "Palavras Esquecidas";
    return "Revisões Pendentes";
  }

  function getIconeFiltro() {
    if (filtro === "learning") return "help-circle-outline";
    if (filtro === "forgotten") return "alert-circle-outline";
    return "time-outline";
  }

  function getCorFiltro() {
    if (filtro === "learning") return "#F59E0B";
    if (filtro === "forgotten") return "#EF4444";
    return "#3B82F6";
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0A0E17",
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <Stack.Screen
        options={{
          title: "Minhas Palavras",
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
        {/* Filtros */}
        <View
          style={{
            marginTop: 20,
            marginBottom: 20,
          }}
        >

          <View style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => {
                setFiltro("due_review");
                setScreenKey(prev => prev + 1);
              }}
              style={{
                backgroundColor: filtro === "due_review" ? "#3B82F6" : "#1E2432",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: filtro === "due_review" ? "#3B82F6" : "#2A3142",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={filtro === "due_review" ? "#FFFFFF" : "#94A3B8"}
              />
              <Text
                style={{
                  color: filtro === "due_review" ? "#FFFFFF" : "#CBD5E1",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                Revisão ({contDue})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setFiltro("forgotten");
                setScreenKey(prev => prev + 1);
              }}
              style={{
                backgroundColor: filtro === "forgotten" ? "#EF4444" : "#1E2432",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: filtro === "forgotten" ? "#EF4444" : "#2A3142",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={filtro === "forgotten" ? "#FFFFFF" : "#94A3B8"}
              />
              <Text
                style={{
                  color: filtro === "forgotten" ? "#FFFFFF" : "#CBD5E1",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                Esquecidas ({contForgotten})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setFiltro("learning");
                setScreenKey(prev => prev + 1);
              }}
              style={{
                backgroundColor: filtro === "learning" ? "#F59E0B" : "#1E2432",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: filtro === "learning" ? "#F59E0B" : "#2A3142",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons
                name="help-circle-outline"
                size={16}
                color={filtro === "learning" ? "#FFFFFF" : "#94A3B8"}
              />
              <Text
                style={{
                  color: filtro === "learning" ? "#FFFFFF" : "#CBD5E1",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                Desconhecidas ({contLearning})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botão Exercitar */}
          <TouchableOpacity
            onPress={iniciarQuiz}
            disabled={palavras.length === 0}
            style={{
              backgroundColor: palavras.length > 0 ? "#3B82F6" : "#2A3142",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 12,
              alignSelf: "flex-start",
              opacity: palavras.length > 0 ? 1 : 0.5,
            }}
          >
            <Ionicons name="play" size={16} color="#FFFFFF" />
            <Text
              style={{
                color: "#FFFFFF",
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Exercitar Agora
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cabeçalho da Lista */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              backgroundColor: "#2A3142",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={getIconeFiltro()} size={16} color={getCorFiltro()} />
          </View>
          <View>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 17,
                fontWeight: "700",
              }}
            >
              {getTituloLista()}
            </Text>
            <Text
              style={{
                color: "#64748B",
                fontSize: 12,
              }}
            >
              {palavras.length} {palavras.length === 1 ? "palavra" : "palavras"}
            </Text>
          </View>
        </View>

        {/* Lista de Palavras */}
        <FlatList
          key={screenKey}
          data={palavras}
          keyExtractor={(item) => item.word}
          contentContainerStyle={{
            paddingBottom: 30,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 60,
              }}
            >
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  backgroundColor: "#1E2432",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#2A3142",
                }}
              >
                <Ionicons name={getIconeFiltro()} size={32} color="#475569" />
              </View>
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 15,
                  textAlign: "center",
                  fontWeight: "500",
                  marginBottom: 6,
                }}
              >
                Nenhuma palavra encontrada
              </Text>
              <Text
                style={{
                  color: "#475569",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                Continue lendo para adicionar novas palavras
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const traducoesLinha = formatarTraducoesUmaLinha(item.translations);

            return (
              <View
                style={{
                  backgroundColor: "#1E2432",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#2A3142",
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      backgroundColor: "#0A0E17",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                      borderWidth: 1,
                      borderColor: "#2A3142",
                    }}
                  >
                    <Text
                      style={{
                        color: getCorFiltro(),
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#FFFFFF",
                        marginBottom: 4,
                      }}
                    >
                      {item.word}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Ionicons name="language-outline" size={13} color="#64748B" />
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#94A3B8",
                          flex: 1,
                          lineHeight: 18,
                        }}
                      >
                        {traducoesLinha || "Sem traduções disponíveis"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}