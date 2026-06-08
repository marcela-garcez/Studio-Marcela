import {
  getMessaging,
  getToken,
  onMessage
} from "firebase/messaging";

import {getFirebaseApp}  from "../firebaseConfig";

const messaging = getMessaging(getFirebaseApp());

export async function requestNotificationPermission() {

  const permission =
    await Notification.requestPermission();

  if (permission === "granted") {

    console.log("Permissão concedida");

    const token = await getToken(messaging, {
      vapidKey: "firebaseWebVapidKey"
    });

    console.log("Token FCM Web:", token);

  } else {

    console.log("Permissão negada");

  }
}

onMessage(messaging, (payload) => {

  console.log("Mensagem recebida:", payload);

  alert(
    payload.notification?.title +
    " - " +
    payload.notification?.body
  );

});