import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  listSavedReadings,
  deleteSavedReading,
  updateSavedReadingTitle,
  SavedReading,
} from "../../src/services/savedReadingsService";

function formatarData(timestamp: number) {
  const data = new Date(timestamp);

  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

export default function ContinuarLeituraScreen() {
  const router = useRouter();
  const [items, setItems] = useState<SavedReading[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  async function carregar() {
    const list = await listSavedReadings();
    setItems(list);
  }

  useFocusEffect(
    useCallback(() => {
      void carregar();
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

    await updateSavedReadingTitle(editingId, editingTitle);
    setEditingId(null);
    setEditingTitle("");
    await carregar();
  }

  async function excluir(item: SavedReading) {
    Alert.alert("Excluir leitura", `Deseja excluir "${item.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await deleteSavedReading(item.id);
          await carregar();
        },
      },
    ]);
  }

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: "#1f1f1f",
      }}
    >
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 20,
        }}
        ListEmptyComponent={
          <Text style={{ color: "#c8c8c8" }}>
            Nenhuma leitura iniciada ainda.
          </Text>
        }
        renderItem={({ item }) => {
          const emEdicao = editingId === item.id;

          return (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ffffff",
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                backgroundColor: "#2e2e2e",
              }}
            >
              {emEdicao ? (
                <>
                  <TextInput
                    value={editingTitle}
                    onChangeText={setEditingTitle}
                    placeholder="Digite o título"
                    placeholderTextColor="#9a9a9a"
                    textAlign="center"
                    style={{
                      borderWidth: 1,
                      borderColor: "#3a3a3a",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                      marginBottom: 10,
                      backgroundColor: "#2a2a2a",
                      color: "#f1f1f1",
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
                        backgroundColor: "#3a3a3a",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Salvar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setEditingId(null);
                        setEditingTitle("");
                      }}
                      style={{
                        backgroundColor: "#444444",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ color: "#ffffff" }}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "700",
                      marginBottom: 12,
                      color: "#f1f1f1",
                      textAlign: "center",
                    }}
                  >
                    {item.title}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => abrir(item)}
                      style={{
                        backgroundColor: "#4CAF50",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Abrir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => iniciarEdicao(item)}
                      style={{
                        backgroundColor: "#111",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Editar título</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => excluir(item)}
                      style={{
                        backgroundColor: "#8f2d2d",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Excluir</Text>
                    </TouchableOpacity>
                  </View>

                  <Text
                    style={{
                      marginTop: 10,
                      color: "#b5b5b5",
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    Adicionado em: {formatarData(item.createdAt)}
                  </Text>
                </>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}