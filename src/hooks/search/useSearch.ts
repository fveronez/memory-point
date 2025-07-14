// src/hooks/search/useSearch.ts
import { useState, useEffect, useMemo } from 'react';
import { useTicket } from '../../contexts/TicketContext';
import { searchTickets, SearchResult, SearchableTicket } from '../../utils/search/searchHelpers';
import { applyFilters, SearchFilters } from '../../utils/search/searchFilters';

export const useSearch = () => {
  const { tickets } = useTicket();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Converter tickets para formato de busca
  const searchableTickets: SearchableTicket[] = useMemo(() => {
    return tickets.map(ticket => ({
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
  }, [tickets]);

  // Aplicar filtros e busca
  const searchResults: SearchResult[] = useMemo(() => {
    if (!query.trim()) return [];

    setIsSearching(true);
    
    // Aplicar filtros primeiro
    const filteredTickets = applyFilters(searchableTickets, filters);
    
    // Depois aplicar busca
    const results = searchTickets(filteredTickets, query);
    
    setIsSearching(false);
    return results;
  }, [searchableTickets, query, filters]);

  // Reset selected index quando resultados mudam
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          return searchResults[selectedIndex].ticket;
        }
        break;
      case 'Escape':
        e.preventDefault();
        setQuery('');
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    setFilters({});
    setSelectedIndex(0);
  };

  return {
    query,
    setQuery,
    filters,
    setFilters,
    searchResults,
    isSearching,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    clearSearch,
    hasResults: searchResults.length > 0,
    totalResults: searchResults.length,
  };
};