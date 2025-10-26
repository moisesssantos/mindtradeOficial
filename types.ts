
export interface BaseItem {
  id: string;
  nome: string;
}

export type Team = BaseItem;
export type Competition = BaseItem;
export type Market = BaseItem;
export type Method = BaseItem;

export type DataType = 'teams' | 'competitions' | 'markets' | 'methods';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string; // Mono-usuário for now
  action: 'create' | 'update' | 'convert' | 'conclude' | 'reopen';
  details: string;
}

export interface MethodExecution {
  methodId: string;
  marketId: string;
  stake: number;
  resultado_financeiro: number;
  odd_entrada: number;
  odd_saida?: number;
  tempo_exposicao?: number;
  seguiu_plano: boolean;
  estado_emocional: string;
  motivacao_entrada: string;
  motivacao_saida?: string;
  autoavaliacao: string;
}

export interface Trading {
  id: string;
  data_jogo: string;
  hora_jogo: string;
  id_competicao: string;
  id_equipe_casa: string;
  id_equipe_fora: string;
  operar: boolean; // false = Pré-Análise, true = Operação

  // Pré-Análise fields (operar = false)
  classificacao_m?: string;
  classificacao_v?: string;
  momento_m?: string;
  momento_v?: string;
  must_win_m?: string;
  must_win_v?: string;
  importancia_prox_partida_m?: string;
  importancia_prox_partida_v?: string;
  desfalques_m?: string;
  desfalques_v?: string;
  tendencia_esperada?: string;
  situacao_casa_fora?: string;
  valor_potencial?: string;
  destaque_essencial?: string;
  justificativa_nao_operacao?: string;
  data_envio_historico?: string;

  // Operação fields (operar = true)
  methodExecutions?: MethodExecution[];
  
  concluido: boolean;
  data_hora_registro: string;
  data_conclusao?: string;
  
  auditLog: AuditLogEntry[];
}

export enum Momento {
  BOA_FASE = 'Boa Fase',
  MA_FASE = 'Má fase',
  EM_CONSTRUCAO = 'Equipe em construção',
  TECNICO_INTERINO = 'Técnico interino',
  IRREGULAR = 'Irregular',
  EM_CRISE = 'Em Crise',
  REGULAR = 'Regular',
}

export enum MustWin {
    TITULO = 'Título',
    REBAIXAMENTO = 'Rebaixamento',
    CLASSIFICACAO_COMPETICOES = 'Classificação competições importantes',
    CLASSICO = 'Clássico',
    QUEBRA_TABUS = 'Quebra de Tabus',
    PROXIMA_FASE = 'Classificação próxima fase',
    IRRELEVANTE = 'Irrelevante',
}

export enum ImportanciaPartida {
    MAIS_IMPORTANTE = 'Mais importante',
    MENOS_IMPORTANTE = 'Menos importante',
    MESMA_IMPORTANCIA = 'Mesma importância',
    SEM_IMPORTANCIA = 'Sem importância',
}

export enum Desfalques {
    GOLEADOR = 'Goleador',
    CAPITAO = 'Capitão',
    TECNICO = 'Técnico',
    JOGADOR_IMPORTANTE = 'Jogador Importante',
    JOGADOR_DECISIVO = 'Jogador Decisivo',
    SEM_DESFALQUES = 'Sem desfalques importantes',
}

export enum Tendencia {
    M_DOMINANTE = 'M Dominante',
    V_DOMINANTE = 'V Dominante',
    UFC = 'Trocação',
    JOGO_TRUNCADO = 'Jogo Truncado',
    JOGO_COMPLEXO = 'Jogo Complexo',
    JOGO_MORNO = 'Jogo Morno',
}

export enum SituacaoCasaFora {
    OTIMO_M_VS_OTIMO_V = 'Ótimo M vs Ótimo V',
    OTIMO_M_VS_PESSIMO_V = 'Ótimo M vs Péssimo V',
    OTIMO_M_VS_REGULAR_V = 'Ótimo M vs Regular V',
    PESSIMO_M_VS_OTIMO_V = 'Péssimo M vs Ótimo V',
    PESSIMO_M_VS_PESSIMO_V = 'Péssimo M vs Péssimo V',
    REGULAR_M_VS_OTIMO_V = 'Regular M vs Ótimo V',
    REGULAR_M_VS_PESSIMO_V = 'Regular M vs Péssimo V',
    REGULAR_M_VS_REGULAR_V = 'Regular M vs Regular V',
}

export enum ValorPotencial {
    ODDS_JUSTAS = 'Odds Justas',
    ODDS_ESMAGADAS = 'Odds Esmagadas',
    ODDS_SEM_VALOR = 'Odds sem Valor',
    ODDS_BOAS = 'Odds Boas',
}

export enum EstadoEmocional {
    ANSIOSO = 'Ansioso',
    CALMO = 'Calmo',
    EUFORICO = 'Eufórico',
    FODASE = 'Foda-se',
    FRUSTRADO = 'Frustrado',
    IRRITADO = 'Irritado',
    NEUTRO = 'Neutro',
}

export enum MotivacaoEntrada {
    ALEATORIA = 'Aleatória',
    ANALISE_PRE_JOGO = 'Análise/Método Pré-Jogo',
    INTUICAO = 'Intuição/Feeling',
    FOMO = 'Medo de perder oportunidade',
    RECUPERAR_PREJUIZO = 'Recuperar prejuízo',
    SINAL_TECNICO = 'Sinal técnico',
}

export enum AutoAvaliacao {
    EXCELENTE = 'Excelente',
    BOA = 'Boa',
    REGULAR = 'Regular',
    RUIM = 'Ruim',
    PESSIMA = 'Péssima',
}
