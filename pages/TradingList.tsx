
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTradings, getItems, deleteTrading, saveTrading } from '../services/db';
import { Trading, Competition, Team } from '../types';
import Card from '../components/ui/Card';
import { PlusCircle, Edit, Trash2, PlayCircle } from 'lucide-react';

interface TradingListProps {
  mode: 'pre-analysis' | 'operation';
}

const TradingList: React.FC<TradingListProps> = ({ mode }) => {
  const navigate = useNavigate();
  const [tradings, setTradings] = useState<Trading[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filterCompetition, setFilterCompetition] = useState('');

  const title = mode === 'pre-analysis' ? 'Pré-Análises' : 'Operações';
  const isPreAnalysis = mode === 'pre-analysis';

  const fetchData = useCallback(() => {
    setTradings(getTradings());
    setCompetitions(getItems('competitions'));
    setTeams(getItems('teams'));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleArchive = useCallback((trading: Trading) => {
    const justification = prompt("A pré-análise não foi operada. Qual a justificativa? (opcional, até 50 caracteres)");
    if (justification !== null) { // Handles cancel button
        const updatedTrading: Trading = {
            ...trading,
            justificativa_nao_operacao: justification.slice(0, 50),
            data_envio_historico: new Date().toISOString(),
        };
        saveTrading(updatedTrading);
        fetchData();
    }
  }, [fetchData]);

  useEffect(() => {
    if (isPreAnalysis) {
        const today = new Date().toISOString().split('T')[0];
        const itemsToArchive = tradings.filter(t => !t.operar && t.data_jogo < today && !t.data_envio_historico);
        if (itemsToArchive.length > 0) {
            // This will now archive one by one on each render, which is not ideal but avoids infinite loops with prompt
            handleArchive(itemsToArchive[0]);
        }
    }
  }, [tradings, isPreAnalysis, handleArchive]);

  const filteredTradings = useMemo(() => {
    return tradings
      .filter(t => (isPreAnalysis ? !t.operar : t.operar))
      .filter(t => !filterCompetition || t.id_competicao === filterCompetition)
      .sort((a, b) => new Date(b.data_jogo).getTime() - new Date(a.data_jogo).getTime());
  }, [tradings, isPreAnalysis, filterCompetition]);

  const getName = (id: string, list: Team[] | Competition[]) => list.find(item => item.id === id)?.nome || 'N/A';

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      const result = deleteTrading(id);
      if (result.success) {
        fetchData();
      } else {
        alert(result.message);
      }
    }
  }, [fetchData]);

  const handleConvertToOperation = useCallback((id: string) => {
    navigate(`/trading/edit/${id}?convertToOp=true`);
  }, [navigate]);

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Link
          to={`/trading/new?mode=${mode}`}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Novo Registro
        </Link>
      </div>

      <div className="flex gap-4 mb-4">
        <select
          value={filterCompetition}
          onChange={e => setFilterCompetition(e.target.value)}
          className="block w-full md:w-1/3 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Todas as Competições</option>
          {competitions.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competição</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partida</th>
              {isPreAnalysis ? (
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tendência</th>
              ) : (
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultado Total</th>
              )}
              <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTradings.map(t => {
              const totalResultado = t.operar ? t.methodExecutions?.reduce((acc, exec) => acc + exec.resultado_financeiro, 0) : undefined;

              return (
                <React.Fragment key={t.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 whitespace-nowrap">{new Date(t.data_jogo + 'T' + t.hora_jogo).toLocaleDateString('pt-BR')} {t.hora_jogo}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{getName(t.id_competicao, competitions)}</td>
                    <td className="py-4 px-6 whitespace-nowrap font-medium">{getName(t.id_equipe_casa, teams)} vs {getName(t.id_equipe_fora, teams)}</td>
                    {isPreAnalysis ? (
                      <td className="py-4 px-6 whitespace-nowrap">{t.tendencia_esperada || 'N/A'}</td>
                    ) : (
                      <td className={`py-4 px-6 whitespace-nowrap font-bold ${totalResultado !== undefined && totalResultado > 0 ? 'text-green-600' : totalResultado !== undefined && totalResultado < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {t.concluido && totalResultado !== undefined ? `R$ ${totalResultado.toFixed(2)}` : 'Em Aberto'}
                      </td>
                    )}
                    <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        {isPreAnalysis && !t.data_envio_historico && (
                          <button onClick={() => handleConvertToOperation(t.id)} className="text-green-600 hover:text-green-900" title="Operar">
                            <PlayCircle />
                          </button>
                        )}
                        <Link to={`/trading/edit/${t.id}`} className="text-indigo-600 hover:text-indigo-900" title="Editar">
                          <Edit />
                        </Link>
                        <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-900" title="Excluir">
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isPreAnalysis && t.destaque_essencial && (
                    <tr className="bg-slate-50">
                      <td colSpan={5} className="px-6 py-3 text-sm text-gray-600 border-t border-slate-200">
                        <strong className="font-semibold text-gray-800">Destaque:</strong> {t.destaque_essencial}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TradingList;
