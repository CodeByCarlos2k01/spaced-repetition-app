import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Image, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BibliotecasPublicas() {
  const insets = useSafeAreaInsets();

  const abrirLink = (url: string) => {
    Linking.openURL(url);
  };

  const bibliotecas = [
    {
      id: 1,
      nome: "Projekt Gutenberg",
      descricao: "Biblioteca digital alemã com milhares de livros clássicos gratuitos",
      url: "https://projekt-gutenberg.org/bibliothek/",
      imagem: require("../../assets/bibliotecas/site1.png"),
      icone: "library-outline",
      cor: "#3B82F6",
    },
    {
      id: 2,
      nome: "Standard Ebooks",
      descricao: "Ebooks gratuitos e cuidadosamente formatados com alta qualidade",
      url: "https://standardebooks.org/ebooks",
      imagem: require("../../assets/bibliotecas/site2.png"),
      icone: "book-outline",
      cor: "#10B981",
    },
    {
      id: 3,
      nome: "Gutenberg Brasil",
      descricao: "Versão brasileira do Projeto Gutenberg com obras em português",
      url: "https://www.gutenberg.com.br/",
      imagem: require("../../assets/bibliotecas/site3.png"),
      icone: "flag-outline",
      cor: "#F59E0B",
    },
  ];

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
          title: "Bibliotecas Públicas",
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
          paddingTop: 5,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <View
          style={{
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 14,
              lineHeight: 20,
              marginLeft: 50,
            }}
          >
            Explore livros gratuitos destas excelentes bibliotecas digitais
          </Text>
        </View>

        {/* Dica */}
        <View
          style={{
            backgroundColor: "#1A202C",
            borderRadius: 10,
            padding: 14,
            borderWidth: 1,
            borderColor: "#2A3142",
            marginBottom: 28,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
          <Text
            style={{
              color: "#CBD5E1",
              fontSize: 13,
              flex: 1,
              lineHeight: 18,
            }}
          >
            Toque em qualquer biblioteca para acessar o site e baixar livros gratuitos
          </Text>
        </View>

        {/* Lista de Bibliotecas */}
        <View style={{ gap: 24 }}>
          {bibliotecas.map((biblioteca, index) => (
            <TouchableOpacity
              key={biblioteca.id}
              onPress={() => abrirLink(biblioteca.url)}
              activeOpacity={0.8}
              style={{
                backgroundColor: "#1E2432",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#2A3142",
                overflow: "hidden",
              }}
            >
              {/* Imagem */}
              <View
                style={{
                  backgroundColor: "#0A0E17",
                  paddingVertical: 20,
                  paddingHorizontal: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: "#2A3142",
                }}
              >
                <Image
                  source={biblioteca.imagem}
                  style={{
                    width: "100%",
                    height: 100,
                    resizeMode: "contain",
                  }}
                />
              </View>

              {/* Informações */}
              <View
                style={{
                  padding: 18,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: `${biblioteca.cor}15`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name={biblioteca.icone as any} size={18} color={biblioteca.cor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 18,
                        fontWeight: "700",
                        marginBottom: 2,
                      }}
                    >
                      {biblioteca.nome}
                    </Text>
                    <Text
                      style={{
                        color: "#94A3B8",
                        fontSize: 13,
                        lineHeight: 18,
                      }}
                    >
                      {biblioteca.descricao}
                    </Text>
                  </View>
                </View>

                {/* Botão Acessar */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: "#2A3142",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: `${biblioteca.cor}15`,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: biblioteca.cor,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      Acessar Biblioteca
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={biblioteca.cor} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View
          style={{
            marginTop: 32,
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <Ionicons name="heart-outline" size={14} color="#475569" />
            <Text
              style={{
                color: "#475569",
                fontSize: 12,
              }}
            >
              Conteúdo gratuito e de domínio público
            </Text>
            <Ionicons name="heart-outline" size={14} color="#475569" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}