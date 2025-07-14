import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useToast } from '../components/ui/Toast';

// Interface
interface User {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'gestor' | 'dev' | 'suporte';
  status: 'ativo' | 'inativo';
  iniciais: string;
  dataCriacao: Date;
  ultimoLogin?: Date;
  permissions: string[];
}

interface UserContextType {
  users: User[];
  currentUser: User | null;
  addUser: (data: Omit<User, 'id' | 'dataCriacao' | 'iniciais'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
  hasPermission: (permission: string) => boolean;
  setCurrentUser: (user: User) => void;
}

// Usuários iniciais
const initialUsers: User[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@empresa.com',
    role: 'admin',
    status: 'ativo',
    iniciais: 'JS',
    dataCriacao: new Date('2024-01-01'),
    ultimoLogin: new Date(),
    permissions: ['create', 'read', 'update', 'delete', 'admin']
  },
  {
    id: '2',
    nome: 'Ana Santos',
    email: 'ana.santos@empresa.com',
    role: 'gestor',
    status: 'ativo',
    iniciais: 'AS',
    dataCriacao: new Date('2024-01-05'),
    ultimoLogin: new Date('2024-01-15'),
    permissions: ['create', 'read', 'update', 'delete', 'admin']
  },
  {
    id: '3',
    nome: 'Carlos Lima',
    email: 'carlos.lima@empresa.com',
    role: 'dev',
    status: 'ativo',
    iniciais: 'CL',
    dataCriacao: new Date('2024-01-10'),
    ultimoLogin: new Date('2024-01-16'),
    permissions: ['create', 'read', 'update']
  },
  {
    id: '4',
    nome: 'Maria Costa',
    email: 'maria.costa@empresa.com',
    role: 'suporte',
    status: 'ativo',
    iniciais: 'MC',
    dataCriacao: new Date('2024-01-12'),
    ultimoLogin: new Date('2024-01-17'),
    permissions: ['read', 'update']
  }
];

// Contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Usar localStorage para persistir usuários
  const [users, setUsers] = useLocalStorage('sistema-usuarios', initialUsers, {
    serialize: (users) => JSON.stringify(users, (key, value) => {
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

  const [currentUser, setCurrentUser] = useLocalStorage('sistema-usuario-atual', users[0] || null, {
    syncAcrossTabs: true
  });

  const { success } = useToast();

  // Gerar iniciais
  const generateIniciais = (nome: string): string => {
    return nome.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Gerar ID único
  const generateId = (): string => {
    const maxId = Math.max(...users.map(user => parseInt(user.id) || 0), 0);
    return String(maxId + 1);
  };

  // Obter permissões por role
  const getRolePermissions = (role: string): string[] => {
    const rolePermissions = {
      admin: ['create', 'read', 'update', 'delete', 'admin', 'manage'],
      gestor: ['create', 'read', 'update', 'manage'],
      dev: ['create', 'read', 'update'],
      suporte: ['read', 'update']
    };
    return rolePermissions[role as keyof typeof rolePermissions] || ['read'];
  };

  // Adicionar usuário
  const addUser = (data: Omit<User, 'id' | 'dataCriacao' | 'iniciais'>): void => {
    // Verificar se email já existe
    const existingUser = users.find(user => user.email.toLowerCase() === data.email.toLowerCase());
    if (existingUser) {
      throw new Error('Já existe um usuário com este email');
    }

    const newUser: User = {
      id: generateId(),
      iniciais: generateIniciais(data.nome),
      dataCriacao: new Date(),
      permissions: data.permissions || getRolePermissions(data.role),
      ...data
    };

    setUsers(prev => [...prev, newUser]);
  };

  // Atualizar usuário
  const updateUser = (id: string, updates: Partial<User>): void => {
    // Verificar se email não conflita
    if (updates.email) {
      const existingUser = users.find(user => 
        user.email.toLowerCase() === updates.email!.toLowerCase() && user.id !== id
      );
      if (existingUser) {
        throw new Error('Já existe um usuário com este email');
      }
    }

    // Atualizar iniciais se nome mudou
    if (updates.nome) {
      updates.iniciais = generateIniciais(updates.nome);
    }

    // Atualizar permissões se role mudou
    if (updates.role && !updates.permissions) {
      updates.permissions = getRolePermissions(updates.role);
    }

    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, ...updates }
        : user
    ));

    // Atualizar currentUser se foi ele que mudou
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  // Deletar usuário
  const deleteUser = (id: string): void => {
    const userToDelete = users.find(user => user.id === id);
    if (!userToDelete) {
      throw new Error('Usuário não encontrado');
    }

    // Não permitir deletar admin principal
    if (userToDelete.id === '1') {
      throw new Error('Não é possível excluir o administrador principal');
    }

    setUsers(prev => prev.filter(user => user.id !== id));

    // Se deletou o usuário atual, trocar para admin
    if (currentUser && currentUser.id === id) {
      const adminUser = users.find(user => user.role === 'admin' && user.id !== id);
      setCurrentUser(adminUser || users[0] || null);
    }
  };

  // Obter usuário por ID
  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  // Verificar permissão
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission) || currentUser.permissions.includes('admin');
  };

  const value: UserContextType = {
    users: users.sort((a, b) => a.nome.localeCompare(b.nome)),
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    getUserById,
    hasPermission,
    setCurrentUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar o contexto
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de UserProvider');
  }
  return context;
};

export default UserContext;