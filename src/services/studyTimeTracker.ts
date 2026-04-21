import { AppState, AppStateStatus } from "react-native";
import { AppLanguage } from "../constants/languages";
import { getSelectedLanguage } from "../repository/appStateRepository";
import { addStudyTimeMs } from "./progressService";

let activeStartTime: number | null = null;
let currentState: AppStateStatus = AppState.currentState;
let subscription: { remove: () => void } | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;
let activeLanguage: AppLanguage | null = null;

function getSafeActiveLanguage(): AppLanguage {
  if (activeLanguage) return activeLanguage;
  activeLanguage = getSelectedLanguage();
  return activeLanguage;
}

function flushActiveTime() {
  if (activeStartTime === null) return;

  const now = Date.now();
  const delta = now - activeStartTime;

  if (delta > 0) {
    addStudyTimeMs(delta, getSafeActiveLanguage());
  }

  activeStartTime = now;
}

function syncLanguageIfChanged() {
  const latestLanguage = getSelectedLanguage();

  if (latestLanguage !== activeLanguage) {
    flushActiveTime();
    activeLanguage = latestLanguage;
  }
}

function startInterval() {
  if (intervalId) return;

  intervalId = setInterval(() => {
    if (currentState === "active") {
      syncLanguageIfChanged();
      flushActiveTime();
    }
  }, 30000);
}

function stopInterval() {
  if (!intervalId) return;
  clearInterval(intervalId);
  intervalId = null;
}

export function startStudyTimeTracking() {
  if (subscription) return;

  activeLanguage = getSelectedLanguage();

  if (currentState === "active") {
    activeStartTime = Date.now();
    startInterval();
  }

  subscription = AppState.addEventListener("change", (nextState) => {
    syncLanguageIfChanged();

    if (currentState === "active" && nextState !== "active") {
      flushActiveTime();
      activeStartTime = null;
      stopInterval();
    }

    if (currentState !== "active" && nextState === "active") {
      activeLanguage = getSelectedLanguage();
      activeStartTime = Date.now();
      startInterval();
    }

    currentState = nextState;
  });
}

export function stopStudyTimeTracking() {
  if (currentState === "active") {
    syncLanguageIfChanged();
    flushActiveTime();
  }

  activeStartTime = null;
  stopInterval();

  subscription?.remove();
  subscription = null;
}