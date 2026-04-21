import { Stack } from "expo-router";
import { View } from "react-native";
import { WebView } from "react-native-webview";

export default function TraduzirScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "",
        }}
      />

      <WebView source={{ uri: "https://translate.google.com/" }} />
    </View>
  );
}