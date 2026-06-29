// Inicialização central do Firebase (Auth, Firestore, Storage).
// As credenciais vêm de variáveis de ambiente — nunca commitar .env.
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ID do município atendido por esta instância do app.
// Em produção, cada município pode ter seu próprio deploy/subdomínio,
// todos apontando para o mesmo projeto Firebase, mudando só essa variável.
export const MUNICIPIO_ID = import.meta.env.VITE_MUNICIPIO_ID || "irati-pr";

export default app;
