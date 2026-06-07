import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import MaskInput from "react-native-mask-input";

import { auth, database } from "../src/services/connectionFirebase";
import { showAlert } from "../src/utils/feedback";

function isValidEmail(text: string) {
  const reg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w\w+)+$/;
  return reg.test(text);
}

function isValidTelefone(text: string) {
  return text.replace(/\D/g, "").length >= 11;
}

function isValidSenha(text: string) {
  return text.length >= 8;
}

function PasswordRule({ valid, text }: { valid: boolean; text: string }) {
  return (
    <View style={styles.passwordRule}>
      <Text style={[styles.passwordRuleMark, valid ? styles.passwordRuleValid : styles.passwordRuleInvalid]}>
        {valid ? "OK" : "X"}
      </Text>
      <Text style={styles.passwordRuleText}>{text}</Text>
    </View>
  );
}

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [erroNome, setErroNome] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [erroTelefone, setErroTelefone] = useState("");
  const [erroSenha, setErroSenha] = useState("");

  const passwordRules = {
    uppercase: /[A-Z]/.test(senha),
    number: /\d/.test(senha),
    symbol: /[@$!%*?&]/.test(senha),
  };

  function validarNome(text: string) {
    setNome(text);
    setErroNome(text.trim().split(" ").length < 2 ? "Digite seu nome completo" : "");
  }

  function validarEmail(text: string) {
    setEmail(text);
    setErroEmail(isValidEmail(text) ? "" : "E-mail invalido");
  }

  function validarTelefone(text: string) {
    setTelefone(text);
    setErroTelefone(isValidTelefone(text) ? "" : "Telefone incompleto");
  }

  function validarSenha(text: string) {
    setSenha(text);
    setErroSenha(isValidSenha(text) ? "" : "Minimo 8 caracteres");
  }

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
      showAlert("Erro", "As senhas nao conferem.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), senha);
      const user = userCredential.user;

      await set(ref(database, `users/${user.uid}`), {
        uid: user.uid,
        nome,
        email: email.trim(),
        telefone,
        createdAt: new Date().toISOString(),
      });

      await AsyncStorage.setItem("usuario", JSON.stringify({ nome, email, telefone }));

      showAlert("Sucesso", "Cadastro realizado com sucesso!");

      setTimeout(() => {
        router.push("/login");
      }, 500);
    } catch (error: any) {
      console.log("ERRO:", error.code);

      let mensagem = "Erro ao realizar cadastro.";
      if (error.code === "auth/email-already-in-use") mensagem = "E-mail ja cadastrado!";
      if (error.code === "auth/weak-password") mensagem = "Senha muito fraca!";
      if (error.code === "auth/invalid-email") mensagem = "E-mail invalido!";

      showAlert("Ops!", mensagem);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Criar Conta</Text>
          <Text style={styles.subtitulo}>Rapido, facil e seguro.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            placeholder="Seu nome"
            style={[styles.input, erroNome ? styles.inputErro : null]}
            value={nome}
            onChangeText={validarNome}
          />
          {erroNome ? <Text style={styles.erroTexto}>{erroNome}</Text> : null}

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            placeholder="exemplo@email.com"
            style={[styles.input, erroEmail ? styles.inputErro : null]}
            value={email}
            onChangeText={validarEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {erroEmail ? <Text style={styles.erroTexto}>{erroEmail}</Text> : null}

          <Text style={styles.label}>Telefone</Text>
          <MaskInput
            value={telefone}
            onChangeText={(masked) => validarTelefone(masked)}
            mask={["(", /\d/, /\d/, ")", " ", /\d/, /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, /\d/]}
            placeholder="(00) 00000-0000"
            style={[styles.input, erroTelefone ? styles.inputErro : null]}
            keyboardType="numeric"
          />
          {erroTelefone ? <Text style={styles.erroTexto}>{erroTelefone}</Text> : null}

          <Text style={styles.label}>Senha</Text>
          <TextInput
            placeholder="******"
            style={[styles.input, erroSenha ? styles.inputErro : null]}
            secureTextEntry
            value={senha}
            onChangeText={validarSenha}
          />

          <PasswordRule valid={isValidSenha(senha)} text="Pelo menos 8 caracteres" />
          <PasswordRule valid={passwordRules.uppercase} text="Inclui letra maiuscula" />
          <PasswordRule valid={passwordRules.number} text="Inclui numero" />
          <PasswordRule valid={passwordRules.symbol} text="Inclui simbolo (@$!%*?&)" />
          {erroSenha ? <Text style={styles.erroTexto}>{erroSenha}</Text> : null}

          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput
            placeholder="******"
            style={styles.input}
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />
        </View>

        <TouchableOpacity style={styles.botao} onPress={cadastrar} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.botaoTexto}>CADASTRAR</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")} style={styles.linkLogin}>
          <Text style={styles.linkLoginTexto}>
            Ja tem conta? <Text style={styles.linkLoginDestaque}>Entrar</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.footerSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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
  passwordRule: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginTop: 6,
  },
  passwordRuleMark: {
    width: 24,
    marginRight: 8,
    fontWeight: "700",
  },
  passwordRuleValid: {
    color: "green",
  },
  passwordRuleInvalid: {
    color: "red",
  },
  passwordRuleText: {
    color: "#444",
  },
  botao: {
    backgroundColor: "#8A2BE2",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    height: 60,
    justifyContent: "center",
  },
  botaoTexto: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  linkLogin: {
    marginTop: 20,
    alignItems: "center",
  },
  linkLoginTexto: {
    color: "#666",
    fontSize: 15,
  },
  linkLoginDestaque: {
    fontWeight: "bold",
    color: "#8A2BE2",
  },
  footerSpace: {
    height: 40,
  },
});
