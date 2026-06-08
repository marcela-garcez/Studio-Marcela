import { getApp, getApps, initializeApp } from "firebase/app";

export const firebaseWebConfig = {
  apiKey: "AIzaSyAoPkIN2Q2yKpeBeX1ZM4QWldaPzuqYHRI",
  authDomain: "studiomarcela-27818.firebaseapp.com",
  databaseURL: "https://studiomarcela-27818-default-rtdb.firebaseio.com",
  projectId: "studiomarcela-27818",
  storageBucket: "studiomarcela-27818.firebasestorage.app",
  messagingSenderId: "989684385460",
  appId: "1:989684385460:web:76e803f05bc69f052d39e1",
};

export const firebaseWebVapidKey =
  "BCBMjOHWBQNaft6DwhFOJwzYug9jgTqeosSKqX66eeV9IDxmrx98FVg2oZ_CaXGBIMVQrQVaAyN_fNlt1yZ7Gzk";

export function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseWebConfig);
}
