import * as FileSystem from "expo-file-system/legacy";
import { AppLanguage } from "../constants/languages";
import { ensureAudioDbReady, openAudioDb } from "../database/audioDb";

type AudioRow = {
  audio_data: unknown;
};

const AUDIO_CACHE_DIR = FileSystem.cacheDirectory + "word-audio-cache/";
const uriCache = new Map<string, string | null>();
const pendingUriLoads = new Map<string, Promise<string | null>>();

function normalizeWord(word?: string | null) {
  return (word ?? "").trim().toLowerCase();
}

function buildCacheKey(word: string, language: AppLanguage) {
  return `${language}:${word}`;
}

function sanitizeFileName(value: string) {
  return value.replace(/[^\p{L}\p{N}_-]+/gu, "_");
}

async function ensureAudioCacheDirectoryExists() {
  if (!FileSystem.cacheDirectory) {
    throw new Error("FileSystem.cacheDirectory está indisponível.");
  }

  const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true });
  }
}

function uint8ArrayToBase64(bytes: Uint8Array) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";

  for (let i = 0; i < bytes.length; i += 3) {
    const byte1 = bytes[i] ?? 0;
    const byte2 = bytes[i + 1] ?? 0;
    const byte3 = bytes[i + 2] ?? 0;

    const combined = (byte1 << 16) | (byte2 << 8) | byte3;

    output += chars[(combined >> 18) & 63];
    output += chars[(combined >> 12) & 63];
    output += i + 1 < bytes.length ? chars[(combined >> 6) & 63] : "=";
    output += i + 2 < bytes.length ? chars[combined & 63] : "=";
  }

  return output;
}

function blobToUint8Array(value: unknown): Uint8Array | null {
  if (!value) return null;

  if (value instanceof Uint8Array) {
    return value;
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }

  if (Array.isArray(value)) {
    return Uint8Array.from(value);
  }

  if (typeof value === "object" && value !== null) {
    const maybeArrayLike = value as { data?: number[]; buffer?: ArrayBuffer; length?: number };

    if (Array.isArray(maybeArrayLike.data)) {
      return Uint8Array.from(maybeArrayLike.data);
    }

    if (maybeArrayLike.buffer instanceof ArrayBuffer && typeof maybeArrayLike.length === "number") {
      return new Uint8Array(maybeArrayLike.buffer, 0, maybeArrayLike.length);
    }
  }

  return null;
}

async function buildAudioUri(word: string, language: AppLanguage) {
  await ensureAudioDbReady();
  await ensureAudioCacheDirectoryExists();

  const db = openAudioDb();
  const row = db.getFirstSync<AudioRow>(
    `SELECT audio_data FROM audios WHERE idioma = ? AND palavra = ? LIMIT 1`,
    [language, word]
  );

  if (!row?.audio_data) {
    return null;
  }

  const bytes = blobToUint8Array(row.audio_data);
  if (!bytes || bytes.length === 0) {
    return null;
  }

  const fileName = `${language}_${sanitizeFileName(word)}.mp3`;
  const fileUri = AUDIO_CACHE_DIR + fileName;
  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (!fileInfo.exists) {
    const base64 = uint8ArrayToBase64(bytes);
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  return fileUri;
}

export async function getWordAudioUri(
  word?: string | null,
  language: AppLanguage = "en"
) {
  const normalizedWord = normalizeWord(word);
  if (!normalizedWord) return null;

  const cacheKey = buildCacheKey(normalizedWord, language);

  if (uriCache.has(cacheKey)) {
    return uriCache.get(cacheKey) ?? null;
  }

  const pending = pendingUriLoads.get(cacheKey);
  if (pending) {
    return pending;
  }

  const loadPromise = buildAudioUri(normalizedWord, language)
    .then((uri) => {
      uriCache.set(cacheKey, uri);
      return uri;
    })
    .finally(() => {
      pendingUriLoads.delete(cacheKey);
    });

  pendingUriLoads.set(cacheKey, loadPromise);
  return loadPromise;
}

export async function hasWordAudio(
  word?: string | null,
  language: AppLanguage = "en"
) {
  const normalizedWord = normalizeWord(word);
  if (!normalizedWord) return false;

  await ensureAudioDbReady();

  const db = openAudioDb();
  const row = db.getFirstSync<{ found: number }>(
    `SELECT 1 AS found FROM audios WHERE idioma = ? AND palavra = ? LIMIT 1`,
    [language, normalizedWord]
  );

  return !!row?.found;
}