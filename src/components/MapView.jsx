import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { STATUS } from "../lib/reportes";

const markerColors = {
  pendente: "#6B7280",
  triagem: "#D97706",
  despachado: "#2563EB",
  concluido: "#16A34A",
};

function createIcon(status) {
  const color = markerColors[status] || markerColors.pendente;
  return L.divIcon({
    html: `<div style="background:${color};width:14px;height:14px;border-radius:9999px;border:3px solid white;box-shadow:0 0 0 2px ${color}33;"></div>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function formatarData(value) {
  if (!value) return "—";
  if (typeof value === "string") return new Date(value).toLocaleString("pt-BR");
  if (value?.toDate) return value.toDate().toLocaleString("pt-BR");
  return "—";
}

export default function MapView({ reports, center = [-24.9, -51.8], zoom = 7, height = "380px" }) {
  const validReports = (reports || []).filter((report) => {
    const lat = Number(report?.localizacao?.lat);
    const lng = Number(report?.localizacao?.lng);
    return Number.isFinite(lat) && Number.isFinite(lng);
  });

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-gray-200">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        {validReports.map((report) => {
          const statusInfo = STATUS[report.status] || STATUS.pendente;
          return (
            <Marker
              key={report.id}
              position={[Number(report.localizacao.lat), Number(report.localizacao.lng)]}
              icon={createIcon(report.status)}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-gray-900">{report.categoria || "Risco reportado"}</p>
                  <p className="text-gray-600">{report.descricao || "Sem descrição adicional"}</p>
                  <p className="text-xs text-gray-500">Status: {statusInfo.label}</p>
                  <p className="text-xs text-gray-500">Registrado em {formatarData(report.criadoEm)}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
