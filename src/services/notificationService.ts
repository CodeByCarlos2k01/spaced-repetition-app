import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DAILY_NOTIFICATION_ID_KEY = "daily_notification_id";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

export async function scheduleDailyNotificationAt18() {
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
      hour: 18,
      minute: 0,
    },
  });

  await AsyncStorage.setItem(DAILY_NOTIFICATION_ID_KEY, id);
}