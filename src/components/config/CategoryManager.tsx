import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Tag,
  Search,
  AlertTriangle
} from 'lucide-react';

// Importar contextos
import { useCategory } from '../../contexts/CategoryContext';
import { useToast, ConfirmDialog } from '../ui/Toast';
import ErrorBoundary from '../error/ErrorBoundary';

interface CategoryFormData {
  nome: string;
  label: string;
  icone: string;
  cor: string;
  descricao: string;
}

const CategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategory();
  const { success, error, warning } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CategoryFormData>({
    nome: '',
    label: '',
    icone: '',
    cor: '',
    descricao: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Cores disponíveis para categorias
  const availableColors = [
    { name: 'Azul', value: 'bg-blue-500', class: 'bg-blue-500' },
    { name: 'Verde', value: 'bg-green-500', class: 'bg-green-500' },
    { name: 'Vermelho', value: 'bg-red-500', class: 'bg-red-500' },
    { name: 'Amarelo', value: 'bg-yellow-500', class: 'bg-yellow-500' },
    { name: 'Roxo', value: 'bg-purple-500', class: 'bg-purple-500' },
    { name: 'Rosa', value: 'bg-pink-500', class: 'bg-pink-500' },
    { name: 'Índigo', value: 'bg-indigo-500', class: 'bg-indigo-500' },
    { name: 'Cinza', value: 'bg-gray-500', class: 'bg-gray-500' }
  ];

  // Ícones disponíveis
  const availableIcons = ['🐛', '✨', '🚀', '📋', '⚡', '🎨', '🔧', '📊', '🌟', '💡', '🎯', '🔥'];

  // Filtrar categorias baseado na busca
  const filteredCategories = categories.filter(category =>
    category.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    } else if (categories.some(cat => cat.nome === formData.nome && cat.id !== editingCategory?.id)) {
      errors.nome = 'Já existe uma categoria com este nome';
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
      if (editingCategory) {
        updateCategory(editingCategory.id, formData);
        success('Categoria atualizada!', `${formData.label} foi atualizada com sucesso`);
      } else {
        addCategory(formData);
        success('Categoria criada!', `${formData.label} foi criada com sucesso`);
      }

      resetForm();
    } catch (err: any) {
      error('Erro ao salvar', err.message || 'Tente novamente em alguns instantes');
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      nome: category.nome,
      label: category.label,
      icone: category.icone,
      cor: category.cor,
      descricao: category.descricao || ''
    });
    setShowForm(true);
  };

  const handleDelete = (category: any) => {
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      try {
        deleteCategory(categoryToDelete.id);
        success('Categoria excluída!', `${categoryToDelete.label} foi removida`);
      } catch (err: any) {
        error('Erro ao excluir', err.message || 'Não foi possível excluir a categoria');
      }
    }
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      label: '',
      icone: '',
      cor: '',
      descricao: ''
    });
    setFormErrors({});
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <ErrorBoundary isolate={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Gerenciar Categorias</h3>
            <p className="text-sm text-gray-600">
              Configure as categorias disponíveis para classificação de tickets
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <Plus size={18} />
            Nova Categoria
          </button>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Lista de Categorias */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">
              Categorias Disponíveis ({filteredCategories.length})
            </h4>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(category => (
                <div key={category.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${category.cor}`}>
                        <span className="text-lg">{category.icone}</span>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{category.label}</h5>
                        <p className="text-sm text-gray-600">ID: {category.nome}</p>
                        {category.descricao && (
                          <p className="text-sm text-gray-500 mt-1">{category.descricao}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Editar categoria"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Excluir categoria"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <Tag size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhuma categoria encontrada</p>
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
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
                    placeholder="ex: bug, feature, task"
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
                    placeholder="ex: Bug, Nova Funcionalidade, Tarefa"
                  />
                  {formErrors.label && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.label}</p>
                  )}
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
                    placeholder="Descrição da categoria..."
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
                      <span className="font-medium">{formData.label || 'Nome da categoria'}</span>
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
                    {editingCategory ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dialog de confirmação de exclusão */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Excluir Categoria"
          message={`Tem certeza que deseja excluir a categoria "${categoryToDelete?.label}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setCategoryToDelete(null);
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default CategoryManager;