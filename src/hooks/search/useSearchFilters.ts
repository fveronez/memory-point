// src/hooks/search/useSearchFilters.ts
import { useState, useMemo } from 'react';
import { useTicket } from '../../contexts/TicketContext';
import { SearchFilters, getFilterOptions } from '../../utils/search/searchFilters';

export const useSearchFilters = () => {
  const { tickets } = useTicket();
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});

  // Opções disponíveis para filtros
  const filterOptions = useMemo(() => {
    const searchableTickets = tickets.map(ticket => ({
      id: ticket.id,
      chave: ticket.chave,
      titulo: ticket.titulo,
      descricao: ticket.descricao,
      categoria: ticket.categoria,
      prioridade: ticket.prioridade,
      responsavel: ticket.responsavel,
      cliente: ticket.cliente,
      status: ticket.status,
      stage: ticket.stage,
      tags: ticket.tags,
      dataCriacao: ticket.dataCriacao,
    }));

    return getFilterOptions(searchableTickets);
  }, [tickets]);

  const setFilter = (key: keyof SearchFilters, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const removeFilter = (key: keyof SearchFilters) => {
    setActiveFilters(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  const hasActiveFilters = useMemo(() => {
    return Object.keys(activeFilters).length > 0;
  }, [activeFilters]);

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length;
  };

  const getFilterLabel = (key: keyof SearchFilters): string => {
    const labels: Record<keyof SearchFilters, string> = {
      categoria: 'Categoria',
      prioridade: 'Prioridade',
      responsavel: 'Responsável',
      status: 'Status',
      stage: 'Estágio',
      dateRange: 'Data',
    };
    return labels[key] || key;
  };

  const getActiveFiltersDescription = (): string[] => {
    const descriptions: string[] = [];
    
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        const label = getFilterLabel(key as keyof SearchFilters);
        if (key === 'dateRange' && typeof value === 'object') {
          descriptions.push(`${label}: ${value.start} - ${value.end}`);
        } else {
          descriptions.push(`${label}: ${value}`);
        }
      }
    });
    
    return descriptions;
  };

  return {
    activeFilters,
    setActiveFilters,
    setFilter,
    removeFilter,
    clearAllFilters,
    hasActiveFilters,
    getActiveFilterCount,
    getFilterLabel,
    getActiveFiltersDescription,
    filterOptions,
  };
};