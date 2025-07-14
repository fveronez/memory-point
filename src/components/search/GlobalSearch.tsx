// src/components/search/GlobalSearch.tsx
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SearchOverlay from './SearchOverlay';
import { useSearch } from '../../hooks/search/useSearch';
import { useSearchHistory } from '../../hooks/search/useSearchHistory';
import { useSearchFilters } from '../../hooks/search/useSearchFilters';

interface GlobalSearchProps {
  onTicketSelect?: (ticket: any) => void;
  onTicketView?: (ticket: any) => void;
  onTicketEdit?: (ticket: any) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onTicketSelect,
  onTicketView,
  onTicketEdit,
}) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  
  const {
    query,
    setQuery,
    searchResults,
    isSearching,
    selectedIndex,
    handleKeyDown,
    clearSearch,
    totalResults,
  } = useSearch();

  const {
    recentSearches,
    addToHistory,
    getPopularSearches,
  } = useSearchHistory();

  const {
    activeFilters,
    setFilter,
    removeFilter,
    clearAllFilters,
    filterOptions,
  } = useSearchFilters();

  // Shortcuts de teclado globais
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K ou Cmd+K para abrir busca
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOverlayOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Adicionar ao histórico quando busca for realizada
  useEffect(() => {
    if (query && searchResults.length > 0) {
      const timeoutId = setTimeout(() => {
        addToHistory(query, searchResults.length);
      }, 1000); // Delay para evitar muitas adições

      return () => clearTimeout(timeoutId);
    }
  }, [query, searchResults.length, addToHistory]);

  const handleResultClick = (ticket: any) => {
    onTicketSelect?.(ticket);
    setIsOverlayOpen(false);
  };

  const handleView = (ticket: any) => {
    onTicketView?.(ticket);
    setIsOverlayOpen(false);
  };

  const handleEdit = (ticket: any) => {
    onTicketEdit?.(ticket);
    setIsOverlayOpen(false);
  };

  const handleKeyDownWithResult = (e: React.KeyboardEvent) => {
    const result = handleKeyDown(e);
    if (result) {
      handleResultClick(result);
    }
  };

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    clearSearch();
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOverlayOpen(true)}
        className="
          flex items-center gap-2 px-3 py-2 
          text-gray-500 hover:text-gray-700
          bg-gray-100 hover:bg-gray-200
          rounded-lg transition-colors
          border border-gray-200
          min-w-[200px] justify-start
        "
      >
        <Search size={16} />
        <span className="text-sm">Buscar tickets...</span>
        <div className="ml-auto flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-300 rounded">⌘</kbd>
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-300 rounded">K</kbd>
        </div>
      </button>

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        query={query}
        onQueryChange={setQuery}
        onKeyDown={handleKeyDownWithResult}
        searchResults={searchResults}
        selectedIndex={selectedIndex}
        isLoading={isSearching}
        filters={activeFilters}
        onFilterChange={setFilter}
        onRemoveFilter={removeFilter}
        onClearAllFilters={clearAllFilters}
        filterOptions={filterOptions}
        recentSearches={recentSearches}
        popularSearches={getPopularSearches()}
        onResultClick={handleResultClick}
        onView={handleView}
        onEdit={handleEdit}
        onClearSearch={clearSearch}
      />
    </>
  );
};

export default GlobalSearch;