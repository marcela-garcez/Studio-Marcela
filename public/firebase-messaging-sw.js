importScripts(
  "https://www.gstatic.com/firebasejs/12.10.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyB8k6vx86HhGy_eg_Z6rg9VWEkMXpUsTAw",
  authDomain: "meuapp-81668.firebaseapp.com",
  projectId: "meuapp-81668",
  storageBucket: "meuapp-81668.firebasestorage.app",
  messagingSenderId: "1057022456607",
  appId: "1:1057022456607:web:3193896c29b7eb99b9762a",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  const notificationTitle = notification.title || "StudiosMarcela";
  const notificationOptions = {
    body: notification.body || "Voce recebeu uma nova atualizacao.",
    icon: "/assets/images/icon.png",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
