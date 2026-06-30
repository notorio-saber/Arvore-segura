import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ensureCitizenSession } from "../lib/auth";
import { criarReporte, CATEGORIAS } from "../lib/reportes";
import { MUNICIPIO_ID } from "../firebase";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const ETAPAS = {
  INTRO: "intro",
  TIPO: "tipo",
  DESCRICAO: "descricao",
  FOTO: "foto",
  LOCALIZACAO: "localizacao",
  ENVIANDO: "enviando",
  SUCESSO: "sucesso",
  ERRO: "erro",
};

const ETAPA_ORDEM = [ETAPAS.INTRO, ETAPAS.TIPO, ETAPAS.DESCRICAO, ETAPAS.FOTO, ETAPAS.LOCALIZACAO];

export default function Reportar() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(ETAPAS.INTRO);
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
    setEtapa(ETAPAS.INTRO);
    setCategoria("");
    setDescricao("");
    setFoto(null);
    setFotoPreview(null);
    setCoords(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function avancarEtapa() {
    const indexAtual = ETAPA_ORDEM.indexOf(etapa);
    if (indexAtual < ETAPA_ORDEM.length - 1) {
      setEtapa(ETAPA_ORDEM[indexAtual + 1]);
    }
  }

  function voltarEtapa() {
    const indexAtual = ETAPA_ORDEM.indexOf(etapa);
    if (indexAtual > 0) {
      setEtapa(ETAPA_ORDEM[indexAtual - 1]);
    }
  }

  function renderHeader(title, subtitle) {
    return (
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest">Árvore Segura</p>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
        <div className="rounded-full bg-forest-light px-3 py-1 text-sm font-semibold text-forest">
          {ETAPA_ORDEM.indexOf(etapa) + 1}/{ETAPA_ORDEM.length}
        </div>
      </div>
    );
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
    <div className="flex h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(232,242,233,0.8),_transparent_50%)] px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-forest/10 bg-white/95 p-3 shadow-xl backdrop-blur sm:p-5 lg:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Árvore Segura" className="h-10 w-10 rounded-2xl object-cover" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Árvore Segura</p>
              <p className="text-sm text-gray-500">Coleta em campo</p>
            </div>
          </div>
          <div className="rounded-full bg-forest-light px-3 py-1 text-sm font-semibold text-forest">
            {ETAPA_ORDEM.indexOf(etapa) + 1}/{ETAPA_ORDEM.length}
          </div>
        </div>

        {renderHeader(
          etapa === ETAPAS.INTRO
            ? "Registro de risco"
            : etapa === ETAPAS.TIPO
            ? "Qual é o tipo de risco?"
            : etapa === ETAPAS.DESCRICAO
            ? "Descreva o que você viu"
            : etapa === ETAPAS.FOTO
            ? "Adicione uma foto"
            : "Confirme a localização",
          etapa === ETAPAS.INTRO
            ? "Uma experiência guiada para registrar ocorrências de forma simples e rápida."
            : "Responda cada item em sequência para concluir o registro."
        )}

        {etapa === ETAPAS.INTRO && (
          <div className="grid flex-1 gap-6 overflow-hidden lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex rounded-full bg-forest-light px-3 py-1 text-sm font-semibold text-forest">
                Coleta em campo
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Registre rapidamente qualquer risco arbóreo</h2>
              <p className="mt-3 text-base text-gray-600">
                O fluxo foi pensado para ser claro, rápido e intuitivo, com uma tela por informação e uma experiência próxima à coleta em campo.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => setEtapa(ETAPAS.TIPO)}>Começar registro</Button>
                <Button variant="secondary" onClick={() => navigate("/central")}>Ver métricas do Paraná</Button>
              </div>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-forest-light to-white p-6">
              <h3 className="font-semibold text-gray-900">Como funciona</h3>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li>• Escolha o tipo de risco</li>
                <li>• Descreva o que foi observado</li>
                <li>• Anexe uma foto</li>
                <li>• Confirme a localização</li>
              </ul>
            </div>
          </div>
        )}

        {(etapa === ETAPAS.TIPO || etapa === ETAPAS.DESCRICAO || etapa === ETAPAS.FOTO || etapa === ETAPAS.LOCALIZACAO) && (
          <div className="flex-1 overflow-auto rounded-3xl border border-gray-200 bg-white p-4 sm:p-6">
            <form onSubmit={async (e) => {
              if (etapa === ETAPAS.LOCALIZACAO) {
                await handleSubmit(e);
              } else {
                e.preventDefault();
                avancarEtapa();
              }
            }} className="space-y-5">
              {etapa === ETAPAS.TIPO && (
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-800">Selecione o tipo de risco</label>
                  <div className="space-y-2">
                    {CATEGORIAS.map((c) => (
                      <label
                        key={c.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 text-sm ${
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
              )}

              {etapa === ETAPAS.DESCRICAO && (
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-800">Descreva o que você viu</label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={5}
                    placeholder="Ex: galho grande pendendo sobre a calçada da Rua XV de Novembro"
                    className="w-full rounded-2xl border border-gray-200 px-3 py-3 text-sm focus:border-forest focus:outline-none"
                  />
                </div>
              )}

              {etapa === ETAPAS.FOTO && (
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-800">Anexe uma foto do risco</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFoto}
                    className="block w-full text-sm text-gray-600"
                  />
                  {fotoPreview && (
                    <img src={fotoPreview} alt="Pré-visualização" className="mt-4 h-56 w-full rounded-2xl object-cover" />
                  )}
                </div>
              )}

              {etapa === ETAPAS.LOCALIZACAO && (
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-800">Confirme a localização</label>
                  <Button type="button" variant="secondary" className="w-full" onClick={capturarGps}>
                    {coords ? "Localização capturada ✓" : "Usar minha localização atual"}
                  </Button>
                  {coords && <p className="mt-2 text-sm text-gray-500">Lat {coords.lat.toFixed(5)}, Lng {coords.lng.toFixed(5)}</p>}
                  {erroGps && <p className="mt-2 text-sm text-amber-600">{erroGps}</p>}
                </div>
              )}

              {erroMsg && <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{erroMsg}</p>}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                <Button type="button" variant="secondary" onClick={voltarEtapa}>
                  Voltar
                </Button>
                {etapa === ETAPAS.LOCALIZACAO ? (
                  <Button type="submit" disabled={etapa === ETAPAS.ENVIANDO}>
                    {etapa === ETAPAS.ENVIANDO ? "Enviando…" : "Enviar reporte"}
                  </Button>
                ) : (
                  <Button type="submit" disabled={etapa === ETAPAS.TIPO && !categoria}>
                    Continuar
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}

        {etapa === ETAPAS.ENVIANDO && (
          <div className="flex flex-1 items-center justify-center rounded-3xl border border-gray-200 bg-gray-50 p-8 text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-forest text-2xl font-bold text-white flex items-center justify-center">
              •
            </div>
            <h2 className="text-xl font-bold text-gray-900">Enviando registro…</h2>
            <p className="mt-2 text-sm text-gray-600">Aguarde enquanto o alerta é registrado com segurança.</p>
          </div>
        )}

        {etapa === ETAPAS.ERRO && (
          <div className="flex flex-1 items-center justify-center rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-xl font-bold text-red-700">Não foi possível concluir</h2>
            <p className="mt-2 text-sm text-red-600">Tente novamente ou revise os dados informados.</p>
            <div className="mt-5 flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setEtapa(ETAPAS.LOCALIZACAO)}>Tentar novamente</Button>
              <Button onClick={novoReporte}>Recomeçar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
