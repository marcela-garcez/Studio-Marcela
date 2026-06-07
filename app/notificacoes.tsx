import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  listenToForegroundWebMessages,
  registerForWebPushNotifications,
} from "../src/notifications";
import { showAlert } from "../src/utils/feedback";

function getNotificationErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message === "WEB_PUSH_PERMISSION_DENIED") {
    return "Permissao negada pelo navegador.";
  }

  if (message === "WEB_PUSH_SERVICE_WORKER_UNSUPPORTED") {
    return "Este navegador nao suporta Service Worker.";
  }

  if (message === "WEB_PUSH_SERVICE_WORKER_REGISTRATION_FAILED") {
    return "Nao foi possivel registrar o arquivo public/firebase-messaging-sw.js.";
  }

  if (message === "WEB_PUSH_TOKEN_EMPTY") {
    return "O Firebase nao retornou um token FCM Web.";
  }

  if (message.includes("messaging/permission-blocked")) {
    return "As notificacoes estao bloqueadas nas permissoes do navegador.";
  }

  if (message.includes("messaging/token-subscribe-failed")) {
    return "Falha ao inscrever o token. Confira se a chave VAPID foi copiada exatamente.";
  }

  if (message.includes("messaging/failed-service-worker-registration")) {
    return "Falha no service worker. Confira se /firebase-messaging-sw.js abre no navegador.";
  }

  if (message.includes("messaging/unsupported-browser")) {
    return "Este navegador nao suporta Firebase Cloud Messaging Web.";
  }

  return `Nao foi possivel ativar notificacoes Web: ${message}`;
}

function getNotificationErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") {
    return String(error);
  }

  const errorObject = error as {
    code?: string;
    message?: string;
    stack?: string;
    customData?: unknown;
  };

  return [
    errorObject.code ? `code: ${errorObject.code}` : null,
    errorObject.message ? `message: ${errorObject.message}` : null,
    errorObject.customData ? `customData: ${JSON.stringify(errorObject.customData)}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function NotificacoesScreen() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("Aguardando permissao");
  const [ultimaMensagem, setUltimaMensagem] = useState("");
  const [detalheErro, setDetalheErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    let unsubscribe: (() => void) | undefined;

    listenToForegroundWebMessages((payload) => {
      const title = payload.notification?.title || "Notificacao recebida";
      const body = payload.notification?.body || "Mensagem recebida em primeiro plano.";

      setUltimaMensagem(`${title} - ${body}`);
      showAlert(title, body);
    }).then((listener) => {
      unsubscribe = listener;
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  const ativarNotificacoes = async () => {
    if (Platform.OS !== "web") {
      showAlert("Disponivel na Web", "Esta tela foi configurada para notificacoes Web com FCM.");
      return;
    }

    setCarregando(true);
    setStatus("Solicitando permissao...");

    try {
      const nextToken = await registerForWebPushNotifications();

      setToken(nextToken);
      setDetalheErro("");
      setStatus("Notificacoes Web ativas");
      showAlert("Notificacoes ativadas", "Token FCM Web gerado com sucesso.");
      console.log("Token FCM Web:", nextToken);
    } catch (error) {
      const statusMessage = getNotificationErrorMessage(error);

      setStatus(statusMessage);
      setDetalheErro(getNotificationErrorDetails(error));
      showAlert("Erro", statusMessage);
      console.log("Erro ao ativar notificacoes Web:", error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={30} color="#7C3AED" />
          </View>
          <Text style={styles.overline}>Firebase Cloud Messaging</Text>
          <Text style={styles.title}>Notificacoes Web</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.statusText}>{status}</Text>

          <TouchableOpacity
            style={[styles.button, carregando && styles.buttonDisabled]}
            activeOpacity={0.9}
            onPress={ativarNotificacoes}
            disabled={carregando}
          >
            <Ionicons name="flash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {carregando ? "Ativando..." : "Ativar notificacoes"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Token FCM Web</Text>
          <Text style={styles.tokenText}>{token || "Nenhum token gerado ainda."}</Text>
        </View>

        {detalheErro ? (
          <View style={styles.infoCard}>
            <Text style={styles.label}>Detalhe tecnico</Text>
            <Text style={styles.errorDetailText}>{detalheErro}</Text>
          </View>
        ) : null}

        <View style={styles.infoCard}>
          <Text style={styles.label}>Ultima mensagem</Text>
          <Text style={styles.messageText}>{ultimaMensagem || "Nenhuma mensagem recebida nesta sessao."}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F0FF",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#ECE3FF",
    marginBottom: 16,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  overline: {
    fontSize: 12,
    fontWeight: "900",
    color: "#7C3AED",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#221431",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#6B6278",
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ECE3FF",
    marginBottom: 14,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ECE3FF",
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "900",
    color: "#8B7AA8",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2F2340",
    marginBottom: 16,
  },
  button: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    marginLeft: 10,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  tokenText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#44305F",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#44305F",
  },
  errorDetailText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#991B1B",
  },
});
