import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SobreScreen() {
  const insets = useSafeAreaInsets();

  const abrirEmail = () => {
    Linking.openURL("mailto:carlos.devvv@gmail.com");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0A0E17",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <Stack.Screen
        options={{
          title: "Sobre",
          headerStyle: {
            backgroundColor: "#0A0E17",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 20,
          },
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com Logo */}
        <View
          style={{
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: "#1E2432",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#2A3142",
            }}
          >
            <Ionicons name="book" size={40} color="#3B82F6" />
          </View>
          
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: "#FFFFFF",
                letterSpacing: -0.5,
              }}
            >
              Poly
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "300",
                color: "#3B82F6",
                letterSpacing: -0.5,
              }}
            >
              Glota
            </Text>
          </View>
          
          <View
            style={{
              backgroundColor: "#1A202C",
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 6,
              marginTop: 8,
              borderWidth: 1,
              borderColor: "#2A3142",
            }}
          >
            <Text
              style={{
                color: "#94A3B8",
                fontSize: 13,
                fontWeight: "500",
              }}
            >
              Versão 1.0.0
            </Text>
          </View>
        </View>

        {/* Card Principal */}
        <View
          style={{
            backgroundColor: "#1E2432",
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: "#2A3142",
            marginBottom: 20,
          }}
        >
          {/* Informações do Aplicativo */}
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#2A3142",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
              </View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                Informações
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: "#64748B", fontSize: 14, width: 100 }}>
                  Nome
                </Text>
                <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "500", flex: 1 }}>
                  PolyGlota
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: "#64748B", fontSize: 14, width: 100 }}>
                  Versão
                </Text>
                <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "500", flex: 1 }}>
                  1.0.0
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Text style={{ color: "#64748B", fontSize: 14, width: 100, marginTop: 2 }}>
                  Compatibilidade
                </Text>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      backgroundColor: "#1A202C",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: "#2A3142",
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text style={{ color: "#94A3B8", fontSize: 13 }}>
                      Android 8+
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: "#2A3142",
              marginVertical: 20,
            }}
          />

          {/* Privacidade */}
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#2A3142",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#10B981" />
              </View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                Privacidade
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "#1A202C",
                borderRadius: 10,
                padding: 14,
                borderWidth: 1,
                borderColor: "#2A3142",
                flexDirection: "row",
                gap: 12,
              }}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" style={{ marginTop: 2 }} />
              <Text
                style={{
                  fontSize: 14,
                  color: "#94A3B8",
                  lineHeight: 20,
                  flex: 1,
                }}
              >
                Todas as informações do usuário são armazenadas localmente no dispositivo.
                Nenhum dado é enviado para servidores externos.
              </Text>
            </View>
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: "#2A3142",
              marginVertical: 20,
            }}
          />

          {/* Desenvolvedor */}
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#2A3142",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="person-outline" size={18} color="#F59E0B" />
              </View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                Desenvolvedor
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "#1A202C",
                borderRadius: 10,
                padding: 14,
                borderWidth: 1,
                borderColor: "#2A3142",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ color: "#64748B", fontSize: 14, width: 70 }}>
                  Nome
                </Text>
                <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "500", flex: 1 }}>
                  Carlos E. Farias
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: "#64748B", fontSize: 14, width: 70 }}>
                  Contato
                </Text>
                <TouchableOpacity onPress={abrirEmail} style={{ flex: 1 }}>
                  <Text style={{ color: "#3B82F6", fontSize: 14, fontWeight: "500" }}>
                    carlos.devvv@gmail.com
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: "#2A3142",
              marginVertical: 20,
            }}
          />

          {/* Créditos */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#2A3142",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="code-slash-outline" size={18} color="#EF4444" />
              </View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                Tecnologias Utilizadas
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "#1A202C",
                borderRadius: 10,
                padding: 14,
                borderWidth: 1,
                borderColor: "#2A3142",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: "#94A3B8",
                  lineHeight: 20,
                  marginBottom: 12,
                }}
              >
                Este aplicativo foi construído com as seguintes tecnologias open-source:
              </Text>

              <View style={{ gap: 8 }}>
                {[
                  { nome: "React Native", icone: "logo-react", cor: "#3B82F6" },
                  { nome: "Expo", icone: "cube-outline", cor: "#FFFFFF" },
                  { nome: "TypeScript", icone: "git-branch-outline", cor: "#F59E0B" },
                  { nome: "WebView", icone: "globe-outline", cor: "#10B981" },
                  { nome: "SQLite", icone: "server-outline", cor: "#EF4444" },
                ].map((tech, index) => (
                  <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Ionicons name={tech.icone as any} size={16} color={tech.cor} style={{ width: 20 }} />
                    <Text style={{ color: "#CBD5E1", fontSize: 14 }}>{tech.nome}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View
          style={{
            marginTop: 20,
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: "#3B82F6",
              }}
            />
            <Text
              style={{
                color: "#475569",
                fontSize: 11,
                fontWeight: "500",
              }}
            >
              Feito com dedicação
            </Text>
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: "#3B82F6",
              }}
            />
          </View>
          <Text
            style={{
              color: "#334155",
              fontSize: 10,
            }}
          >
            © 2026 PolyGlota - Todos os direitos reservados
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}