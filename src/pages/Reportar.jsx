import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ensureCitizenSession } from "../lib/auth";
import { criarReporte, CATEGORIAS } from "../lib/reportes";
import { MUNICIPIO_ID } from "../firebase";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const ETAPAS = {
  FORM: "form",
  ENVIANDO: "enviando",
  SUCESSO: "sucesso",
  ERRO: "erro",
};

export default function Reportar() {
  const navigate = useNavigate();
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-forest-light to-white px-4 py-8">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-2xl font-bold text-white">
            ✓
          </div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">Reporte enviado!</h1>
          <p className="mb-6 text-sm text-gray-600">
            Sua prefeitura recebeu o alerta e vai avaliar o risco. Obrigado por ajudar a manter sua cidade mais segura.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={novoReporte}>Enviar outro reporte</Button>
            <Button variant="secondary" onClick={() => navigate("/central")}>Ver métricas do Paraná</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(232,242,233,0.8),_transparent_50%)] px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row lg:items-start">
        <div className="w-full lg:max-w-sm">
          <div className="rounded-3xl border border-forest/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest">Árvore Segura</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Reporte de risco arbóreo em poucos passos</h1>
            <p className="mt-3 text-sm text-gray-600">
              Viu um galho, árvore ou tronco que oferece risco? Envie com foto, descrição e localização para agilizar o atendimento.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => navigate("/central")}>Ver central</Button>
              <Button size="sm" onClick={() => navigate("/login")}>Equipe municipal</Button>
            </div>
          </div>
        </div>

        <Card title="Novo reporte" subtitle="Sua contribuição ajuda a priorizar o manejo e a segurança da rua." className="w-full lg:flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Tipo de risco</label>
              <div className="space-y-2">
                {CATEGORIAS.map((c) => (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${
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
              <label className="mb-2 block text-sm font-semibold text-gray-800">Descreva o que você viu (opcional)</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                placeholder="Ex: galho grande pendendo sobre a calçada da Rua XV de Novembro"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-forest focus:outline-none"
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
                <img src={fotoPreview} alt="Pré-visualização" className="mt-3 h-40 w-full rounded-xl object-cover" />
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Localização</label>
              <Button type="button" variant="secondary" className="w-full" onClick={capturarGps}>
                {coords ? "Localização capturada ✓" : "Usar minha localização atual"}
              </Button>
              {coords && <p className="mt-1 text-xs text-gray-500">Lat {coords.lat.toFixed(5)}, Lng {coords.lng.toFixed(5)}</p>}
              {erroGps && <p className="mt-1 text-xs text-amber-600">{erroGps}</p>}
            </div>

            {erroMsg && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{erroMsg}</p>}

            <Button type="submit" className="w-full" disabled={etapa === ETAPAS.ENVIANDO}>
              {etapa === ETAPAS.ENVIANDO ? "Enviando…" : "Enviar reporte"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
