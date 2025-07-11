import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Bug, Sparkles, Headphones, Settings, Zap } from 'lucide-react';

// Tipos
interface Category {
  id: number;
  nome: string;
  label: string;
  icone: string;
  cor: string;
  ativo: boolean;
  descricao: string;
}

interface CategoryContextType {
  categories: Category[];
  getActiveCategories: () => Category[];
  getCategoryByKey: (key: string) => Category | undefined;
  getCategoryIcon: (iconName: string) => React.ComponentType<any>;
  addCategory: (categoryData: Partial<Category>) => Category;
  updateCategory: (id: number, updates: Partial<Category>) => void;
  toggleCategory: (id: number) => void;
}

// Contexto
const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Provider
export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([
    { 
      id: 1, 
      nome: "bug", 
      label: "Bug", 
      icone: "🐛", 
      cor: "bg-red-500", 
      ativo: true, 
      descricao: "Correção de erros no sistema" 
    },
    { 
      id: 2, 
      nome: "feature", 
      label: "Nova Funcionalidade", 
      icone: "✨", 
      cor: "bg-blue-500", 
      ativo: true, 
      descricao: "Implementação de novos recursos" 
    },
    { 
      id: 3, 
      nome: "suporte", 
      label: "Suporte", 
      icone: "🤝", 
      cor: "bg-green-500", 
      ativo: true, 
      descricao: "Atendimento e orientação ao cliente" 
    },
    { 
      id: 4, 
      nome: "melhoria", 
      label: "Melhoria", 
      icone: "🔧", 
      cor: "bg-yellow-500", 
      ativo: true, 
      descricao: "Aprimoramentos em funcionalidades existentes" 
    },
    { 
      id: 5, 
      nome: "manutencao", 
      label: "Manutenção", 
      icone: "⚙️", 
      cor: "bg-purple-500", 
      ativo: true, 
      descricao: "Manutenção preventiva do sistema" 
    }
  ]);

  const getActiveCategories = (): Category[] => {
    return categories.filter(category => category.ativo);
  };

  const getCategoryByKey = (key: string): Category | undefined => {
    return categories.find(category => category.nome === key);
  };

  const getCategoryIcon = (iconName: string): React.ComponentType<any> => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      bug: Bug,
      sparkles: Sparkles,
      headphones: Headphones,
      settings: Settings,
      zap: Zap
    };
    return iconMap[iconName] || Settings;
  };

  const addCategory = (categoryData: Partial<Category>): Category => {
    const newCategory: Category = {
      id: Math.max(...categories.map(c => c.id), 0) + 1,
      nome: categoryData.nome || '',
      label: categoryData.label || '',
      icone: categoryData.icone || '📝',
      cor: categoryData.cor || 'bg-gray-500',
      ativo: categoryData.ativo ?? true,
      descricao: categoryData.descricao || ''
    };
    
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = (id: number, updates: Partial<Category>): void => {
    setCategories(prev => prev.map(category =>
      category.id === id ? { ...category, ...updates } : category
    ));
  };

  const toggleCategory = (id: number): void => {
    updateCategory(id, { 
      ativo: !categories.find(c => c.id === id)?.ativo 
    });
  };

  const value: CategoryContextType = {
    categories,
    getActiveCategories,
    getCategoryByKey,
    getCategoryIcon,
    addCategory,
    updateCategory,
    toggleCategory
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

// Hook
export const useCategory = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory deve ser usado dentro de CategoryProvider');
  }
  return context;
};