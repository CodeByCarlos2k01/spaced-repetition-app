import { BackgroundMusicButton } from "@/components/BackgroundMusicButton";
import { getSelectedLanguage } from "@/src/repository/appStateRepository";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { initDatabase } from "../src/database/database";
import { ensureOmwDbReady } from "../src/database/omwDb";
import { WordRepository } from "../src/repository/wordRepository";
import { markCameFromReading } from "../src/services/navigationStateService";
import {
  deleteSavedReading,
  getSavedReadingById,
  saveReadingFromUrl,
} from "../src/services/savedReadingsService";
import { buscarTraducoesComFallback } from "../src/services/translationService";
import { registrarCliqueEmPalavra } from "../src/services/wordClickService";

type WebSourceState =
  | { kind: "none" }
  | { kind: "uri"; uri: string; baseUrl: string }
  | { kind: "html"; html: string; baseUrl: string };
  
function limparPalavra(raw: string) {
  return raw
    .replace(/[’']/g, "'")
    .replace(/[^\p{L}\p{N}'-]+/gu, "")
    .trim()
    .toLowerCase();
}

function formatarTraducoesUmaLinha(traducoes: string[]) {
  const uniq = Array.from(
    new Set((traducoes ?? []).map((t) => t.trim()).filter(Boolean))
  );
  return uniq.join(", ");
}

export default function NavegadorScreen() {
  const params = useLocalSearchParams<{ readingId?: string }>();

  const repoRef = useRef(new WordRepository());
  const [screenKey, setScreenKey] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [webSource, setWebSource] = useState<WebSourceState>({ kind: "none" });
  const [readingFileUri, setReadingFileUri] = useState("");
  const [readingUrl, setReadingUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [readingTitle, setReadingTitle] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ titulo: '', palavra: '', linha: '' });

  const lastClickAtRef = useRef<number>(0);
  const COOLDOWN_MS = 650;

  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        initDatabase();
        await ensureOmwDbReady(getSelectedLanguage());
      } catch (error) {
        if (!cancelled) {
          console.error("Erro ao inicializar leitura:", error);
        }
      }
    }

    void boot();

    return () => {
      setScreenKey((prev) => prev + 1);
    };
  }, []);

  async function fallbackToHtml(fileUri: string, baseUrl: string) {
    try {
      const content = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      setWebSource({ kind: "html", html: content, baseUrl });
    } catch (error) {
      console.error("Erro no fallback HTML:", error);
      Alert.alert("Erro", "Não foi possível carregar a leitura salva.");
    }
  }

  async function atualizarLeituraAtual() {
    try {
      if (!params.readingId || typeof params.readingId !== "string") return;
      if (!readingUrl) return;

      setCarregando(true);

      const language = getSelectedLanguage();

      const urlParaSalvar = currentUrl || readingUrl;
      const novaLeitura = await saveReadingFromUrl(urlParaSalvar, language, readingTitle);
      const oldId = params.readingId;
      
      router.replace({
        pathname: "/navegador",
        params: { readingId: String(novaLeitura.id) },
      });

      // apagar depois de trocar a rota
      setTimeout(() => {
        deleteSavedReading(oldId, language);
      }, 500);
    } catch (error) {
      console.error("Erro ao atualizar leitura:", error);
      Alert.alert("Erro", "Não foi possível atualizar a página.");
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function carregarLeitura() {
        try {
          if (!params.readingId || typeof params.readingId !== "string") return;

          setCarregando(true);
          setWebSource({ kind: "none" });

          const language = getSelectedLanguage();
          const reading = await getSavedReadingById(params.readingId, language);

          if (!reading) {
            if (!cancelled) {
              Alert.alert("Erro", "Leitura não encontrada.");
              setCarregando(false);
            }
            return;
          }

          const info = await FileSystem.getInfoAsync(reading.fileUri);
          if (!info.exists) {
            throw new Error("Arquivo salvo não encontrado.");
          }

          if (cancelled) return;

          setReadingFileUri(reading.fileUri);
          setReadingUrl(reading.url);
          setReadingTitle(reading.title);
          setWebSource({ kind: "uri", uri: reading.fileUri, baseUrl: reading.url });
        } catch (error) {
          if (!cancelled) {
            console.error("Erro ao carregar leitura:", error);
            Alert.alert("Erro", "Não foi possível carregar a leitura salva.");
          }
        } finally {
          if (!cancelled) {
            setCarregando(false);
          }
        }
      }

      void carregarLeitura();

      return () => {
        cancelled = true;
        webViewRef.current?.stopLoading();
        setReadingFileUri("");
        setReadingUrl("");
        setWebSource({ kind: "none" });
        setCarregando(false);
        markCameFromReading();
      };
    }, [params.readingId])
  );

  const injectedJS = `
    (function() {
      function getWordFromPoint(x, y) {
        var range;
        if (document.caretRangeFromPoint) {
          range = document.caretRangeFromPoint(x, y);
        } else if (document.caretPositionFromPoint) {
          var pos = document.caretPositionFromPoint(x, y);
          range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.setEnd(pos.offsetNode, pos.offset);
        }
        if (!range || !range.startContainer) return "";
        var text = range.startContainer.textContent || "";
        var offset = range.startOffset || 0;

        function isWordChar(ch) {
          return /[A-Za-zÀ-ÖØ-öø-ÿ'\-]/.test(ch);
        }

        var left = offset;
        var right = offset;

        while (left > 0 && isWordChar(text[left - 1])) left--;
        while (right < text.length && isWordChar(text[right])) right++;

        return text.slice(left, right).trim();
      }

      document.addEventListener('click', function(e) {
        try {
          var w = getWordFromPoint(e.clientX, e.clientY);
          if (w && w.length > 0) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "WORD_CLICK", word: w }));
          }
        } catch (err) {}
      }, true);
    })();
    true;
  `;

  async function onMessage(event: WebViewMessageEvent) {
    try {
      const now = Date.now();
      if (now - lastClickAtRef.current < COOLDOWN_MS) return;
      lastClickAtRef.current = now;

      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type !== "WORD_CLICK") return;

      const palavra = limparPalavra(String(msg.word || ""));
      if (!palavra || palavra.length < 2) return;

      setCarregando(true);
      const language = getSelectedLanguage();
      const lookup = await buscarTraducoesComFallback(palavra, language);
      const traducoes = lookup.translations;

      if (!traducoes.length) {
        setCarregando(false);
        Alert.alert(
          "Sem tradução disponível",
          "Não encontrei essa palavra."
        );
        return;
      }

      const palavraParaSalvar = lookup.resolvedWord || palavra;

      const result = registrarCliqueEmPalavra(
        repoRef.current,
        palavraParaSalvar,
        traducoes,
        language
      );

      setCarregando(false);

      const linha = formatarTraducoesUmaLinha(traducoes);

      const titulo =
        result.action === "added_learning"
          ? "Adicionada às desconhecidas"
          : result.action === "forgotten"
          ? "Marcada como esquecida"
          : "Já registrada";

      setModalData({ titulo, palavra: palavraParaSalvar, linha });
      setModalVisible(true);

    } catch (error) {
      console.error("Erro ao processar clique na palavra:", error);
      setCarregando(false);
      Alert.alert("Erro", "Não foi possível processar a palavra selecionada.");
    }
  }

  function abrirTradutor() {
    if (!params.readingId || typeof params.readingId !== "string") {
      router.push("/traduzir");
      return;
    }

    router.push({
      pathname: "/traduzir",
      params: { readingId: params.readingId },
    });
  }

  function handleWebViewError() {
    if (!readingFileUri || webSource.kind === "html") return;

    const baseUrl =
      webSource.kind === "uri" ? webSource.baseUrl : "";

    fallbackToHtml(readingFileUri, baseUrl);
  }

  const webViewSource =
    webSource.kind === "uri"
      ? { uri: webSource.uri }
      : webSource.kind === "html"
      ? { html: webSource.html, baseUrl: webSource.baseUrl }
      : undefined;

  return (
    <View key={screenKey} style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Leitura",
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginRight: 4,
              }}
            >
              <TouchableOpacity
                onPress={abrirTradutor}
                style={{
                  backgroundColor: "#1E2432",
                  borderWidth: 1,
                  borderColor: "#2A3142",
                  paddingHorizontal: 13,
                  paddingVertical: 7,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                >
                  Traduzir
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  void atualizarLeituraAtual();
                }}
                style={{
                  backgroundColor: "#1E2432",
                  borderWidth: 1,
                  borderColor: "#2A3142",
                  paddingHorizontal: 13,
                  paddingVertical: 7,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                >
                  Salvar
                </Text>
              </TouchableOpacity>

              <BackgroundMusicButton color="#ffffff" />
            </View>
          ),
        }}
      />

      <View
        style={{
          paddingHorizontal: 12,
          paddingBottom: 1,
          paddingTop: 1,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            opacity: 0.7,
            textAlign: "center",
          }}
        >
          Toque em uma palavra para ver sua tradução.
        </Text>
      </View>

      {carregando && (
        <View
          style={{
            paddingHorizontal: 12,
            paddingBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <ActivityIndicator />
          <Text>Processando...</Text>
        </View>
      )}

      {webViewSource ? (
        <WebView
          ref={webViewRef}
          source={webViewSource}
          originWhitelist={["*"]}
          allowFileAccess
          allowingReadAccessToURL={Platform.OS === "ios" ? readingFileUri : undefined}
          allowUniversalAccessFromFileURLs
          mixedContentMode="compatibility"
          injectedJavaScript={injectedJS}
          onMessage={onMessage}
          onError={handleWebViewError}
          onNavigationStateChange={(navState) => {
            setCurrentUrl(navState.url);
          }}
        />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text>Carregando leitura...</Text>
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ 
            backgroundColor: '#1E2432', 
            borderRadius: 14, 
            padding: 24, 
            width: '85%', 
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#3B82F6'
          }}>
            <Text style={{ 
              color: '#FFFFFF', 
              fontSize: 20, // TAMANHO GRANDE
              fontWeight: 'bold', 
              marginBottom: 16, 
              textAlign: 'center' // CENTRALIZADO
            }}>
              {modalData.titulo}
            </Text>
            
            <Text style={{ 
              color: '#3B82F6', 
              fontSize: 32, // TAMANHO GRANDE PARA A PALAVRA
              fontWeight: '800', 
              marginBottom: 12, 
              textAlign: 'center' // CENTRALIZADO
            }}>
              {modalData.palavra}
            </Text>
            
            <Text style={{ 
              color: '#D1D5DB', 
              fontSize: 25, // TAMANHO GRANDE
              marginBottom: 24, 
              textAlign: 'center' // CENTRALIZADO
            }}>
              {modalData.linha}
            </Text>
            
            <TouchableOpacity
              style={{ 
                backgroundColor: '#3B82F6', 
                paddingHorizontal: 32, 
                paddingVertical: 12, 
                borderRadius: 10,
                width: '100%'
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
