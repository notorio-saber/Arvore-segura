import StatusBadge from "./StatusBadge";
import { CATEGORIAS, STATUS } from "../lib/reportes";

function formatarData(timestamp) {
  if (!timestamp) return "—";
  if (typeof timestamp === "string") return new Date(timestamp).toLocaleString("pt-BR");
  if (timestamp?.toDate) return timestamp.toDate().toLocaleString("pt-BR");
  return "—";
}

export default function ReportCard({ reporte, onStatusChange, onToggleAuc, onSelect }) {
  const categoriaLabel =
    CATEGORIAS.find((c) => c.id === reporte.categoria)?.label || reporte.categoria;

  return (
    <div 
      className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row cursor-pointer transition-colors hover:bg-gray-50"
      onClick={onSelect}
    >
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
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{categoriaLabel}</h3>
            {reporte.precisaAuc && (
              <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">Requer AUC</span>
            )}
          </div>
          <StatusBadge status={reporte.status} />
        </div>

        {reporte.descricao && <p className="mt-1 text-sm text-gray-600">{reporte.descricao}</p>}

        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
          <span>Reportado em {formatarData(reporte.criadoEm)}</span>
          {typeof reporte.localizacao?.lat === "number" && (
            <> 
              <a
                className="underline"
                target="_blank"
                rel="noreferrer"
                href={`https://www.google.com/maps?q=${reporte.localizacao.lat},${reporte.localizacao.lng}`}
                onClick={(e) => e.stopPropagation()}
              >
                Ver no mapa
              </a>
              <a
                className="underline"
                target="_blank"
                rel="noreferrer"
                href={`https://www.google.com/maps/dir/?api=1&destination=${reporte.localizacao.lat},${reporte.localizacao.lng}`}
                onClick={(e) => e.stopPropagation()}
              >
                Obter rota
              </a>
            </>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 items-center">
          {Object.keys(STATUS).map((key) => (
            <button
              key={key}
              onClick={(e) => { e.stopPropagation(); onStatusChange?.(reporte.id, key); }}
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
          {onToggleAuc && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleAuc(reporte.id, !!reporte.precisaAuc); }}
              className={`rounded-full px-3 py-1 text-xs font-semibold ml-auto border transition-colors ${
                reporte.precisaAuc 
                  ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {reporte.precisaAuc ? "Desmarcar AUC" : "Marcar necessidade de AUC"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
