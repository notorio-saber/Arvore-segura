// Helpers de autenticação locais.
// Cidadão: sessão anônima persistida no navegador.
// Equipe municipal: e-mail/senha simples, persistido localmente.
import { MUNICIPIO_ID, broadcastStorageChange, readStorage, writeStorage } from "../firebase";

const AUTH_KEY = "auth";
const STAFF_KEY = "staff";

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function readSession() {
  return readStorage(AUTH_KEY, null);
}

function writeSession(session) {
  writeStorage(AUTH_KEY, session);
  broadcastStorageChange(AUTH_KEY);
}

export function ensureCitizenSession() {
  return new Promise((resolve) => {
    const current = readSession();

    if (current?.user) {
      resolve(current.user);
      return;
    }

    const user = { uid: createId("citizen"), isAnonymous: true };
    writeSession({ user });
    resolve(user);
  });
}

export async function staffLogin(email, password) {
  if (!email || !password) {
    throw new Error("Informe e-mail e senha para entrar.");
  }

  const user = { uid: createId("staff"), email, isAnonymous: false };
  const staff = {
    uid: user.uid,
    nome: email.split("@")[0],
    municipioId: MUNICIPIO_ID,
    email,
  };

  writeSession({ user, staff });
  writeStorage(STAFF_KEY, staff);
  broadcastStorageChange(STAFF_KEY);

  return { user, staff };
}

export function staffLogout() {
  writeSession(null);
  writeStorage(STAFF_KEY, null);
  broadcastStorageChange(STAFF_KEY);
  return Promise.resolve();
}

export function watchAuthState(callback) {
  const emit = () => {
    const session = readSession();
    callback(session?.user ?? null);
  };

  emit();

  if (typeof window === "undefined") {
    return () => {};
  }

  const onChange = () => emit();
  window.addEventListener("arvore-segura-storage", onChange);

  return () => {
    window.removeEventListener("arvore-segura-storage", onChange);
  };
}

export async function getStaffProfile(uid) {
  const staff = readStorage(STAFF_KEY, null);
  return staff?.uid === uid ? staff : null;
}
