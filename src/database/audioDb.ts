import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as SQLite from "expo-sqlite";

const AUDIO_DB_NAME = "audios.db";
const AUDIO_DB_ASSET = require("../../assets/db/audios.db");
const AUDIO_DB_DIR = `${FileSystem.documentDirectory}SQLite/`;

let audioDbInstance: SQLite.SQLiteDatabase | null = null;
let ensurePromise: Promise<void> | null = null;

async function ensureDirectoryExists(dir: string) {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

function openAudioDbUnsafe() {
  if (audioDbInstance) return audioDbInstance;

  audioDbInstance = SQLite.openDatabaseSync(
    AUDIO_DB_NAME,
    undefined,
    AUDIO_DB_DIR
  );

  return audioDbInstance;
}

function closeAudioDbIfOpen() {
  try {
    audioDbInstance?.closeSync?.();
  } catch {}
  audioDbInstance = null;
}

function hasAudioTable(db: SQLite.SQLiteDatabase) {
  const row = db.getFirstSync<{ name?: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'audios' LIMIT 1"
  );
  return !!row?.name;
}

export async function ensureAudioDbReady() {
  if (ensurePromise) {
    await ensurePromise;
    return;
  }

  ensurePromise = (async () => {
    const dbPath = `${AUDIO_DB_DIR}${AUDIO_DB_NAME}`;

    await ensureDirectoryExists(AUDIO_DB_DIR);

    let mustCopy = false;

    const existing = await FileSystem.getInfoAsync(dbPath);
    if (!existing.exists) {
      mustCopy = true;
    } else {
      try {
        closeAudioDbIfOpen();
        const db = openAudioDbUnsafe();
        if (!hasAudioTable(db)) {
          mustCopy = true;
        }
      } catch {
        mustCopy = true;
      } finally {
        closeAudioDbIfOpen();
      }
    }

    if (mustCopy) {
      const asset = Asset.fromModule(AUDIO_DB_ASSET);
      await asset.downloadAsync();

      const from = asset.localUri ?? asset.uri;
      if (!from) {
        throw new Error("Não foi possível localizar o asset audios.db");
      }

      if (existing.exists) {
        try {
          await FileSystem.deleteAsync(dbPath, { idempotent: true });
        } catch {}
      }

      await FileSystem.copyAsync({
        from,
        to: dbPath,
      });
    }

    closeAudioDbIfOpen();

    const db = openAudioDbUnsafe();

    if (!hasAudioTable(db)) {
      throw new Error("audios.db foi aberto, mas a tabela 'audios' não existe.");
    }
  })();

  try {
    await ensurePromise;
  } finally {
    ensurePromise = null;
  }
}

export function openAudioDb() {
  if (!audioDbInstance) {
    throw new Error("openAudioDb() chamado antes de ensureAudioDbReady()");
  }

  return audioDbInstance;
}