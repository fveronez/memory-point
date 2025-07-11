import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Tipos
interface User {
  id: number;
  nome: string;
  email: string;
  departamento: string;
  role: 'admin' | 'manager' | 'support' | 'developer';
  status: 'ativo' | 'inativo';
  iniciais: string;
  dataCriacao: Date;
}

interface UserContextType {
  users: User[];
  currentUser: User;
  addUser: (userData: Partial<User>) => User;
  updateUser: (userId: number, updates: Partial<User>) => void;
  deleteUser: (userId: number) => boolean;
  toggleUserStatus: (userId: number) => void;
  setCurrentUser: (user: User) => void;
  hasPermission: (permission: string) => boolean;
  validateUserForm: (formData: Partial<User>) => { errors: Record<string, string>; isValid: boolean };
}

// Contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estados migrados do AppProvider interno
  const [users, setUsers] = useState<User[]>([
    { 
      id: 1, 
      nome: "Admin Sistema", 
      email: "admin@sistema.com", 
      departamento: "TI", 
      role: "admin", 
      status: "ativo", 
      iniciais: "AS", 
      dataCriacao: new Date() 
    },
    { 
      id: 2, 
      nome: "João Silva", 
      email: "joao@empresa.com", 
      departamento: "Desenvolvimento", 
      role: "manager", 
      status: "ativo", 
      iniciais: "JS", 
      dataCriacao: new Date() 
    },
    { 
      id: 3, 
      nome: "Maria Santos", 
      email: "maria@empresa.com", 
      departamento: "Suporte", 
      role: "support", 
      status: "ativo", 
      iniciais: "MS", 
      dataCriacao: new Date() 
    }
  ]);

  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  // Funções migradas do AppProvider interno
  const addUser = useCallback((userData: Partial<User>): User => {
    const newUser: User = {
      ...userData,
      id: Math.max(...users.map(u => u.id), 0) + 1,
      dataCriacao: new Date(),
      status: "ativo",
      iniciais: userData.nome?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'XX'
    } as User;
    
    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, [users]);

  const updateUser = useCallback((userId: number, updates: Partial<User>) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, ...updates } : user
    ));
  }, []);

  const deleteUser = useCallback((userId: number): boolean => {
    if (userId === currentUser.id) {
      alert('Você não pode excluir seu próprio usuário!');
      return false;
    }
    setUsers(prev => prev.filter(user => user.id !== userId));
    return true;
  }, [currentUser.id]);

  const toggleUserStatus = useCallback((userId: number) => {
    updateUser(userId, {
      status: users.find(u => u.id === userId)?.status === 'ativo' ? 'inativo' : 'ativo'
    });
  }, [updateUser, users]);

  // Sistema de permissões migrado
  const hasPermission = useCallback((permission: string): boolean => {
    const permissions = {
      admin: ["cliente", "gestao", "dev", "config"],
      manager: ["cliente", "gestao", "config"],
      support: ["cliente", "gestao"],
      developer: ["gestao", "dev"]
    };
    return permissions[currentUser?.role]?.includes(permission) || false;
  }, [currentUser?.role]);

  // Validações migradas
  const validateUserForm = useCallback((formData: Partial<User>) => {
    const errors: Record<string, string> = {};

    if (!formData.nome?.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  }, []);

  const value: UserContextType = {
    users,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    setCurrentUser,
    hasPermission,
    validateUserForm
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Hook
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de UserProvider');
  }
  return context;
};