import { AppState, AppStateStatus } from "react-native";
import { addStudyTimeMs } from "./progressService";

let activeStartTime: number | null = null;
let currentState: AppStateStatus = AppState.currentState;
let subscription: { remove: () => void } | null = null;

export function startStudyTimeTracking() {
  if (subscription) return;

  if (currentState === "active") {
    activeStartTime = Date.now();
  }

  subscription = AppState.addEventListener("change", (nextState) => {
    if (currentState === "active" && nextState !== "active") {
      if (activeStartTime !== null) {
        addStudyTimeMs(Date.now() - activeStartTime);
        activeStartTime = null;
      }
    }

    if (currentState !== "active" && nextState === "active") {
      activeStartTime = Date.now();
    }

    currentState = nextState;
  });
}

export function stopStudyTimeTracking() {
  if (currentState === "active" && activeStartTime !== null) {
    addStudyTimeMs(Date.now() - activeStartTime);
    activeStartTime = null;
  }

  subscription?.remove();
  subscription = null;
}