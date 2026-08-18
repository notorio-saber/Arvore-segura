import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { obterMetricasGerais } from "../lib/reportes";
import { MUNICIPIOS } from "../lib/municipios";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import MapView from "../components/MapView";

export default function Central() {
  const [reports, setReports] = useState([]);
  const [buscaInput, setBuscaInput] = useState("");
  const [termoBuscado, setTermoBuscado] = useState("");
  const [mapCenter, setMapCenter] = useState([-24.9, -51.8]);
  const [mapZoom, setMapZoom] = useState(6);
  const municipios = useMemo(() => obterMetricasGerais(MUNICIPIOS), []);

  useEffect(() => {
    function carregarReports() {
      const all = [];
      MUNICIPIOS.forEach((municipio) => {
        const data = window.localStorage.getItem(`arvore-segura:reportes:${municipio.id}`);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            all.push(...parsed);
          } catch {
            // ignore
          }
        }
      });
      setReports(all);
    }

    carregarReports();
    window.addEventListener("arvore-segura-storage", carregarReports);
    return () => window.removeEventListener("arvore-segura-storage", carregarReports);
  }, []);

  const totalSolicitacoes = municipios.reduce((acc, item) => acc + item.total, 0);
  const totalConcluidas = municipios.reduce((acc, item) => acc + item.concluido, 0);
  const taxaMedia = totalSolicitacoes === 0 ? 0 : Math.round((totalConcluidas / totalSolicitacoes) * 100);

  const municipiosFiltrados = useMemo(() => {
    const termo = termoBuscado.trim().toLowerCase();
    if (!termo) return municipios;
    return municipios.filter((municipio) => municipio.nome.toLowerCase().includes(termo));
  }, [municipios, termoBuscado]);

  function handleSearch() {
    setTermoBuscado(buscaInput);
    const termo = buscaInput.trim().toLowerCase();
    
    if (termo) {
      const matches = municipios.filter((municipio) => municipio.nome.toLowerCase().includes(termo));
      if (matches.length > 0) {
        const target = matches.find((m) => m.coordenadas);
        if (target) {
          setMapCenter(target.coordenadas);
          setMapZoom(11);
        }
      }
    } else {
      setMapCenter([-24.9, -51.8]);
      setMapZoom(6);
    }
  }

  const topSolicitacoes = [...municipiosFiltrados].sort((a, b) => b.total - a.total).slice(0, 3);
  const topManejo = [...municipiosFiltrados].sort((a, b) => b.concluido - a.concluido).slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 px-4 py-8 text-gray-900">
      <div className="mx-auto flex w-full max-w-7xl flex-1 min-h-0 flex-col overflow-auto">
        <PageHeader
          eyebrow="Operação Paraná"
          title="Central de métricas por prefeitura"
          description="Acompanhe o volume de solicitações e a execução de manejo arbóreo em cada município do Paraná."
          actions={[
            <Link key="novo" to="/">
              <Button variant="secondary">Abrir envio público</Button>
            </Link>,
            <Link key="painel" to="/login">
              <Button>Entrar como equipe</Button>
            </Link>,
          ]}
        />

        <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          
          {/* Coluna Esquerda: MAPA (Fixo) */}
          <div className="flex flex-col gap-4 lg:h-[calc(100vh-8rem)] lg:sticky lg:top-8">
             <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col h-full">
               <div className="mb-4">
                 <h3 className="text-base font-semibold text-gray-900">Mapa estadual das ocorrências</h3>
                 <p className="mt-1 text-sm text-gray-500">Visão consolidada de todas as solicitações.</p>
               </div>
               <div className="flex-1 min-h-[400px] rounded-xl overflow-hidden">
                 <MapView reports={reports} center={mapCenter} zoom={mapZoom} height="100%" />
               </div>
             </div>
          </div>

          {/* Coluna Direita: Conteúdo Rola Normalmente */}
          <div className="flex flex-col gap-6">
            
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <label className="mb-2 block text-sm font-semibold text-gray-800">Pesquisar município</label>
              <div className="flex gap-2">
                <input
                  value={buscaInput}
                  onChange={(e) => setBuscaInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Digite o nome da cidade..."
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-forest focus:outline-none"
                />
                <Button onClick={handleSearch}>Buscar</Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Registradas" value={totalSolicitacoes} hint="Total acumulado" />
              <StatCard label="Concluídos" value={totalConcluidas} hint="Ações finalizadas" tone="success" />
              <StatCard label="Efetividade" value={`${taxaMedia}%`} hint="Índice de execução" tone="warning" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Card title="Ranking (Solicitações)" subtitle="Maior demanda registrada.">
                <div className="space-y-3 mt-2">
                  {topSolicitacoes.map((municipio, index) => (
                    <div key={municipio.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                      <div>
                        <p className="font-semibold text-gray-900">#{index + 1} {municipio.nome}</p>
                        <p className="text-xs text-gray-500">{municipio.regiao}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-forest">{municipio.total}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Ranking (Manejos)" subtitle="Maior execução da prefeitura.">
                <div className="space-y-3 mt-2">
                  {topManejo.map((municipio, index) => (
                    <div key={municipio.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                      <div>
                        <p className="font-semibold text-gray-900">#{index + 1} {municipio.nome}</p>
                        <p className="text-xs text-gray-500">{municipio.regiao}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-forest">{municipio.concluido}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card title="Visão detalhada por município" subtitle="Acesse o dashboard de cada prefeitura para acompanhar os riscos.">
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                {municipiosFiltrados.map((municipio) => (
                  <div 
                    key={municipio.id} 
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      if (municipio.coordenadas) {
                        setMapCenter(municipio.coordenadas);
                        setMapZoom(13);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{municipio.nome}</h3>
                        <p className="text-xs text-gray-500">{municipio.regiao}</p>
                      </div>
                      <span className="rounded-full bg-forest-light px-2.5 py-1 text-[10px] font-semibold text-forest">{municipio.populacao}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-white p-2 shadow-sm text-center">
                        <p className="text-gray-500 text-xs">Avisos</p>
                        <p className="mt-1 text-base font-bold text-gray-900">{municipio.total}</p>
                      </div>
                      <div className="rounded-xl bg-white p-2 shadow-sm text-center">
                        <p className="text-gray-500 text-xs">Concluídos</p>
                        <p className="mt-1 text-base font-bold text-forest">{municipio.concluido}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
                      <span>Conclusão: <strong>{municipio.taxaConclusao}%</strong></span>
                      <Link to={`/painel/${municipio.id}`} onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">Dashboard</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
