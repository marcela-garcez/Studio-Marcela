import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();

  const servicos = [
    { nome: "Corte & Escova", icone: "cut-outline" },
    { nome: "Coloração", icone: "color-palette-outline" },
    { nome: "Hidratação", icone: "water-outline" },
    { nome: "Progressiva", icone: "sparkles-outline" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* BANNER COM OVERLAY */}
        <View style={styles.bannerContainer}>
          <Image
            source={require("../../assets/images/capa.png")}
            style={styles.banner}
            resizeMode="cover"
          />
          <View style={styles.gradientOverlay} />
          <View style={styles.textOverlay}>
            <Text style={styles.boasVindas}>Bem-vinda ao</Text>
            <Text style={styles.tituloOverlay}>Studio Marcela</Text>
            <Text style={styles.subtituloTexto}>
              Realce sua beleza com quem entende de cabelo.
            </Text>
          </View>
        </View>

        {/* BOTÃO AGENDAR - DESIGN FLUTUANTE */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.botaoPrincipal}
            onPress={() => router.push("/agendar")}
          >
            <Ionicons name="calendar" size={20} color="#FFF" style={{ marginRight: 10 }} />
            <Text style={styles.botaoTexto}>AGENDAR HORÁRIO</Text>
          </TouchableOpacity>
        </View>

        {/* SEÇÃO DE SERVIÇOS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nossos Serviços</Text>
          <TouchableOpacity>
            <Text style={styles.verTodos}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {servicos.map((item, index) => (
            <TouchableOpacity key={index} style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icone as any} size={24} color="#8A2BE2" />
              </View>
              <Text style={styles.cardTitulo}>{item.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PROMOÇÃO - CARD ESTILIZADO */}
        <View style={styles.promocaoCard}>
          <View style={styles.promoContent}>
            <View>
              <Text style={styles.promoTag}>OFERTA LIMITADA</Text>
              <Text style={styles.promoServico}>Escova + Hidratação</Text>
              <View style={styles.priceRow}>
                <Text style={styles.promoPreco}>R$ 99,90</Text>
                <Text style={styles.precoAntigo}>R$ 140</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.botaoPromo}
              onPress={() => router.push("/agendar")}
            >
              <Text style={styles.botaoPromoTexto}>QUERO</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBFF",
  },
  bannerContainer: {
    width: "100%",
    height: 380,
    position: "relative",
  },
  banner: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)", // Escurece a imagem para o texto brilhar
  },
  textOverlay: {
    position: "absolute",
    bottom: 60,
    left: 25,
    right: 25,
  },
  boasVindas: {
    color: "#EEE",
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tituloOverlay: {
    fontSize: 38,
    fontWeight: "900",
    color: "#FFF",
    lineHeight: 42,
  },
  subtituloTexto: {
    fontSize: 16,
    color: "#DDD",
    marginTop: 8,
    fontWeight: "500",
  },
  actionContainer: {
    alignItems: "center",
    marginTop: -30, // Faz o botão "subir" sobre o banner
    paddingHorizontal: 20,
  },
  botaoPrincipal: {
    backgroundColor: "#8A2BE2",
    width: "100%",
    flexDirection: "row",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8A2BE2",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  botaoTexto: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginTop: 35,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  verTodos: {
    color: "#8A2BE2",
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#FFF",
    width: "47%",
    padding: 20,
    borderRadius: 24,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitulo: {
    fontWeight: "700",
    color: "#444",
    fontSize: 14,
  },
  promocaoCard: {
    backgroundColor: "#1A1A1A", // Dark mode para contraste na promoção
    marginHorizontal: 20,
    marginTop: 20,
    padding: 25,
    borderRadius: 30,
  },
  promoTag: {
    color: "#8A2BE2",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 5,
  },
  promoContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  promoServico: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 5,
  },
  promoPreco: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
  },
  precoAntigo: {
    color: "#666",
    fontSize: 14,
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  botaoPromo: {
    backgroundColor: "#8A2BE2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  botaoPromoTexto: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 12,
  },
});