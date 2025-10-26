
import { BaseItem, Trading, DataType, AuditLogEntry } from '../types';

const getFromStorage = <T,>(key: string): T[] => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return [];
  }
};

const saveToStorage = <T,>(key: string, value: T[]): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key “${key}”:`, error);
  }
};

// Generic CRUD for BaseItem
export const getItems = (type: DataType): BaseItem[] => {
  return getFromStorage<BaseItem>(type).sort((a, b) => a.nome.localeCompare(b.nome));
};

export const getItemById = (type: DataType, id: string): BaseItem | undefined => {
  return getItems(type).find(item => item.id === id);
};

export const addItem = (type: DataType, item: Omit<BaseItem, 'id'>): { success: boolean; message?: string } => {
  const items = getItems(type);
  if (items.some(i => i.nome.toLowerCase() === item.nome.toLowerCase())) {
    return { success: false, message: 'Cadastro com este nome já existe.' };
  }
  const newItem = { ...item, id: new Date().toISOString() };
  saveToStorage(type, [...items, newItem]);
  return { success: true };
};

export const updateItem = (type: DataType, id: string, updatedItem: Omit<BaseItem, 'id'>): { success: boolean; message?: string } => {
  const items = getItems(type);
  if (items.some(i => i.id !== id && i.nome.toLowerCase() === updatedItem.nome.toLowerCase())) {
    return { success: false, message: 'Cadastro com este nome já existe.' };
  }
  const newItems = items.map(i => (i.id === id ? { ...i, ...updatedItem } : i));
  saveToStorage(type, newItems);
  return { success: true };
};

export const deleteItem = (type: DataType, id: string): { success: boolean; message?: string } => {
  const tradings = getTradings();
  const isUsed = tradings.some(t => {
    switch (type) {
      case 'teams': return t.id_equipe_casa === id || t.id_equipe_fora === id;
      case 'competitions': return t.id_competicao === id;
      case 'markets': return t.methodExecutions?.some(exec => exec.marketId === id);
      case 'methods': return t.methodExecutions?.some(exec => exec.methodId === id);
      default: return false;
    }
  });

  if (isUsed) {
    return { success: false, message: 'Não é possível excluir, pois está em uso em um registro de Trading.' };
  }

  const items = getItems(type);
  saveToStorage(type, items.filter(i => i.id !== id));
  return { success: true };
};

// Trading specific functions
export const getTradings = (): Trading[] => {
  return getFromStorage<Trading>('tradings');
};

export const getTradingById = (id: string): Trading | undefined => {
  return getTradings().find(t => t.id === id);
};

const addAuditLog = (trading: Trading, action: AuditLogEntry['action'], details: string): Trading => {
    const newLog: AuditLogEntry = {
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toISOString(),
        user: 'Trader',
        action,
        details,
    };
    trading.auditLog = [...(trading.auditLog || []), newLog];
    return trading;
}

export const saveTrading = (tradingData: Omit<Trading, 'id' | 'auditLog'> | Trading): Trading => {
  let tradings = getTradings();
  if ('id' in tradingData) { // Update
    let existingTrading = tradings.find(t => t.id === tradingData.id);
    if (!existingTrading) throw new Error("Trading not found for update");
    
    let details = 'Registro atualizado.';
    if (!existingTrading.operar && tradingData.operar) details = 'Convertido de Pré-Análise para Operação.';
    if (!existingTrading.concluido && tradingData.concluido) details = 'Operação concluída.';

    existingTrading = addAuditLog(existingTrading, 'update', details);
    const updatedTrading = { ...existingTrading, ...tradingData };
    
    tradings = tradings.map(t => (t.id === updatedTrading.id ? updatedTrading : t));
    saveToStorage('tradings', tradings);
    return updatedTrading;
  } else { // Create
    let newTrading: Trading = {
      ...tradingData,
      id: new Date().toISOString(),
      concluido: false,
      data_hora_registro: new Date().toISOString(),
      auditLog: [],
    };
    newTrading = addAuditLog(newTrading, 'create', 'Registro criado.');
    tradings.push(newTrading);
    saveToStorage('tradings', tradings);
    return newTrading;
  }
};

export const deleteTrading = (id: string): { success: boolean; message?: string } => {
    const trading = getTradingById(id);
    if (trading?.concluido) {
        return { success: false, message: 'Não é possível excluir uma operação concluída.' };
    }
    const tradings = getTradings();
    saveToStorage('tradings', tradings.filter(t => t.id !== id));
    return { success: true };
};
