import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { AppLanguage } from "../constants/languages";

const READINGS_DIR = `${FileSystem.documentDirectory}readings/`;

export type SavedReading = {
  id: string;
  language: AppLanguage;
  url: string;
  title: string;
  customTitle: boolean;
  fileUri: string;
  createdAt: number;
};

function getStorageKey(language: AppLanguage) {
  return `saved_readings_v1_${language}`;
}

function normalizeUrl(raw: string) {
  const value = raw.trim();
  const withProtocol =
    value.startsWith("http://") || value.startsWith("https://")
      ? value
      : `https://${value}`;

  return withProtocol.replace(/\/+$/, "");
}

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(READINGS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(READINGS_DIR, {
      intermediates: true,
    });
  }
}

async function readAll(language: AppLanguage): Promise<SavedReading[]> {
  const raw = await AsyncStorage.getItem(getStorageKey(language));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(language: AppLanguage, items: SavedReading[]) {
  await AsyncStorage.setItem(getStorageKey(language), JSON.stringify(items));
}

function renumberUntitled(items: SavedReading[]) {
  const ordered = [...items].sort((a, b) => a.createdAt - b.createdAt);

  const titleById: Record<string, string> = {};

  for (let i = 0; i < ordered.length; i++) {
    const item = ordered[i];
    const contentNumber = i + 1;

    if (!item.customTitle) {
      titleById[item.id] = `Conteúdo ${contentNumber}`;
    }
  }

  return items.map((item) =>
    !item.customTitle && titleById[item.id]
      ? {
          ...item,
          title: titleById[item.id],
        }
      : item
  );
}

export async function listSavedReadings(language: AppLanguage) {
  const items = await readAll(language);
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
}

export async function getSavedReadingById(id: string, language: AppLanguage) {
  const items = await readAll(language);
  return items.find((item) => item.id === id) ?? null;
}

export async function saveReadingFromUrl(
  rawUrl: string, 
  language: AppLanguage, 
  customTitle: string | undefined = undefined
) {
  const url = normalizeUrl(rawUrl);
  const items = await readAll(language);

  const existing = items.find(
    (item) => normalizeUrl(item.url) === url
  );

  if (existing) {
    return existing;
  }

  await ensureDir();

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Não foi possível baixar o conteúdo da página.");
  }

  const html = await response.text();

  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const fileUri = `${READINGS_DIR}${id}.html`;

  const htmlWithBase = html.includes("<head>")
    ? html.replace("<head>", `<head><base href="${url}/">`)
    : `<head><base href="${url}/"></head>${html}`;

  await FileSystem.writeAsStringAsync(fileUri, htmlWithBase, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const nextUntitledCount = items.length + 1;

  const created: SavedReading = {
    id,
    language,
    url,
    title: customTitle === undefined ? `Conteúdo ${nextUntitledCount}` : customTitle.trim(),
    customTitle: true,
    fileUri,
    createdAt: Date.now(),
  };

  const next = [...items, created];
  await writeAll(language, renumberUntitled(next));

  return created;
}

export async function updateSavedReadingTitle(id: string, title: string, language: AppLanguage) {
  const items = await readAll(language);

  const next = items.map((item) =>
    item.id === id
      ? {
          ...item,
          title: title.trim() || item.title,
          customTitle: true,
        }
      : item
  );

  await writeAll(language, next);
}

export async function deleteSavedReading(id: string, language: AppLanguage) {
  const items = await readAll(language);
  const target = items.find((item) => item.id === id);

  if (target) {
    try {
      await FileSystem.deleteAsync(target.fileUri, { idempotent: true });
    } catch {}
  }

  const filtered = items.filter((item) => item.id !== id);
  await writeAll(language, renumberUntitled(filtered));
}