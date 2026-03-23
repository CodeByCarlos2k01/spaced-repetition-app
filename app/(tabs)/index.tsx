import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { saveReadingFromUrl } from "../../src/services/savedReadingsService";

export default function HomeScreen() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function abrirLeitura() {
    const value = url.trim();

    if (!value) {
      Alert.alert("URL obrigatória", "Digite um link para continuar.");
      return;
    }

    try {
      setCarregando(true);

      const saved = await saveReadingFromUrl(value);

      router.push({
        pathname: "/navegador",
        params: { readingId: saved.id },
      });
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a leitura."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 20,
        backgroundColor: "#1f1f1f",
      }}
    >
      <Text
        style={{
          marginTop: 24,
          fontSize: 64,
          fontWeight: "700",
          color: "#f1f1f1",
          textAlign: "center",
        }}
      >
        Inglês
      </Text>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingBottom: 100,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            color: "#c8c8c8",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Cole o link da página que você quer ler.
        </Text>

        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="Digite a URL aqui"
          placeholderTextColor="#9a9a9a"
          autoCapitalize="none"
          autoCorrect={false}
          textAlign="center"
          style={{
            borderWidth: 1,
            borderColor: "#ffffff",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            marginBottom: 12,
            backgroundColor: "#2a2a2a",
            color: "#f1f1f1",
          }}
        />

        <TouchableOpacity
          onPress={abrirLeitura}
          disabled={carregando}
          style={{
            backgroundColor: "#3a3a3a",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            opacity: carregando ? 0.7 : 1,
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "600" }}>
            Salvar e Abrir Leitura
          </Text>
        </TouchableOpacity>

        {carregando && (
          <View
            style={{
              marginTop: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <ActivityIndicator />
            <Text style={{ color: "#c8c8c8" }}>Salvando conteúdo...</Text>
          </View>
        )}
      </View>

      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 40,
        }}
      >
        <Text
          style={{
            color: "#9a9a9a",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          ©AppExemplo
        </Text>

        <Text
          style={{
            color: "#9a9a9a",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          v1.0.0
        </Text>
      </View>
    </View>
  );
}