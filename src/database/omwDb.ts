import * as FileSystem from "expo-file-system/legacy";
import { Asset } from "expo-asset";
import * as SQLite from "expo-sqlite";

const SQLITE_DIR = FileSystem.documentDirectory + "SQLite/";
const DB_NAME = "wordnet_omw_en_pt.db";

export async function ensureOmwDbReady(): Promise<void> {
  if (!FileSystem.documentDirectory) {
    throw new Error("FileSystem.documentDirectory está indisponível.");
  }

  // 1) garante pasta SQLite/
  const dirInfo = await FileSystem.getInfoAsync(SQLITE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(SQLITE_DIR, { intermediates: true });
  }

  const dbPath = SQLITE_DIR + DB_NAME;

  // 2) se já existe, ok
  const dbInfo = await FileSystem.getInfoAsync(dbPath);
  if (dbInfo.exists) return;

  // 3) baixa asset localmente e copia
  const asset = Asset.fromModule(require("../../assets/db/wordnet_omw_en_pt.db"));
  await asset.downloadAsync();

  const localUri = asset.localUri ?? asset.uri;
  if (!localUri) {
    throw new Error("Não foi possível resolver o caminho do asset do banco.");
  }

  await FileSystem.copyAsync({ from: localUri, to: dbPath });

  // 4) verificação final
  const check = await FileSystem.getInfoAsync(dbPath);
  if (!check.exists) {
    throw new Error("Falha ao copiar o banco para a pasta SQLite.");
  }
}

export function openOmwDb() {
  return SQLite.openDatabaseSync(DB_NAME);
}