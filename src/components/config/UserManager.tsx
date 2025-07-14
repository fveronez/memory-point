import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Users,
  Search,
  Shield,
  User,
  Crown,
  Settings,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';

// Importar contextos
import { useUser } from '../../contexts/UserContext';
import { useToast, ConfirmDialog } from '../ui/Toast';
import ErrorBoundary from '../error/ErrorBoundary';

interface UserFormData {
  nome: string;
  email: string;
  role: 'admin' | 'gestor' | 'dev' | 'suporte';
  status: 'ativo' | 'inativo';
  permissions: string[];
}

const UserManager: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useUser();
  const { success, error, warning } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [formData, setFormData] = useState<UserFormData>({
    nome: '',
    email: '',
    role: 'suporte',
    status: 'ativo',
    permissions: []
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Roles disponíveis
  const availableRoles = [
    { id: 'admin', label: 'Administrador', icon: Crown, color: 'text-red-600' },
    { id: 'gestor', label: 'Gestor', icon: Shield, color: 'text-blue-600' },
    { id: 'dev', label: 'Desenvolvedor', icon: Settings, color: 'text-green-600' },
    { id: 'suporte', label: 'Suporte', icon: User, color: 'text-gray-600' }
  ];

  // Permissões disponíveis
  const availablePermissions = [
    { id: 'create', label: 'Criar', description: 'Criar novos tickets e recursos' },
    { id: 'read', label: 'Visualizar', description: 'Visualizar tickets e dados' },
    { id: 'update', label: 'Editar', description: 'Editar tickets existentes' },
    { id: 'delete', label: 'Excluir', description: 'Excluir tickets e recursos' },
    { id: 'manage', label: 'Gerenciar', description: 'Gerenciar configurações' },
    { id: 'admin', label: 'Administrar', description: 'Acesso total ao sistema' }
  ];

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email deve ter formato válido';
    } else if (users.some(user => 
      user.email.toLowerCase() === formData.email.toLowerCase() && user.id !== editingUser?.id
    )) {
      errors.email = 'Já existe um usuário com este email';
    }

    if (formData.permissions.length === 0) {
      errors.permissions = 'Selecione pelo menos uma permissão';
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
      if (editingUser) {
        updateUser(editingUser.id, formData);
        success('Usuário atualizado!', `${formData.nome} foi atualizado com sucesso`);
      } else {
        addUser(formData);
        success('Usuário criado!', `${formData.nome} foi criado com sucesso`);
      }

      resetForm();
    } catch (err: any) {
      error('Erro ao salvar', err.message || 'Tente novamente em alguns instantes');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      role: user.role,
      status: user.status,
      permissions: [...user.permissions]
    });
    setShowForm(true);
  };

  const handleDelete = (user: any) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      try {
        deleteUser(userToDelete.id);
        success('Usuário excluído!', `${userToDelete.nome} foi removido`);
      } catch (err: any) {
        error('Erro ao excluir', err.message || 'Não foi possível excluir o usuário');
      }
    }
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      role: 'suporte',
      status: 'ativo',
      permissions: []
    });
    setFormErrors({});
    setShowForm(false);
    setEditingUser(null);
  };

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleChange = (role: string) => {
    const defaultPermissions = {
      admin: ['create', 'read', 'update', 'delete', 'admin', 'manage'],
      gestor: ['create', 'read', 'update', 'manage', 'delete'],
      dev: ['create', 'read', 'update'],
      suporte: ['read', 'update']
    };

    setFormData(prev => ({
      ...prev,
      role: role as any,
      permissions: defaultPermissions[role as keyof typeof defaultPermissions] || ['read']
    }));
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getRoleInfo = (role: string) => {
    return availableRoles.find(r => r.id === role) || availableRoles[3];
  };

  return (
    <ErrorBoundary isolate={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Gerenciar Usuários</h3>
            <p className="text-sm text-gray-600">
              Controle usuários e permissões do sistema
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <Plus size={18} />
            Novo Usuário
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-4">
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
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as funções</option>
            {availableRoles.map(role => (
              <option key={role.id} value={role.id}>{role.label}</option>
            ))}
          </select>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">
              Usuários Cadastrados ({filteredUsers.length})
            </h4>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => {
                const roleInfo = getRoleInfo(user.role);
                const RoleIcon = roleInfo.icon;

                return (
                  <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {user.iniciais}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h5 className="font-medium text-gray-900">{user.nome}</h5>
                            <div className={`flex items-center gap-1 ${roleInfo.color}`}>
                              <RoleIcon size={14} />
                              <span className="text-sm font-medium">{roleInfo.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {user.status === 'ativo' ? (
                                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  <Eye size={12} />
                                  Ativo
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                  <EyeOff size={12} />
                                  Inativo
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              Criado: {formatDate(user.dataCriacao)}
                            </span>
                            <span>
                              Permissões: {user.permissions.length}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Editar usuário"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Excluir usuário"
                          disabled={user.id === '1' || user.id === currentUser?.id}
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
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhum usuário encontrado</p>
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.nome ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="João Silva"
                    />
                    {formErrors.nome && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="joao@empresa.com"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Função *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {availableRoles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                {/* Permissões */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissões *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map(permission => (
                      <label
                        key={permission.id}
                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{permission.label}</p>
                          <p className="text-sm text-gray-600">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {formErrors.permissions && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.permissions}</p>
                  )}
                </div>

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
                    {editingUser ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dialog de confirmação de exclusão */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Excluir Usuário"
          message={`Tem certeza que deseja excluir o usuário "${userToDelete?.nome}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setUserToDelete(null);
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default UserManager;