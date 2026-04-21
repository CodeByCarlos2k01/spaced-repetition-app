import { BackgroundMusicButton } from '@/components/BackgroundMusicButton';
import { useColorScheme } from '@/components/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from "react-native";
import 'react-native-reanimated';

import { ensureAudioDbReady } from "../src/database/audioDb";
import { initDatabase } from "../src/database/database";
import { runDailyTickOncePerDay } from "../src/services/dailyTick";
import { musicPlayer } from "../src/services/musicPlayer";
import { scheduleSavedDailyNotification } from "../src/services/notificationService";
import {
  markDailyQuizPromptShown,
  saveTodayLearnedCount,
  shouldShowDailyQuizPrompt,
} from "../src/services/progressService";
import { promptUserToReviewIfNeeded } from "../src/services/quizPromptService";
import { startStudyTimeTracking, stopStudyTimeTracking } from "../src/services/studyTimeTracker";

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [audioDbReady, setAudioDbReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    (async () => {
      try {
        await ensureAudioDbReady();
        setAudioDbReady(true);
      } catch (e) {
        console.error("Erro ao preparar audios.db:", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (loaded && audioDbReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, audioDbReady]);

  useEffect(() => {
    (async () => {
      initDatabase();
      await runDailyTickOncePerDay();
      await scheduleSavedDailyNotification();
      saveTodayLearnedCount();
      startStudyTimeTracking();
    })();
  }, []);

  useEffect(() => {
    if (shouldShowDailyQuizPrompt()) {
      markDailyQuizPromptShown();
      setTimeout(() => {
        promptUserToReviewIfNeeded();
      }, 500);
    }
  }, []);

  useEffect(() => {
    void musicPlayer.start();

    return () => {
      musicPlayer.destroy();
      stopStudyTimeTracking();
    };
  }, []);

  if (!loaded || !audioDbReady) {
    return null;
  }

  return (
      <RootLayoutNav />
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerRight: () => (
            <View style={{ marginRight: 4 }}>
              <BackgroundMusicButton />
            </View>
          ),
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}