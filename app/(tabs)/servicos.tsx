import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Interface para tipagem
interface Servico {
  id: string;
  nome: string;
  preco: string;
  icone: string;
  descricao: string;
  detalhes: string;
}

const servicos: Servico[] = [
  { id: "1", nome: "Corte de Cabelo", preco: "R$ 40", icone: "cut", descricao: "Corte moderno", detalhes: "Inclui lavagem com produtos premium, corte tesoura ou máquina e finalização com pomada modeladora." },
  { id: "2", nome: "Escova", preco: "R$ 35", icone: "brush", descricao: "Modelagem e brilho", detalhes: "Lavagem profunda, secagem e modelagem com escova para um efeito liso ou ondulado duradouro." },
  { id: "3", nome: "Coloração", preco: "R$ 120", icone: "color-palette", descricao: "Tintura premium", detalhes: "Aplicação de coloração profissional sem amônia, garantindo brilho e proteção aos fios." },
  { id: "4", nome: "Hidratação", preco: "R$ 60", icone: "water", descricao: "Reposição de massa", detalhes: "Tratamento intensivo para cabelos ressecados, devolvendo a umidade natural e maciez." },
  { id: "5", nome: "Progressiva", preco: "R$ 180", icone: "sparkles", descricao: "Redução de volume", detalhes: "Alinhamento capilar térmico com produtos de alta tecnologia para um liso natural." },
];

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);

  const abrirDetalhes = (servico: Servico) => {
    setServicoSelecionado(servico);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Nossos Serviços</Text>
          <Text style={styles.subtitulo}>Toque para ver detalhes</Text>
        </View>

        <FlatList
          data={servicos}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={styles.card}
              onPress={() => abrirDetalhes(item)}
            >
              <View style={styles.row}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icone as any} size={24} color="#8A2BE2" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.nome}>{item.nome}</Text>
                  <Text style={styles.descricaoCurta}>{item.descricao}</Text>
                </View>
              </View>
              <View style={styles.precoBadge}>
                <Text style={styles.precoText}>{item.preco}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* MODAL DE DETALHES */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <Ionicons name={servicoSelecionado?.icone as any} size={40} color="#8A2BE2" />
              </View>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            <Text style={styles.modalTitle}>{servicoSelecionado?.nome}</Text>
            <Text style={styles.modalPrice}>{servicoSelecionado?.preco}</Text>
            <Text style={styles.modalDescription}>{servicoSelecionado?.detalhes}</Text>

            <TouchableOpacity style={styles.buttonAgendar} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Agendar Agora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBFBFF" },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 30, marginBottom: 25 },
  titulo: { fontSize: 28, fontWeight: "800", color: "#1A1A1A" },
  subtitulo: { fontSize: 15, color: "#777", marginTop: 4 },
  
  // Card Estilizado
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#8A2BE2",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  row: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconContainer: {
    width: 50, height: 50, borderRadius: 15,
    backgroundColor: "#F3E8FF", alignItems: "center", justifyContent: "center",
  },
  info: { marginLeft: 15, flex: 1 },
  nome: { fontSize: 16, fontWeight: "700", color: "#333" },
  descricaoCurta: { fontSize: 12, color: "#999" },
  precoBadge: { backgroundColor: "#F8F0FF", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  precoText: { fontSize: 14, fontWeight: "800", color: "#8A2BE2" },

  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: "center",
  },
  modalHeader: { width: "100%", flexDirection: "row", justifyContent: "center", position: "relative" },
  modalIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#F3E8FF", alignItems: "center", justifyContent: "center",
    marginTop: -70, borderWidth: 5, borderColor: "#FFF",
  },
  closeButton: { position: "absolute", right: 0, top: 0 },
  modalTitle: { fontSize: 24, fontWeight: "800", color: "#333", marginTop: 15 },
  modalPrice: { fontSize: 20, fontWeight: "700", color: "#8A2BE2", marginVertical: 10 },
  modalDescription: { fontSize: 16, color: "#666", textAlign: "center", lineHeight: 24, marginBottom: 30 },
  buttonAgendar: {
    backgroundColor: "#8A2BE2",
    width: "100%",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
});