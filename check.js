const fs = require("fs");

console.log("\n=======================================");
console.log("   VERIFICAÇÃO FIREBASE PUSH WEB");
console.log("=======================================\n");

function existeArquivo(caminho) {
  return fs.existsSync(caminho);
}

function lerArquivo(caminho) {
  if (!existeArquivo(caminho)) return "";
  return fs.readFileSync(caminho, "utf8");
}

function verificar(nome, status) {
  if (status) {
    console.log(`✅ ${nome}`);
  } else {
    console.log(`❌ ${nome}`);
  }
}

/* =======================================
   PACKAGE.JSON
======================================= */

const packageJson = lerArquivo("./package.json");

verificar(
  "Firebase instalado",
  packageJson.includes('"firebase"')
);

/* =======================================
   FIREBASE CONFIG
======================================= */

const firebaseConfig = lerArquivo("./src/firebaseConfig.ts");

verificar(
  "firebaseConfig.ts existe",
  existeArquivo("./src/firebaseConfig.ts")
);

verificar(
  "initializeApp configurado",
  firebaseConfig.includes("initializeApp")
);

verificar(
  "apiKey configurada",
  firebaseConfig.includes("apiKey")
);

verificar(
  "projectId configurado",
  firebaseConfig.includes("projectId")
);

/* =======================================
   FIREBASE MESSAGING
======================================= */

const firebaseMessaging = lerArquivo(
  "./src/services/firebaseMessaging.ts"
);

verificar(
  "firebaseMessaging.ts existe",
  existeArquivo("./src/services/firebaseMessaging.ts")
);

verificar(
  "getMessaging configurado",
  firebaseMessaging.includes("getMessaging")
);

verificar(
  "getToken configurado",
  firebaseMessaging.includes("getToken")
);

verificar(
  "VAPID KEY configurada",
  firebaseMessaging.includes("vapidKey")
);

verificar(
  "Notification Permission configurada",
  firebaseMessaging.includes("Notification.requestPermission")
);

/* =======================================
   SERVICE WORKER
======================================= */

const serviceWorker = lerArquivo(
  "./public/firebase-messaging-sw.js"
);

verificar(
  "Service Worker existe",
  existeArquivo("./public/firebase-messaging-sw.js")
);

verificar(
  "firebase.initializeApp configurado",
  serviceWorker.includes("firebase.initializeApp")
);

verificar(
  "onBackgroundMessage configurado",
  serviceWorker.includes("onBackgroundMessage")
);

/* =======================================
   APP.TSX
======================================= */

const appTsx = lerArquivo("./App.tsx");

verificar(
  "App.tsx existe",
  existeArquivo("./App.tsx")
);

verificar(
  "requestNotificationPermission chamada",
  appTsx.includes("requestNotificationPermission")
);

/* =======================================
   RESULTADO FINAL
======================================= */

console.log("\n=======================================");
console.log(" VERIFICAÇÃO FINALIZADA");
console.log("=======================================\n");