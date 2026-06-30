// Camada de acesso a dados local.
// Reportes de risco arbóreo são salvos no armazenamento local do navegador.
import { broadcastStorageChange, readStorage, writeStorage } from "../firebase";
import { getMunicipioById } from "./municipios";

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

function getReportesKey(municipioId) {
  return `reportes:${municipioId}`;
}

function readReportes(municipioId) {
  return readStorage(getReportesKey(municipioId), []);
}

function writeReportes(municipioId, reportes) {
  writeStorage(getReportesKey(municipioId), reportes);
  broadcastStorageChange(getReportesKey(municipioId));
}

export async function criarReporte(municipioId, dados, uid) {
  const reportes = readReportes(municipioId);
  const novoReporte = {
    id: `reporte-${Date.now()}`,
    categoria: dados.categoria,
    descricao: dados.descricao || "",
    localizacao: { lat: dados.lat, lng: dados.lng },
    fotoUrl: null,
    contato: dados.contato || null,
    status: "pendente",
    reportadoPor: uid,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  writeReportes(municipioId, [novoReporte, ...reportes]);
  return { id: novoReporte.id };
}

export function escutarReportes(municipioId, callback) {
  const emit = () => {
    const reportes = readReportes(municipioId).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    callback(reportes);
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

export async function atualizarStatus(municipioId, reporteId, novoStatus) {
  const reportes = readReportes(municipioId);
  const atualizados = reportes.map((reporte) =>
    reporte.id === reporteId
      ? { ...reporte, status: novoStatus, atualizadoEm: new Date().toISOString() }
      : reporte
  );

  writeReportes(municipioId, atualizados);
  return atualizados;
}

export function obterMetricasPorMunicipio(municipioId) {
  const reportes = readReportes(municipioId);
  const municipio = getMunicipioById(municipioId);
  const total = reportes.length;
  const pendente = reportes.filter((reporte) => reporte.status === "pendente").length;
  const triagem = reportes.filter((reporte) => reporte.status === "triagem").length;
  const despachado = reportes.filter((reporte) => reporte.status === "despachado").length;
  const concluido = reportes.filter((reporte) => reporte.status === "concluido").length;
  const taxaConclusao = total === 0 ? 0 : Math.round((concluido / total) * 100);

  return {
    id: municipioId,
    nome: municipio.nome,
    regiao: municipio.regiao,
    populacao: municipio.populacao,
    total,
    pendente,
    triagem,
    despachado,
    concluido,
    taxaConclusao,
  };
}

export function obterMetricasGerais(municipios) {
  return municipios.map((municipio) => obterMetricasPorMunicipio(municipio.id));
}
