
import React, { useState, useMemo } from 'react';
import { getTradings, getItems } from '../services/db';
import { Trading, Competition, Market, Method, MethodExecution } from '../types';
import Card from '../components/ui/Card';

const Reports: React.FC = () => {
  const [filters, setFilters] = useState({
    period: 'all',
    competition: 'all',
    market: 'all',
    method: 'all',
  });

  const allTradings = useMemo(() => getTradings().filter(t => t.operar && t.concluido), []);
  const competitions = useMemo(() => getItems('competitions'), []);
  const markets = useMemo(() => getItems('markets'), []);
  const methods = useMemo(() => getItems('methods'), []);

  const filteredTradings = useMemo(() => {
    return allTradings.filter(t => {
      if (filters.competition !== 'all' && t.id_competicao !== filters.competition) return false;
      if (filters.market !== 'all' && !t.methodExecutions?.some(exec => exec.marketId === filters.market)) return false;
      if (filters.method !== 'all' && !t.methodExecutions?.some(exec => exec.methodId === filters.method)) return false;
      // TODO: Add period filter logic
      return true;
    });
  }, [allTradings, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculateStats = (executions: MethodExecution[]) => {
    if (executions.length === 0) {
      return { profit: 0, roi: 0, winRate: 0, count: 0 };
    }
    const profit = executions.reduce((acc, ex) => acc + (ex.resultado_financeiro || 0), 0);
    const totalStake = executions.reduce((acc, ex) => acc + (ex.stake || 0), 0);
    const wins = executions.filter(ex => (ex.resultado_financeiro || 0) > 0).length;
    const roi = totalStake > 0 ? (profit / totalStake) * 100 : 0;
    const winRate = executions.length > 0 ? (wins / executions.length) * 100 : 0;
    return { profit, roi, winRate, count: executions.length };
  };

  const allFilteredExecutions = filteredTradings.flatMap(t => t.methodExecutions || []);
  const generalStats = calculateStats(allFilteredExecutions);

  const renderStatsGroup = (title: string, data: { label: string; stats: ReturnType<typeof calculateStats> }[]) => (
    <Card title={title}>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 text-left">Item</th>
              <th className="py-2 px-4 text-right">Execuções</th>
              <th className="py-2 px-4 text-right">Lucro/Prejuízo</th>
              <th className="py-2 px-4 text-right">ROI</th>
              <th className="py-2 px-4 text-right">Taxa de Acerto</th>
            </tr>
          </thead>
          <tbody>
            {data.map(({ label, stats }) => (
              <tr key={label} className="border-b">
                <td className="py-2 px-4 font-medium">{label}</td>
                <td className="py-2 px-4 text-right">{stats.count}</td>
                <td className={`py-2 px-4 text-right font-semibold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {stats.profit.toFixed(2)}
                </td>
                <td className="py-2 px-4 text-right">{stats.roi.toFixed(2)}%</td>
                <td className="py-2 px-4 text-right">{stats.winRate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const statsByMarket = markets.map(market => ({
    label: market.nome,
    stats: calculateStats(
        allFilteredExecutions.filter(exec => exec.marketId === market.id)
    ),
  })).filter(s => s.stats.count > 0);

  const statsByMethod = methods.map(method => ({
    label: method.nome,
    stats: calculateStats(
        allFilteredExecutions.filter(exec => exec.methodId === method.id)
    ),
  })).filter(s => s.stats.count > 0);

  const statsByCompetition = competitions.map(comp => ({
    label: comp.nome,
    stats: calculateStats(
        filteredTradings
            .filter(t => t.id_competicao === comp.id)
            .flatMap(t => t.methodExecutions || [])
    ),
  })).filter(s => s.stats.count > 0);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Relatórios de Desempenho</h2>
      
      <Card title="Filtros">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select name="competition" value={filters.competition} onChange={handleFilterChange} className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3">
            <option value="all">Todas Competições</option>
            {competitions.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select name="market" value={filters.market} onChange={handleFilterChange} className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3">
            <option value="all">Todos Mercados</option>
            {markets.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
          <select name="method" value={filters.method} onChange={handleFilterChange} className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3">
            <option value="all">Todos Métodos</option>
            {methods.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
      </Card>

      <Card title="Resumo Geral (com filtros aplicados)">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Execuções</p>
            <p className="text-2xl font-bold">{generalStats.count}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Lucro/Prejuízo</p>
            <p className={`text-2xl font-bold ${generalStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>R$ {generalStats.profit.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ROI</p>
            <p className="text-2xl font-bold">{generalStats.roi.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Taxa de Acerto</p>
            <p className="text-2xl font-bold">{generalStats.winRate.toFixed(2)}%</p>
          </div>
        </div>
      </Card>

      {statsByMarket.length > 0 && renderStatsGroup("Desempenho por Mercado", statsByMarket)}
      {statsByMethod.length > 0 && renderStatsGroup("Desempenho por Método", statsByMethod)}
      {statsByCompetition.length > 0 && renderStatsGroup("Desempenho por Competição", statsByCompetition)}
    </div>
  );
};

export default Reports;
