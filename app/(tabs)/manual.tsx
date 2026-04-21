import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ManualScreen() {
  const insets = useSafeAreaInsets();

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
          title: "Manual de Uso",
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
        {/* Introdução */}
        <View
          style={{
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#1E2432",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#2A3142",
              }}
            >
              <Ionicons name="school-outline" size={22} color="#3B82F6" />
            </View>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 24,
                fontWeight: "700",
                letterSpacing: -0.5,
              }}
            >
              Como Funciona
            </Text>
          </View>
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 14,
              lineHeight: 20,
              marginLeft: 50,
            }}
          >
            Entenda a metodologia por trás do seu aprendizado
          </Text>
        </View>

        {/* Card Principal */}
        <View
          style={{
            backgroundColor: "#1E2432",
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: "#2A3142",
          }}
        >
          {/* Lógica de Aprendizado */}
          <View style={{ marginBottom: 24 }}>
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
                  width: 4,
                  height: 24,
                  borderRadius: 2,
                  backgroundColor: "#3B82F6",
                }}
              />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 20,
                  fontWeight: "700",
                }}
              >
                Lógica de Aprendizado
              </Text>
            </View>

            <Text
              style={{
                fontSize: 15,
                color: "#CBD5E1",
                lineHeight: 22,
                marginBottom: 16,
              }}
            >
              Este aplicativo foi desenvolvido para ajudar você a aprender vocabulário em idiomas de forma eficiente e duradoura.
              Em vez de simplesmente memorizar palavras de forma aleatória, o sistema utiliza princípios da ciência da
              aprendizagem, como:
            </Text>

            <View
              style={{
                backgroundColor: "#1A202C",
                borderRadius: 10,
                padding: 14,
                borderWidth: 1,
                borderColor: "#2A3142",
                marginBottom: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Ionicons name="repeat-outline" size={18} color="#3B82F6" />
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
                  Repetição Espaçada
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Ionicons name="flash-outline" size={18} color="#10B981" />
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
                  Recordação Ativa
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="document-text-outline" size={18} color="#F59E0B" />
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
                  Exposição Contextual
                </Text>
              </View>
            </View>
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: "#2A3142",
              marginVertical: 24,
            }}
          />

          {/* Aprendizado Por Contexto */}
          <View style={{ marginBottom: 24 }}>
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
                  width: 4,
                  height: 24,
                  borderRadius: 2,
                  backgroundColor: "#10B981",
                }}
              />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 20,
                  fontWeight: "700",
                }}
              >
                Aprendizado Por Contexto
              </Text>
            </View>

            <Text
              style={{
                fontSize: 15,
                color: "#CBD5E1",
                lineHeight: 22,
                marginBottom: 16,
              }}
            >
              Uma das formas mais eficazes de aprender um idioma é por meio da leitura de textos reais.
              Por isso, o aplicativo permite que você leia textos importados de páginas da internet.
            </Text>

            <View
              style={{
                backgroundColor: "#1A202C",
                borderRadius: 10,
                padding: 14,
                borderWidth: 1,
                borderColor: "#2A3142",
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Ionicons name="finger-print-outline" size={20} color="#10B981" style={{ marginTop: 2 }} />
                <Text style={{ fontSize: 14, color: "#94A3B8", lineHeight: 20, flex: 1 }}>
                  Durante a leitura, sempre que você tocar em uma palavra desconhecida, o aplicativo mostra a tradução
                  e adiciona essa palavra à sua lista de aprendizado.
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: 15,
                color: "#CBD5E1",
                fontWeight: "600",
                marginBottom: 10,
              }}
            >
              Vantagens deste método:
            </Text>

            <View style={{ gap: 8, marginLeft: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginTop: 1 }} />
                <Text style={{ fontSize: 14, color: "#94A3B8", lineHeight: 20, flex: 1 }}>
                  Você aprende palavras dentro de um contexto real de uso
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginTop: 1 }} />
                <Text style={{ fontSize: 14, color: "#94A3B8", lineHeight: 20, flex: 1 }}>
                  Você seleciona apenas as palavras que realmente são novas para você
                </Text>
              </View>
            </View>
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: "#2A3142",
              marginVertical: 24,
            }}
          />

          {/* Lista de Palavras */}
          <View style={{ marginBottom: 24 }}>
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
                  width: 4,
                  height: 24,
                  borderRadius: 2,
                  backgroundColor: "#F59E0B",
                }}
              />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 20,
                  fontWeight: "700",
                }}
              >
                Lista de Palavras
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
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Ionicons name="list-outline" size={20} color="#F59E0B" style={{ marginTop: 2 }} />
                <Text style={{ fontSize: 14, color: "#94A3B8", lineHeight: 20, flex: 1 }}>
                  Todas as palavras que você seleciona durante a leitura são armazenadas na seção "Minhas Palavras".
                  Ali o aplicativo organiza as palavras em diferentes estados de aprendizado, permitindo que o sistema
                  saiba quais precisam ser revisadas com mais frequência.
                </Text>
              </View>
            </View>
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: "#2A3142",
              marginVertical: 24,
            }}
          />

          {/* Repetição Espaçada */}
          <View style={{ marginBottom: 24 }}>
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
                  width: 4,
                  height: 24,
                  borderRadius: 2,
                  backgroundColor: "#3B82F6",
                }}
              />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 20,
                  fontWeight: "700",
                }}
              >
                Repetição Espaçada
              </Text>
            </View>

            <Text
              style={{
                fontSize: 15,
                color: "#CBD5E1",
                lineHeight: 22,
                marginBottom: 16,
              }}
            >
              O aplicativo utiliza um método chamado repetição espaçada, baseado em psicologia cognitiva.
              Revisões feitas em intervalos progressivamente maiores ajudam a fixar o conhecimento na memória
              de longo prazo.
            </Text>

            <View
              style={{
                backgroundColor: "#1A202C",
                borderRadius: 10,
                padding: 14,
                borderWidth: 1,
                borderColor: "#2A3142",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 10,
                }}
              >
                Exemplo de progressão:
              </Text>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ width: 20, alignItems: "center" }}>
                    <Text style={{ color: "#3B82F6", fontSize: 12, fontWeight: "700" }}>1</Text>
                  </View>
                  <Text style={{ color: "#94A3B8", fontSize: 14 }}>
                    Palavra recém aprendida aparece rapidamente no quiz
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ width: 20, alignItems: "center" }}>
                    <Text style={{ color: "#3B82F6", fontSize: 12, fontWeight: "700" }}>2</Text>
                  </View>
                  <Text style={{ color: "#94A3B8", fontSize: 14 }}>
                    Se você acertar várias vezes, ela aparece com menos frequência
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ width: 20, alignItems: "center" }}>
                    <Text style={{ color: "#3B82F6", fontSize: 12, fontWeight: "700" }}>3</Text>
                  </View>
                  <Text style={{ color: "#94A3B8", fontSize: 14 }}>
                    Se você errar, ela volta a aparecer mais cedo
                  </Text>
                </View>
              </View>
            </View>

            <Text
              style={{
                fontSize: 15,
                color: "#CBD5E1",
                lineHeight: 22,
              }}
            >
              Assim, o aplicativo se adapta ao seu progresso individual.
            </Text>
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: "#2A3142",
              marginVertical: 24,
            }}
          />

          {/* Exercícios */}
          <View>
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
                  width: 4,
                  height: 24,
                  borderRadius: 2,
                  backgroundColor: "#EF4444",
                }}
              />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 20,
                  fontWeight: "700",
                }}
              >
                Exercícios
              </Text>
            </View>

            <Text
              style={{
                fontSize: 15,
                color: "#CBD5E1",
                lineHeight: 22,
                marginBottom: 16,
              }}
            >
              Durante os exercícios, o aplicativo apresenta palavras que você já encontrou e pede que lembre
              o significado ou a forma correta.
            </Text>

            <View style={{ gap: 16 }}>
              {/* Múltipla Escolha */}
              <View
                style={{
                  backgroundColor: "#1A202C",
                  borderRadius: 10,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "#2A3142",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
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
                    <Ionicons name="grid-outline" size={18} color="#3B82F6" />
                  </View>
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                    Múltipla Escolha
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: "#94A3B8", lineHeight: 20, marginLeft: 42 }}>
                  Você vê uma palavra e precisa escolher a tradução correta entre várias alternativas.
                </Text>
              </View>

              {/* Digitar a Palavra */}
              <View
                style={{
                  backgroundColor: "#1A202C",
                  borderRadius: 10,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "#2A3142",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
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
                    <Ionicons name="keypad-outline" size={18} color="#10B981" />
                  </View>
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                    Digitar a Palavra
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: "#94A3B8", lineHeight: 20, marginLeft: 42 }}>
                  O aplicativo mostra o significado e você precisa digitar a palavra original.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View
          style={{
            marginTop: 24,
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
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
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              Bons estudos!
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
        </View>
      </ScrollView>
    </View>
  );
}