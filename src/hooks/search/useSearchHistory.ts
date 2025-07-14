// src/hooks/search/useSearchHistory.ts
import { useState, useEffect } from 'react';
import { useLocalStorage } from '../useLocalStorage';

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  resultsCount: number;
}

export const useSearchHistory = (maxItems: number = 10) => {
  const [history, setHistory] = useLocalStorage<SearchHistoryItem[]>('search-history', []);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Atualizar buscas recentes quando histórico muda
  useEffect(() => {
    const recent = history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(item => item.query);
    setRecentSearches(recent);
  }, [history]);

  const addToHistory = (query: string, resultsCount: number) => {
    if (!query.trim()) return;

    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: Date.now(),
      resultsCount,
    };

    setHistory(prev => {
      // Remover duplicatas
      const filtered = prev.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase()
      );
      
      // Adicionar novo item e manter apenas os últimos maxItems
      const updated = [newItem, ...filtered].slice(0, maxItems);
      return updated;
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const getPopularSearches = (limit: number = 5) => {
    const searchCounts = history.reduce((acc, item) => {
      acc[item.query] = (acc[item.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(searchCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([query]) => query);
  };

  const getSuggestions = (currentQuery: string, limit: number = 5) => {
    if (!currentQuery.trim()) return recentSearches.slice(0, limit);

    const query = currentQuery.toLowerCase();
    const suggestions = history
      .filter(item => 
        item.query.toLowerCase().includes(query) && 
        item.query.toLowerCase() !== query
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(item => item.query);

    return suggestions;
  };

  return {
    history,
    recentSearches,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getPopularSearches,
    getSuggestions,
  };
};