import { Alert } from "react-native";

export function confirm(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Não", style: "cancel", onPress: () => resolve(false) },
      { text: "Sim", onPress: () => resolve(true) },
    ]);
  });
}