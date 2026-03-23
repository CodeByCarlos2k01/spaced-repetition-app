import React from "react";
import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#1f1f1f",
        },
        headerTintColor: "#f1f1f1",
        drawerStyle: {
          backgroundColor: "#262626", 
        },
        drawerActiveBackgroundColor: "#2e2e2e", 
        drawerInactiveBackgroundColor: "#262626", 
        drawerActiveTintColor: "#f1f1f1", 
        drawerInactiveTintColor: "#c8c8c8",
        sceneStyle: {
          backgroundColor: "#1f1f1f", 
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Página Inicial",
          drawerLabel: "Página Inicial",
        }}
      />

      <Drawer.Screen
        name="continuar-leitura"
        options={{
          title: "Minha Biblioteca",
          drawerLabel: "Minha Biblioteca",
        }}
      />

      <Drawer.Screen
        name="minhas-palavras"
        options={{
          title: "Minhas Palavras",
          drawerLabel: "Minhas Palavras",
        }}
      />

      <Drawer.Screen
        name="evolucao"
        options={{
          title: "Evolução",
          drawerLabel: "Evolução",
        }}
      />

      <Drawer.Screen
        name="manual"
        options={{
          title: "Manual",
          drawerLabel: "Manual de Uso",
        }}
      />

      <Drawer.Screen
        name="sobre"
        options={{
          title: "Sobre",
          drawerLabel: "Sobre",
        }}
      />
    </Drawer>
  );
}