import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

const STORAGE_KEY = "saved_readings_v1";
const READINGS_DIR = `${FileSystem.documentDirectory}readings/`;

export type SavedReading = {
  id: string;
  url: string;
  title: string;
  customTitle: boolean;
  fileUri: string;
  createdAt: number;
};

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

async function readAll(): Promise<SavedReading[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(items: SavedReading[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renumberUntitled(items: SavedReading[]) {
  const ordered = [...items].sort((a, b) => a.createdAt - b.createdAt);

  let untitledIndex = 1;

  for (const item of ordered) {
    if (!item.customTitle) {
      item.title = `Conteúdo ${untitledIndex}`;
      untitledIndex++;
    }
  }

  return ordered;
}

export async function listSavedReadings() {
  const items = await readAll();
  return [...items].sort((a, b) => a.createdAt - b.createdAt);
}

export async function getSavedReadingById(id: string) {
  const items = await readAll();
  return items.find((item) => item.id === id) ?? null;
}

export async function saveReadingFromUrl(rawUrl: string) {
  const url = normalizeUrl(rawUrl);
  const items = await readAll();

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

  const nextUntitledCount =
    items.filter((item) => !item.customTitle).length + 1;

  const created: SavedReading = {
    id,
    url,
    title: `Conteúdo ${nextUntitledCount}`,
    customTitle: false,
    fileUri,
    createdAt: Date.now(),
  };

  const next = [...items, created];
  await writeAll(renumberUntitled(next));

  return created;
}

export async function updateSavedReadingTitle(id: string, title: string) {
  const items = await readAll();

  const next = items.map((item) =>
    item.id === id
      ? {
          ...item,
          title: title.trim() || item.title,
          customTitle: true,
        }
      : item
  );

  await writeAll(next);
}

export async function deleteSavedReading(id: string) {
  const items = await readAll();
  const target = items.find((item) => item.id === id);

  if (target) {
    try {
      await FileSystem.deleteAsync(target.fileUri, { idempotent: true });
    } catch {}
  }

  const filtered = items.filter((item) => item.id !== id);
  await writeAll(renumberUntitled(filtered));
}