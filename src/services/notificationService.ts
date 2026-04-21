import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const DAILY_NOTIFICATION_ID_KEY = "daily_notification_id";
const REMINDER_HOUR_KEY = "reminder_hour";
const REMINDER_MINUTE_KEY = "reminder_minute";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function normalizeHour(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return 18;
  if (value < 0 || value > 23) return 18;
  return Math.floor(value);
}

function normalizeMinute(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  if (value < 0 || value > 59) return 0;
  return Math.floor(value);
}

export async function ensureNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== "granted") return false;
  }
  return true;
}

export async function cancelScheduledDailyNotificationIfAny() {
  const existingId = await AsyncStorage.getItem(DAILY_NOTIFICATION_ID_KEY);

  if (existingId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    } catch {}
    await AsyncStorage.removeItem(DAILY_NOTIFICATION_ID_KEY);
  }
}

export async function getReminderTime() {
  const rawHour = await AsyncStorage.getItem(REMINDER_HOUR_KEY);
  const rawMinute = await AsyncStorage.getItem(REMINDER_MINUTE_KEY);

  return {
    hour: normalizeHour(rawHour === null ? 18 : Number(rawHour)),
    minute: normalizeMinute(rawMinute === null ? 0 : Number(rawMinute)),
  };
}

export async function setReminderTime(hour?: number | null, minute?: number | null) {
  const nextHour = normalizeHour(hour);
  const nextMinute = normalizeMinute(minute);

  await AsyncStorage.setItem(REMINDER_HOUR_KEY, String(nextHour));
  await AsyncStorage.setItem(REMINDER_MINUTE_KEY, String(nextMinute));

  await scheduleDailyNotification(nextHour, nextMinute);
}

export async function scheduleDailyNotification(hour: number, minute: number) {
  const allowed = await ensureNotificationPermission();
  if (!allowed) return;

  await cancelScheduledDailyNotificationIfAny();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Hora de praticar vocabulário",
      body: "Reserve alguns minutos para revisar suas palavras de hoje.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: normalizeHour(hour),
      minute: normalizeMinute(minute),
    },
  });

  await AsyncStorage.setItem(DAILY_NOTIFICATION_ID_KEY, id);
}

export async function scheduleSavedDailyNotification() {
  const { hour, minute } = await getReminderTime();
  await scheduleDailyNotification(hour, minute);
}