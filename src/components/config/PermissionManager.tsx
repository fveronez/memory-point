// src/components/config/PermissionManager.tsx - VERSÃO FINAL INTEGRADA
import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Users,
  Search,
  History,
  Copy
} from 'lucide-react';

import { usePermission } from '../../contexts/PermissionContext';
import { useUser } from '../../contexts/UserContext';
import { useToast, ConfirmDialog } from '../ui/Toast';
import ErrorBoundary from '../error/ErrorBoundary';

// Componentes extraídos
import PermissionList from './permissions/PermissionList';
import UserPermissionManager, { useUserPermissionManager } from './permissions/UserPermissionManager';
import TemplateManager, { useTemplateManager } from './permissions/TemplateManager';
import PermissionForm, { usePermissionForm } from './permissions/PermissionForm';
import PermissionHistory, { usePermissionHistory } from './permissions/PermissionHistory';

const PermissionManager: React.FC = () => {
  const {
    permissions,
    addPermission,
    updatePermission,
    deletePermission,
    roleTemplates,
    permissionHistory
  } = usePermission();

  const { users } = useUser();
  const { success, error, warning } = useToast();

  // Estado principal
  const [activeTab, setActiveTab] = useState<'permissions' | 'users' | 'templates' | 'history'>('permissions');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Hooks dos componentes
  const { isOpen: showUserPermissionModal, userData: userPermissionData, openModal: openUserPermissionModal, closeModal: closeUserPermissionModal } = useUserPermissionManager();
  const { isOpen: showTemplateManager, openManager: openTemplateManager, closeManager: closeTemplateManager } = useTemplateManager();
  const { isOpen: showPermissionForm, editingPermission, openForm: openPermissionForm, closeForm: closePermissionForm } = usePermissionForm();
  const { isOpen: showPermissionHistory, openHistory: openPermissionHistory, closeHistory: closePermissionHistory } = usePermissionHistory();

  // Handlers de permissões
  const handleAddPermission = (permission: any) => {
    try {
      addPermission(permission);
      success('Permissão criada!', `Permissão "${permission.label}" foi criada`);
    } catch (err: any) {
      error('Erro ao criar', err.message || 'Tente novamente');
    }
  };

  const handleUpdatePermission = (id: string, permission: any) => {
    try {
      updatePermission(id, permission);
      success('Permissão atualizada!', `Permissão "${permission.label}" foi atualizada`);
    } catch (err: any) {
      error('Erro ao atualizar', err.message || 'Tente novamente');
    }
  };

  const handleDeletePermission = (permission: any) => {
    if (permission.isSystemPermission) {
      warning('Não é possível excluir', 'Esta é uma permissão do sistema');
      return;
    }
    setItemToDelete(permission);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      try {
        deletePermission(itemToDelete.id);
        success('Permissão excluída!', `Permissão "${itemToDelete.label}" foi excluída`);
      } catch (err: any) {
        error('Erro ao excluir', err.message);
      }
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  // Filtrar permissões
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || permission.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <ErrorBoundary isolate={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Gerenciamento de Permissões</h3>
            <p className="text-sm text-gray-600">
              Controle completo de permissões, usuários e templates
            </p>
          </div>
          {activeTab === 'permissions' && (
            <button
              onClick={() => openPermissionForm()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <Plus size={18} />
              Nova Permissão
            </button>
          )}
          {activeTab === 'templates' && (
            <button
              onClick={openTemplateManager}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              <Plus size={18} />
              Gerenciar Templates
            </button>
          )}
          {activeTab === 'history' && (
            <button
              onClick={openPermissionHistory}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              <History size={18} />
              Ver Histórico
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'permissions', label: 'Permissões', icon: Shield },
              { key: 'users', label: 'Usuários', icon: Users },
              { key: 'templates', label: 'Templates', icon: Copy },
              { key: 'history', label: 'Histórico', icon: History }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Tab: Permissões */}
          {activeTab === 'permissions' && (
            <PermissionList
              permissions={filteredPermissions}
              onAdd={handleAddPermission}
              onUpdate={handleUpdatePermission}
              onDelete={handleDeletePermission}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterCategory={filterCategory}
              onFilterChange={setFilterCategory}
            />
          )}

          {/* Tab: Usuários */}
          {activeTab === 'users' && (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">
                  Gerenciar Permissões de Usuários
                </h4>
              </div>
              <div className="p-6">
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {users.filter(user => 
                    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(user => (
                    <div key={user.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full ${
                            user.isSubUser ? 'bg-blue-400' : 'bg-blue-600'
                          } flex items-center justify-center text-white font-semibold text-sm`}>
                            {user.iniciais}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h5 className="font-medium text-gray-900">{user.nome}</h5>
                              {user.isSubUser && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                  SUBUSUÁRIO
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              {user.permissions?.length || 0} permissões ativas
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openUserPermissionModal(user)}
                          className="flex items-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                        >
                          <Shield size={16} />
                          Gerenciar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tab: Templates */}
          {activeTab === 'templates' && (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">
                  Templates de Roles ({roleTemplates.length})
                </h4>
              </div>
              <div className="divide-y divide-gray-200">
                {roleTemplates.length > 0 ? (
                  roleTemplates.map(template => (
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
                        <button
                          onClick={openTemplateManager}
                          className="flex items-center gap-2 px-3 py-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
                        >
                          <Copy size={16} />
                          Gerenciar
                        </button>
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
            </>
          )}

          {/* Tab: Histórico */}
          {activeTab === 'history' && (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">
                  Histórico de Alterações ({permissionHistory.length})
                </h4>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <History size={48} className="mx-auto mb-4 opacity-50 text-gray-400" />
                  <p className="text-gray-600 mb-4">
                    Visualize o histórico completo de alterações
                  </p>
                  <button
                    onClick={openPermissionHistory}
                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <History size={16} />
                    Ver Histórico Completo
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modais e Componentes */}
        <UserPermissionManager
          isOpen={showUserPermissionModal}
          userData={userPermissionData}
          permissions={permissions}
          onClose={closeUserPermissionModal}
        />

        <TemplateManager
          isOpen={showTemplateManager}
          templates={roleTemplates}
          permissions={permissions}
          onClose={closeTemplateManager}
        />

        <PermissionForm
          isOpen={showPermissionForm}
          editingPermission={editingPermission}
          permissions={permissions}
          onClose={closePermissionForm}
        />

        <PermissionHistory
          isOpen={showPermissionHistory}
          history={permissionHistory}
          users={users}
          permissions={permissions}
          onClose={closePermissionHistory}
        />

        {/* Dialog de Confirmação */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Excluir Permissão"
          message={`Tem certeza que deseja excluir a permissão "${itemToDelete?.label}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setItemToDelete(null);
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default PermissionManager;