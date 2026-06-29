// Configuração local do app sem depender de chaves externas.
// A autenticação e o banco de dados ficam no armazenamento local do navegador.
const STORAGE_PREFIX = "arvore-segura";

function getStorageKey(key) {
  return `${STORAGE_PREFIX}:${key}`;
}

export function readStorage(key, fallback = null) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  const serialized = JSON.stringify(value);
  window.localStorage.setItem(getStorageKey(key), serialized);
}

export function broadcastStorageChange(key) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("arvore-segura-storage", { detail: key }));
}

export const MUNICIPIO_ID = import.meta.env.VITE_MUNICIPIO_ID || "irati-pr";

export default {
  MUNICIPIO_ID,
};
