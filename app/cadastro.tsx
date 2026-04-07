import React, { useEffect, useState } from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator
} from "react-native";

import MaskInput from "react-native-mask-input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { set, ref } from "firebase/database";
import { auth, database } from "../src/services/connectionFirebase";
import { showAlert } from "../src/utils/feedback";

function getPasswordStrength(password: string) {
  let strength = 0;
  if (password.length >= 6) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[@$!%*?&]/.test(password)) strength += 1;

  if (strength <= 2) return { label: "Fraca", color: "#FF6B6B" };
  if (strength === 3) return { label: "Média", color: "#FFD166" };
  return { label: "Forte", color: "#06D6A0" };
}
export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [forcaSenha, setForcaSenha] = useState({ label: "", color: "" }); 
  const [loading, setLoading] = useState(false);

  const [erroNome, setErroNome] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [erroTelefone, setErroTelefone] = useState("");
  const [erroSenha, setErroSenha] = useState("");

  const passwordRules = {
    length: senha.length >= 8,
    uppercase: /[A-Z]/.test(senha),
    number: /\d/.test(senha),
    symbol: /[@$!%*?&]/.test(senha),
  };

function PasswordRule({ valid, text }: { valid: boolean; text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
      <Text style={{ color: valid ? "green" : "red", marginRight: 8 }}>
        {valid ? "✓" : "✗"}
      </Text>
      <Text>{text}</Text>
    </View>
  );
}

function isValidEmail(text: string) {
  const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
  return reg.test(text);
}

function isValidTelefone(text: string) {
  return text.replace(/\D/g, "").length >= 11;
}

function isValidSenha(text: string) {
  return text.length >= 8;
}

const isFormValid =
  nome.trim().split(" ").length >= 2 &&
  isValidEmail(email) &&
  isValidTelefone(telefone) &&
  isValidSenha(senha) &&
  senha === confirmarSenha;

  // --- VALIDAÇÕES ---
  function validarNome(text: string) {
  setNome(text); // ← estava faltando isso também!

  if (text.trim().split(" ").length < 2) {
    setErroNome("Digite seu nome completo");
  } else {
    setErroNome("");
  }
}

  function validarEmail(text: string) {
    setEmail(text);
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (!reg.test(text)) {
      setErroEmail("E-mail inválido");
    } else {
      setErroEmail("");
    }
  }

  function validarTelefone(text: string) {
    setTelefone(text);
    const numeros = text.replace(/\D/g, "");
    if (numeros.length < 11) {
      setErroTelefone("Telefone incompleto");
    } else {
      setErroTelefone("");
    }
  }

  function validarSenha(text: string) {
    setSenha(text);
    if (text.length < 8) {
      setErroSenha("Mínimo 8 caracteres");
    } else {
      setErroSenha("");
    }
  }

  // --- FUNÇÃO CADASTRAR ---
  async function cadastrar() {
    if (!nome || !email || !telefone || !senha || !confirmarSenha) {
      showAlert("Erro", "Preencha todos os campos.");
      return;
    }

    if (erroNome || erroEmail || erroTelefone || erroSenha) {
      showAlert("Erro", "Verifique os campos em vermelho.");
      return;
    }

    if (senha !== confirmarSenha) {
      showAlert("Erro", "As senhas não conferem.");
      return;
    }

    setLoading(true);

    try {
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        senha
      );

      const user = userCredential.user;

      // 2. Salvar no Realtime Database
      await set(ref(database, `users/${user.uid}`), {
        uid: user.uid,
        nome,
        email: email.trim(),
        telefone,
        createdAt: new Date().toISOString(),
      });

      // 3. Salvar no AsyncStorage
      await AsyncStorage.setItem(
        "usuario",
        JSON.stringify({ nome, email, telefone })
      );

      setLoading(false);

      // ✅ ALERTA
      showAlert("Sucesso", "Cadastro realizado com sucesso!");

      // ✅ NAVEGAÇÃO FORÇADA (FUNCIONA NO EXPO ROUTER)
      setTimeout(() => {
        console.log("Indo para login...");
        router.push("/login"); // ⚠️ pode precisar ajustar o caminho
      }, 500);

    } catch (error: any) {
      setLoading(false);
      console.log("ERRO:", error.code);

      let mensagem = "Erro ao realizar cadastro.";
      if (error.code === "auth/email-already-in-use") mensagem = "E-mail já cadastrado!";
      if (error.code === "auth/weak-password") mensagem = "Senha muito fraca!";
      if (error.code === "auth/invalid-email") mensagem = "E-mail inválido!";

      showAlert("Ops!", mensagem);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Criar Conta</Text>
          <Text style={styles.subtitulo}>Rápido, fácil e seguro.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            placeholder="Seu nome"
            style={[styles.input, erroNome ? styles.inputErro : null]}
            value={nome}
            onChangeText={validarNome}
          />
          {erroNome && <Text style={styles.erroTexto}>{erroNome}</Text>}

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            placeholder="exemplo@email.com"
            style={[styles.input, erroEmail ? styles.inputErro : null]}
            value={email}
            onChangeText={validarEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {erroEmail && <Text style={styles.erroTexto}>{erroEmail}</Text>}

          <Text style={styles.label}>Telefone</Text>
          <MaskInput
            value={telefone}
            onChangeText={(masked) => validarTelefone(masked)}
            mask={["(", /\d/, /\d/, ")", " ", /\d/, /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, /\d/]}
            placeholder="(00) 00000-0000"
            style={[styles.input, erroTelefone ? styles.inputErro : null]}
            keyboardType="numeric"
          />
          {erroTelefone && <Text style={styles.erroTexto}>{erroTelefone}</Text>}

          <Text style={styles.label}>Senha</Text>
          <TextInput
            placeholder="******"
            style={[styles.input, erroSenha ? styles.inputErro : null]}
            secureTextEntry
            value={senha}
            onChangeText={validarSenha}
          />

          <PasswordRule valid={isValidSenha(senha)} text="Pelo menos 8 caracteres" />
          <PasswordRule valid={passwordRules.uppercase} text="Inclui letra maiúscula" />
          <PasswordRule valid={passwordRules.number} text="Inclui número" />
          <PasswordRule valid={passwordRules.symbol} text="Inclui símbolo (@$!%*?&)" />
          {erroSenha && <Text style={styles.erroTexto}>{erroSenha}</Text>}

          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput
            placeholder="******"
            style={styles.input}
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />
        </View>

        <TouchableOpacity
          style={styles.botao}
          onPress={cadastrar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.botaoTexto}>CADASTRAR</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")} style={styles.linkLogin}>
          <Text style={styles.linkLoginTexto}>
            Já tem conta? <Text style={{ fontWeight: 'bold', color: '#8A2BE2' }}>Entrar</Text>
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 50,
    backgroundColor: "#F8F9FA",
  },
  header: {
    marginBottom: 30,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4B0082",
  },
  subtitulo: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  inputErro: {
    borderColor: "#FF3B30",
  },
  erroTexto: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
  },
  botao: {
    backgroundColor: "#8A2BE2",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    height: 60,
    justifyContent: 'center'
  },
  botaoTexto: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  linkLogin: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkLoginTexto: {
    color: "#666",
    fontSize: 15,
  }
});
