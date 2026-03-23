import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

// importa serviços extras
import { initDatabase } from "../src/database/database";
import { runDailyTickOncePerDay } from "../src/services/dailyTick";
import { scheduleDailyNotificationAt18 } from "../src/services/notificationService";
import { ensureOmwDbReady } from "../src/database/omwDb";

import { startStudyTimeTracking, stopStudyTimeTracking } from "../src/services/studyTimeTracker";
import { saveTodayLearnedCount } from "../src/services/progressService";

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // efeito para inicialização da base e notificações
  useEffect(() => {
    (async () => {
      initDatabase();
      await ensureOmwDbReady();

      // 1) roda tick diário
      await runDailyTickOncePerDay();

      // 2) agenda notificação diária para 18h
      await scheduleDailyNotificationAt18();

      saveTodayLearnedCount();
      startStudyTimeTracking();
    })();
  }, []);

  useEffect(() => {
    return () => {
      stopStudyTimeTracking();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}