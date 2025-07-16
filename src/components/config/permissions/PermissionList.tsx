// src/components/config/permissions/PermissionList.tsx
import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';

import { PermissionFormData, validatePermissionForm, formatDate, getCategoryColor, getCategoryIcon } from './PermissionTypes';
import { useToast } from '../../ui/Toast';

interface PermissionListProps {
  permissions: any[];
  onAdd: (permission: PermissionFormData) => void;
  onUpdate: (id: string, permission: PermissionFormData) => void;
  onDelete: (permission: any) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterCategory: string;
  onFilterChange: (category: string) => void;
}

const PermissionList: React.FC<PermissionListProps> = ({
  permissions,
  onAdd,
  onUpdate,
  onDelete,
  searchTerm,
  onSearchChange,
  filterCategory,
  onFilterChange
}) => {
  const { success, error, warning } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [formData, setFormData] = useState<PermissionFormData>({
    id: '',
    label: '',
    description: '',
    category: 'basic'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtrar permissões
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || permission.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validatePermissionForm(formData, permissions, editingPermission?.id);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      warning('Dados inválidos', 'Verifique os campos obrigatórios');
      return;
    }

    try {
      if (editingPermission) {
        onUpdate(editingPermission.id, formData);
        success('Permissão atualizada!', `Permissão "${formData.label}" foi atualizada`);
      } else {
        onAdd(formData);
        success('Permissão criada!', `Permissão "${formData.label}" foi criada`);
      }
      resetForm();
    } catch (err: any) {
      error('Erro ao salvar', err.message || 'Tente novamente');
    }
  };

  const handleEdit = (permission: any) => {
    setEditingPermission(permission);
    setFormData({
      id: permission.id,
      label: permission.label,
      description: permission.description,
      category: permission.category
    });
    setShowForm(true);
  };

  const handleDelete = (permission: any) => {
    if (permission.isSystemPermission) {
      warning('Não é possível excluir', 'Esta é uma permissão do sistema');
      return;
    }
    onDelete(permission);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      label: '',
      description: '',
      category: 'basic'
    });
    setFormErrors({});
    setShowForm(false);
    setEditingPermission(null);
  };

  const getCategoryIconComponent = (category: string) => {
    switch (category) {
      case 'basic': return CheckCircle;
      case 'advanced': return Settings;
      case 'admin': return Shield;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
          Permissões Cadastradas ({filteredPermissions.length})
        </h4>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          <Plus size={18} />
          Nova Permissão
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar permissões..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todas as categorias</option>
          <option value="basic">Básicas</option>
          <option value="advanced">Avançadas</option>
          <option value="admin">Administrativas</option>
        </select>
      </div>

      {/* Lista de Permissões */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredPermissions.length > 0 ? (
            filteredPermissions.map(permission => {
              const CategoryIcon = getCategoryIconComponent(permission.category);
              const categoryColor = getCategoryColor(permission.category);

              return (
                <div key={permission.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${categoryColor}`}>
                        <CategoryIcon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h5 className="font-medium text-gray-900">{permission.label}</h5>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {permission.id}
                          </code>
                          <span className={`text-xs px-2 py-1 rounded-full ${categoryColor}`}>
                            {permission.category}
                          </span>
                          {permission.isSystemPermission && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              Sistema
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{permission.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Criado: {formatDate(permission.createdAt)}
                          {permission.updatedAt && permission.updatedAt !== permission.createdAt && (
                            <span> • Atualizado: {formatDate(permission.updatedAt)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(permission)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Editar permissão"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(permission)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Excluir permissão"
                        disabled={permission.isSystemPermission}
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
              <Shield size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhuma permissão encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPermission ? 'Editar Permissão' : 'Nova Permissão'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID da Permissão *
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="exemplo: manage_reports"
                  disabled={editingPermission?.isSystemPermission}
                />
                {formErrors.id && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rótulo *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.label ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Gerenciar Relatórios"
                />
                {formErrors.label && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.label}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Permite gerar, visualizar e exportar relatórios do sistema"
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={editingPermission?.isSystemPermission}
                >
                  <option value="basic">Básica</option>
                  <option value="advanced">Avançada</option>
                  <option value="admin">Administrativa</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Save size={16} />
                  {editingPermission ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionList;