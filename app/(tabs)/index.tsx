import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();

  const servicos = [
    { nome: "Corte & Escova", icone: "cut-outline" },
    { nome: "Coloracao", icone: "color-palette-outline" },
    { nome: "Hidratacao", icone: "water-outline" },
    { nome: "Progressiva", icone: "sparkles-outline" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bannerContainer}>
          <Image
            source={require("../../assets/images/capa.png")}
            style={styles.banner}
            resizeMode="cover"
          />
          <View style={styles.gradientOverlay} />
          <View style={styles.textOverlay}>
            <Text style={styles.tituloOverlay}>StudiosMarcela</Text>
            <Text style={styles.subtituloTexto}>
              Agende seu horario e veja os principais servicos do studio.
            </Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.botaoPrincipal}
            onPress={() => router.push("/agendar")}
          >
            <Ionicons name="calendar-outline" size={20} color="#FFF" />
            <Text style={styles.botaoTexto}>AGENDAR HORARIO</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Destaques do studio</Text>
          <TouchableOpacity onPress={() => router.push("/servicos")}>
            <Text style={styles.verTodos}>Ver servicos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {servicos.map((item, index) => (
            <TouchableOpacity key={index} style={styles.card} activeOpacity={0.82}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icone as any} size={24} color="#7C3AED" />
              </View>
              <Text style={styles.cardTitulo}>{item.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.promocaoCard}>
          <View style={styles.promoGlow} />
          <Text style={styles.promoTag}>OFERTA DA SEMANA</Text>
          <Text style={styles.promoServico}>Escova + Hidratacao</Text>
          <Text style={styles.promoDescricao}>
            Cuidado completo com acabamento brilhante para sair pronta do studio.
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.promoPreco}>R$ 99,90</Text>
            <Text style={styles.precoAntigo}>R$ 140</Text>
          </View>

          <TouchableOpacity style={styles.botaoPromo} onPress={() => router.push("/agendar")}>
            <Text style={styles.botaoPromoTexto}>QUERO AGENDAR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.espacoFinal} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F0FF",
  },
  bannerContainer: {
    width: "100%",
    height: 390,
    position: "relative",
  },
  banner: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28, 16, 43, 0.42)",
  },
  textOverlay: {
    position: "absolute",
    bottom: 56,
    left: 24,
    right: 24,
  },
  tituloOverlay: {
    fontSize: 38,
    fontWeight: "900",
    color: "#FFF",
    lineHeight: 42,
  },
  subtituloTexto: {
    fontSize: 15,
    color: "#F5EFFF",
    marginTop: 10,
    lineHeight: 22,
    fontWeight: "500",
  },
  actionContainer: {
    alignItems: "center",
    marginTop: -28,
    paddingHorizontal: 20,
  },
  botaoPrincipal: {
    backgroundColor: "#7C3AED",
    width: "100%",
    flexDirection: "row",
    padding: 19,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  botaoTexto: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.8,
    marginLeft: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    marginTop: 34,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#221431",
  },
  verTodos: {
    color: "#6D28D9",
    fontWeight: "700",
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
    borderColor: "#EEE6FF",
    shadowColor: "#2E1065",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitulo: {
    fontWeight: "700",
    color: "#44305F",
    fontSize: 14,
    textAlign: "center",
  },
  promocaoCard: {
    backgroundColor: "#221431",
    marginHorizontal: 20,
    marginTop: 22,
    padding: 24,
    borderRadius: 30,
    overflow: "hidden",
  },
  promoGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(124, 58, 237, 0.18)",
    top: -40,
    right: -30,
  },
  promoTag: {
    color: "#C4B5FD",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  promoServico: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
  },
  promoDescricao: {
    marginTop: 10,
    color: "#D3C9E4",
    fontSize: 14,
    lineHeight: 21,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 16,
    marginBottom: 18,
  },
  promoPreco: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
  },
  precoAntigo: {
    color: "#8F83A4",
    fontSize: 14,
    textDecorationLine: "line-through",
    marginLeft: 10,
  },
  botaoPromo: {
    backgroundColor: "#7C3AED",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  botaoPromoTexto: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.7,
  },
  espacoFinal: {
    height: 40,
  },
});
