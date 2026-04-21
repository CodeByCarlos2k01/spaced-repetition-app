import { router } from "expo-router";
import { Alert } from "react-native";
import { getSelectedLanguage } from "../repository/appStateRepository";
import { WordRepository } from "../repository/wordRepository";

export function promptUserToReviewIfNeeded() {
  const repo = new WordRepository();
  const language = getSelectedLanguage();

  const due = repo.getDueReviews(50, language);
  const forgotten = repo.getForgotten(language);
  const learning = repo.getLearning(language);

  if (due.length === 0 && forgotten.length === 0 && learning.length === 0) {
    return;
  }

  Alert.alert(
    "Hora de revisar",
    "Você tem palavras para revisar. Deseja iniciar o quiz?",
    [
      { text: "Não", style: "cancel" },
      {
        text: "Sim",
        onPress: () => {
          if (due.length > 0) {
            router.push({ pathname: "/quiz", params: { mode: "review" } });
            return;
          }

          if (forgotten.length > 0) {
            router.push({ pathname: "/quiz", params: { mode: "forgotten" } });
            return;
          }

          if (learning.length > 0) {
            router.push({ pathname: "/quiz", params: { mode: "learning" } });
            return;
          }
        },
      },
    ]
  );
}