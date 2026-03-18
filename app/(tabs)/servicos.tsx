import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const servicos = [
  { id: "1", nome: "Corte de Cabelo", preco: "R$ 40", icone: "cut" },
  { id: "2", nome: "Escova", preco: "R$ 35", icone: "brush" },
  { id: "3", nome: "Coloração", preco: "R$ 120", icone: "color-palette" },
  { id: "4", nome: "Hidratação", preco: "R$ 60", icone: "water" },
  { id: "5", nome: "Progressiva", preco: "R$ 180", icone: "sparkles" },
];

export default function Servicos() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Nossos Serviços</Text>

      <FlatList
        data={servicos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Ionicons name={item.icone as any} size={28} color="#8A2BE2" />

            <View style={styles.info}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.preco}>{item.preco}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  info: {
    marginLeft: 15,
  },

  nome: {
    fontSize: 16,
    fontWeight: "600",
  },

  preco: {
    fontSize: 14,
    color: "#8A2BE2",
    marginTop: 4,
  },
});