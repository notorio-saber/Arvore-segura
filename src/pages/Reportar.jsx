import { useState, useRef } from "react";
import { ensureCitizenSession } from "../lib/auth";
import { criarReporte, CATEGORIAS } from "../lib/reportes";
import { MUNICIPIO_ID } from "../firebase";

const ETAPAS = {
  FORM: "form",
  ENVIANDO: "enviando",
  SUCESSO: "sucesso",
  ERRO: "erro",
};

export default function Reportar() {
  const [etapa, setEtapa] = useState(ETAPAS.FORM);
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [coords, setCoords] = useState(null);
  const [erroGps, setErroGps] = useState("");
  const [erroMsg, setErroMsg] = useState("");
  const fileInputRef = useRef(null);

  function handleFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  function capturarGps() {
    setErroGps("");
    if (!navigator.geolocation) {
      setErroGps("Seu navegador não suporta localização. Você ainda pode enviar o reporte sem o ponto exato.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setErroGps("Não foi possível obter sua localização. Verifique a permissão de GPS do navegador.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!categoria) {
      setErroMsg("Selecione o tipo de risco antes de enviar.");
      return;
    }
    setErroMsg("");
    setEtapa(ETAPAS.ENVIANDO);
    try {
      const user = await ensureCitizenSession();
      await criarReporte(
        MUNICIPIO_ID,
        {
          categoria,
          descricao,
          foto,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
        },
        user.uid
      );
      setEtapa(ETAPAS.SUCESSO);
    } catch (err) {
      console.error(err);
      setErroMsg(err.message || "Não foi possível enviar o reporte. Tente novamente.");
      setEtapa(ETAPAS.ERRO);
    }
  }

  function novoReporte() {
    setEtapa(ETAPAS.FORM);
    setCategoria("");
    setDescricao("");
    setFoto(null);
    setFotoPreview(null);
    setCoords(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (etapa === ETAPAS.SUCESSO) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest-light px-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-2xl font-bold text-white">
            ✓
          </div>
          <h1 className="mb-2 text-xl font-bold text-forest">Reporte enviado!</h1>
          <p className="mb-6 text-sm text-gray-600">
            Sua prefeitura recebeu o alerta e vai avaliar o risco. Obrigado por ajudar a manter sua
            cidade mais segura.
          </p>
          <button
            onClick={novoReporte}
            className="rounded-lg bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-dark"
          >
            Enviar outro reporte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-md">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-forest">Árvore Segura</h1>
          <p className="mt-1 text-sm text-gray-600">
            Viu um galho, árvore ou tronco que oferece risco? Reporte em menos de 1 minuto.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Tipo de risco
            </label>
            <div className="space-y-2">
              {CATEGORIAS.map((c) => (
                <label
                  key={c.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${
                    categoria === c.id
                      ? "border-forest bg-forest-light font-semibold text-forest"
                      : "border-gray-200 text-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="categoria"
                    value={c.id}
                    checked={categoria === c.id}
                    onChange={() => setCategoria(c.id)}
                    className="accent-forest"
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Descreva o que você viu (opcional)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              placeholder="Ex: galho grande pendendo sobre a calçada da Rua XV de Novembro"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-forest focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">Foto</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFoto}
              className="block w-full text-sm text-gray-600"
            />
            {fotoPreview && (
              <img
                src={fotoPreview}
                alt="Pré-visualização"
                className="mt-3 h-40 w-full rounded-lg object-cover"
              />
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">Localização</label>
            <button
              type="button"
              onClick={capturarGps}
              className="w-full rounded-lg border border-forest px-3 py-2.5 text-sm font-semibold text-forest hover:bg-forest-light"
            >
              {coords ? "Localização capturada ✓" : "Usar minha localização atual"}
            </button>
            {coords && (
              <p className="mt-1 text-xs text-gray-500">
                Lat {coords.lat.toFixed(5)}, Lng {coords.lng.toFixed(5)}
              </p>
            )}
            {erroGps && <p className="mt-1 text-xs text-amber-600">{erroGps}</p>}
          </div>

          {erroMsg && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erroMsg}</p>
          )}

          <button
            type="submit"
            disabled={etapa === ETAPAS.ENVIANDO}
            className="w-full rounded-lg bg-forest px-4 py-3 text-sm font-bold text-white hover:bg-forest-dark disabled:opacity-60"
          >
            {etapa === ETAPAS.ENVIANDO ? "Enviando…" : "Enviar reporte"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          <a href="/login" className="underline">
            Acesso da equipe municipal
          </a>
        </p>
      </div>
    </div>
  );
}
