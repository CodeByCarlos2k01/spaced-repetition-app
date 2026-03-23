import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database/database";
import { todayKey } from "../utils/date";

const LAST_OPEN_KEY = "last_open_day";

export async function runDailyTickOncePerDay(): Promise<boolean> {
  const today = todayKey();
  const last = await AsyncStorage.getItem(LAST_OPEN_KEY);

  if (last === today) {
    return false; // já rodou hoje
  }

  // Novo dia: decrementa nextReview para palavras em review
  db.runSync(
    `
    UPDATE words
    SET nextReview = nextReview - 1
    WHERE status = 'review'
    `
  );

  await AsyncStorage.setItem(LAST_OPEN_KEY, today);
  return true;
}