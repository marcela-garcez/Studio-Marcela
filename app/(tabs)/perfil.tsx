import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAgendamento } from "../../context/AgendamentosContext";
import { signOut } from "firebase/auth";
import { auth } from "../../src/services/connectionFirebase";
import { showConfirm } from "../../src/utils/feedback";

export default function Perfil() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const { agendamentos, remover } = useAgendamento();

  const verificarLogin = useCallback(async () => {
    const dados = await AsyncStorage.getItem("usuario");
    if (!dados) {
      router.replace("/login");
      return;
    }
    setUsuario(JSON.parse(dados));
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      verificarLogin();
    }, [verificarLogin])
  );

  async function confirmarExclusao(index: number) {
    const confirmou = await showConfirm({
      title: "Cancelar Agendamento",
      message: "Deseja realmente remover este compromisso?",
      confirmText: "Confirmar",
      cancelText: "Voltar",
    });

    if (confirmou) {
      await remover(index);
    }
  }

  async function sair() {
    try {
      await signOut(auth);
    } catch (error) {
      console.log("Erro ao encerrar sessao no Firebase:", error);
    } finally {
      await AsyncStorage.removeItem("usuario");
      setUsuario(null);
      router.replace("/login");
    }
  }

  if (!usuario) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <Image source={require("../../assets/images/avatar.png")} style={styles.avatar} />
        </View>

        <Text style={styles.nome}>{usuario.nome || "Usuario"}</Text>
        <Text style={styles.email}>{usuario.email}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumero}>{agendamentos.length}</Text>
            <Text style={styles.statLabel}>Agendamentos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumero}>{usuario.telefone || "-"}</Text>
            <Text style={styles.statLabel}>Telefone</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.botaoAgendar}
        activeOpacity={0.9}
        onPress={() => router.push("/agendar")}
      >
        <Ionicons name="add-circle-outline" size={22} color="#fff" />
        <Text style={styles.textoBotao}>Novo Agendamento</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.titulo}>Seus compromissos</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{agendamentos.length}</Text>
        </View>
      </View>

      {agendamentos.length === 0 ? (
        <View style={styles.cardVazio}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="calendar-outline" size={34} color="#A78BFA" />
          </View>
          <Text style={styles.vazioTitulo}>Nada marcado por enquanto</Text>
          <Text style={styles.vazioText}>
            Assim que voce reservar um horario, ele vai aparecer aqui.
          </Text>
        </View>
      ) : (
        agendamentos.map((item: any, index: number) => (
          <View key={index} style={styles.card}>
            <View style={styles.iconBox}>
              <Ionicons name="cut-outline" size={22} color="#7C3AED" />
            </View>

            <View style={styles.info}>
              <Text style={styles.servico}>{item.servico}</Text>
              <Text style={styles.data}>{item.data} • {item.hora}</Text>
            </View>

            <TouchableOpacity style={styles.btnDelete} onPress={() => confirmarExclusao(index)}>
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </TouchableOpacity>
          </View>
        ))
      )}

      <Text style={styles.configTitulo}>Configuracoes</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/editarPerfil")}>
          <View style={[styles.menuIcon, { backgroundColor: "#EDE9FE" }]}>
            <Ionicons name="person-outline" size={20} color="#5B21B6" />
          </View>
          <Text style={styles.menuTexto}>Editar Perfil</Text>
          <Ionicons name="chevron-forward" size={18} color="#A8A0B5" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botaoSair} onPress={sair}>
        <Ionicons name="log-out-outline" size={20} color="#DC2626" />
        <Text style={styles.textoSair}>Sair da Conta</Text>
      </TouchableOpacity>

      <View style={styles.espacoFinal} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F0FF",
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 28,
    marginBottom: 22,
    backgroundColor: "#FFF",
    padding: 24,
    borderRadius: 30,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  avatarWrapper: {
    padding: 5,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#C4B5FD",
    marginBottom: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  nome: {
    fontSize: 24,
    fontWeight: "800",
    color: "#221431",
  },
  email: {
    marginTop: 4,
    color: "#766B88",
    fontSize: 14,
  },
  statsRow: {
    width: "100%",
    flexDirection: "row",
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FAF7FF",
    borderWidth: 1,
    borderColor: "#ECE3FF",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 5,
  },
  statNumero: {
    fontSize: 20,
    fontWeight: "800",
    color: "#5B21B6",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#7C7194",
    fontWeight: "600",
  },
  botaoAgendar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7C3AED",
    paddingVertical: 17,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 5,
  },
  textoBotao: {
    color: "#fff",
    marginLeft: 10,
    fontWeight: "800",
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2F2340",
  },
  badge: {
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    color: "#5B21B6",
    fontSize: 12,
    fontWeight: "800",
  },
  cardVazio: {
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECE3FF",
    marginBottom: 24,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F5F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  vazioTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2F2340",
  },
  vazioText: {
    color: "#84789A",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
    fontSize: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECE3FF",
    shadowColor: "#2E1065",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  iconBox: {
    backgroundColor: "#F3E8FF",
    padding: 11,
    borderRadius: 14,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  servico: {
    fontWeight: "800",
    fontSize: 16,
    color: "#2F2340",
  },
  data: {
    fontSize: 13,
    color: "#766B88",
    marginTop: 4,
  },
  btnDelete: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  configTitulo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2F2340",
    marginTop: 14,
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    paddingHorizontal: 12,
    marginBottom: 18,
    shadowColor: "#2E1065",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  menuTexto: {
    flex: 1,
    marginLeft: 14,
    color: "#44305F",
    fontWeight: "700",
    fontSize: 15,
  },
  botaoSair: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF1F2",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FBCACA",
  },
  textoSair: {
    color: "#DC2626",
    marginLeft: 8,
    fontWeight: "800",
    fontSize: 16,
  },
  espacoFinal: {
    height: 40,
  },
});
