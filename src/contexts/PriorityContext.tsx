import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useToast } from '../components/ui/Toast';

// Interface
interface Priority {
  id: string;
  nome: string;
  label: string;
  nivel: number; // 1 = baixa, 2 = média, 3 = alta, etc.
  cor: string;
  icone: string;
  descricao?: string;
  ativo: boolean;
}

interface PriorityContextType {
  priorities: Priority[];
  addPriority: (data: Omit<Priority, 'id'>) => void;
  updatePriority: (id: string, updates: Partial<Priority>) => void;
  deletePriority: (id: string) => void;
  getPriorityById: (id: string) => Priority | undefined;
  getActivePriorities: () => Priority[];
}

// Prioridades iniciais (apenas se não existir no localStorage)
const initialPriorities: Priority[] = [
  {
    id: '1',
    nome: 'baixa',
    label: 'Baixa',
    nivel: 1,
    cor: 'bg-green-500',
    icone: '🟢',
    descricao: 'Prioridade baixa - pode ser resolvido quando houver tempo',
    ativo: true
  },
  {
    id: '2',
    nome: 'media',
    label: 'Média',
    nivel: 2,
    cor: 'bg-yellow-500',
    icone: '🟡',
    descricao: 'Prioridade média - resolução em prazo normal',
    ativo: true
  },
  {
    id: '3',
    nome: 'alta',
    label: 'Alta',
    nivel: 3,
    cor: 'bg-red-500',
    icone: '🔴',
    descricao: 'Prioridade alta - requer atenção urgente',
    ativo: true
  },
  {
    id: '4',
    nome: 'critica',
    label: 'Crítica',
    nivel: 4,
    cor: 'bg-red-600',
    icone: '🚨',
    descricao: 'Prioridade crítica - resolução imediata necessária',
    ativo: true
  }
];

// Contexto
const PriorityContext = createContext<PriorityContextType | undefined>(undefined);

// Provider
export const PriorityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Usar localStorage para persistir prioridades
  const [priorities, setPriorities] = useLocalStorage('sistema-prioridades', initialPriorities, {
    syncAcrossTabs: true
  });

  const { success } = useToast();

  // Gerar ID único
  const generateId = (): string => {
    const maxId = Math.max(...priorities.map(priority => parseInt(priority.id) || 0), 0);
    return String(maxId + 1);
  };

  // Adicionar prioridade
  const addPriority = (data: Omit<Priority, 'id'>): void => {
    // Verificar se já existe prioridade com o mesmo nome
    const existingPriority = priorities.find(priority => 
      priority.nome.toLowerCase() === data.nome.toLowerCase()
    );
    if (existingPriority) {
      throw new Error('Já existe uma prioridade com este nome');
    }

    // Verificar se já existe prioridade com o mesmo nível
    const existingLevel = priorities.find(priority => priority.nivel === data.nivel);
    if (existingLevel) {
      throw new Error('Já existe uma prioridade com este nível');
    }

    const newPriority: Priority = {
      id: generateId(),
      ...data
    };

    setPriorities(prev => [...prev, newPriority].sort((a, b) => a.nivel - b.nivel));
  };

  // Atualizar prioridade
  const updatePriority = (id: string, updates: Partial<Priority>): void => {
    // Verificar conflitos de nome
    if (updates.nome) {
      const existingPriority = priorities.find(priority => 
        priority.nome.toLowerCase() === updates.nome!.toLowerCase() && priority.id !== id
      );
      if (existingPriority) {
        throw new Error('Já existe uma prioridade com este nome');
      }
    }

    // Verificar conflitos de nível
    if (updates.nivel) {
      const existingLevel = priorities.find(priority => 
        priority.nivel === updates.nivel && priority.id !== id
      );
      if (existingLevel) {
        throw new Error('Já existe uma prioridade com este nível');
      }
    }

    setPriorities(prev => prev.map(priority => 
      priority.id === id 
        ? { ...priority, ...updates }
        : priority
    ).sort((a, b) => a.nivel - b.nivel));
  };

  // Deletar prioridade
  const deletePriority = (id: string): void => {
    const priorityToDelete = priorities.find(priority => priority.id === id);
    if (!priorityToDelete) {
      throw new Error('Prioridade não encontrada');
    }

    // Verificar se não é uma prioridade padrão essencial
    if (['1', '2', '3'].includes(id)) {
      throw new Error('Não é possível excluir prioridades essenciais do sistema');
    }

    // Verificar se há tickets usando esta prioridade
    // Nota: Em uma implementação real, você verificaria com o TicketContext
    // Por agora, permitimos deletar prioridades não essenciais

    setPriorities(prev => prev.filter(priority => priority.id !== id));
  };

  // Obter prioridade por ID
  const getPriorityById = (id: string): Priority | undefined => {
    return priorities.find(priority => priority.id === id);
  };

  // Obter apenas prioridades ativas
  const getActivePriorities = (): Priority[] => {
    return priorities.filter(priority => priority.ativo).sort((a, b) => a.nivel - b.nivel);
  };

  const value: PriorityContextType = {
    priorities: priorities.sort((a, b) => a.nivel - b.nivel),
    addPriority,
    updatePriority,
    deletePriority,
    getPriorityById,
    getActivePriorities
  };

  return (
    <PriorityContext.Provider value={value}>
      {children}
    </PriorityContext.Provider>
  );
};

// Hook para usar o contexto
export const usePriority = (): PriorityContextType => {
  const context = useContext(PriorityContext);
  if (!context) {
    throw new Error('usePriority deve ser usado dentro de PriorityProvider');
  }
  return context;
};

export default PriorityContext;