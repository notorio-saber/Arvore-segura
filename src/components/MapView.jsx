import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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
  const svgIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="14" height="14">' +
    '<path d="M12 2C9.243 2 7 4.243 7 7c0 1.816.96 3.415 2.427 4.292A4.5 4.5 0 0 0 8.5 16.5c0 1.337.538 2.544 1.403 3.403L10 22h4l.097-.097A4.5 4.5 0 0 0 15.5 16.5a4.5 4.5 0 0 0-1.927-5.208C16.04 10.415 17 8.816 17 7c0-2.757-2.243-5-5-5zm-1 14.5a1.5 1.5 0 0 1 3 0V18h-3v-1.5z"/>';
  return L.divIcon({
    html:
      '<div style="background:' +
      color +
      ';width:22px;height:22px;border-radius:9999px;border:3px solid white;box-shadow:0 0 0 3px ' +
      color +
      '33;display:flex;align-items:center;justify-content:center;">' +
      svgIcon +
      '</div>',
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

function formatarData(value) {
  if (!value) return "—";
  if (typeof value === "string") return new Date(value).toLocaleString("pt-BR");
  if (value?.toDate) return value.toDate().toLocaleString("pt-BR");
  return "—";
}

function MapController({ center, zoom }) {
  const map = useMap();

  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [map, center, zoom]);

  return null;
}

export default function MapView({ reports, center = [-24.9, -51.8], zoom = 7, height = "380px" }) {
  const validReports = (reports || []).filter((report) => {
    const lat = Number(report?.localizacao?.lat);
    const lng = Number(report?.localizacao?.lng);
    return Number.isFinite(lat) && Number.isFinite(lng);
  });

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-gray-200">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false}>
        <MapController center={center} zoom={zoom} />
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
                <div className="space-y-3 text-sm">
                  <p className="font-semibold text-gray-900">{report.categoria || "Risco reportado"}</p>
                  <p className="text-gray-600">{report.descricao || "Sem descrição adicional"}</p>
                  <p className="text-xs text-gray-500">Status: {statusInfo.label}</p>
                  <p className="text-xs text-gray-500">Registrado em {formatarData(report.criadoEm)}</p>
                  <a
                    className="inline-flex rounded-full bg-forest px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-forest-dark"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${Number(report.localizacao.lat)},${Number(report.localizacao.lng)}`}
                  >
                    Obter rota
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
