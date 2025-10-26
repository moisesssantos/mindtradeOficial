
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BaseItem, DataType } from '../types';
import { getItems, addItem, updateItem, deleteItem } from '../services/db';
import Card from '../components/ui/Card';
import { Edit, Trash2, Save, X } from 'lucide-react';

const dataTypeMap: Record<string, { singular: string; plural: string; type: DataType }> = {
  teams: { singular: 'Equipe', plural: 'Equipes', type: 'teams' },
  competitions: { singular: 'Competição', plural: 'Competições', type: 'competitions' },
  markets: { singular: 'Mercado', plural: 'Mercados', type: 'markets' },
  methods: { singular: 'Método', plural: 'Métodos', type: 'methods' },
};

const Cadastros: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const config = type ? dataTypeMap[type] : null;

  const [items, setItems] = useState<BaseItem[]>([]);
  const [editingItem, setEditingItem] = useState<BaseItem | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(() => {
    if (config) {
      setItems(getItems(config.type));
    }
  }, [config]);

  useEffect(() => {
    if (!config) {
      navigate('/cadastros/teams');
      return;
    }
    fetchData();
    setEditingItem(null);
    setNewItemName('');
    setError('');
    setSearchTerm('');
  }, [type, config, navigate, fetchData]);

  const filteredItems = useMemo(() => {
    return items.filter(item => item.nome.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [items, searchTerm]);

  const handleSave = useCallback(() => {
    if (!config) return;
    if (!newItemName.trim()) {
      setError('O nome não pode estar vazio.');
      return;
    }

    const result = editingItem
      ? updateItem(config.type, editingItem.id, { nome: newItemName.trim() })
      : addItem(config.type, { nome: newItemName.trim() });

    if (result.success) {
      fetchData();
      setEditingItem(null);
      setNewItemName('');
      setError('');
    } else {
      setError(result.message || 'Ocorreu um erro.');
    }
  }, [config, newItemName, editingItem, fetchData]);

  const handleDelete = useCallback((id: string) => {
    if (!config) return;
    if (window.confirm('Tem certeza que deseja excluir? Esta ação não pode ser desfeita.')) {
      const result = deleteItem(config.type, id);
      if (result.success) {
        fetchData();
      } else {
        alert(result.message);
      }
    }
  }, [config, fetchData]);

  const startEditing = (item: BaseItem) => {
    setEditingItem(item);
    setNewItemName(item.nome);
    setError('');
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setNewItemName('');
    setError('');
  };

  if (!config) return null;

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Cadastro de {config.plural}</h2>
        <div className="flex gap-2">
            {Object.keys(dataTypeMap).map(key => (
                <button key={key} onClick={() => navigate(`/cadastros/${key}`)} className={`px-3 py-1 rounded-md text-sm font-medium ${type === key ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    {dataTypeMap[key].plural}
                </button>
            ))}
        </div>
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">{editingItem ? `Editando ${config.singular}` : `Adicionar Nova ${config.singular}`}</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={`Nome da ${config.singular}`}
            maxLength={30}
            className="flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button onClick={handleSave} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            <Save className="mr-2 h-5 w-5" /> Salvar
          </button>
          {editingItem && (
            <button onClick={cancelEditing} className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
              <X className="mr-2 h-5 w-5" /> Cancelar
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="py-4 px-6 whitespace-nowrap font-medium">{item.nome}</td>
                <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-4">
                    <button onClick={() => startEditing(item)} className="text-indigo-600 hover:text-indigo-900" title="Editar">
                      <Edit />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900" title="Excluir">
                      <Trash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default Cadastros;
