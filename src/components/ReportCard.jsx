import StatusBadge from "./StatusBadge";
import { CATEGORIAS, STATUS } from "../lib/reportes";

function formatarData(timestamp) {
  if (!timestamp) return "—";
  if (typeof timestamp === "string") return new Date(timestamp).toLocaleString("pt-BR");
  if (timestamp?.toDate) return timestamp.toDate().toLocaleString("pt-BR");
  return "—";
}

export default function ReportCard({ reporte, onStatusChange }) {
  const categoriaLabel =
    CATEGORIAS.find((c) => c.id === reporte.categoria)?.label || reporte.categoria;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">
      {reporte.fotoUrl ? (
        <img
          src={reporte.fotoUrl}
          alt="Foto do risco reportado"
          className="h-32 w-full rounded-xl object-cover sm:h-28 sm:w-40"
        />
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400 sm:h-28 sm:w-40">
          Sem foto
        </div>
      )}

      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900">{categoriaLabel}</h3>
          <StatusBadge status={reporte.status} />
        </div>

        {reporte.descricao && <p className="mt-1 text-sm text-gray-600">{reporte.descricao}</p>}

        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
          <span>Reportado em {formatarData(reporte.criadoEm)}</span>
          {typeof reporte.localizacao?.lat === "number" && (
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href={`https://www.google.com/maps?q=${reporte.localizacao.lat},${reporte.localizacao.lng}`}
            >
              Ver no mapa
            </a>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {Object.keys(STATUS).map((key) => (
            <button
              key={key}
              onClick={() => onStatusChange(reporte.id, key)}
              disabled={reporte.status === key}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                reporte.status === key
                  ? "cursor-default bg-forest text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {STATUS[key].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
