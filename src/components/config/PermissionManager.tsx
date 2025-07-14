import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Users,
  Search,
  Eye,
  History,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Filter,
  Download,
  Upload
} from 'lucide-react';

import { usePermission } from '../../contexts/PermissionContext';
import { useUser } from '../../contexts/UserContext';
import { useToast, ConfirmDialog } from '../ui/Toast';
import ErrorBoundary from '../error/ErrorBoundary';

interface PermissionFormData {
  id: string;
  label: string;
  description: string;
  category: 'basic' | 'advanced' | 'admin';
}

interface UserPermissionModalData {
  userId: string;
  userName: string;
  currentPermissions: string[];
  parentPermissions?: string[];
}

const PermissionManager: React.FC = () => {
  const {
    permissions,
    addPermission,
    updatePermission,
    deletePermission,
    getPermissionsByCategory,
    roleTemplates,
    addRoleTemplate,
    updateRoleTemplate,
    deleteRoleTemplate,
    permissionHistory,
    getUserPermissionHistory,
    addPermissionChange,
    comparePermissions
  } = usePermission();

  const { users, updateUser, currentUser } = useUser();
  const { success, error, warning } = useToast();

  // Estados da interface
  const [activeTab, setActiveTab] = useState<'permissions' | 'users' | 'templates' | 'history'>('permissions');
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [showUserPermissionModal, setShowUserPermissionModal] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [userPermissionData, setUserPermissionData] = useState<UserPermissionModalData | null>(null);

  const [permissionFormData, setPermissionFormData] = useState<PermissionFormData>({
    id: '',
    label: '',
    description: '',
    category: 'basic'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Dados do formulário de template
  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    role: 'suporte' as 'admin' | 'gestor' | 'dev' | 'suporte',
    permissions: [] as string[],
    isDefault: false
  });

  // Filtrar permissões
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || permission.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Validação do formulário
  const validatePermissionForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!permissionFormData.id.trim()) {
      errors.id = 'ID é obrigatório';
    } else if (!/^[a-z_]+$/.test(permissionFormData.id)) {
      errors.id = 'ID deve conter apenas letras minúsculas e underscore';
    } else if (permissions.some(p => p.id === permissionFormData.id && p.id !== editingPermission?.id)) {
      errors.id = 'Já existe uma permissão com este ID';
    }

    if (!permissionFormData.label.trim()) {
      errors.label = 'Rótulo é obrigatório';
    } else if (permissionFormData.label.length < 2) {
      errors.label = 'Rótulo deve ter pelo menos 2 caracteres';
    }

    if (!permissionFormData.description.trim()) {
      errors.description = 'Descrição é obrigatória';
    } else if (permissionFormData.description.length < 10) {
      errors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleSubmitPermission = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePermissionForm()) {
      warning('Dados inválidos', 'Verifique os campos obrigatórios');
      return;
    }

    try {
      if (editingPermission) {
        updatePermission(editingPermission.id, permissionFormData);
      } else {
        addPermission(permissionFormData);
      }
      resetPermissionForm();
    } catch (err: any) {
      error('Erro ao salvar', err.message || 'Tente novamente');
    }
  };

  const handleEditPermission = (permission: any) => {
    setEditingPermission(permission);
    setPermissionFormData({
      id: permission.id,
      label: permission.label,
      description: permission.description,
      category: permission.category
    });
    setShowPermissionForm(true);
  };

  const handleDeletePermission = (permission: any) => {
    setItemToDelete(permission);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      try {
        if (itemToDelete.role) {
          // É um template
          deleteRoleTemplate(itemToDelete.id);
        } else {
          // É uma permissão
          deletePermission(itemToDelete.id);
        }
      } catch (err: any) {
        error('Erro ao excluir', err.message);
      }
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const resetPermissionForm = () => {
    setPermissionFormData({
      id: '',
      label: '',
      description: '',
      category: 'basic'
    });
    setFormErrors({});
    setShowPermissionForm(false);
    setEditingPermission(null);
  };

  const handleManageUserPermissions = (user: any) => {
    const parentUser = user.parentUserId ? users.find(u => u.id === user.parentUserId) : null;
    
    setUserPermissionData({
      userId: user.id,
      userName: user.nome,
      currentPermissions: user.permissions || [],
      parentPermissions: parentUser?.permissions || undefined
    });
    setShowUserPermissionModal(true);
  };

  const updateUserPermissions = (userId: string, newPermissions: string[]) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const oldPermissions = user.permissions || [];
    
    // Registrar mudanças no histórico
    const added = newPermissions.filter(p => !oldPermissions.includes(p));
    const removed = oldPermissions.filter(p => !newPermissions.includes(p));

    added.forEach(permission => {
      addPermissionChange({
        userId: userId,
        userName: user.nome,
        action: 'grant',
        permission: permission,
        previousValue: false,
        newValue: true,
        changedBy: currentUser?.nome || 'Sistema'
      });
    });

    removed.forEach(permission => {
      addPermissionChange({
        userId: userId,
        userName: user.nome,
        action: 'revoke',
        permission: permission,
        previousValue: true,
        newValue: false,
        changedBy: currentUser?.nome || 'Sistema'
      });
    });

    updateUser(userId, { permissions: newPermissions });
    success('Permissões atualizadas!', `Permissões de ${user.nome} foram atualizadas`);
  };

  // Handlers para Templates
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateFormData({
      name: '',
      role: 'suporte',
      permissions: [],
      isDefault: false
    });
    setShowTemplateForm(true);
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setTemplateFormData({
      name: template.name,
      role: template.role,
      permissions: [...template.permissions],
      isDefault: template.isDefault
    });
    setShowTemplateForm(true);
  };

  const handleDeleteTemplate = (template: any) => {
    setItemToDelete(template);
    setShowDeleteConfirm(true);
  };

  const validateTemplateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!templateFormData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (templateFormData.name.length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (templateFormData.permissions.length === 0) {
      errors.permissions = 'Selecione pelo menos uma permissão';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitTemplate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateTemplateForm()) {
      warning('Dados inválidos', 'Verifique os campos obrigatórios');
      return;
    }

    try {
      if (editingTemplate) {
        updateRoleTemplate(editingTemplate.id, templateFormData);
      } else {
        addRoleTemplate(templateFormData);
      }
      resetTemplateForm();
    } catch (err: any) {
      error('Erro ao salvar', err.message || 'Tente novamente');
    }
  };

  const resetTemplateForm = () => {
    setTemplateFormData({
      name: '',
      role: 'suporte',
      permissions: [],
      isDefault: false
    });
    setFormErrors({});
    setShowTemplateForm(false);
    setEditingTemplate(null);
  };

  const toggleTemplatePermission = (permissionId: string) => {
    setTemplateFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basic': return CheckCircle;
      case 'advanced': return Settings;
      case 'admin': return Shield;
      default: return AlertTriangle;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'text-green-600 bg-green-100';
      case 'advanced': return 'text-blue-600 bg-blue-100';
      case 'admin': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

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
              onClick={() => setShowPermissionForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <Plus size={18} />
              Nova Permissão
            </button>
          )}
          {activeTab === 'templates' && (
            <button
              onClick={handleCreateTemplate}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              <Plus size={18} />
              Novo Template
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

        {/* Filtros */}
        {(activeTab === 'permissions' || activeTab === 'users') && (
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`Buscar ${activeTab === 'permissions' ? 'permissões' : 'usuários'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {activeTab === 'permissions' && (
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas as categorias</option>
                <option value="basic">Básicas</option>
                <option value="advanced">Avançadas</option>
                <option value="admin">Administrativas</option>
              </select>
            )}
          </div>
        )}

        {/* Conteúdo das Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Tab: Permissões */}
          {activeTab === 'permissions' && (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">
                  Permissões Cadastradas ({filteredPermissions.length})
                </h4>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredPermissions.length > 0 ? (
                  filteredPermissions.map(permission => {
                    const CategoryIcon = getCategoryIcon(permission.category);
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
                              onClick={() => handleEditPermission(permission)}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                              title="Editar permissão"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeletePermission(permission)}
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
            </>
          )}

          {/* Tab: Usuários */}
          {activeTab === 'users' && (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">
                  Gerenciar Permissões de Usuários
                </h4>
              </div>
              <div className="divide-y divide-gray-200">
                {users.filter(user => 
                  user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(user => (
                  <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
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
                        onClick={() => handleManageUserPermissions(user)}
                        className="flex items-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        <Settings size={16} />
                        Gerenciar
                      </button>
                    </div>
                  </div>
                ))}
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                            title="Editar template"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template)}
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
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tab: Histórico */}
          {activeTab === 'history' && (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    Histórico de Alterações ({permissionHistory.length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <select
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos os usuários</option>
                      {users.map(user => (
                        <option key={user.id} value={user.nome}>
                          {user.nome}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        warning('Em desenvolvimento', 'Exportação de histórico será implementada em breve');
                      }}
                      className="flex items-center gap-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium"
                    >
                      <Download size={16} />
                      Exportar
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {permissionHistory.length > 0 ? (
                  permissionHistory
                    .filter(change => !searchTerm || change.userName.toLowerCase().includes(searchTerm.toLowerCase()))
                    .slice(0, 50) // Mostrar últimas 50 mudanças
                    .map(change => {
                      const actionColors = {
                        grant: 'text-green-600 bg-green-100',
                        revoke: 'text-red-600 bg-red-100',
                        inherit: 'text-blue-600 bg-blue-100',
                        override: 'text-yellow-600 bg-yellow-100'
                      };
                      
                      const actionLabels = {
                        grant: 'Concedida',
                        revoke: 'Revogada',
                        inherit: 'Herdada',
                        override: 'Sobreposta'
                      };

                      const permission = permissions.find(p => p.id === change.permission);

                      return (
                        <div key={change.id} className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <History className="text-gray-600" size={20} />
                              </div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <h5 className="font-medium text-gray-900">{change.userName}</h5>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${actionColors[change.action]}`}>
                                    {actionLabels[change.action]}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {permission?.label || change.permission}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                  <span>
                                    Por: {change.changedBy}
                                  </span>
                                  <span>
                                    {formatDate(change.changedAt)}
                                  </span>
                                  {change.reason && (
                                    <span>
                                      Motivo: {change.reason}
                                    </span>
                                  )}
                                </div>
                                {permission && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {permission.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                {change.previousValue !== undefined && (
                                  <span className="text-xs text-gray-500">
                                    {change.previousValue ? '✅' : '❌'} → {change.newValue ? '✅' : '❌'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <History size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Nenhuma alteração registrada</p>
                    <p className="text-sm mt-1">As mudanças de permissões aparecerão aqui</p>
                  </div>
                )}
              </div>
              {permissionHistory.length > 50 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    Mostrando últimas 50 alterações de {permissionHistory.length} total
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal: Formulário de Template */}
        {showTemplateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingTemplate ? 'Editar Template' : 'Novo Template'}
                </h3>
                <button
                  onClick={resetTemplateForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitTemplate} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Template *
                    </label>
                    <input
                      type="text"
                      value={templateFormData.name}
                      onChange={(e) => setTemplateFormData(prev => ({ ...prev, name: e.target.value }))}
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
                      value={templateFormData.role}
                      onChange={(e) => setTemplateFormData(prev => ({ ...prev, role: e.target.value as any }))}
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
                                  checked={templateFormData.permissions.includes(permission.id)}
                                  onChange={() => toggleTemplatePermission(permission.id)}
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

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetTemplateForm}
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

        {/* Modal: Formulário de Permissão */}
        {showPermissionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingPermission ? 'Editar Permissão' : 'Nova Permissão'}
                </h3>
                <button
                  onClick={resetPermissionForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitPermission} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID da Permissão *
                  </label>
                  <input
                    type="text"
                    value={permissionFormData.id}
                    onChange={(e) => setPermissionFormData(prev => ({ ...prev, id: e.target.value }))}
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
                    value={permissionFormData.label}
                    onChange={(e) => setPermissionFormData(prev => ({ ...prev, label: e.target.value }))}
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
                    value={permissionFormData.description}
                    onChange={(e) => setPermissionFormData(prev => ({ ...prev, description: e.target.value }))}
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
                    value={permissionFormData.category}
                    onChange={(e) => setPermissionFormData(prev => ({ ...prev, category: e.target.value as any }))}
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
                    onClick={resetPermissionForm}
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

        {/* Modal: Gerenciar Permissões do Usuário */}
        {showUserPermissionModal && userPermissionData && (
          <UserPermissionModal
            userData={userPermissionData}
            permissions={permissions}
            onSave={(newPermissions) => {
              updateUserPermissions(userPermissionData.userId, newPermissions);
              setShowUserPermissionModal(false);
              setUserPermissionData(null);
            }}
            onClose={() => {
              setShowUserPermissionModal(false);
              setUserPermissionData(null);
            }}
          />
        )}

        {/* Dialog de Confirmação */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title={itemToDelete?.role ? "Excluir Template" : "Excluir Permissão"}
          message={`Tem certeza que deseja excluir ${itemToDelete?.role ? 'o template' : 'a permissão'} "${itemToDelete?.name || itemToDelete?.label}"? Esta ação não pode ser desfeita.`}
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

// Componente Modal para Gerenciar Permissões do Usuário
const UserPermissionModal: React.FC<{
  userData: UserPermissionModalData;
  permissions: any[];
  onSave: (permissions: string[]) => void;
  onClose: () => void;
}> = ({ userData, permissions, onSave, onClose }) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(userData.currentPermissions);
  const [showInherited, setShowInherited] = useState(true);

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const inheritedPermissions = userData.parentPermissions || [];
  const isInherited = (permissionId: string) => inheritedPermissions.includes(permissionId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Gerenciar Permissões: {userData.userName}
            </h3>
            {userData.parentPermissions && (
              <p className="text-sm text-gray-600">
                Subusuário • Pode herdar permissões do usuário principal
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {userData.parentPermissions && (
            <div className="mb-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={showInherited}
                  onChange={(e) => setShowInherited(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mostrar permissões herdadas do usuário principal
                </span>
              </label>
            </div>
          )}

          <div className="space-y-6">
            {['basic', 'advanced', 'admin'].map(category => {
              const categoryPermissions = permissions.filter(p => p.category === category);
              
              if (categoryPermissions.length === 0) return null;

              return (
                <div key={category}>
                  <h4 className="font-medium text-gray-900 mb-3 capitalize">
                    {category === 'basic' ? 'Básicas' : category === 'advanced' ? 'Avançadas' : 'Administrativas'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryPermissions.map(permission => {
                      const isSelected = selectedPermissions.includes(permission.id);
                      const inherited = isInherited(permission.id);
                      
                      return (
                        <label
                          key={permission.id}
                          className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-blue-200 bg-blue-50' 
                              : inherited && showInherited
                                ? 'border-green-200 bg-green-50'
                                : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected || (inherited && showInherited)}
                            onChange={() => togglePermission(permission.id)}
                            disabled={inherited && showInherited}
                            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{permission.label}</p>
                              {inherited && showInherited && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Herdada
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                            <code className="text-xs text-gray-500">{permission.id}</code>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(selectedPermissions)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Save size={16} />
              Salvar Permissões
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionManager;