importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAoPkIN2Q2yKpeBeX1ZM4QWldaPzuqYHRI",
  authDomain: "studiomarcela-27818.firebaseapp.com",
  projectId: "studiomarcela-27818",
  storageBucket: "studiomarcela-27818.firebasestorage.app",
  messagingSenderId: "989684385460",
  appId: "1:989684385460:web:76e803f05bc69f052d39e1",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/icon.png",
    }
  );
});