// src/components/config/permissions/TemplateManager.tsx
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Copy } from 'lucide-react';

import { RoleTemplateFormData } from './PermissionTypes';
import { usePermission } from '../../../contexts/PermissionContext';
import { useToast } from '../../ui/Toast';

interface TemplateManagerProps {
  isOpen: boolean;
  templates: any[];
  permissions: any[];
  onClose: () => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  isOpen,
  templates,
  permissions,
  onClose
}) => {
  const { addRoleTemplate, updateRoleTemplate, deleteRoleTemplate } = usePermission();
  const { success, error, warning } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState<RoleTemplateFormData>({
    name: '',
    role: 'suporte',
    permissions: [],
    isDefault: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateTemplateForm = (data: RoleTemplateFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (data.name.length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (data.permissions.length === 0) {
      errors.permissions = 'Selecione pelo menos uma permissão';
    }

    return errors;
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      role: 'suporte',
      permissions: [],
      isDefault: false
    });
    setShowForm(true);
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      role: template.role,
      permissions: [...template.permissions],
      isDefault: template.isDefault
    });
    setShowForm(true);
  };

  const handleDelete = (template: any) => {
    if (template.isDefault) {
      warning('Não é possível excluir', 'Este é um template padrão do sistema');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o template "${template.name}"?`)) {
      try {
        deleteRoleTemplate(template.id);
        success('Template excluído!', `Template "${template.name}" foi excluído`);
      } catch (err: any) {
        error('Erro ao excluir', err.message || 'Tente novamente');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateTemplateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      warning('Dados inválidos', 'Verifique os campos obrigatórios');
      return;
    }

    try {
      if (editingTemplate) {
        updateRoleTemplate(editingTemplate.id, formData);
        success('Template atualizado!', `Template "${formData.name}" foi atualizado`);
      } else {
        addRoleTemplate(formData);
        success('Template criado!', `Template "${formData.name}" foi criado`);
      }
      resetForm();
    } catch (err: any) {
      error('Erro ao salvar', err.message || 'Tente novamente');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'suporte',
      permissions: [],
      isDefault: false
    });
    setFormErrors({});
    setShowForm(false);
    setEditingTemplate(null);
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
          Templates de Roles ({templates.length})
        </h4>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
        >
          <Plus size={18} />
          Novo Template
        </button>
      </div>

      {/* Lista de Templates */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-200">
          {templates.length > 0 ? (
            templates.map(template => (
              <div key={template.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Copy className="text-white" size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h5 className="font-medium text-gray-900">{template.name}</h5>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                          {template.role.toUpperCase()}
                        </span>
                        {template.isDefault && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {template.permissions.length} permissões configuradas
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.permissions.slice(0, 5).map(permId => {
                          const perm = permissions.find(p => p.id === permId);
                          return perm ? (
                            <span key={permId} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {perm.label}
                            </span>
                          ) : null;
                        })}
                        {template.permissions.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{template.permissions.length - 5} mais
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="Editar template"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(template)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Excluir template"
                      disabled={template.isDefault}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <Copy size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhum template encontrado</p>
              <p className="text-sm mt-1">Crie templates para facilitar a atribuição de permissões</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTemplate ? 'Editar Template' : 'Novo Template'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Template *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Desenvolvedor Senior"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="admin">Administrador</option>
                    <option value="gestor">Gestor</option>
                    <option value="dev">Desenvolvedor</option>
                    <option value="suporte">Suporte</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissões *
                </label>
                <div className="space-y-4">
                  {['basic', 'advanced', 'admin'].map(category => {
                    const categoryPermissions = permissions.filter(p => p.category === category);
                    
                    if (categoryPermissions.length === 0) return null;

                    return (
                      <div key={category}>
                        <h4 className="font-medium text-gray-900 mb-2 capitalize">
                          {category === 'basic' ? 'Básicas' : category === 'advanced' ? 'Avançadas' : 'Administrativas'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryPermissions.map(permission => (
                            <label
                              key={permission.id}
                              className="flex items-start gap-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{permission.label}</p>
                                <p className="text-xs text-gray-600">{permission.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {formErrors.permissions && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.permissions}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                  Definir como template padrão
                </label>
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  <Save size={16} />
                  {editingTemplate ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook para facilitar o uso do componente
export const useTemplateManager = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openManager = () => setIsOpen(true);
  const closeManager = () => setIsOpen(false);

  return {
    isOpen,
    openManager,
    closeManager
  };
};

export default TemplateManager;