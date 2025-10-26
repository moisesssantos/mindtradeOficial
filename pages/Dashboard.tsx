
import React, { useMemo } from 'react';
import { getTradings } from '../services/db';
import Card from '../components/ui/Card';
import { TrendingUp, DollarSign, Percent, CheckCircle, XCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const completedOperations = useMemo(() => {
    return getTradings().filter(t => t.operar && t.concluido && t.methodExecutions && t.methodExecutions.length > 0);
  }, []);

  const stats = useMemo(() => {
    if (completedOperations.length === 0) {
      return {
        lucroTotal: 0,
        roi: 0,
        taxaAcerto: 0,
        totalOperacoes: 0,
        totalStake: 0,
        lucroMedio: 0,
        totalWins: 0,
        totalLosses: 0,
      };
    }

    const allExecutions = completedOperations.flatMap(op => op.methodExecutions || []);
    if (allExecutions.length === 0) {
        return {
            lucroTotal: 0, roi: 0, taxaAcerto: 0, totalOperacoes: completedOperations.length, totalStake: 0, lucroMedio: 0, totalWins: 0, totalLosses: 0
        };
    }

    const lucroTotal = allExecutions.reduce((acc, exec) => acc + (exec.resultado_financeiro || 0), 0);
    const totalStake = allExecutions.reduce((acc, exec) => acc + (exec.stake || 0), 0);
    const totalWins = allExecutions.filter(exec => (exec.resultado_financeiro || 0) > 0).length;
    const totalLosses = allExecutions.filter(exec => (exec.resultado_financeiro || 0) < 0).length;
    const totalOperacoes = completedOperations.length;
    
    const roi = totalStake > 0 ? (lucroTotal / totalStake) * 100 : 0;
    const taxaAcerto = allExecutions.length > 0 ? (totalWins / allExecutions.length) * 100 : 0;
    const lucroMedio = totalOperacoes > 0 ? lucroTotal / totalOperacoes : 0;

    return {
      lucroTotal,
      roi,
      taxaAcerto,
      totalOperacoes,
      totalStake,
      lucroMedio,
      totalWins,
      totalLosses,
    };
  }, [completedOperations]);

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string; color: string }> = ({ icon: Icon, title, value, color }) => (
    <Card className="flex items-center p-4">
      <div className={`p-3 rounded-full mr-4 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard Geral</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} title="Lucro/Prejuízo Total" value={formatCurrency(stats.lucroTotal)} color={stats.lucroTotal >= 0 ? 'bg-green-500' : 'bg-red-500'} />
        <StatCard icon={Percent} title="ROI Total" value={formatPercent(stats.roi)} color="bg-blue-500" />
        <StatCard icon={TrendingUp} title="Taxa de Acerto (por método)" value={formatPercent(stats.taxaAcerto)} color="bg-yellow-500" />
        <StatCard icon={DollarSign} title="Lucro Médio / Partida" value={formatCurrency(stats.lucroMedio)} color="bg-purple-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
            <h3 className="font-semibold">Total de Partidas Operadas</h3>
            <p className="text-3xl font-bold">{stats.totalOperacoes}</p>
        </Card>
        <Card>
            <h3 className="font-semibold">Execuções com Lucro</h3>
            <p className="text-3xl font-bold text-green-600 flex items-center"><CheckCircle className="mr-2"/> {stats.totalWins}</p>
        </Card>
        <Card>
            <h3 className="font-semibold">Execuções com Prejuízo</h3>
            <p className="text-3xl font-bold text-red-600 flex items-center"><XCircle className="mr-2"/> {stats.totalLosses}</p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
