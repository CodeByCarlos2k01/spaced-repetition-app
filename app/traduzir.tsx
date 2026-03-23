import { View, Text } from "react-native";
import { WebView } from "react-native-webview";

export default function TraduzirScreen() {
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          paddingHorizontal: 12,
          paddingBottom: 10,
        }}
      >

        <Text style={{ fontSize: 20 }}>Traduzir</Text>
      </View>

      <WebView source={{ uri: "https://translate.google.com/" }} />
    </View>
  );
}