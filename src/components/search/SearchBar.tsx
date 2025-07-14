// src/components/search/SearchBar.tsx
import React, { useRef, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onClear: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  isLoading?: boolean;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onKeyDown,
  onClear,
  onFocus,
  onBlur,
  placeholder = 'Buscar tickets...',
  showFilters = false,
  onToggleFilters,
  isLoading = false,
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    onKeyDown?.(e);
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        {/* Ícone de busca */}
        <div className="absolute left-3 pointer-events-none">
          <Search 
            size={20} 
            className={`text-gray-400 ${isLoading ? 'animate-pulse' : ''}`}
          />
        </div>

        {/* Input de busca */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-20 py-2 
            border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            text-sm
          "
        />

        {/* Botões do lado direito */}
        <div className="absolute right-2 flex items-center gap-1">
          {/* Botão de filtros */}
          {showFilters && (
            <button
              onClick={onToggleFilters}
              className="
                p-1 text-gray-400 hover:text-gray-600 
                rounded transition-colors
              "
              title="Filtros"
            >
              <Filter size={16} />
            </button>
          )}

          {/* Botão de limpar */}
          {query && (
            <button
              onClick={onClear}
              className="
                p-1 text-gray-400 hover:text-gray-600 
                rounded transition-colors
              "
              title="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Indicador de loading */}
      {isLoading && (
        <div className="absolute top-full left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;