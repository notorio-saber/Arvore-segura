// Helpers de autenticação.
// Cidadão: autenticação anônima (sem fricção, sem dado pessoal obrigatório).
// Equipe municipal: e-mail/senha, com vínculo a um município via coleção `staff`.
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export function ensureCitizenSession() {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      (user) => {
        unsub();
        if (user) {
          resolve(user);
        } else {
          signInAnonymously(auth).then((cred) => resolve(cred.user)).catch(reject);
        }
      },
      reject
    );
  });
}

export async function staffLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const staffDoc = await getDoc(doc(db, "staff", cred.user.uid));
  if (!staffDoc.exists()) {
    await signOut(auth);
    throw new Error(
      "Este usuário não está vinculado a nenhum município. Contate o administrador."
    );
  }
  return { user: cred.user, staff: staffDoc.data() };
}

export function staffLogout() {
  return signOut(auth);
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getStaffProfile(uid) {
  const staffDoc = await getDoc(doc(db, "staff", uid));
  return staffDoc.exists() ? staffDoc.data() : null;
}
