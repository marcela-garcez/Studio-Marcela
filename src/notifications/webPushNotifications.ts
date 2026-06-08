import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import {
  getMessaging,
  getToken,
  isSupported as isMessagingSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from "firebase/messaging";
import { Platform } from "react-native";

import { firebaseWebConfig, firebaseWebVapidKey } from "./firebaseConfig";

let messagingInstance: Messaging | null = null;

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseWebConfig);
}

export async function initializeFirebaseWeb() {
  if (Platform.OS !== "web") {
    return null;
  }

  const app = getFirebaseApp();

  if (await isAnalyticsSupported()) {
    getAnalytics(app);
  }

  if (!(await isMessagingSupported())) {
    return null;
  }

  messagingInstance = messagingInstance ?? getMessaging(app);

  return messagingInstance;
}

async function registerFirebaseMessagingServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    throw new Error("WEB_PUSH_SERVICE_WORKER_UNSUPPORTED");
  }

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    await registration.update();
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.log("Erro ao registrar firebase-messaging-sw.js:", error);
    throw new Error("WEB_PUSH_SERVICE_WORKER_REGISTRATION_FAILED");
  }
}

export async function registerForWebPushNotifications() {
  if (Platform.OS !== "web" || typeof window === "undefined" || !("Notification" in window)) {
    throw new Error("WEB_PUSH_UNSUPPORTED");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("WEB_PUSH_PERMISSION_DENIED");
  }

  const messaging = await initializeFirebaseWeb();

  if (!messaging) {
    throw new Error("WEB_PUSH_UNSUPPORTED");
  }

  const serviceWorkerRegistration = await registerFirebaseMessagingServiceWorker();
  const token = await getToken(messaging, {
    vapidKey: firebaseWebVapidKey,
    serviceWorkerRegistration,
  });

  if (!token) {
    throw new Error("WEB_PUSH_TOKEN_EMPTY");
  }

  return token;
}

export async function listenToForegroundWebMessages(
  callback: (payload: MessagePayload) => void,
) {
  const messaging = await initializeFirebaseWeb();

  if (!messaging) {
    return () => undefined;
  }

  return onMessage(messaging, callback);
}
