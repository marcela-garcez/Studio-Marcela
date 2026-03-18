import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* BANNER */}
        <View style={styles.bannerContainer}>
          <Image
            source={require("../../assets/images/capa.png")}
            style={styles.banner}
            resizeMode="cover"
          />

          <View style={styles.textOverlay}>
            <Text style={styles.tituloOverlay}>Studio Marcela!</Text>
          </View>
        </View>

        <Text style={styles.subtituloOverlay}>
          Realce sua beleza com quem entende de cabelo!
        </Text>

        {/* BOTÃO AGENDAR */}
        <TouchableOpacity
          style={styles.botaoPrincipal}
          onPress={() => router.push("/agendar")}
        >
          <Text style={styles.botaoTexto}>AGENDAR HORÁRIO</Text>
        </TouchableOpacity>

        {/* SERVIÇOS */}
        <Text style={styles.titulo}>Nossos Serviços</Text>

        <View style={styles.grid}>
          {["Corte & Escova", "Coloração", "Hidratação", "Progressiva"].map(
            (item, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitulo}>{item}</Text>
              </View>
            )
          )}
        </View>

        {/* PROMOÇÃO */}
        <View style={styles.promocao}>
          <Text style={styles.promoTitulo}>Promoção da Semana</Text>
          <Text style={styles.promoServico}>Escova + Hidratação</Text>
          <Text style={styles.promoPreco}>R$ 99,90</Text>

          <TouchableOpacity
            style={styles.botaoPromo}
            onPress={() => router.push("/agendar")}
          >
            <Text style={styles.botaoPromoTexto}>APROVEITAR</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  banner: {
    width: "100%",
    height: 260,
  },

  bannerContainer: {
    position: "relative",
  },

  textOverlay: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },

  tituloOverlay: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#951be6",
  },

  subtituloOverlay: {
    fontSize: 17,
    color: "#b40cec",
    marginTop: 10,
    marginHorizontal: 20,
  },

  botaoPrincipal: {
    backgroundColor: "#8A2BE2",
    margin: 20,
    padding: 18,
    borderRadius: 30,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },

  botaoTexto: {
    color: "#f4f1f1",
    fontWeight: "bold",
    fontSize: 16,
  },

  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
    marginBottom: 15,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },

  card: {
    backgroundColor: "#cf7df3",
    width: "42%",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  cardTitulo: {
    fontWeight: "bold",
  },

  promocao: {
    backgroundColor: "#8A2BE2",
    margin: 20,
    padding: 20,
    borderRadius: 25,
  },

  promoTitulo: {
    color: "#fff",
    fontSize: 16,
  },

  promoServico: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },

  promoPreco: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 10,
  },

  botaoPromo: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
  },

  botaoPromoTexto: {
    color: "#8A2BE2",
    fontWeight: "bold",
  },
});