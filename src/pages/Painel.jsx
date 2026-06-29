import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { staffLogout } from "../lib/auth";
import { escutarReportes, atualizarStatus, STATUS } from "../lib/reportes";
import ReportCard from "../components/ReportCard.jsx";

export default function Painel() {
  const { staff } = useAuth();
  const navigate = useNavigate();
  const [reportes, setReportes] = useState([]);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    if (!staff?.municipioId) return;
    const unsub = escutarReportes(staff.municipioId, setReportes);
    return unsub;
  }, [staff]);

  const reportesFiltrados = useMemo(() => {
    if (filtro === "todos") return reportes;
    return reportes.filter((r) => r.status === filtro);
  }, [reportes, filtro]);

  const contagem = useMemo(() => {
    const base = { todos: reportes.length };
    Object.keys(STATUS).forEach((key) => {
      base[key] = reportes.filter((r) => r.status === key).length;
    });
    return base;
  }, [reportes]);

  async function handleStatusChange(reporteId, novoStatus) {
    await atualizarStatus(staff.municipioId, reporteId, novoStatus);
  }

  async function handleLogout() {
    await staffLogout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between bg-forest px-6 py-4 text-white">
        <div>
          <h1 className="text-lg font-extrabold">Árvore Segura — Painel municipal</h1>
          <p className="text-xs text-forest-light">{staff?.nome || staff?.municipioId}</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-forest-dark px-3 py-1.5 text-sm font-semibold hover:bg-black/20"
        >
          Sair
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            onClick={() => setFiltro("todos")}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              filtro === "todos" ? "bg-forest text-white" : "bg-white text-gray-700 shadow-sm"
            }`}
          >
            Todos ({contagem.todos})
          </button>
          {Object.keys(STATUS).map((key) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                filtro === key ? "bg-forest text-white" : "bg-white text-gray-700 shadow-sm"
              }`}
            >
              {STATUS[key].label} ({contagem[key] || 0})
            </button>
          ))}
        </div>

        {reportesFiltrados.length === 0 ? (
          <p className="rounded-xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            Nenhum reporte nessa categoria ainda.
          </p>
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
      </main>
    </div>
  );
}
