// Camada de acesso a dados: reportes de risco arbóreo.
// Estrutura multi-tenant: municipios/{municipioId}/reportes/{reporteId}
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

export const CATEGORIAS = [
  { id: "galho_quebrado", label: "Galho quebrado ou pendente" },
  { id: "arvore_inclinada", label: "Árvore inclinada / risco de queda" },
  { id: "tronco_oco", label: "Tronco oco ou apodrecido" },
  { id: "conflito_rede", label: "Conflito com rede elétrica ou sinalização" },
  { id: "outro", label: "Outro risco" },
];

export const STATUS = {
  pendente: { label: "Pendente", color: "bg-gray-200 text-gray-800" },
  triagem: { label: "Em triagem", color: "bg-amber-100 text-amber-800" },
  despachado: { label: "Equipe despachada", color: "bg-blue-100 text-blue-800" },
  concluido: { label: "Concluído", color: "bg-green-100 text-green-800" },
};

function reportesRef(municipioId) {
  return collection(db, "municipios", municipioId, "reportes");
}

/**
 * Envia um novo reporte: faz upload da foto (se houver) e grava o documento.
 * @param {string} municipioId
 * @param {{categoria:string, descricao:string, lat:number, lng:number, foto?:File, contato?:string}} dados
 * @param {string} uid - uid do usuário autenticado (anônimo ou não)
 */
export async function criarReporte(municipioId, dados, uid) {
  let fotoUrl = null;

  if (dados.foto) {
    const ext = dados.foto.name?.split(".").pop() || "jpg";
    const path = `reportes/${municipioId}/${uid}-${Date.now()}.${ext}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, dados.foto, {
      contentType: dados.foto.type || "image/jpeg",
    });
    fotoUrl = await getDownloadURL(storageRef);
  }

  const payload = {
    categoria: dados.categoria,
    descricao: dados.descricao || "",
    localizacao: { lat: dados.lat, lng: dados.lng },
    fotoUrl,
    contato: dados.contato || null,
    status: "pendente",
    reportadoPor: uid,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  };

  return addDoc(reportesRef(municipioId), payload);
}

/**
 * Assina (real-time) a lista de reportes de um município, mais recentes primeiro.
 * Retorna a função de unsubscribe.
 */
export function escutarReportes(municipioId, callback) {
  const q = query(reportesRef(municipioId), orderBy("criadoEm", "desc"));
  return onSnapshot(q, (snapshot) => {
    const reportes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(reportes);
  });
}

export async function atualizarStatus(municipioId, reporteId, novoStatus) {
  const reporteDoc = doc(db, "municipios", municipioId, "reportes", reporteId);
  return updateDoc(reporteDoc, {
    status: novoStatus,
    atualizadoEm: serverTimestamp(),
  });
}
