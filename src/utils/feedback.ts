import { Alert, Platform } from "react-native";

export function showAlert(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

export function showConfirm({
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: ConfirmOptions): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelText, style: "cancel", onPress: () => resolve(false) },
      { text: confirmText, style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}
