import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../src/services/connectionFirebase"; 
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar() {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Salva os dados localmente
      await AsyncStorage.setItem("usuarioLogado", JSON.stringify({ uid: user.uid, email: user.email }));
      
      console.log("Login realizado com sucesso! Tentando navegar...");

      router.replace("/(tabs)/perfil");
      
    } catch (error: any) {
      console.error("Erro no Firebase:", error.code);
      let mensagem = "Ocorreu um erro ao entrar.";
      
      if (error.code === "auth/invalid-credential") mensagem = "E-mail ou senha incorretos.";
      if (error.code === "auth/user-not-found") mensagem = "Usuário não encontrado.";
      
      Alert.alert("Erro", mensagem);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Login</Text>
          <Text style={styles.subtitulo}>Entre para agendar seu horário</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputArea}>
            <Ionicons name="mail-outline" size={20} color="#999" style={styles.icon} />
            <TextInput
              placeholder="E-mail"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputArea}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.icon} />
            <TextInput
              placeholder="Senha"
              secureTextEntry
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.botao} 
          onPress={entrar}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.textoBotao}>ENTRAR</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#7404ba" }, // Fundo colorido
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 25 },
  header: { marginBottom: 30, alignItems: 'center' },
  titulo: { fontSize: 32, fontWeight: "bold", color: "#FFF" },
  subtitulo: { fontSize: 16, color: "rgba(255,255,255,0.7)", marginTop: 5 },
  form: { marginBottom: 20 },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Transparência
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 60,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#FFF" }, // Texto branco
  botao: {
    backgroundColor: "#FFF",
    height: 60,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotao: { color: "#7404ba", fontWeight: "bold", fontSize: 16 },
});