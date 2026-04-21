import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as SQLite from "expo-sqlite";
import { AppLanguage } from "../constants/languages";

const SQLITE_DIR = FileSystem.documentDirectory + "SQLite/";

const omwDbInstances = new Map<AppLanguage, SQLite.SQLiteDatabase>();
const ensurePromises = new Map<AppLanguage, Promise<void>>();

function getOmwDbFileName(language: AppLanguage) {
  if (language === "es") return "wordnet_omw_es_pt.db";
  if (language === "ita") return "wordnet_omw_ita_pt.db";
  if (language === "fr") return "wordnet_omw_fr_pt.db";
  if (language === "de") return "wordnet_omw_de_pt.db";
  return "wordnet_omw_en_pt.db";
}

function getOmwDbAsset(language: AppLanguage) {
  if (language === "es") {
    return require("../../assets/db/wordnet_omw_es_pt.db");
  }

  if (language === "ita") {
    return require("../../assets/db/wordnet_omw_ita_pt.db");
  }

  if (language === "fr") {
    return require("../../assets/db/wordnet_omw_fr_pt.db");
  }

  if (language === "de") {
    return require("../../assets/db/wordnet_omw_de_pt.db");
  }

  return require("../../assets/db/wordnet_omw_en_pt.db");
}

async function ensureSqliteDirectoryExists() {
  if (!FileSystem.documentDirectory) {
    throw new Error("FileSystem.documentDirectory está indisponível.");
  }

  const dirInfo = await FileSystem.getInfoAsync(SQLITE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(SQLITE_DIR, { intermediates: true });
  }
}

export async function ensureOmwDbReady(language: AppLanguage) {
  const existingPromise = ensurePromises.get(language);
  if (existingPromise) {
    await existingPromise;
    return;
  }

  const promise = (async () => {
    const DB_NAME = getOmwDbFileName(language);

    await ensureSqliteDirectoryExists();

    const dbPath = SQLITE_DIR + DB_NAME;
    const dbInfo = await FileSystem.getInfoAsync(dbPath);
    if (dbInfo.exists) return;

    const asset = Asset.fromModule(getOmwDbAsset(language));
    await asset.downloadAsync();

    const localUri = asset.localUri ?? asset.uri;
    if (!localUri) {
      throw new Error("Não foi possível resolver o caminho do asset do banco.");
    }

    await FileSystem.copyAsync({ from: localUri, to: dbPath });

    const check = await FileSystem.getInfoAsync(dbPath);
    if (!check.exists) {
      throw new Error("Falha ao copiar o banco para a pasta SQLite.");
    }
  })();

  ensurePromises.set(language, promise);

  try {
    await promise;
  } finally {
    ensurePromises.delete(language);
  }
}

function closeDbInstance(instance: SQLite.SQLiteDatabase) {
  const maybeDb = instance as SQLite.SQLiteDatabase & {
    closeSync?: () => void;
    closeAsync?: () => Promise<void>;
  };

  try {
    if (typeof maybeDb.closeSync === "function") {
      maybeDb.closeSync();
      return;
    }
  } catch (error) {
    console.error("Erro ao fechar banco OMW (sync):", error);
  }

  try {
    if (typeof maybeDb.closeAsync === "function") {
      void maybeDb.closeAsync();
    }
  } catch (error) {
    console.error("Erro ao fechar banco OMW (async):", error);
  }
}

export function closeOmwDb(language: AppLanguage) {
  const instance = omwDbInstances.get(language);
  if (!instance) return;

  closeDbInstance(instance);
  omwDbInstances.delete(language);
}

export function closeAllOmwDbs(exceptLanguage?: AppLanguage) {
  for (const [language, instance] of omwDbInstances.entries()) {
    if (exceptLanguage && language === exceptLanguage) continue;
    closeDbInstance(instance);
    omwDbInstances.delete(language);
  }
}

export async function resetOmwDbForLanguage(language: AppLanguage) {
  closeOmwDb(language);
  await ensureOmwDbReady(language);
}

export function openOmwDb(language: AppLanguage) {
  const cached = omwDbInstances.get(language);
  if (cached) return cached;

  const DB_NAME = getOmwDbFileName(language);
  const instance = SQLite.openDatabaseSync(DB_NAME);
  omwDbInstances.set(language, instance);
  return instance;
}
