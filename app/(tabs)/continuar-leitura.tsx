import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getSelectedLanguage } from "../../src/repository/appStateRepository";
import { consumeCameFromReading } from "../../src/services/navigationStateService";
import { promptUserToReviewIfNeeded } from "../../src/services/quizPromptService";
import {
  deleteSavedReading,
  listSavedReadings,
  SavedReading,
  updateSavedReadingTitle,
} from "../../src/services/savedReadingsService";

function formatarData(timestamp: number) {
  const data = new Date(timestamp);

  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

export default function ContinuarLeituraScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [screenKey, setScreenKey] = useState(0);
  const [items, setItems] = useState<SavedReading[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  async function carregar() {
    const language = getSelectedLanguage();
    const list = await listSavedReadings(language);
    setItems(list);
  }

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [screenKey])
  );

  useFocusEffect(
    useCallback(() => {
      if (consumeCameFromReading()) {
        setTimeout(() => {
          promptUserToReviewIfNeeded();
        }, 300);
      }
    }, [])
  );

  function abrir(item: SavedReading) {
    router.push({
      pathname: "/navegador",
      params: { readingId: item.id },
    });
  }

  function iniciarEdicao(item: SavedReading) {
    setEditingId(item.id);
    setEditingTitle(item.title);
  }

  async function salvarEdicao() {
    if (!editingId) return;

    const language = getSelectedLanguage();
    await updateSavedReadingTitle(editingId, editingTitle, language);
    setEditingId(null);
    setEditingTitle("");
    setScreenKey((prev) => prev + 1);
  }

  async function excluir(item: SavedReading) {
    Alert.alert("Excluir leitura", `Deseja excluir "${item.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const language = getSelectedLanguage();
          await deleteSavedReading(item.id, language);
          setScreenKey((prev) => prev + 1);
        },
      },
    ]);
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
          title: "Continuar Leitura",
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

      <FlatList
        key={screenKey}
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 30,
          flexGrow: 1,
        }}
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
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#1E2432",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                borderWidth: 1,
                borderColor: "#2A3142",
              }}
            >
              <Ionicons name="book-outline" size={36} color="#475569" />
            </View>
            <Text
              style={{
                color: "#94A3B8",
                fontSize: 16,
                textAlign: "center",
                fontWeight: "500",
                marginBottom: 8,
              }}
            >
              Nenhuma leitura iniciada
            </Text>
            <Text
              style={{
                color: "#475569",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Volte para a tela inicial e comece uma nova leitura
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const emEdicao = editingId === item.id;

          return (
            <View
              style={{
                backgroundColor: "#1E2432",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#2A3142",
                padding: 18,
                marginBottom: 16,
              }}
            >
              {emEdicao ? (
                <>
                  <TextInput
                    value={editingTitle}
                    onChangeText={setEditingTitle}
                    placeholder="Digite o título"
                    placeholderTextColor="#475569"
                    autoFocus
                    style={{
                      backgroundColor: "#0A0E17",
                      borderWidth: 1,
                      borderColor: "#3B82F6",
                      borderRadius: 10,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      marginBottom: 16,
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      justifyContent: "center",
                    }}
                  >
                    <TouchableOpacity
                      onPress={salvarEdicao}
                      style={{
                        flex: 1,
                        backgroundColor: "#3B82F6",
                        paddingVertical: 12,
                        borderRadius: 10,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontWeight: "600",
                          fontSize: 14,
                        }}
                      >
                        Salvar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setEditingId(null);
                        setEditingTitle("");
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: "#2A3142",
                        paddingVertical: 12,
                        borderRadius: 10,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: "#3A4252",
                      }}
                    >
                      <Text
                        style={{
                          color: "#CBD5E1",
                          fontWeight: "500",
                          fontSize: 14,
                        }}
                      >
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: "#2A3142",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: "#FFFFFF",
                          marginBottom: 4,
                        }}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Ionicons name="calendar-outline" size={12} color="#64748B" />
                        <Text
                          style={{
                            color: "#64748B",
                            fontSize: 12,
                          }}
                        >
                          {formatarData(item.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                      justifyContent: "flex-end",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => abrir(item)}
                      style={{
                        backgroundColor: "#3B82F6",
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Ionicons name="play-outline" size={16} color="#FFFFFF" />
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontWeight: "600",
                          fontSize: 13,
                        }}
                      >
                        Abrir
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => iniciarEdicao(item)}
                      style={{
                        backgroundColor: "#2A3142",
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#3A4252",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Ionicons name="pencil-outline" size={16} color="#94A3B8" />
                      <Text
                        style={{
                          color: "#CBD5E1",
                          fontWeight: "500",
                          fontSize: 13,
                        }}
                      >
                        Editar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => excluir(item)}
                      style={{
                        backgroundColor: "#2A1A1A",
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#4A2A2A",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      <Text
                        style={{
                          color: "#EF4444",
                          fontWeight: "500",
                          fontSize: 13,
                        }}
                      >
                        Excluir
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}