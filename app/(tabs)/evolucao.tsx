import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { initDatabase } from "../../src/database/database";
import { Word } from "../../src/models/Word";
import { getSelectedLanguage } from "../../src/repository/appStateRepository";
import { WordRepository } from "../../src/repository/wordRepository";
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
  return `${valor.toFixed(1)}h`;
}

function formatarTraducoes(traducoes: string[]) {
  const unicas = Array.from(
    new Set((traducoes ?? []).map((t) => t.trim()).filter(Boolean))
  );

  return unicas.join(" • ");
}

function formatarDataCurta(date: string) {
  const [ano, mes, dia] = date.split("-");
  return `${dia}/${mes}`;
}

function SimpleHistoryChart({ data }: { data: HistoryPoint[] }) {
  const maxY = Math.max(...data.map((p) => p.learnedCount), 1);

  if (data.length === 0) {
    return (
      <View
        style={{
          height: 160,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1A202C",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#2A3142",
        }}
      >
        <Ionicons name="bar-chart-outline" size={32} color="#475569" style={{ marginBottom: 8 }} />
        <Text style={{ color: "#64748B", fontSize: 14 }}>
          Nenhum dado disponível
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: "#1A202C",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#2A3142",
      }}
    >
      <View
        style={{
          height: 160,
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        {data.map((point) => {
          const height = Math.max(12, Math.round((point.learnedCount / maxY) * 120));
          return (
            <View
              key={point.date}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Text
                style={{
                  color: "#CBD5E1",
                  fontSize: 11,
                  fontWeight: "600",
                  marginBottom: 6,
                }}
              >
                {point.learnedCount}
              </Text>
              <View
                style={{
                  width: "100%",
                  maxWidth: 28,
                  height,
                  borderRadius: 8,
                  backgroundColor: "#3B82F6",
                }}
              />
              <Text
                style={{
                  color: "#64748B",
                  fontSize: 10,
                  fontWeight: "500",
                  marginTop: 6,
                }}
              >
                {formatarDataCurta(point.date)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function EvolucaoScreen() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    initDatabase();
  }, []);

  const repo = useMemo(() => new WordRepository(), []);

  const [screenKey, setScreenKey] = useState(0);
  const [palavrasEsquecidas, setPalavrasEsquecidas] = useState(0);
  const [taxaRetencao, setTaxaRetencao] = useState(0);
  const [tempoEstudoHoras, setTempoEstudoHoras] = useState(0);
  const [pioresEaseFactors, setPioresEaseFactors] = useState<Word[]>([]);
  const [historicoAprendidas, setHistoricoAprendidas] = useState<HistoryPoint[]>([]);

  const carregarDados = useCallback(() => {
    try {
      const language = getSelectedLanguage();
      saveTodayLearnedCount(language);

      const todas = repo.getAll(language);
      const aprendidas = todas.filter((w) => w.status === "review");
      const esquecidas = todas.filter((w) => w.status === "forgotten");

      const totalConsiderado = aprendidas.length + esquecidas.length;
      const retencao =
        totalConsiderado > 0 ? aprendidas.length / totalConsiderado : 0;

      const menoresEaseFactors = [...todas]
        .sort((a, b) => a.easeFactor - b.easeFactor)
        .slice(0, 5);

      setPalavrasEsquecidas(esquecidas.length);
      setTaxaRetencao(retencao);
      setTempoEstudoHoras(getStudyTimeHours(language));
      setPioresEaseFactors(menoresEaseFactors);
      setHistoricoAprendidas(getLearnedHistory(language));
    } catch (error) {
      console.error("Erro ao carregar evolução:", error);
      setPalavrasEsquecidas(0);
      setTaxaRetencao(0);
      setTempoEstudoHoras(getStudyTimeHours(getSelectedLanguage()));
      setPioresEaseFactors([]);
      setHistoricoAprendidas([]);
    }
  }, [repo]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados, screenKey])
  );

  // Calcular cor da taxa de retenção
  const getCorTaxaRetencao = () => {
    if (taxaRetencao >= 0.7) return "#10B981";
    if (taxaRetencao >= 0.4) return "#F59E0B";
    return "#EF4444";
  };

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
          title: "Evolução",
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

      <ScrollView
        key={screenKey}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cards de Métricas */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {/* Tempo de Estudo */}
          <View
            style={{
              flex: 1,
              backgroundColor: "#1E2432",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#2A3142",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: "#2A3142",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="time-outline" size={16} color="#3B82F6" />
              </View>
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                Tempo
              </Text>
            </View>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 28,
                fontWeight: "700",
              }}
            >
              {formatarHoras(tempoEstudoHoras)}
            </Text>
            <Text
              style={{
                color: "#64748B",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Total de estudo
            </Text>
          </View>

          {/* Taxa de Retenção */}
          <View
            style={{
              flex: 1,
              backgroundColor: "#1E2432",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#2A3142",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: "#2A3142",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="trending-up-outline" size={16} color={getCorTaxaRetencao()} />
              </View>
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                Retenção
              </Text>
            </View>
            <Text
              style={{
                color: getCorTaxaRetencao(),
                fontSize: 28,
                fontWeight: "700",
              }}
            >
              {formatarPercentual(taxaRetencao)}
            </Text>
            <Text
              style={{
                color: "#64748B",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {palavrasEsquecidas} esquecidas
            </Text>
          </View>
        </View>

        {/* Gráfico de Histórico */}
        <View
          style={{
            backgroundColor: "#1E2432",
            borderRadius: 16,
            padding: 18,
            borderWidth: 1,
            borderColor: "#2A3142",
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#2A3142",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="calendar-outline" size={18} color="#3B82F6" />
              </View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 17,
                  fontWeight: "700",
                }}
              >
                Histórico de Aprendizado
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#2A3142",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 11,
                  fontWeight: "500",
                }}
              >
                Últimos 7 dias
              </Text>
            </View>
          </View>

          <SimpleHistoryChart data={historicoAprendidas} />
        </View>

        {/* Palavras com Dificuldade */}
        <View
          style={{
            backgroundColor: "#1E2432",
            borderRadius: 16,
            padding: 18,
            borderWidth: 1,
            borderColor: "#2A3142",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "#2A3142",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            </View>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 17,
                fontWeight: "700",
              }}
            >
              Palavras com Maior Dificuldade
            </Text>
          </View>

          {pioresEaseFactors.length === 0 ? (
            <View
              style={{
                paddingVertical: 30,
                alignItems: "center",
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={40} color="#475569" style={{ marginBottom: 8 }} />
              <Text
                style={{
                  color: "#64748B",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                Nenhuma palavra com dificuldade registrada
              </Text>
            </View>
          ) : (
            pioresEaseFactors.map((item, index) => (
              <View
                key={`${item.language}:${item.word}`}
                style={{
                  paddingVertical: 14,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: "#2A3142",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    {item.word}
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#2A1A1A",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: "#4A2A2A",
                    }}
                  >
                    <Text
                      style={{
                        color: "#EF4444",
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      EF: {item.easeFactor.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Ionicons name="language-outline" size={14} color="#64748B" />
                  <Text
                    style={{
                      color: "#94A3B8",
                      fontSize: 14,
                      flex: 1,
                    }}
                  >
                    {formatarTraducoes(item.translations) || "Sem traduções"}
                  </Text>
                </View>

                {/* Barra de dificuldade */}
                <View
                  style={{
                    marginTop: 8,
                    height: 4,
                    backgroundColor: "#2A3142",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${Math.max(10, Math.min(100, (1.3 - item.easeFactor) * 100))}%`,
                      height: "100%",
                      backgroundColor: "#EF4444",
                      borderRadius: 2,
                    }}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}