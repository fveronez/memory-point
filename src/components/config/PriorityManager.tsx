import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Star,
  Search,
  AlertTriangle,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// Importar contextos
import { usePriority } from '../../contexts/PriorityContext';
import { useToast, ConfirmDialog } from '../ui/Toast';
import ErrorBoundary from '../error/ErrorBoundary';

interface PriorityFormData {
  nome: string;
  label: string;
  nivel: number;
  cor: string;
  icone: string;
  descricao: string;
  ativo: boolean;
}

const PriorityManager: React.FC = () => {
  const { priorities, addPriority, updatePriority, deletePriority } = usePriority();
  const { success, error, warning } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingPriority, setEditingPriority] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [priorityToDelete, setPriorityToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<PriorityFormData>({
    nome: '',
    label: '',
    nivel: 1,
    cor: '',
    icone: '',
    descricao: '',
    ativo: true
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Cores disponíveis para prioridades
  const availableColors = [
    { name: 'Verde', value: 'bg-green-500', class: 'bg-green-500' },
    { name: 'Amarelo', value: 'bg-yellow-500', class: 'bg-yellow-500' },
    { name: 'Laranja', value: 'bg-orange-500', class: 'bg-orange-500' },
    { name: 'Vermelho', value: 'bg-red-500', class: 'bg-red-500' },
    { name: 'Vermelho Escuro', value: 'bg-red-600', class: 'bg-red-600' },
    { name: 'Roxo', value: 'bg-purple-500', class: 'bg-purple-500' },
    { name: 'Azul', value: 'bg-blue-500', class: 'bg-blue-500' },
    { name: 'Cinza', value: 'bg-gray-500', class: 'bg-gray-500' }
  ];

  // Ícones disponíveis para prioridades
  const availableIcons = ['🟢', '🟡', '🟠', '🔴', '🚨', '⭐', '🔥', '⚡', '💥', '🎯', '📈', '⬆️'];

  // Níveis disponíveis (1-10)
  const availableLevels = Array.from({ length: 10 }, (_, i) => i + 1);

  // Filtrar prioridades baseado na busca
  const filteredPriorities = priorities.filter(priority =>
    priority.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    priority.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    } else if (priorities.some(priority => 
      priority.nome === formData.nome && priority.id !== editingPriority?.id
    )) {
      errors.nome = 'Já existe uma prioridade com este nome';
    }

    if (!formData.label.trim()) {
      errors.label = 'Rótulo é obrigatório';
    } else if (formData.label.length < 2) {
      errors.label = 'Rótulo deve ter pelo menos 2 caracteres';
    }

    if (!formData.icone) {
      errors.icone = 'Ícone é obrigatório';
    }

    if (!formData.cor) {
      errors.cor = 'Cor é obrigatória';
    }

    if (formData.nivel < 1 || formData.nivel > 10) {
      errors.nivel = 'Nível deve ser entre 1 e 10';
    } else if (priorities.some(priority => 
      priority.nivel === formData.nivel && priority.id !== editingPriority?.id
    )) {
      errors.nivel = 'Já existe uma prioridade com este nível';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      warning('Dados inválidos', 'Verifique os campos obrigatórios');
      return;
    }

    try {
      if (editingPriority) {
        updatePriority(editingPriority.id, formData);
        success('Prioridade atualizada!', `${formData.label} foi atualizada com sucesso`);
      } else {
        addPriority(formData);
        success('Prioridade criada!', `${formData.label} foi criada com sucesso`);
      }

      resetForm();
    } catch (err: any) {
      error('Erro ao salvar', err.message || 'Tente novamente em alguns instantes');
    }
  };

  const handleEdit = (priority: any) => {
    setEditingPriority(priority);
    setFormData({
      nome: priority.nome,
      label: priority.label,
      nivel: priority.nivel,
      cor: priority.cor,
      icone: priority.icone,
      descricao: priority.descricao || '',
      ativo: priority.ativo
    });
    setShowForm(true);
  };

  const handleDelete = (priority: any) => {
    setPriorityToDelete(priority);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (priorityToDelete) {
      try {
        deletePriority(priorityToDelete.id);
        success('Prioridade excluída!', `${priorityToDelete.label} foi removida`);
      } catch (err: any) {
        error('Erro ao excluir', err.message || 'Não foi possível excluir a prioridade');
      }
    }
    setShowDeleteConfirm(false);
    setPriorityToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      label: '',
      nivel: Math.max(...priorities.map(p => p.nivel), 0) + 1,
      cor: '',
      icone: '',
      descricao: '',
      ativo: true
    });
    setFormErrors({});
    setShowForm(false);
    setEditingPriority(null);
  };

  const handleInputChange = (field: keyof PriorityFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getLevelIndicator = (nivel: number) => {
    if (nivel <= 2) return { text: 'Baixa', color: 'text-green-600' };
    if (nivel <= 4) return { text: 'Média', color: 'text-yellow-600' };
    if (nivel <= 6) return { text: 'Alta', color: 'text-orange-600' };
    if (nivel <= 8) return { text: 'Urgente', color: 'text-red-600' };
    return { text: 'Crítica', color: 'text-red-800' };
  };

  return (
    <ErrorBoundary isolate={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Gerenciar Prioridades</h3>
            <p className="text-sm text-gray-600">
              Configure os níveis de prioridade para classificação de tickets
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <Plus size={18} />
            Nova Prioridade
          </button>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar prioridades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Lista de Prioridades */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">
              Prioridades Disponíveis ({filteredPriorities.length})
            </h4>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredPriorities.length > 0 ? (
              filteredPriorities.map(priority => {
                const levelInfo = getLevelIndicator(priority.nivel);
                return (
                  <div key={priority.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${priority.cor}`}>
                          <span className="text-lg">{priority.icone}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h5 className="font-medium text-gray-900">{priority.label}</h5>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Nível {priority.nivel}</span>
                              <span className={`text-sm font-medium ${levelInfo.color}`}>
                                ({levelInfo.text})
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {priority.ativo ? (
                                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  <Eye size={12} />
                                  Ativo
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  <EyeOff size={12} />
                                  Inativo
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">ID: {priority.nome}</p>
                          {priority.descricao && (
                            <p className="text-sm text-gray-500 mt-1">{priority.descricao}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(priority)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Editar prioridade"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(priority)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Excluir prioridade"
                          disabled={['1', '2', '3'].includes(priority.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <Star size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhuma prioridade encontrada</p>
                {searchTerm && (
                  <p className="text-sm mt-1">Tente buscar por outros termos</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal de Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingPriority ? 'Editar Prioridade' : 'Nova Prioridade'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Nome (ID) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome (ID) *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.nome ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="ex: critica, urgente, normal"
                  />
                  {formErrors.nome && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
                  )}
                </div>

                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rótulo de Exibição *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => handleInputChange('label', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.label ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="ex: Crítica, Urgente, Normal"
                  />
                  {formErrors.label && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.label}</p>
                  )}
                </div>

                {/* Nível */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nível de Prioridade * (1-10)
                  </label>
                  <select
                    value={formData.nivel}
                    onChange={(e) => handleInputChange('nivel', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.nivel ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    {availableLevels.map(level => {
                      const levelInfo = getLevelIndicator(level);
                      const isUsed = priorities.some(p => p.nivel === level && p.id !== editingPriority?.id);
                      return (
                        <option key={level} value={level} disabled={isUsed}>
                          Nível {level} - {levelInfo.text} {isUsed ? '(Em uso)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {formErrors.nivel && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.nivel}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Níveis mais altos têm maior prioridade
                  </p>
                </div>

                {/* Ícone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ícone *
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {availableIcons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleInputChange('icone', icon)}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-colors ${
                          formData.icone === icon
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  {formErrors.icone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.icone}</p>
                  )}
                </div>

                {/* Cor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableColors.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleInputChange('cor', color.value)}
                        className={`w-full p-3 rounded-lg border-2 flex items-center justify-center text-white font-medium text-sm transition-colors ${
                          color.class
                        } ${
                          formData.cor === color.value
                            ? 'border-gray-800 ring-2 ring-gray-300'
                            : 'border-transparent'
                        }`}
                      >
                        {color.name}
                      </button>
                    ))}
                  </div>
                  {formErrors.cor && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.cor}</p>
                  )}
                </div>

                {/* Status Ativo */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => handleInputChange('ativo', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
                    Prioridade ativa
                  </label>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Descrição da prioridade..."
                  />
                </div>

                {/* Preview */}
                {(formData.icone || formData.cor || formData.label) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${formData.cor || 'bg-gray-300'}`}>
                        <span>{formData.icone || '?'}</span>
                      </div>
                      <div>
                        <span className="font-medium">{formData.label || 'Nome da prioridade'}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          (Nível {formData.nivel})
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    <Save size={16} />
                    {editingPriority ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dialog de confirmação de exclusão */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Excluir Prioridade"
          message={`Tem certeza que deseja excluir a prioridade "${priorityToDelete?.label}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setPriorityToDelete(null);
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default PriorityManager;