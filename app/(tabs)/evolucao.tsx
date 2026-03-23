import { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";

import { initDatabase } from "../../src/database/database";
import { WordRepository } from "../../src/repository/wordRepository";
import { Word } from "../../src/models/Word";
import {
  getLearnedHistory,
  getStudyTimeHours,
  saveTodayLearnedCount,
} from "../../src/services/progressService";

type HistoryPoint = {
  date: string;
  learnedCount: number;
};

function formatarPercentual(valor: number) {
  return `${(valor * 100).toFixed(1)}%`;
}

function formatarHoras(valor: number) {
  return `${valor.toFixed(2)} h`;
}

function formatarTraducoes(traducoes: string[]) {
  const unicas = Array.from(
    new Set((traducoes ?? []).map((t) => t.trim()).filter(Boolean))
  );

  return unicas.join(", ");
}

function formatarDataCurta(date: string) {
  const [ano, mes, dia] = date.split("-");
  return `${dia}/${mes}`;
}

function LineChart({
  data,
}: {
  data: HistoryPoint[];
}) {
  const width = 300;
  const height = 160;
  const padding = 20;

  if (data.length === 0) {
    return (
      <View
        style={{
          height,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1f1f1f",
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#c8c8c8" }}>
          Ainda não há dados para o gráfico.
        </Text>
      </View>
    );
  }

  const maxY = Math.max(...data.map((p) => p.learnedCount), 1);
  const stepX =
    data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const points = data.map((point, index) => {
    const x = padding + index * stepX;
    const y =
      height -
      padding -
      ((point.learnedCount / maxY) * (height - padding * 2));

    return { ...point, x, y };
  });

  return (
    <View
      style={{
        width,
        height: height + 30,
        alignSelf: "center",
      }}
    >
      <View
        style={{
          width,
          height,
          backgroundColor: "#1f1f1f",
          borderRadius: 12,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {[0, 1, 2, 3].map((i) => {
          const y = padding + (i * (height - padding * 2)) / 3;
          return (
            <View
              key={i}
              style={{
                position: "absolute",
                left: padding,
                right: padding,
                top: y,
                borderTopWidth: 1,
                borderTopColor: "#333",
              }}
            />
          );
        })}

        {points.slice(0, -1).map((point, index) => {
          const next = points[index + 1];
          const dx = next.x - point.x;
          const dy = next.y - point.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

          return (
            <View
              key={`line-${index}`}
              style={{
                position: "absolute",
                left: point.x,
                top: point.y,
                width: length,
                height: 2,
                backgroundColor: "#7aa2ff",
                transform: [{ rotate: `${angle}deg` }],
                transformOrigin: "left center" as any,
              }}
            />
          );
        })}

        {points.map((point, index) => (
          <View key={`point-${index}`}>
            <View
              style={{
                position: "absolute",
                left: point.x - 4,
                top: point.y - 4,
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: "#7aa2ff",
              }}
            />
            <Text
              style={{
                position: "absolute",
                left: point.x - 14,
                top: point.y - 24,
                width: 32,
                textAlign: "center",
                color: "#f1f1f1",
                fontSize: 11,
              }}
            >
              {point.learnedCount}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          width,
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 6,
          paddingHorizontal: 6,
        }}
      >
        {points.map((point, index) => (
          <Text
            key={`label-${index}`}
            style={{
              color: "#9f9f9f",
              fontSize: 10,
              maxWidth: 44,
            }}
            numberOfLines={1}
          >
            {formatarDataCurta(point.date)}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function EvolucaoScreen() {
  useMemo(() => initDatabase(), []);
  const repo = useMemo(() => new WordRepository(), []);

  const [palavrasEsquecidas, setPalavrasEsquecidas] = useState(0);
  const [taxaRetencao, setTaxaRetencao] = useState(0);
  const [tempoEstudoHoras, setTempoEstudoHoras] = useState(0);
  const [pioresEaseFactors, setPioresEaseFactors] = useState<Word[]>([]);
  const [historicoAprendidas, setHistoricoAprendidas] = useState<HistoryPoint[]>([]);

  const carregarDados = useCallback(() => {
    saveTodayLearnedCount();

    const todas = repo.getAll();
    const aprendidas = todas.filter((w) => w.status === "review");
    const esquecidas = todas.filter((w) => w.status === "forgotten");

    const totalConsiderado = aprendidas.length + esquecidas.length;
    const retencao =
      totalConsiderado > 0 ? aprendidas.length / totalConsiderado : 0;

    const menoresEaseFactors = [...todas]
      .sort((a, b) => a.easeFactor - b.easeFactor)
      .slice(0, 4);

    setPalavrasEsquecidas(esquecidas.length);
    setTaxaRetencao(retencao);
    setTempoEstudoHoras(getStudyTimeHours());
    setPioresEaseFactors(menoresEaseFactors);
    setHistoricoAprendidas(getLearnedHistory());
  }, [repo]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 40,
        backgroundColor: "#1f1f1f",
      }}
    >

      <View
        style={{
          backgroundColor: "#2a2a2a",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "#ffffff",
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#c8c8c8", fontSize: 14, marginBottom: 6 }}>
          Tempo de estudo
        </Text>
        <Text style={{ color: "#f1f1f1", fontSize: 28, fontWeight: "700" }}>
          {formatarHoras(tempoEstudoHoras)}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: "#2a2a2a",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "#ffffff",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: "#f1f1f1",
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 12,
          }}
        >
          Gráfico de palavras aprendidas
        </Text>

        <LineChart data={historicoAprendidas} />
      </View>

      <View
        style={{
          backgroundColor: "#2a2a2a",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "#ffffff",
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#c8c8c8", fontSize: 14, marginBottom: 6 }}>
          Taxa de retenção das palavras
        </Text>
        <Text style={{ color: "#f1f1f1", fontSize: 28, fontWeight: "700" }}>
          {formatarPercentual(taxaRetencao)}
        </Text>

        <Text style={{ color: "#9f9f9f", fontSize: 12, marginTop: 8 }}>
          Fórmula: aprendidas / (aprendidas + esquecidas)
        </Text>
        <Text style={{ color: "#9f9f9f", fontSize: 12, marginTop: 4 }}>
          ({historicoAprendidas.length > 0
            ? historicoAprendidas[historicoAprendidas.length - 1].learnedCount
            : 0}
          ) / (
          {historicoAprendidas.length > 0
            ? historicoAprendidas[historicoAprendidas.length - 1].learnedCount
            : 0}
          + {palavrasEsquecidas})
        </Text>
      </View>

      <View
        style={{
          backgroundColor: "#2a2a2a",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "#ffffff",
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            color: "#f1f1f1",
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 12,
          }}
        >
          Palavras com maior dificuldade
        </Text>

        {pioresEaseFactors.length === 0 ? (
          <Text style={{ color: "#c8c8c8", fontSize: 14 }}>
            Ainda não há palavras cadastradas.
          </Text>
        ) : (
          <FlatList
            data={pioresEaseFactors}
            keyExtractor={(item) => item.word}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item, index }) => (
              <View
                style={{
                  backgroundColor: "#1f1f1f",
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#3a3a3a",
                }}
              >
                <Text
                  style={{
                    color: "#f1f1f1",
                    fontSize: 16,
                    fontWeight: "700",
                    marginBottom: 4,
                  }}
                >
                  {index + 1}. {item.word}
                </Text>

                <Text
                  style={{
                    color: "#c8c8c8",
                    fontSize: 14,
                    marginBottom: 6,
                  }}
                >
                  {formatarTraducoes(item.translations) || "Sem tradução"}
                </Text>

                <Text style={{ color: "#9f9f9f", fontSize: 13 }}>
                  easeFactor: {item.easeFactor.toFixed(2)}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}