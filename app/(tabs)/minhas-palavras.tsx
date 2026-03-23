import { useCallback, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { initDatabase } from "../../src/database/database";
import { WordRepository } from "../../src/repository/wordRepository";
import { Word } from "../../src/models/Word";

type Filtro = "learning" | "forgotten" | "due_review";

function formatarTraducoesUmaLinha(traducoes: string[]) {
  const uniq = Array.from(new Set((traducoes ?? []).map(t => t.trim()).filter(Boolean)));
  return uniq.join(", ");
}

export default function MinhasPalavrasScreen() {
  const router = useRouter();

  // Inicializa o DB uma vez (não custa)
  useMemo(() => initDatabase(), []);

  const repo = useMemo(() => new WordRepository(), []);

  const [filtro, setFiltro] = useState<Filtro>("due_review");
  const [palavras, setPalavras] = useState<Word[]>([]);
  const [contLearning, setContLearning] = useState(0);
  const [contForgotten, setContForgotten] = useState(0);
  const [contDue, setContDue] = useState(0);

  const carregar = useCallback(() => {
    const learning = repo.getLearning();
    const forgotten = repo.getForgotten();
    const due = repo.getDueReviews(50); // ✅ limite 50 já aqui

    setContLearning(learning.length);
    setContForgotten(forgotten.length);
    setContDue(due.length);

    if (filtro === "learning") setPalavras(learning);
    if (filtro === "forgotten") setPalavras(forgotten);
    if (filtro === "due_review") setPalavras(due);
  }, [repo, filtro]);

  // Recarrega toda vez que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function iniciarQuiz() {
    const mode =
      filtro === "due_review" ? "review" : filtro === "forgotten" ? "forgotten" : "learning";

    // Se não tiver palavras, não entra
    if (palavras.length === 0) {
      Alert.alert("Nada para estudar", "Não há palavras nesta categoria no momento.");
      return;
    }

    router.push({
      pathname: "/quiz",
      params: { mode },
    });
  }

  function tituloLista() {
    if (filtro === "learning") return "Desconhecidas";
    if (filtro === "forgotten") return "Esquecidas";
    return "Revisão Vencida";
  }

  function estiloBotaoSelecionado(ativo: boolean) {
    return {
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#ffffff",
      backgroundColor: ativo ? "#ffffff" : "#2a2a2a",
      minWidth: 170,
      alignItems: "center" as const,
    };
  }

  function estiloTextoSelecionado(ativo: boolean) {
    return {
      color: ativo ? "#000000" : "#f1f1f1",
      fontWeight: "600" as const,
      textAlign: "center" as const,
    };
  }

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: "#1f1f1f",
      }}
    >
      <View
        style={{
          alignItems: "center",
          marginTop: 8,
          marginBottom: 16,
          gap: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => setFiltro("due_review")}
          style={estiloBotaoSelecionado(filtro === "due_review")}
        >
          <Text style={estiloTextoSelecionado(filtro === "due_review")}>
            Revisão ({contDue})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFiltro("forgotten")}
          style={estiloBotaoSelecionado(filtro === "forgotten")}
        >
          <Text style={estiloTextoSelecionado(filtro === "forgotten")}>
            Esquecidas ({contForgotten})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFiltro("learning")}
          style={estiloBotaoSelecionado(filtro === "learning")}
        >
          <Text style={estiloTextoSelecionado(filtro === "learning")}>
            Desconhecidas ({contLearning})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ação principal */}
      <TouchableOpacity
        onPress={iniciarQuiz}
        style={{
          padding: 12,
          borderRadius: 12,
          backgroundColor: "#4CAF50",
          alignSelf: "flex-start",
          marginBottom: 12,
          minWidth: 100,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#f1f1f1", fontWeight: "600" }}>Iniciar Exercício</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 16, marginTop: 4, color: "#c8c8c8" }}>{tituloLista()}</Text>

      {/* Lista */}
      <FlatList
        data={palavras}
        keyExtractor={(item) => item.word}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <Text style={{ marginTop: 10, opacity: 0.7, color: "#9a9a9a" }}>
            Nenhuma palavra nesta categoria.
          </Text>
        }
        renderItem={({ item }) => {
          const traducoesLinha = formatarTraducoesUmaLinha(item.translations);

          return (
            <View
              style={{
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#3a3a3a",
                marginTop: 10,
                backgroundColor: "#2e2e2e",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#f1f1f1" }}>{item.word}</Text>

              <Text style={{ fontSize: 14, marginTop: 4, color: "#c8c8c8" }}>
                {traducoesLinha || "Sem traduções"}
              </Text>

              
            </View>
          );
        }}
      />
    </View>
  );
}