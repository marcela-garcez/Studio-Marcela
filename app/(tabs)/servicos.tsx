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
import { router } from "expo-router";

interface Servico {
  id: string;
  nome: string;
  preco: string;
  icone: string;
  descricao: string;
  detalhes: string;
}

const servicos: Servico[] = [
  {
    id: "1",
    nome: "Corte de Cabelo",
    preco: "R$ 50",
    icone: "cut",
    descricao: "Corte moderno",
    detalhes: "Inclui lavagem com produtos premium.",
  },
  {
    id: "2",
    nome: "Escova",
    preco: "R$ 45",
    icone: "brush",
    descricao: "Modelagem e brilho",
    detalhes:
      "Lavagem profunda, secagem e modelagem com escova para um efeito liso ou ondulado duradouro.",
  },
  {
    id: "3",
    nome: "Coloracao",
    preco: "R$ 120",
    icone: "color-palette",
    descricao: "Tintura premium",
    detalhes:
      "Aplicacao de coloracao profissional mais escova para um resultado duradouro.",
  },
  {
    id: "4",
    nome: "Hidratacao",
    preco: "R$ 60",
    icone: "water",
    descricao: "Reposicao de massa",
    detalhes:
      "Tratamento intensivo para cabelos ressecados, devolvendo maciez e brilho.",
  },
  {
    id: "5",
    nome: "Progressiva",
    preco: "R$ 180",
    icone: "sparkles",
    descricao: "Reducao de volume",
    detalhes:
      "Alinhamento capilar termico com produtos de alta tecnologia para um liso natural.",
  },
];

export default function ServicosScreen() {
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
        <View style={styles.hero}>
          <Text style={styles.titulo}>Nossos Servicos</Text>
          <Text style={styles.subtitulo}>
            Escolha o cuidado ideal para o seu momento e toque para ver os detalhes.
          </Text>
        </View>

        <FlatList
          data={servicos}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.card}
              onPress={() => abrirDetalhes(item)}
            >
              <View style={styles.cardTop}>
                <View style={styles.row}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={item.icone as any} size={24} color="#7C3AED" />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.nome}>{item.nome}</Text>
                    <Text style={styles.descricaoCurta}>{item.descricao}</Text>
                  </View>
                </View>
                <View style={styles.precoBadge}>
                  <Text style={styles.precoText}>{item.preco}</Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.cardHint}>Ver mais detalhes </Text>
                <Ionicons name="arrow-forward" size={18} color="#8B7AA8" />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <Ionicons name={servicoSelecionado?.icone as any} size={38} color="#7C3AED" />
              </View>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={22} color="#47345F" />
              </Pressable>
            </View>

            <Text style={styles.modalTitle}>{servicoSelecionado?.nome}</Text>
            <Text style={styles.modalPrice}>{servicoSelecionado?.preco}</Text>
            <Text style={styles.modalDescription}>{servicoSelecionado?.detalhes}</Text>

            <TouchableOpacity
              style={styles.buttonAgendar}
              onPress={() => {
                setModalVisible(false);
                router.push("/agendar");
              }}
            >
              <Ionicons name="calendar-outline" size={18} color="#FFF" />
              <Text style={styles.buttonText}>Agendar Agora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F0FF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  hero: {
    marginTop: 18,
    marginBottom: 18,
    padding: 22,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 4,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "800",
    color: "#221431",
  },
  subtitulo: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#6B6278",
  },
  listaContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 24,
    marginBottom: 14,
    shadowColor: "#2E1065",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 12,
  },
  nome: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2F2340",
  },
  descricaoCurta: {
    marginTop: 4,
    fontSize: 13,
    color: "#7B718E",
  },
  precoBadge: {
    backgroundColor: "#F8F2FF",
    borderWidth: 1,
    borderColor: "#E8D8FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  precoText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7C3AED",
  },
  cardBottom: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1ECF8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHint: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8B7AA8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(33, 20, 49, 0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 34,
    alignItems: "center",
  },
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    position: "relative",
  },
  modalIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -62,
    borderWidth: 6,
    borderColor: "#FFF",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F7F2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2F2340",
    marginTop: 16,
    textAlign: "center",
  },
  modalPrice: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "800",
    color: "#7C3AED",
  },
  modalDescription: {
    marginTop: 12,
    marginBottom: 28,
    fontSize: 15,
    lineHeight: 24,
    color: "#6F6482",
    textAlign: "center",
  },
  buttonAgendar: {
    width: "100%",
    backgroundColor: "#7C3AED",
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
    marginLeft: 10,
  },
});
