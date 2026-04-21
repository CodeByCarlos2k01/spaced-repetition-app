import { BackgroundMusicButton } from "@/components/BackgroundMusicButton";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppLanguage, LANGUAGES } from "../../src/constants/languages";
import { initDatabase } from "../../src/database/database";
import { ensureOmwDbReady } from "../../src/database/omwDb";
import {
  getSelectedLanguage,
  setSelectedLanguage,
} from "../../src/repository/appStateRepository";
import { saveReadingFromUrl } from "../../src/services/savedReadingsService";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [language, setLanguageState] = useState<AppLanguage>("en");
  const [url, setUrl] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const changingLanguageRef = useRef(false);

  useEffect(() => {
    initDatabase();
    setLanguageState(getSelectedLanguage());
  }, []);

  async function onChangeLanguage(value: AppLanguage) {
    if (changingLanguageRef.current) return;
    if (value === language) return;

    try {
      changingLanguageRef.current = true;
      await ensureOmwDbReady(value);

      await new Promise((r) => setTimeout(r, 100));
      setSelectedLanguage(value);
      setLanguageState(value);
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível trocar o idioma."
      );
    } finally {
      changingLanguageRef.current = false;
    }
  }

  function abrirTradutor() {
    router.push("/traduzir");
  }

  async function abrirLeitura() {
    const value = url.trim();

    if (!value) {
      Alert.alert("URL obrigatória", "Digite um link para continuar.");
      return;
    }

    try {
      setCarregando(true);

      const language = getSelectedLanguage();
      const saved = await saveReadingFromUrl(value, language);

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
      changingLanguageRef.current = false;
      setCarregando(false);
    }
  }

  const selectedLanguageLabel =
    LANGUAGES.find((item) => item.value === language)?.label ?? language;

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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Stack.Screen
          options={{
            title: "PolyGlota",
            headerStyle: {
              backgroundColor: "#0A0E17",
            },
            headerTintColor: "#FFFFFF",
            headerTitleStyle: {
              fontWeight: "700",
              fontSize: 20,
            },
            headerShadowVisible: false,
            headerRight: () => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginRight: 4,
                }}
              >
                <TouchableOpacity
                  onPress={abrirTradutor}
                  style={{
                    backgroundColor: "#1E2432",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#2A3142",
                  }}
                >
                  <Text
                    style={{
                      color: "#3B82F6",
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    Traduzir
                  </Text>
                </TouchableOpacity>

                <BackgroundMusicButton color="#94A3B8" />

                <TouchableOpacity
                  onPress={() => router.push("/configuracao" as any)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: "#1E2432",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "#2A3142",
                  }}
                >
                  <Ionicons name="settings-outline" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            ),
          }}
        />

        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
          }}
        >
          {/* Seletor de Idioma */}
          <TouchableOpacity
            onPress={() => setShowLanguageModal(true)}
            disabled={carregando}
            style={{
              alignSelf: "center",
              marginTop: 28,
              marginBottom: 20,
              backgroundColor: "#1E2432",
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#2A3142",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              opacity: carregando ? 0.6 : 1,
            }}
          >
            <Ionicons name="globe-outline" size={18} color="#3B82F6" />
            <Text
              style={{
                color: "#E2E8F0",
                fontWeight: "500",
                fontSize: 14,
              }}
            >
              {selectedLanguageLabel}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#64748B" />
          </TouchableOpacity>

          {/* Conteúdo Principal */}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text
              style={{
                fontSize: 34,
                fontWeight: "700",
                color: "#FFFFFF",
                textAlign: "center",
                marginBottom: 8,
                letterSpacing: -0.5,
              }}
            >
              O que vamos ler?
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: "#94A3B8",
                marginBottom: 28,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Cole o link da página que você deseja explorar
            </Text>

            {/* Campo de URL */}
            <View
              style={{
                backgroundColor: "#1E2432",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#2A3142",
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                }}
              >
                <Ionicons name="link-outline" size={20} color="#64748B" />
                <TextInput
                  value={url}
                  onChangeText={setUrl}
                  placeholder="https://exemplo.com/artigo"
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    paddingHorizontal: 12,
                    color: "#F1F5F9",
                    fontSize: 14,
                  }}
                />
                {url.length > 0 && (
                  <TouchableOpacity onPress={() => setUrl("")}>
                    <Ionicons name="close-circle" size={18} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Botão Principal */}
            <TouchableOpacity
              onPress={abrirLeitura}
              disabled={carregando}
              style={{
                backgroundColor: "#3B82F6",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                opacity: carregando ? 0.8 : 1,
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontWeight: "600",
                  fontSize: 15,
                }}
              >
                {carregando ? "Processando..." : "Iniciar Leitura"}
              </Text>
            </TouchableOpacity>

            {/* Dica Rápida */}
            <View
              style={{
                marginTop: 16,
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
                💡 Dica: Você pode ler artigos, notícias e qualquer página web
              </Text>
            </View>

            {/* Indicador de Carregamento */}
            {carregando && (
              <View
                style={{
                  marginTop: 24,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  backgroundColor: "#1E2432",
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#2A3142",
                }}
              >
                <ActivityIndicator color="#3B82F6" />
                <Text style={{ color: "#94A3B8", fontSize: 13 }}>
                  Obtendo conteúdo da página...
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View
            style={{
              alignItems: "center",
              paddingVertical: 24,
              borderTopWidth: 1,
              borderTopColor: "#1E2432",
              marginTop: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#3B82F6",
                }}
              />
              <Text
                style={{
                  color: "#475569",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                PolyGlota
              </Text>
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#3B82F6",
                }}
              />
            </View>
            <Text
              style={{
                color: "#334155",
                fontSize: 10,
                marginTop: 4,
              }}
            >
              Versão 1.0.0
            </Text>
          </View>
        </View>

        {/* Modal de Seleção de Idioma */}
        <Modal
          visible={showLanguageModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowLanguageModal(false)}
            style={{
              flex: 1,
              backgroundColor: "rgba(10, 14, 23, 0.9)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "85%",
                maxWidth: 340,
                backgroundColor: "#1E2432",
                borderRadius: 16,
                padding: 24,
                borderWidth: 1,
                borderColor: "#2A3142",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                Escolha o idioma
              </Text>

              {LANGUAGES.map((item, index) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    setShowLanguageModal(false);
                    onChangeLanguage(item.value);
                  }}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor:
                      item.value === language ? "#2A3142" : "transparent",
                    borderWidth: 1,
                    borderColor:
                      item.value === language ? "#3B82F6" : "transparent",
                    marginBottom: index === LANGUAGES.length - 1 ? 0 : 8,
                  }}
                >
                  <Text
                    style={{
                      color: item.value === language ? "#3B82F6" : "#CBD5E1",
                      fontSize: 15,
                      fontWeight: item.value === language ? "600" : "400",
                      textAlign: "center",
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <View
                style={{
                  marginTop: 20,
                  borderTopWidth: 1,
                  borderTopColor: "#2A3142",
                  paddingTop: 16,
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowLanguageModal(false)}
                  style={{
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#94A3B8",
                      textAlign: "center",
                      fontWeight: "500",
                      fontSize: 14,
                    }}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
}