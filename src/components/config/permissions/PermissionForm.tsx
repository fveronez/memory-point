// src/components/config/permissions/PermissionForm.tsx
import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

import { PermissionFormData, validatePermissionForm } from './PermissionTypes';
import { usePermission } from '../../../contexts/PermissionContext';
import { useToast } from '../../ui/Toast';

interface PermissionFormProps {
  isOpen: boolean;
  editingPermission?: any;
  permissions: any[];
  onClose: () => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({
  isOpen,
  editingPermission,
  permissions,
  onClose
}) => {
  const { addPermission, updatePermission } = usePermission();
  const { success, error, warning } = useToast();

  const [formData, setFormData] = useState<PermissionFormData>({
    id: '',
    label: '',
    description: '',
    category: 'basic'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Atualizar form quando editingPermission mudar
  useEffect(() => {
    if (editingPermission) {
      setFormData({
        id: editingPermission.id,
        label: editingPermission.label,
        description: editingPermission.description,
        category: editingPermission.category
      });
    } else {
      resetForm();
    }
  }, [editingPermission]);

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
        updatePermission(editingPermission.id, formData);
        success('Permissão atualizada!', `Permissão "${formData.label}" foi atualizada`);
      } else {
        addPermission(formData);
        success('Permissão criada!', `Permissão "${formData.label}" foi criada`);
      }
      handleClose();
    } catch (err: any) {
      error('Erro ao salvar', err.message || 'Tente novamente');
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      label: '',
      description: '',
      category: 'basic'
    });
    setFormErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingPermission ? 'Editar Permissão' : 'Nova Permissão'}
          </h3>
          <button
            onClick={handleClose}
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
            <p className="mt-1 text-xs text-gray-500">
              Use apenas letras minúsculas e underscore
            </p>
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
            <p className="mt-1 text-xs text-gray-500">
              Descreva claramente o que esta permissão permite fazer
            </p>
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
            <p className="mt-1 text-xs text-gray-500">
              Básica: Funcionalidades essenciais • Avançada: Recursos específicos • Administrativa: Gestão do sistema
            </p>
          </div>

          {editingPermission?.isSystemPermission && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Permissão do Sistema:</strong> Alguns campos estão bloqueados para edição por segurança.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
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
  );
};

// Hook para facilitar o uso do componente
export const usePermissionForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);

  const openForm = (permission?: any) => {
    setEditingPermission(permission || null);
    setIsOpen(true);
  };

  const closeForm = () => {
    setIsOpen(false);
    setEditingPermission(null);
  };

  return {
    isOpen,
    editingPermission,
    openForm,
    closeForm
  };
};

export default PermissionForm;