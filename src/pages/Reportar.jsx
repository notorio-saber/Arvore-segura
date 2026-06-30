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

  const etapaIndex = ETAPA_ORDEM.indexOf(etapa);
  const headerTitle =
    etapa === ETAPAS.INTRO
      ? "Registro de risco"
      : etapa === ETAPAS.TIPO
      ? "Qual é o tipo de risco?"
      : etapa === ETAPAS.DESCRICAO
      ? "Descreva o que você viu"
      : etapa === ETAPAS.FOTO
      ? "Adicione uma foto"
      : "Confirme a localização";

  const headerSubtitle =
    etapa === ETAPAS.INTRO
      ? "Uma experiência guiada para registrar ocorrências de forma simples e rápida."
      : "Responda cada item em sequência para concluir o registro.";

  function renderHeader(title, subtitle) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Árvore Segura</p>
            <h1 className="mt-1 text-xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
          </div>
          <div className="inline-flex items-center rounded-full bg-forest-light px-3 py-1.5 text-sm font-semibold text-forest shadow-sm">
            Etapa {etapaIndex + 1} de {ETAPA_ORDEM.length}
          </div>
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
          <div className="flex flex-col gap-3">
            <Button onClick={novoReporte}>Enviar outro reporte</Button>
            <Button variant="secondary" onClick={() => navigate("/central")}>Ver métricas do Paraná</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(232,242,233,0.8),_transparent_50%)] px-3 py-6 sm:px-4 sm:py-8 md:overflow-auto">
      <div className="flex w-full max-w-5xl min-h-0 flex-col gap-6 rounded-[32px] border border-forest/10 bg-white/95 p-3 shadow-xl backdrop-blur sm:p-5 lg:p-6 md:h-auto">
        {etapa !== ETAPAS.INTRO && (
          <div className="flex flex-col gap-4 rounded-3xl bg-forest-light/40 p-5">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo Árvore Segura" className="h-10 w-10 rounded-2xl object-cover" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Árvore Segura</p>
                <p className="text-sm text-gray-500">Coleta em campo</p>
              </div>
            </div>
            {renderHeader(headerTitle, headerSubtitle)}
          </div>
        )}

        {etapa === ETAPAS.INTRO ? (
          <div className="flex flex-col items-center justify-center gap-8 text-center py-12">
            <img src="/logo.png" alt="Logo Árvore Segura" className="mx-auto h-24 w-24 rounded-3xl bg-white p-3 shadow-sm" />
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest">Árvore Segura</p>
              <h2 className="text-3xl font-bold text-gray-900">Registre rapidamente qualquer risco arbóreo</h2>
              <p className="text-sm text-gray-600">5 passos e menos de 1 minuto para enviar um alerta.</p>
              <p className="text-xs text-gray-500">Teste de commit: alteração visível no app.</p>
            </div>
            <Button className="w-full max-w-xs mx-auto" onClick={() => setEtapa(ETAPAS.TIPO)}>
              Registrar risco
            </Button>
          </div>
        ) : etapa === ETAPAS.ENVIANDO ? (
          <Card className="min-h-[360px] flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-2xl font-bold text-white">
                •
              </div>
              <h2 className="text-xl font-bold text-gray-900">Enviando registro…</h2>
              <p className="mt-2 text-sm text-gray-600">Aguarde enquanto o alerta é registrado com segurança.</p>
            </div>
          </Card>
        ) : etapa === ETAPAS.ERRO ? (
          <Card className="min-h-[360px] text-center">
            <h2 className="text-xl font-bold text-red-700">Não foi possível concluir</h2>
            <p className="mt-2 text-sm text-red-600">Tente novamente ou revise os dados informados.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="secondary" onClick={() => setEtapa(ETAPAS.LOCALIZACAO)}>Tentar novamente</Button>
              <Button onClick={novoReporte}>Recomeçar</Button>
            </div>
          </Card>
        ) : (
          <Card className="min-h-[380px]">
            <form
              onSubmit={async (e) => {
                if (etapa === ETAPAS.LOCALIZACAO) {
                  await handleSubmit(e);
                } else {
                  e.preventDefault();
                  avancarEtapa();
                }
              }}
              className="space-y-6"
            >
              {etapa === ETAPAS.TIPO && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">Selecione o tipo de risco</label>
                  <div className="space-y-3">
                    {CATEGORIAS.map((c) => (
                      <label
                        key={c.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 text-sm transition ${
                          categoria === c.id
                            ? "border-forest bg-forest-light font-semibold text-forest"
                            : "border-gray-200 bg-white text-gray-700"
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
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">Descreva o que você viu</label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={5}
                    placeholder="Ex: galho grande pendendo sobre a calçada da Rua XV de Novembro"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm leading-6 text-gray-800 focus:border-forest focus:outline-none"
                  />
                </div>
              )}

              {etapa === ETAPAS.FOTO && (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-800">Tire uma foto com a câmera</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFoto}
                    className="block w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 focus:border-forest focus:outline-none"
                  />
                  {fotoPreview && (
                    <img src={fotoPreview} alt="Pré-visualização" className="mt-2 h-56 w-full rounded-2xl object-cover" />
                  )}
                </div>
              )}

              {etapa === ETAPAS.LOCALIZACAO && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Fique próximo da árvore e marque a posição</label>
                    <Button type="button" variant="secondary" className="w-full" onClick={capturarGps}>
                      Clique aqui para marcar a localização
                    </Button>
                  </div>
                  {coords && <p className="text-sm text-gray-500">Lat {coords.lat.toFixed(5)}, Lng {coords.lng.toFixed(5)}</p>}
                  {erroGps && <p className="text-sm text-amber-600">{erroGps}</p>}
                </div>
              )}

              {erroMsg && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{erroMsg}</p>}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                <Button type="button" variant="secondary" onClick={voltarEtapa}>
                  Voltar
                </Button>
                <Button type="submit" disabled={etapa === ETAPAS.TIPO && !categoria}>
                  {etapa === ETAPAS.LOCALIZACAO ? (etapa === ETAPAS.ENVIANDO ? "Enviando…" : "Enviar reporte") : "Continuar"}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
