
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Trading, Team, Competition, Market, Method, MethodExecution, EstadoEmocional, MotivacaoEntrada, AutoAvaliacao } from '../types';
import { getItems, getTradingById, saveTrading } from '../services/db';
import * as C from '../constants';
import Card from '../components/ui/Card';
import MultiSelect from '../components/ui/MultiSelect';

const initialTradingState: Omit<Trading, 'id' | 'auditLog'> = {
  data_jogo: '',
  hora_jogo: '',
  id_competicao: '',
  id_equipe_casa: '',
  id_equipe_fora: '',
  operar: false,
  concluido: false,
  data_hora_registro: '',
  methodExecutions: [],
};

const defaultMethodExecution: Omit<MethodExecution, 'methodId'> = {
    marketId: '',
    stake: 0,
    resultado_financeiro: 0,
    odd_entrada: 1.01,
    seguiu_plano: true,
    estado_emocional: EstadoEmocional.NEUTRO,
    motivacao_entrada: MotivacaoEntrada.ANALISE_PRE_JOGO,
    autoavaliacao: AutoAvaliacao.REGULAR,
    odd_saida: undefined,
    tempo_exposicao: undefined,
    motivacao_saida: '',
};

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mt-8">
    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
  </div>
);

const TradingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [trading, setTrading] = useState<Omit<Trading, 'id' | 'auditLog'> | Trading>(initialTradingState);
  const [teams, setTeams] = useState<Team[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);

  useEffect(() => {
    setTeams(getItems('teams'));
    setCompetitions(getItems('competitions'));
    setMarkets(getItems('markets'));
    setMethods(getItems('methods'));

    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get('mode');
    const convertToOp = queryParams.get('convertToOp');

    if (id) {
      const existingTrading = getTradingById(id);
      if (existingTrading) {
        if (convertToOp === 'true' && !existingTrading.operar) {
            setTrading({ ...existingTrading, operar: true, methodExecutions: existingTrading.methodExecutions || [] });
        } else {
            setTrading(existingTrading);
        }
      }
    } else if (mode === 'operation') {
      setTrading(prev => ({ ...prev, operar: true }));
    }
  }, [id, location.search]);

  const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | boolean = value;
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = value === '' ? '' : parseFloat(value);
    }
    setTrading(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleExecutionChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | boolean = value;
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = value === '' ? '' : parseFloat(value);
    }
    
    const updatedExecutions = [...(trading.methodExecutions || [])];
    updatedExecutions[index] = { ...updatedExecutions[index], [name]: finalValue };
    
    setTrading(prev => ({ ...prev, methodExecutions: updatedExecutions }));
  };

  const handleMultiSelectChange = (selectedMethodIds: string[]) => {
    const currentExecutions = trading.methodExecutions || [];
    const newExecutions = selectedMethodIds.map(methodId => {
        const existing = currentExecutions.find(exec => exec.methodId === methodId);
        return existing || { ...defaultMethodExecution, methodId };
    }).filter(exec => selectedMethodIds.includes(exec.methodId)); // Ensure executions for unselected methods are removed
    setTrading(prev => ({ ...prev, methodExecutions: newExecutions }));
  };

  const handleSubmit = (e: React.FormEvent, conclude = false) => {
    e.preventDefault();
    
    if (trading.operar) {
        if (!trading.methodExecutions || trading.methodExecutions.length === 0) {
            alert('Selecione ao menos um método para a operação.');
            return;
        }
        for (const exec of trading.methodExecutions) {
            const methodName = methods.find(m => m.id === exec.methodId)?.nome || 'Desconhecido';
            if (!exec.marketId) {
                alert(`O Mercado para o método "${methodName}" é obrigatório.`);
                return;
            }
            if (exec.stake === undefined || exec.stake <= 0) {
                alert(`O Stake para o método "${methodName}" deve ser maior que zero.`);
                return;
            }
            if (exec.odd_entrada === undefined || exec.odd_entrada <= 1.01) {
                alert(`A Odd de Entrada para o método "${methodName}" deve ser maior que 1.01.`);
                return;
            }
            if (exec.resultado_financeiro === undefined) {
                alert(`O Resultado Financeiro para o método "${methodName}" é obrigatório.`);
                return;
            }
        }
    } else {
        if (!trading.data_jogo || !trading.id_competicao || !trading.id_equipe_casa || !trading.id_equipe_fora) {
            alert('Para pré-análise, os campos Data do Jogo, Competição e Equipes são obrigatórios.');
            return;
        }
    }

    let finalTrading = { ...trading };
    if (conclude) {
        if (finalTrading.methodExecutions?.some(exec => exec.resultado_financeiro === undefined)) {
            alert('Não é possível concluir sem um Resultado Financeiro para todos os métodos.');
            return;
        }
        finalTrading.concluido = true;
        finalTrading.data_conclusao = new Date().toISOString();
    }

    saveTrading(finalTrading);
    navigate(finalTrading.operar ? '/operacoes' : '/pre-analise');
  };

  const renderSelect = (name: string, label: string, options: string[], required = false) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <select id={name} name={name} value={(trading as any)[name] || ''} onChange={handleCommonChange} required={required} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        <option value="">Selecione...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  const renderInput = (name: string, label: string, type = 'text', required = false, props = {}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <input type={type} id={name} name={name} value={(trading as any)[name] || ''} onChange={handleCommonChange} required={required} {...props} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
  );

  return (
    <Card>
      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">{id ? 'Editar Registro' : 'Novo Registro'}</h2>
          <div className="flex items-center">
            <span className="mr-3 text-sm font-medium text-gray-900">Pré-Análise</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="operar" checked={trading.operar} onChange={handleCommonChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
            <span className="ml-3 text-sm font-medium text-gray-900">Operação</span>
          </div>
        </div>

        <FormSection title="Informações Comuns">
          {renderInput('data_jogo', 'Data do Jogo', 'date', true)}
          {renderInput('hora_jogo', 'Hora do Jogo', 'time', true)}
          <div>
            <label htmlFor="id_competicao" className="block text-sm font-medium text-gray-700">Competição</label>
            <select id="id_competicao" name="id_competicao" value={trading.id_competicao} onChange={handleCommonChange} required className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">Selecione...</option>
              {competitions.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="id_equipe_casa" className="block text-sm font-medium text-gray-700">Equipe Casa</label>
            <select id="id_equipe_casa" name="id_equipe_casa" value={trading.id_equipe_casa} onChange={handleCommonChange} required className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">Selecione...</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="id_equipe_fora" className="block text-sm font-medium text-gray-700">Equipe Fora</label>
            <select id="id_equipe_fora" name="id_equipe_fora" value={trading.id_equipe_fora} onChange={handleCommonChange} required className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">Selecione...</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
        </FormSection>

        {!trading.operar ? (
          <FormSection title="Campos de Pré-Análise">
            <div className="w-28">{renderInput('classificacao_m', 'Class. Mandante', 'text', false, { maxLength: 2 })}</div>
            <div className="w-28">{renderInput('classificacao_v', 'Class. Visitante', 'text', false, { maxLength: 2 })}</div>
            {renderSelect('momento_m', 'Momento Mandante', C.MOMENTO_OPTIONS)}
            {renderSelect('momento_v', 'Momento Visitante', C.MOMENTO_OPTIONS)}
            {renderSelect('must_win_m', 'Must Win Mandante', C.MUST_WIN_OPTIONS)}
            {renderSelect('must_win_v', 'Must Win Visitante', C.MUST_WIN_OPTIONS)}
            {renderSelect('desfalques_m', 'Desfalques Mandante', C.DESFALQUES_OPTIONS)}
            {renderSelect('desfalques_v', 'Desfalques Visitante', C.DESFALQUES_OPTIONS)}
            {renderSelect('tendencia_esperada', 'Tendência Esperada', C.TENDENCIA_OPTIONS)}
            {renderSelect('situacao_casa_fora', 'Situação Casa x Fora', C.SITUACAO_CASA_FORA_OPTIONS)}
            {renderSelect('valor_potencial', 'Valor Potencial', C.VALOR_POTENCIAL_OPTIONS)}
            <div className="md:col-span-3">
              <label htmlFor="destaque_essencial" className="block text-sm font-medium text-gray-700">Destaque Essencial</label>
              <textarea id="destaque_essencial" name="destaque_essencial" value={trading.destaque_essencial || ''} onChange={handleCommonChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
            </div>
          </FormSection>
        ) : (
          <>
            <FormSection title="Dados Gerais da Operação">
                <div className="md:col-span-3">
                    <label htmlFor="id_estrategia" className="block text-sm font-medium text-gray-700">Métodos/Estratégias Aplicados</label>
                    <MultiSelect options={methods} selected={trading.methodExecutions?.map(e => e.methodId) || []} onChange={handleMultiSelectChange} />
                </div>
            </FormSection>

            {(trading.methodExecutions || []).map((exec, index) => (
                <div key={exec.methodId} className="mt-8 p-6 bg-indigo-50 rounded-lg">
                    <h4 className="text-xl font-semibold text-indigo-800 mb-4 border-b border-indigo-200 pb-2">
                        Método: {methods.find(m => m.id === exec.methodId)?.nome}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label htmlFor={`marketId-${index}`} className="block text-sm font-medium text-gray-700">Mercado</label>
                            <select id={`marketId-${index}`} name="marketId" value={exec.marketId} onChange={(e) => handleExecutionChange(index, e)} required className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                <option value="">Selecione...</option>
                                {markets.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor={`stake-${index}`} className="block text-sm font-medium text-gray-700">Stake</label>
                            <input type="number" id={`stake-${index}`} name="stake" value={exec.stake} onChange={(e) => handleExecutionChange(index, e)} required step="0.01" min="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label htmlFor={`odd_entrada-${index}`} className="block text-sm font-medium text-gray-700">Odd Entrada</label>
                            <input type="number" id={`odd_entrada-${index}`} name="odd_entrada" value={exec.odd_entrada} onChange={(e) => handleExecutionChange(index, e)} required step="0.01" min="1.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label htmlFor={`resultado_financeiro-${index}`} className="block text-sm font-medium text-gray-700">Resultado Financeiro</label>
                            <input type="number" id={`resultado_financeiro-${index}`} name="resultado_financeiro" value={exec.resultado_financeiro} onChange={(e) => handleExecutionChange(index, e)} required step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label htmlFor={`odd_saida-${index}`} className="block text-sm font-medium text-gray-700">Odd Saída</label>
                            <input type="number" id={`odd_saida-${index}`} name="odd_saida" value={exec.odd_saida || ''} onChange={(e) => handleExecutionChange(index, e)} step="0.01" min="1.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label htmlFor={`estado_emocional-${index}`} className="block text-sm font-medium text-gray-700">Estado Emocional</label>
                            <select id={`estado_emocional-${index}`} name="estado_emocional" value={exec.estado_emocional} onChange={(e) => handleExecutionChange(index, e)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                {C.ESTADO_EMOCIONAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor={`motivacao_entrada-${index}`} className="block text-sm font-medium text-gray-700">Motivação da Entrada</label>
                            <select id={`motivacao_entrada-${index}`} name="motivacao_entrada" value={exec.motivacao_entrada} onChange={(e) => handleExecutionChange(index, e)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                {C.MOTIVACAO_ENTRADA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor={`autoavaliacao-${index}`} className="block text-sm font-medium text-gray-700">Autoavaliação</label>
                            <select id={`autoavaliacao-${index}`} name="autoavaliacao" value={exec.autoavaliacao} onChange={(e) => handleExecutionChange(index, e)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                {C.AUTOAVALIACAO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center h-full mt-6">
                            <input id={`seguiu_plano-${index}`} name="seguiu_plano" type="checkbox" checked={exec.seguiu_plano} onChange={(e) => handleExecutionChange(index, e)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                            <label htmlFor={`seguiu_plano-${index}`} className="ml-2 block text-sm text-gray-900">Seguiu o plano?</label>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label htmlFor={`motivacao_saida-${index}`} className="block text-sm font-medium text-gray-700">Motivo da Saída/Observação</label>
                        <textarea id={`motivacao_saida-${index}`} name="motivacao_saida" value={exec.motivacao_saida || ''} onChange={(e) => handleExecutionChange(index, e)} rows={2} maxLength={200} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                </div>
            ))}
          </>
        )}

        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
            Cancelar
          </button>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            Salvar
          </button>
          {trading.operar && !trading.concluido && (
            <button type="button" onClick={(e) => handleSubmit(e, true)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Concluir Operação
            </button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default TradingForm;
