import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAgendamento } from "../../context/AgendamentosContext";

export default function Perfil() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  
  const { agendamentos, remover } = useAgendamento(); 

  useEffect(() => {
    verificarLogin();
  }, []);

  async function verificarLogin() {
    const dados = await AsyncStorage.getItem("usuarioLogado");
    if (!dados) {
      router.replace("/login");
      return;
    }
    setUsuario(JSON.parse(dados));
  }

  async function confirmarExclusao(index: number) {
    Alert.alert(
      "Cancelar Agendamento",
      "Deseja realmente remover este compromisso?",
      [
        { text: "Voltar", style: "cancel" },
        { 
          text: "Confirmar", 
          style: "destructive", 
          onPress: () => remover(index) 
        },
      ]
    );
  }

  async function sair() {
    await AsyncStorage.removeItem("usuarioLogado");
    router.replace("/login");
  }

  if (!usuario) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER - Perfil do Usuário */}
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <Image
            source={require("../../assets/images/avatar.png")}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.nome}>{usuario.nome || "Usuário"}</Text>
        <Text style={styles.email}>{usuario.email}</Text>
      </View>

      {/* BOTÃO NOVO AGENDAMENTO */}
      <TouchableOpacity
        style={styles.botaoAgendar}
        activeOpacity={0.8}
        onPress={() => router.push("/agendar")}
      >
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.textoBotao}>Novo Agendamento</Text>
      </TouchableOpacity>

      {/* SEÇÃO DE AGENDAMENTOS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.titulo}>Seus Compromissos</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{agendamentos.length}</Text>
        </View>
      </View>

      {agendamentos.length === 0 ? (
        <View style={styles.cardVazio}>
          <Ionicons name="calendar-outline" size={40} color="#ccc" />
          <Text style={styles.vazioText}>Nenhum horário marcado ainda</Text>
        </View>
      ) : (
        agendamentos.map((item: any, index: number) => (
          <View key={index} style={styles.card}>
            <View style={styles.iconBox}>
              <Ionicons name="cut-outline" size={22} color="#8A2BE2" />
            </View>

            <View style={styles.info}>
              <Text style={styles.servico}>{item.servico}</Text>
              <Text style={styles.data}>
                {item.data} • {item.hora}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.btnDelete}
              onPress={() => confirmarExclusao(index)}
            >
              <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* MENU DE OPÇÕES (LISTA AGRUPADA) */}
      <Text style={[styles.titulo, { marginTop: 25, marginBottom: 10 }]}>Configurações</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/editarPerfil")}>
          <View style={[styles.menuIcon, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="person-outline" size={20} color="#4338CA" />
          </View>
          <Text style={styles.menuTexto}>Editar Perfil</Text>
          <Ionicons name="chevron-forward" size={18} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="notifications-outline" size={20} color="#D97706" />
          </View>
          <Text style={styles.menuTexto}>Notificações</Text>
          <Ionicons name="chevron-forward" size={18} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
          <View style={[styles.menuIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#8A2BE2" />
          </View>
          <Text style={styles.menuTexto}>Privacidade</Text>
          <Ionicons name="chevron-forward" size={18} color="#CCC" />
        </TouchableOpacity>
      </View>

      {/* BOTÃO SAIR */}
      <TouchableOpacity style={styles.botaoSair} onPress={sair}>
        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        <Text style={styles.textoSair}>Sair da Conta</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8F9FA", 
    paddingHorizontal: 20 
  },
  header: { 
    alignItems: "center", 
    marginTop: 40, 
    marginBottom: 30,
    backgroundColor: '#FFF',
    padding: 25,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2
  },
  avatarWrapper: {
    padding: 4,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#8A2BE2",
    marginBottom: 15,
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  nome: { fontSize: 22, fontWeight: "800", color: "#1A1A1A" },
  email: { color: "#777", fontSize: 14, marginTop: 4 },
  
  botaoAgendar: {
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#8A2BE2", 
    paddingVertical: 16, 
    borderRadius: 20, 
    marginBottom: 30,
    shadowColor: "#8A2BE2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  textoBotao: { color: "#fff", marginLeft: 10, fontWeight: "bold", fontSize: 16 },

  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 15 
  },
  titulo: { fontSize: 18, fontWeight: "700", color: "#333" },
  badge: { 
    backgroundColor: '#8A2BE2', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  cardVazio: { 
    backgroundColor: '#fff', 
    padding: 30, 
    borderRadius: 25, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    borderStyle: 'dashed'
  },
  vazioText: { color: '#999', marginTop: 10, fontSize: 14 },

  card: {
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#fff",
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8A2BE2',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  iconBox: { backgroundColor: "#F3E8FF", padding: 10, borderRadius: 12 },
  info: { flex: 1, marginLeft: 15 },
  servico: { fontWeight: "bold", fontSize: 16, color: "#333" },
  data: { fontSize: 13, color: "#666", marginTop: 3 },
  btnDelete: { padding: 8 },

  menuContainer: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuTexto: { flex: 1, marginLeft: 15, color: "#444", fontWeight: "600", fontSize: 15 },

  botaoSair: {
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#FEE2E2", 
    padding: 16, 
    borderRadius: 20, 
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5'
  },
  textoSair: { color: "#DC2626", marginLeft: 8, fontWeight: "bold", fontSize: 16 },
});