import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useToast } from '../components/ui/Toast';

// Interface para permissões
interface Permission {
  id: string;
  label: string;
  description: string;
  category: 'basic' | 'advanced' | 'admin';
  isSystemPermission: boolean; // Permissões do sistema não podem ser deletadas
  createdAt: Date;
  updatedAt: Date;
}

// Interface para templates de permissões por role
interface RoleTemplate {
  id: string;
  name: string;
  role: 'admin' | 'gestor' | 'dev' | 'suporte';
  permissions: string[];
  isDefault: boolean;
}

// Interface para histórico de mudanças
interface PermissionChange {
  id: string;
  userId: string;
  userName: string;
  action: 'grant' | 'revoke' | 'inherit' | 'override';
  permission: string;
  previousValue?: boolean;
  newValue: boolean;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

interface PermissionContextType {
  // Permissões disponíveis
  permissions: Permission[];
  addPermission: (data: Omit<Permission, 'id' | 'createdAt' | 'updatedAt' | 'isSystemPermission'>) => void;
  updatePermission: (id: string, updates: Partial<Permission>) => void;
  deletePermission: (id: string) => void;
  getPermissionById: (id: string) => Permission | undefined;
  
  // Templates de roles
  roleTemplates: RoleTemplate[];
  addRoleTemplate: (data: Omit<RoleTemplate, 'id'>) => void;
  updateRoleTemplate: (id: string, updates: Partial<RoleTemplate>) => void;
  deleteRoleTemplate: (id: string) => void;
  getRoleTemplate: (role: string) => RoleTemplate | undefined;
  
  // Histórico de mudanças
  permissionHistory: PermissionChange[];
  addPermissionChange: (data: Omit<PermissionChange, 'id' | 'changedAt'>) => void;
  getUserPermissionHistory: (userId: string) => PermissionChange[];
  
  // Funções utilitárias
  getPermissionsByCategory: (category: string) => Permission[];
  validateUserPermissions: (userPermissions: string[]) => { valid: string[], invalid: string[] };
  getInheritedPermissions: (parentUserId: string) => string[];
  comparePermissions: (user1Permissions: string[], user2Permissions: string[]) => {
    common: string[],
    user1Only: string[],
    user2Only: string[]
  };
}

// Permissões iniciais do sistema
const initialPermissions: Permission[] = [
  // Permissões básicas
  {
    id: 'create',
    label: 'Criar',
    description: 'Criar novos tickets e recursos',
    category: 'basic',
    isSystemPermission: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'read',
    label: 'Visualizar',
    description: 'Visualizar tickets e dados',
    category: 'basic',
    isSystemPermission: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'update',
    label: 'Editar',
    description: 'Editar tickets existentes',
    category: 'basic',
    isSystemPermission: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'delete',
    label: 'Excluir',
    description: 'Excluir tickets e recursos',
    category: 'basic',
    isSystemPermission: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  // Permissões avançadas
  {
    id: 'manage',
    label: 'Gerenciar',
    description: 'Gerenciar configurações do sistema',
    category: 'advanced',
    isSystemPermission: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'export',
    label: 'Exportar',
    description: 'Exportar dados e relatórios',
    category: 'advanced',
    isSystemPermission: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'import',
    label: 'Importar',
    description: 'Importar dados e configurações',
    category: 'advanced',
    isSystemPermission: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'reports',
    label: 'Relatórios',
    description: 'Gerar e visualizar relatórios avançados',
    category: 'advanced',
    isSystemPermission: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  // Permissões administrativas
  {
    id: 'admin',
    label: 'Administrar',
    description: 'Acesso total ao sistema',
    category: 'admin',
    isSystemPermission: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'user_management',
    label: 'Gerenciar Usuários',
    description: 'Criar, editar e excluir usuários',
    category: 'admin',
    isSystemPermission: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'system_config',
    label: 'Configurar Sistema',
    description: 'Alterar configurações do sistema',
    category: 'admin',
    isSystemPermission: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Templates iniciais de roles
const initialRoleTemplates: RoleTemplate[] = [
  {
    id: 'admin-template',
    name: 'Administrador Completo',
    role: 'admin',
    permissions: ['create', 'read', 'update', 'delete', 'admin', 'manage', 'export', 'import', 'reports', 'user_management', 'system_config'],
    isDefault: true
  },
  {
    id: 'gestor-template',
    name: 'Gestor Padrão',
    role: 'gestor',
    permissions: ['create', 'read', 'update', 'delete', 'manage', 'export', 'reports'],
    isDefault: true
  },
  {
    id: 'dev-template',
    name: 'Desenvolvedor Padrão',
    role: 'dev',
    permissions: ['create', 'read', 'update', 'export'],
    isDefault: true
  },
  {
    id: 'suporte-template',
    name: 'Suporte Padrão',
    role: 'suporte',
    permissions: ['read', 'update'],
    isDefault: true
  }
];

// Contexto
const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Provider
export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { success, error } = useToast();

  // Estados persistentes
  const [permissions, setPermissions] = useLocalStorage('sistema-permissions', initialPermissions, {
    serialize: (data) => JSON.stringify(data, (key, value) => {
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    }),
    deserialize: (str) => JSON.parse(str, (key, value) => {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    }),
    syncAcrossTabs: true
  });

  const [roleTemplates, setRoleTemplates] = useLocalStorage('sistema-role-templates', initialRoleTemplates, {
    syncAcrossTabs: true
  });

  const [permissionHistory, setPermissionHistory] = useLocalStorage<PermissionChange[]>('sistema-permission-history', [], {
    serialize: (data) => JSON.stringify(data, (key, value) => {
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    }),
    deserialize: (str) => JSON.parse(str, (key, value) => {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    }),
    syncAcrossTabs: true
  });

  // Gerar ID único
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // CRUD de Permissões
  const addPermission = (data: Omit<Permission, 'id' | 'createdAt' | 'updatedAt' | 'isSystemPermission'>): void => {
    // Verificar se já existe permissão com mesmo ID
    const existingPermission = permissions.find(p => p.id === data.id);
    if (existingPermission) {
      throw new Error('Já existe uma permissão com este ID');
    }

    const newPermission: Permission = {
      id: data.id,
      label: data.label,
      description: data.description,
      category: data.category,
      isSystemPermission: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPermissions(prev => [...prev, newPermission]);
    success('Permissão criada!', `Permissão "${data.label}" foi criada com sucesso`);
  };

  const updatePermission = (id: string, updates: Partial<Permission>): void => {
    const permission = permissions.find(p => p.id === id);
    if (!permission) {
      throw new Error('Permissão não encontrada');
    }

    if (permission.isSystemPermission && (updates.id || updates.category)) {
      throw new Error('Não é possível alterar ID ou categoria de permissões do sistema');
    }

    setPermissions(prev => prev.map(p => 
      p.id === id 
        ? { ...p, ...updates, updatedAt: new Date() }
        : p
    ));

    success('Permissão atualizada!', `Permissão "${permission.label}" foi atualizada`);
  };

  const deletePermission = (id: string): void => {
    const permission = permissions.find(p => p.id === id);
    if (!permission) {
      throw new Error('Permissão não encontrada');
    }

    if (permission.isSystemPermission) {
      throw new Error('Não é possível excluir permissões do sistema');
    }

    setPermissions(prev => prev.filter(p => p.id !== id));
    success('Permissão excluída!', `Permissão "${permission.label}" foi removida`);
  };

  const getPermissionById = (id: string): Permission | undefined => {
    return permissions.find(p => p.id === id);
  };

  // CRUD de Templates de Roles
  const addRoleTemplate = (data: Omit<RoleTemplate, 'id'>): void => {
    const newTemplate: RoleTemplate = {
      id: generateId(),
      ...data
    };

    setRoleTemplates(prev => [...prev, newTemplate]);
    success('Template criado!', `Template "${data.name}" foi criado`);
  };

  const updateRoleTemplate = (id: string, updates: Partial<RoleTemplate>): void => {
    setRoleTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
    success('Template atualizado!', 'Template foi atualizado com sucesso');
  };

  const deleteRoleTemplate = (id: string): void => {
    const template = roleTemplates.find(t => t.id === id);
    if (!template) {
      throw new Error('Template não encontrado');
    }

    if (template.isDefault) {
      throw new Error('Não é possível excluir templates padrão');
    }

    setRoleTemplates(prev => prev.filter(t => t.id !== id));
    success('Template excluído!', `Template "${template.name}" foi removido`);
  };

  const getRoleTemplate = (role: string): RoleTemplate | undefined => {
    return roleTemplates.find(t => t.role === role && t.isDefault);
  };

  // Histórico de mudanças
  const addPermissionChange = (data: Omit<PermissionChange, 'id' | 'changedAt'>): void => {
    const newChange: PermissionChange = {
      id: generateId(),
      changedAt: new Date(),
      ...data
    };

    setPermissionHistory(prev => [newChange, ...prev.slice(0, 999)]); // Manter últimas 1000 mudanças
  };

  const getUserPermissionHistory = (userId: string): PermissionChange[] => {
    return permissionHistory.filter(change => change.userId === userId);
  };

  // Funções utilitárias
  const getPermissionsByCategory = (category: string): Permission[] => {
    return permissions.filter(p => p.category === category);
  };

  const validateUserPermissions = (userPermissions: string[]): { valid: string[], invalid: string[] } => {
    const validPermissionIds = permissions.map(p => p.id);
    const valid = userPermissions.filter(p => validPermissionIds.includes(p));
    const invalid = userPermissions.filter(p => !validPermissionIds.includes(p));
    
    return { valid, invalid };
  };

  const getInheritedPermissions = (parentUserId: string): string[] => {
    // Esta função seria implementada em conjunto com o UserContext
    // Por enquanto retorna array vazio
    return [];
  };

  const comparePermissions = (user1Permissions: string[], user2Permissions: string[]): {
    common: string[],
    user1Only: string[],
    user2Only: string[]
  } => {
    const common = user1Permissions.filter(p => user2Permissions.includes(p));
    const user1Only = user1Permissions.filter(p => !user2Permissions.includes(p));
    const user2Only = user2Permissions.filter(p => !user1Permissions.includes(p));
    
    return { common, user1Only, user2Only };
  };

  const value: PermissionContextType = {
    permissions,
    addPermission,
    updatePermission,
    deletePermission,
    getPermissionById,
    roleTemplates,
    addRoleTemplate,
    updateRoleTemplate,
    deleteRoleTemplate,
    getRoleTemplate,
    permissionHistory,
    addPermissionChange,
    getUserPermissionHistory,
    getPermissionsByCategory,
    validateUserPermissions,
    getInheritedPermissions,
    comparePermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

// Hook para usar o contexto
export const usePermission = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission deve ser usado dentro de PermissionProvider');
  }
  return context;
};

export default PermissionContext;
