import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { staffLogout } from "../lib/auth";
import { escutarReportes, atualizarStatus, STATUS } from "../lib/reportes";
import ReportCard from "../components/ReportCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import Button from "../components/ui/Button.jsx";
import MapView from "../components/MapView.jsx";
import { getMunicipioById } from "../lib/municipios.js";
import { MUNICIPIO_ID } from "../firebase.js";

export default function Painel() {
  const { staff } = useAuth();
  const navigate = useNavigate();
  const { municipioId: municipioParam } = useParams();
  const [reportes, setReportes] = useState([]);
  const [filtro, setFiltro] = useState("todos");

  const municipioId = municipioParam || staff?.municipioId || MUNICIPIO_ID;
  const municipio = useMemo(() => getMunicipioById(municipioId), [municipioId]);

  useEffect(() => {
    if (!municipioId) return;
    const unsub = escutarReportes(municipioId, setReportes);
    return unsub;
  }, [municipioId]);

  const reportesFiltrados = useMemo(() => {
    if (filtro === "todos") return reportes;
    return reportes.filter((r) => r.status === filtro);
  }, [reportes, filtro]);

  const resumo = useMemo(() => {
    const base = { todos: reportes.length, pendente: 0, triagem: 0, despachado: 0, concluido: 0 };
    reportes.forEach((reporte) => {
      if (base[reporte.status] !== undefined) base[reporte.status] += 1;
    });
    return base;
  }, [reportes]);

  const taxaConclusao = useMemo(() => {
    if (!resumo.todos) return 0;
    return Math.round((resumo.concluido / resumo.todos) * 100);
  }, [resumo]);

  async function handleStatusChange(reporteId, novoStatus) {
    await atualizarStatus(municipioId, reporteId, novoStatus);
  }

  async function handleLogout() {
    await staffLogout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Árvore Segura" className="h-10 w-10 rounded-2xl object-cover" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Painel operacional</p>
              <h1 className="text-lg font-semibold text-gray-900">{municipio.nome} • gestão de risco arbóreo</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate("/central")}>Central</Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Sair</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex-1 min-h-0 overflow-auto px-4 py-8">
        <PageHeader
          eyebrow="Atendimento municipal"
          title={`Dashboard de ${municipio.nome}`}
          description={`Acompanhe os riscos recebidos, em triagem, despachados e concluídos para ${municipio.nome}.`}
          actions={[
            <Button key="publico" variant="secondary" onClick={() => navigate("/")}>Abrir envio público</Button>,
            <Button key="central" onClick={() => navigate("/central")}>Ver central do PR</Button>,
          ]}
        />

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Solicitações" value={resumo.todos} hint="Total de alertas recebidos" />
          <StatCard label="Pendentes" value={resumo.pendente} hint="Aguardando análise" tone="warning" />
          <StatCard label="Concluídos" value={resumo.concluido} hint="Manejo encerrado" tone="success" />
          <StatCard label="Taxa de conclusão" value={`${taxaConclusao}%`} hint="Execução da equipe" />
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card title="Mapa de ocorrências" subtitle="Veja os pontos georreferenciados e o status de cada solicitação.">
            <MapView reports={reportes} center={municipio.coordenadas || [-24.9, -51.8]} zoom={13} height="420px" />
          </Card>

          <Card title="Fluxo de atendimento" subtitle="Filtre por etapa para priorizar o que precisa de ação.">
            <div className="mb-5 flex flex-wrap gap-2">
            <button
              onClick={() => setFiltro("todos")}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                filtro === "todos" ? "bg-forest text-white" : "bg-white text-gray-700 shadow-sm"
              }`}
            >
              Todos ({resumo.todos})
            </button>
            {Object.keys(STATUS).map((key) => (
              <button
                key={key}
                onClick={() => setFiltro(key)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  filtro === key ? "bg-forest text-white" : "bg-white text-gray-700 shadow-sm"
                }`}
              >
                {STATUS[key].label} ({resumo[key] || 0})
              </button>
            ))}
          </div>

            {reportesFiltrados.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                Nenhum alerta nessa categoria ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {reportesFiltrados.map((reporte) => (
                  <ReportCard
                    key={reporte.id}
                    reporte={reporte}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
