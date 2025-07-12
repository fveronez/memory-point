import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useToast } from '../components/ui/Toast';

// Interface
interface Category {
  id: string;
  nome: string;
  label: string;
  icone: string;
  cor: string;
  descricao?: string;
}

interface CategoryContextType {
  categories: Category[];
  addCategory: (data: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
}

// Categorias iniciais (apenas se não existir no localStorage)
const initialCategories: Category[] = [
  {
    id: '1',
    nome: 'bug',
    label: 'Bug',
    icone: '🐛',
    cor: 'bg-red-500',
    descricao: 'Problemas, erros ou falhas no sistema'
  },
  {
    id: '2',
    nome: 'feature',
    label: 'Nova Funcionalidade',
    icone: '✨',
    cor: 'bg-blue-500',
    descricao: 'Solicitações de novas funcionalidades'
  },
  {
    id: '3',
    nome: 'improvement',
    label: 'Melhoria',
    icone: '🚀',
    cor: 'bg-green-500',
    descricao: 'Melhorias em funcionalidades existentes'
  },
  {
    id: '4',
    nome: 'task',
    label: 'Tarefa',
    icone: '📋',
    cor: 'bg-yellow-500',
    descricao: 'Tarefas gerais e administrativas'
  },
  {
    id: '5',
    nome: 'documentation',
    label: 'Documentação',
    icone: '📊',
    cor: 'bg-purple-500',
    descricao: 'Criação ou atualização de documentação'
  }
];

// Contexto
const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Provider
export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Usar localStorage para persistir categorias
  const [categories, setCategories] = useLocalStorage('sistema-categorias', initialCategories, {
    syncAcrossTabs: true
  });

  const { success } = useToast();

  // Gerar ID único
  const generateId = (): string => {
    const maxId = Math.max(...categories.map(cat => parseInt(cat.id) || 0), 0);
    return String(maxId + 1);
  };

  // Adicionar categoria
  const addCategory = (data: Omit<Category, 'id'>): void => {
    // Verificar se já existe categoria com o mesmo nome
    const existingCategory = categories.find(cat => cat.nome.toLowerCase() === data.nome.toLowerCase());
    if (existingCategory) {
      throw new Error('Já existe uma categoria com este nome');
    }

    const newCategory: Category = {
      id: generateId(),
      ...data
    };

    setCategories(prev => [...prev, newCategory]);
  };

  // Atualizar categoria
  const updateCategory = (id: string, updates: Partial<Category>): void => {
    // Verificar se o nome atualizado não conflita com outras categorias
    if (updates.nome) {
      const existingCategory = categories.find(cat => 
        cat.nome.toLowerCase() === updates.nome!.toLowerCase() && cat.id !== id
      );
      if (existingCategory) {
        throw new Error('Já existe uma categoria com este nome');
      }
    }

    setCategories(prev => prev.map(category => 
      category.id === id 
        ? { ...category, ...updates }
        : category
    ));
  };

  // Deletar categoria
  const deleteCategory = (id: string): void => {
    // Verificar se não é uma categoria padrão (IDs 1-5)
    const categoryToDelete = categories.find(cat => cat.id === id);
    if (!categoryToDelete) {
      throw new Error('Categoria não encontrada');
    }

    // Verificar se há tickets usando esta categoria
    // Nota: Em uma implementação real, você verificaria com o TicketContext
    // Por agora, permitimos deletar qualquer categoria

    setCategories(prev => prev.filter(category => category.id !== id));
  };

  // Obter categoria por ID
  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(category => category.id === id);
  };

  const value: CategoryContextType = {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

// Hook para usar o contexto
export const useCategory = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory deve ser usado dentro de CategoryProvider');
  }
  return context;
};

export default CategoryContext;