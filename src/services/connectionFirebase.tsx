import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  baseURL: "https://studiomarcela-27818-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyAoPkIN2Q2yKpeBeX1ZM4QWldaPzuqYHRI",
  authDomain: "studiomarcela-27818.firebaseapp.com",
  projectId: "studiomarcela-27818",
  storageBucket: "studiomarcela-27818.firebasestorage.app",
  messagingSenderId: "989684385460",
  appId: "1:989684385460:web:76e803f05bc69f052d39e1"
};

//Inicializa o Firebase
const app = initializeApp(firebaseConfig);

//inicializa e exporta serviço
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

//se precisar exportar o app
export default app;
