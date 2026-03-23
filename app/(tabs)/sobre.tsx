import { ScrollView, Text, View } from "react-native";

export default function SobreScreen() {

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#1f1f1f" }} // fundo principal
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
    >

      <View
        style={{
          backgroundColor: "#2e2e2e", // card/bloco
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "#ffffff", // borda
        }}
      >

        {/* Informações básicas */}
        <Text style={{ fontSize: 16, color: "#c8c8c8", marginBottom: 6 }}>
          <Text style={{ fontWeight: "700" }}>Nome: </Text>AppExemplo
        </Text>
        <Text style={{ fontSize: 16, color: "#c8c8c8", marginBottom: 6 }}>
          <Text style={{ fontWeight: "700" }}>Versão: </Text>1.0.0
        </Text>
        <Text style={{ fontSize: 16, color: "#c8c8c8", marginBottom: 12 }}>
          <Text style={{ fontWeight: "700" }}>Compatibilidade: </Text>Android 8 ou superior.
        </Text>

        {/* Separador */}
        <View style={{ height: 1, backgroundColor: "#3a3a3a", marginVertical: 16 }} />

        {/* Privacidade */}
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 8 }}>
          Privacidade
        </Text>
        <Text style={{ fontSize: 16, color: "#c8c8c8", lineHeight: 24, marginBottom: 12 }}>
          Todas as informações do usuário são armazenadas localmente no dispositivo.
        </Text>

        {/* Separador */}
        <View style={{ height: 1, backgroundColor: "#3a3a3a", marginVertical: 16 }} />

        {/* Equipe & Contato */}
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 8 }}>
          Equipe & Contato
        </Text>
        <Text style={{ fontSize: 16, color: "#c8c8c8", marginBottom: 6 }}>
          <Text style={{ fontWeight: "700" }}>Desenvolvedor: </Text>Carlos E. Farias
        </Text>
        <Text style={{ fontSize: 16, color: "#c8c8c8", marginBottom: 12 }}>
          <Text style={{ fontWeight: "700" }}>Suporte: </Text>carlos.devvv@gmail.com
        </Text>

        {/* Separador */}
        <View style={{ height: 1, backgroundColor: "#3a3a3a", marginVertical: 16 }} />

        {/* Créditos */}
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 8 }}>
          Créditos
        </Text>
        <Text style={{ fontSize: 16, color: "#c8c8c8", lineHeight: 24 }}>
          Este aplicativo utiliza bibliotecas open-source importantes para seu funcionamento, incluindo:
        </Text>
        <Text style={{ fontSize: 16, color: "#c8c8c8", marginTop: 8 }}>• React Native;</Text>
        <Text style={{ fontSize: 16, color: "#c8c8c8" }}>• Expo;</Text>
        <Text style={{ fontSize: 16, color: "#c8c8c8" }}>• Expo Router;</Text>
        <Text style={{ fontSize: 16, color: "#c8c8c8" }}>• React Native WebView;</Text>
        <Text style={{ fontSize: 16, color: "#c8c8c8" }}>• SQLite.</Text>
        
      </View>
    </ScrollView>
  );
}