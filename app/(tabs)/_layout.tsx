import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    async function verificarSessao() {
      const usuario = await AsyncStorage.getItem("usuario");

      if (!usuario) {
        router.replace("/login");
        return;
      }

      setCarregandoSessao(false);
    }

    verificarSessao();
  }, []);

  if (carregandoSessao) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#7C3AED",
        tabBarInactiveTintColor: "#8D84A1",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          height: 70,
          paddingTop: 8,
          paddingBottom: 10,
          shadowColor: "#2E1065",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 18,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
        headerStyle: { backgroundColor: "#F4F0FF" },
        headerTintColor: "#5B21B6",
        headerTitleStyle: { fontWeight: "800" },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: "#F4F0FF" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="servicos"
        options={{
          title: "Servicos",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "cut" : "cut-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="agendar"
        options={{
          title: "Agendar",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
