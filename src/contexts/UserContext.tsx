import React, { createContext, useContext, useState } from 'react';
import { User, UserStats } from '../types/User';

interface UserContextType {
  users: User[];
  currentUser: User | null;
  hasPermission: (permission: string) => boolean;
  switchUser: (userId: number) => boolean;
  addUser: (userData: Partial<User>) => User;
  updateUser: (id: number, userData: Partial<User>) => void;
  deleteUser: (id: number) => void;
  toggleUserActive: (id: number) => void;
  searchUsers: (query: string) => User[];
  getUserStats: () => UserStats;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1, name: 'Admin Sistema', email: 'admin@sistema.com', username: 'admin', role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+Sistema&background=3b82f6&color=fff', 
      active: true, createdAt: new Date('2024-01-01'), lastLogin: new Date()
    },
    {
      id: 2, name: 'João Silva', email: 'joao@empresa.com', username: 'manager', role: 'manager',
      avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=10b981&color=fff', 
      active: true, createdAt: new Date('2024-02-15'), lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 3, name: 'Maria Santos', email: 'maria@empresa.com', username: 'support', role: 'support',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=f59e0b&color=fff', 
      active: true, createdAt: new Date('2024-03-10'), lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(users[0]);
  
  const permissions = {
    admin: ['cliente', 'gestao', 'dev', 'config'],
    manager: ['cliente', 'gestao', 'config'],
    support: ['cliente', 'gestao']
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    return permissions[currentUser.role]?.includes(permission) || false;
  };

  const switchUser = (userId: number): boolean => {
    const user = users.find(u => u.id === userId);
    if (user && user.active) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const addUser = (userData: Partial<User>): User => {
    const newUser: User = {
      id: Date.now(),
      name: userData.name || '',
      email: userData.email || '',
      username: userData.username || '',
      role: userData.role || 'support',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || '')}&background=6366f1&color=fff`,
      active: true, 
      createdAt: new Date(), 
      lastLogin: null
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: number, userData: Partial<User>): void => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...userData } : user));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
    }
  };

  const deleteUser = (id: number): void => {
    if (currentUser?.id === id) throw new Error('Não é possível deletar o próprio usuário');
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const toggleUserActive = (id: number): void => {
    const user = users.find(u => u.id === id);
    if (user) {
      updateUser(id, { active: !user.active });
    }
  };

  const searchUsers = (query: string): User[] => {
    if (!query) return users;
    const lowerQuery = query.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery) ||
      user.username.toLowerCase().includes(lowerQuery)
    );
  };

  const getUserStats = (): UserStats => ({
    total: users.length,
    active: users.filter(u => u.active).length,
    inactive: users.filter(u => !u.active).length,
    byRole: {
      admin: users.filter(u => u.role === 'admin').length,
      manager: users.filter(u => u.role === 'manager').length,
      support: users.filter(u => u.role === 'support').length
    }
  });

  return (
    <UserContext.Provider value={{
      users, currentUser, hasPermission, switchUser, addUser, updateUser, deleteUser, 
      toggleUserActive, searchUsers, getUserStats
    }}>
      {children}
    </UserContext.Provider>
  );
};
