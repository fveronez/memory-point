// src/components/search/SearchOverlay.tsx
import React, { useEffect } from 'react';
import { X, Clock, TrendingUp } from 'lucide-react';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import SearchFilters from './SearchFilters';
import { SearchResult } from '../../utils/search/searchHelpers';
import { SearchFilters as SearchFiltersType } from '../../utils/search/searchFilters';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  searchResults: SearchResult[];
  selectedIndex: number;
  isLoading: boolean;
  filters: SearchFiltersType;
  onFilterChange: (key: keyof SearchFiltersType, value: any) => void;
  onRemoveFilter: (key: keyof SearchFiltersType) => void;
  onClearAllFilters: () => void;
  filterOptions: any;
  recentSearches: string[];
  popularSearches: string[];
  onResultClick: (ticket: any) => void;
  onView?: (ticket: any) => void;
  onEdit?: (ticket: any) => void;
  onClearSearch: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  query,
  onQueryChange,
  onKeyDown,
  searchResults,
  selectedIndex,
  isLoading,
  filters,
  onFilterChange,
  onRemoveFilter,
  onClearAllFilters,
  filterOptions,
  recentSearches,
  popularSearches,
  onResultClick,
  onView,
  onEdit,
  onClearSearch,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showSuggestions = !query && !isLoading;
  const showResults = query && searchResults.length > 0;
  const showNoResults = query && searchResults.length === 0 && !isLoading;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative flex justify-center pt-16 px-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <div className="flex-1">
              <SearchBar
                query={query}
                onQueryChange={onQueryChange}
                onKeyDown={onKeyDown}
                onClear={onClearSearch}
                placeholder="Buscar em todos os tickets..."
                showFilters={true}
                onToggleFilters={() => setShowFilters(!showFilters)}
                isLoading={isLoading}
                autoFocus={true}
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Filtros */}
          <SearchFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onRemoveFilter={onRemoveFilter}
            onClearAll={onClearAllFilters}
            filterOptions={filterOptions}
            isVisible={showFilters}
          />

          {/* Conteúdo */}
          <div className="flex-1 overflow-hidden">
            {showSuggestions && (
              <SearchSuggestions
                recentSearches={recentSearches}
                popularSearches={popularSearches}
                onSearchSelect={onQueryChange}
              />
            )}

            {showResults && (
              <SearchResults
                results={searchResults}
                query={query}
                selectedIndex={selectedIndex}
                onResultClick={onResultClick}
                onView={onView}
                onEdit={onEdit}
              />
            )}

            {showNoResults && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-lg mb-2">Nenhum resultado encontrado</div>
                <div className="text-sm text-gray-400">
                  Tente usar termos diferentes ou ajustar os filtros
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>↑↓ para navegar</span>
                <span>Enter para selecionar</span>
                <span>Esc para fechar</span>
              </div>
              {searchResults.length > 0 && (
                <span>{searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SearchSuggestionsProps {
  recentSearches: string[];
  popularSearches: string[];
  onSearchSelect: (search: string) => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  recentSearches,
  popularSearches,
  onSearchSelect,
}) => {
  return (
    <div className="p-4 space-y-6">
      {/* Buscas recentes */}
      {recentSearches.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Buscas recentes</span>
          </div>
          <div className="space-y-1">
            {recentSearches.slice(0, 5).map((search, index) => (
              <button
                key={index}
                onClick={() => onSearchSelect(search)}
                className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Buscas populares */}
      {popularSearches.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Buscas populares</span>
          </div>
          <div className="space-y-1">
            {popularSearches.slice(0, 5).map((search, index) => (
              <button
                key={index}
                onClick={() => onSearchSelect(search)}
                className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {recentSearches.length === 0 && popularSearches.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-sm">Comece digitando para buscar tickets</div>
        </div>
      )}
    </div>
  );
};

export default SearchOverlay;