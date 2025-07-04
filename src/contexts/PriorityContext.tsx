import React, { createContext, useContext, useState } from 'react';
import { Priority } from '../types/Common';

interface PriorityContextType {
  priorities: Priority[];
  getActivePriorities: () => Priority[];
  getPriorityByKey: (key: string) => Priority | undefined;
  addPriority: (priorityData: Partial<Priority>) => Priority;
  updatePriority: (id: number, priorityData: Partial<Priority>) => void;
  deletePriority: (id: number) => void;
  togglePriorityActive: (id: number) => void;
  getPriorityStats: () => { total: number; active: number; inactive: number };
}

const PriorityContext = createContext<PriorityContextType | undefined>(undefined);

export const usePriorities = () => {
  const context = useContext(PriorityContext);
  if (!context) {
    throw new Error('usePriorities must be used within a PriorityProvider');
  }
  return context;
};

export const PriorityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [priorities, setPriorities] = useState<Priority[]>([
    { id: 1, name: 'Baixa', key: 'baixa', description: 'Questões menores que podem ser resolvidas quando houver tempo', color: 'green', order: 1, active: true },
    { id: 2, name: 'Média', key: 'media', description: 'Questões importantes que devem ser resolvidas em breve', color: 'yellow', order: 2, active: true },
    { id: 3, name: 'Alta', key: 'alta', description: 'Questões críticas que precisam de atenção imediata', color: 'red', order: 3, active: true }
  ]);

  const getActivePriorities = (): Priority[] => priorities.filter(p => p.active).sort((a, b) => a.order - b.order);
  
  const getPriorityByKey = (key: string): Priority | undefined => priorities.find(p => p.key === key && p.active);
  
  const addPriority = (priorityData: Partial<Priority>): Priority => {
    const newPriority: Priority = {
      id: Date.now(),
      name: priorityData.name || '',
      key: priorityData.name?.toLowerCase().replace(/\s+/g, '-') || '',
      description: priorityData.description || '',
      color: priorityData.color || 'blue',
      order: priorities.length + 1,
      active: true
    };
    setPriorities(prev => [...prev, newPriority]);
    return newPriority;
  };

  const updatePriority = (id: number, priorityData: Partial<Priority>): void => {
    setPriorities(prev => prev.map(priority => 
      priority.id === id ? { 
        ...priority, 
        ...priorityData,
        key: priorityData.name ? priorityData.name.toLowerCase().replace(/\s+/g, '-') : priority.key
      } : priority
    ));
  };

  const deletePriority = (id: number): void => {
    const activePriorities = priorities.filter(p => p.active);
    if (activePriorities.length <= 1) {
      throw new Error('Deve existir pelo menos uma prioridade ativa');
    }
    setPriorities(prev => prev.filter(priority => priority.id !== id));
  };

  const togglePriorityActive = (id: number): void => {
    const priority = priorities.find(p => p.id === id);
    if (!priority) return;

    const activePriorities = priorities.filter(p => p.active && p.id !== id);
    if (priority.active && activePriorities.length === 0) {
      throw new Error('Deve existir pelo menos uma prioridade ativa');
    }

    updatePriority(id, { active: !priority.active });
  };

  const getPriorityStats = () => ({
    total: priorities.length,
    active: priorities.filter(p => p.active).length,
    inactive: priorities.filter(p => !p.active).length
  });

  return (
    <PriorityContext.Provider value={{ 
      priorities, getActivePriorities, getPriorityByKey, addPriority, updatePriority, 
      deletePriority, togglePriorityActive, getPriorityStats 
    }}>
      {children}
    </PriorityContext.Provider>
  );
};
