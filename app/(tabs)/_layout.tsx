import { BackgroundMusicButton } from "@/components/BackgroundMusicButton";
import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { View } from "react-native";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        
        headerStyle: {
          backgroundColor: "#0A0E17",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 20,
        },
        headerShadowVisible: false,
        
        headerRight: () => (
          <View style={{ marginRight: 16 }}>
            <BackgroundMusicButton color="#94A3B8" />
          </View>
        ),

        drawerStyle: {
          backgroundColor: "#0A0E17",
          width: 300,
        },

        sceneStyle: {
          backgroundColor: "#0A0E17",
        },

        drawerContentContainerStyle: {
          flex: 1,
          justifyContent: "center",
        },

        drawerItemStyle: {
          borderRadius: 10,
          marginHorizontal: 12,
          marginVertical: 4,
          paddingVertical: 4,
          paddingHorizontal: 0,
        },

        drawerActiveBackgroundColor: "#1E2432",
        drawerInactiveBackgroundColor: "transparent",

        drawerActiveTintColor: "#3B82F6",
        drawerInactiveTintColor: "#94A3B8",

        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: "500",
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Página Inicial",
          drawerLabel: "Página Inicial",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="continuar-leitura"
        options={{
          title: "Minha Biblioteca",
          drawerLabel: "Minha Biblioteca",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="minhas-palavras"
        options={{
          title: "Minhas Palavras",
          drawerLabel: "Minhas Palavras",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="ouca-e-aprenda"
        options={{
          title: "Ouça e Aprenda",
          drawerLabel: "Ouça e Aprenda",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="volume-high-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="evolucao"
        options={{
          title: "Evolução",
          drawerLabel: "Evolução",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* Separador Visual */}
      <Drawer.Screen
        name="bibliotecas-publicas"
        options={{
          title: 'Bibliotecas Públicas',
          drawerLabel: 'Bibliotecas Públicas',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="globe-outline" size={size} color={color} />
          ),
          drawerItemStyle: {
            borderRadius: 10,
            marginHorizontal: 12,
            marginVertical: 4,
            marginTop: 24,
            paddingVertical: 4,
            paddingHorizontal: 0,
          },
        }}
      />

      <Drawer.Screen
        name="manual"
        options={{
          title: "Manual",
          drawerLabel: "Manual de Uso",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="sobre"
        options={{
          title: "Sobre",
          drawerLabel: "Sobre",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}