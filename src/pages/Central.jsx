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
  const [busca, setBusca] = useState("");
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
    const termo = busca.trim().toLowerCase();
    if (!termo) return municipios;
    return municipios.filter((municipio) => municipio.nome.toLowerCase().includes(termo));
  }, [municipios, busca]);

  const topSolicitacoes = [...municipiosFiltrados].sort((a, b) => b.total - a.total).slice(0, 3);
  const topManejo = [...municipiosFiltrados].sort((a, b) => b.concluido - a.concluido).slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 px-4 py-8 text-gray-900">
      <div className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col overflow-auto">
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

        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-gray-800">Pesquisar município</label>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite o nome da cidade"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-forest focus:outline-none"
          />
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <StatCard label="Solicitações registradas" value={totalSolicitacoes} hint="Total acumulado entre as prefeituras" />
          <StatCard label="Manejos concluídos" value={totalConcluidas} hint="Ações finalizadas até o momento" tone="success" />
          <StatCard label="Taxa média de conclusão" value={`${taxaMedia}%`} hint="Índice geral de execução" tone="warning" />
        </div>

        <div className="mb-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card title="Ranking por volume de solicitações" subtitle="Municípios com maior demanda registrada.">
            <div className="space-y-3">
              {topSolicitacoes.map((municipio, index) => (
                <div key={municipio.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                  <div>
                    <p className="font-semibold text-gray-900">#{index + 1} {municipio.nome}</p>
                    <p className="text-sm text-gray-500">{municipio.regiao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-forest">{municipio.total}</p>
                    <p className="text-xs text-gray-500">solicitações</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Ranking por manejo realizado" subtitle="Prefeituras com maior execução de atendimento.">
            <div className="space-y-3">
              {topManejo.map((municipio, index) => (
                <div key={municipio.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                  <div>
                    <p className="font-semibold text-gray-900">#{index + 1} {municipio.nome}</p>
                    <p className="text-sm text-gray-500">{municipio.regiao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-forest">{municipio.concluido}</p>
                    <p className="text-xs text-gray-500">concluídos</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="Mapa estadual das ocorrências" subtitle="Todos os pontos georreferenciados do Paraná em uma visão consolidada.">
          <MapView reports={reports} center={[-24.9, -51.8]} zoom={6} height="320px" />
        </Card>

        <div className="mt-4 flex-1 overflow-auto">
          <Card title="Visão detalhada por município" subtitle="Acesse o dashboard de cada prefeitura para acompanhar os riscos em andamento.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {municipiosFiltrados.map((municipio) => (
              <div key={municipio.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{municipio.nome}</h3>
                    <p className="text-sm text-gray-500">{municipio.regiao}</p>
                  </div>
                  <span className="rounded-full bg-forest-light px-2.5 py-1 text-xs font-semibold text-forest">{municipio.populacao}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-gray-500">Solicitações</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">{municipio.total}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-gray-500">Concluídos</p>
                    <p className="mt-1 text-lg font-bold text-forest">{municipio.concluido}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span>Taxa de conclusão: <strong>{municipio.taxaConclusao}%</strong></span>
                  <Link to={`/painel/${municipio.id}`}>
                    <Button variant="ghost" size="sm">Abrir dashboard</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
