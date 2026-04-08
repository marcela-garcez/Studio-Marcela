import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { showAlert } from "../src/utils/feedback";

export default function EditarPerfil() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    const usuarioJson = await AsyncStorage.getItem("usuario");

    if (usuarioJson) {
      const usuario = JSON.parse(usuarioJson);
      setNome(usuario.nome || "");
      setEmail(usuario.email || "");
      setTelefone(usuario.telefone || "");
    }
  }

  async function salvar() {
    if (!nome || !email || !telefone) {
      showAlert("Erro", "Preencha todos os campos.");
      return;
    }

    await AsyncStorage.setItem(
      "usuario",
      JSON.stringify({
        nome,
        email,
        telefone,
      })
    );

    showAlert("Sucesso", "Perfil atualizado com sucesso!");
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Editar perfil</Text>

      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />

      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.botao} onPress={salvar}>
        <Text style={styles.botaoTexto}>Salvar alterações</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f2f8",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },
  botao: {
    backgroundColor: "#8A2BE2",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
});
