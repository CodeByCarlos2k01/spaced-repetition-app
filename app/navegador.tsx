import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useLocalSearchParams, router } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";

import { initDatabase } from "../src/database/database";
import { ensureOmwDbReady } from "../src/database/omwDb";
import { WordRepository } from "../src/repository/wordRepository";
import { listarTraducoes } from "../src/services/translationService";
import { registrarCliqueEmPalavra } from "../src/services/wordClickService";
import { getSavedReadingById } from "../src/services/savedReadingsService";

function limparPalavra(raw: string) {
  return raw
    .replace(/[\u2019']/g, "'")
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

  useMemo(() => {
    (async () => {
      initDatabase();
      await ensureOmwDbReady();
    })();
  }, []);

  const repoRef = useRef(new WordRepository());
  const [carregando, setCarregando] = useState(false);
  const [html, setHtml] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  const lastClickAtRef = useRef<number>(0);
  const COOLDOWN_MS = 650;

  useEffect(() => {
    async function carregarLeitura() {
      try {
        if (!params.readingId || typeof params.readingId !== "string") return;

        setCarregando(true);

        const reading = await getSavedReadingById(params.readingId);
        if (!reading) {
          Alert.alert("Erro", "Leitura não encontrada.");
          setCarregando(false);
          return;
        }

        const content = await FileSystem.readAsStringAsync(reading.fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        setHtml(content);
        setBaseUrl(reading.url);
      } catch {
        Alert.alert("Erro", "Não foi possível carregar a leitura salva.");
      } finally {
        setCarregando(false);
      }
    }

    void carregarLeitura();
  }, [params.readingId]);

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
          return /[A-Za-zÀ-ÖØ-öø-ÿ'\\-]/.test(ch);
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

      const traducoes = await listarTraducoes(palavra);
      if (!traducoes.length) {
        setCarregando(false);
        Alert.alert(
          "Sem tradução disponível",
          "Não encontrei essa palavra no WordNet/OMW."
        );
        return;
      }

      const result = registrarCliqueEmPalavra(
        repoRef.current,
        palavra,
        traducoes
      );

      setCarregando(false);

      const linha = formatarTraducoesUmaLinha(traducoes);

      const titulo =
        result.action === "added_learning"
          ? "Adicionada às desconhecidas"
          : result.action === "forgotten"
          ? "Marcada como esquecida"
          : "Já registrada";

      Alert.alert(titulo, `${palavra}\n\n${linha}`);
    } catch {
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

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          paddingHorizontal: 12,
          paddingBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20 }}>Leitura na web</Text>
          
          <Text style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Toque em uma palavra para ver as traduções e salvar automaticamente.
          </Text>
        </View>

        <TouchableOpacity
          onPress={abrirTradutor}
          style={{
            backgroundColor: "#111",
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Google Tradutor</Text>
        </TouchableOpacity>
      </View>

      {carregando && (
        <View
          style={{
            paddingHorizontal: 12,
            paddingBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ActivityIndicator />
          <Text>Processando...</Text>
        </View>
      )}

      <WebView
        source={{ html, baseUrl }}
        injectedJavaScript={injectedJS}
        onMessage={onMessage}
      />
    </View>
  );
}