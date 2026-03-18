import React, { useState } from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform,
} from "react-native";

import MaskInput from "react-native-mask-input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { set, ref } from "firebase/database";
import { auth, database } from "../src/services/connectionFirebase";

export default function Cadastro() {
  const [nome, setNome] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telefone, setTelefone] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [confirmarSenha, setConfirmarSenha] = useState<string>("");

  async function cadastrar() {
    // validação de campos vazios
    if (!nome || !email || !telefone || !senha || !confirmarSenha) {
      alert("Preencha todos os campos!");
      return;
    }

    // validação de senha
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    const usuario = {
      nome,
      email,
      telefone,
      senha,
    };

    try {
      // salva localmente
      await AsyncStorage.setItem("usuario", JSON.stringify(usuario));

      // registra no firebase
      await register();

      alert("Cadastro realizado com sucesso!");
      router.replace("/login");
    } catch (error) {
      console.log(error);
      alert("Erro ao cadastrar usuário");
    }
  }

  async function register(): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );

      const user = userCredential.user;

      if (user) {
        await set(ref(database, "users/" + user.uid), {
          uid: user.uid,
          name: nome,
          email: email,
          telefone: telefone,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.log(error);

      if (error.message) {
        alert(error.message);
      } else {
        alert("Erro ao cadastrar usuário");
      }
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Criar Conta</Text>

      <TextInput
        placeholder="Nome Completo"
        style={styles.input}
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <MaskInput
        value={telefone}
        onChangeText={(masked) => setTelefone(masked)}
        mask={[
          "(",
          /\d/,
          /\d/,
          ")",
          " ",
          /\d/,
          /\d/,
          /\d/,
          /\d/,
          /\d/,
          "-",
          /\d/,
          /\d/,
          /\d/,
          /\d/,
        ]}
        placeholder="Telefone"
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Senha"
        style={styles.input}
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TextInput
        placeholder="Confirmar Senha"
        style={styles.input}
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={cadastrar}>
        <Text style={styles.botaoTexto}>CADASTRAR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#8A2BE2",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },

  botao: {
    backgroundColor: "#8A2BE2",
    padding: 18,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },

  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});