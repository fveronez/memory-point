// src/components/search/SearchFilters.tsx
import React from 'react';
import { X, Filter } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../../utils/search/searchFilters';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFilterChange: (key: keyof SearchFiltersType, value: any) => void;
  onRemoveFilter: (key: keyof SearchFiltersType) => void;
  onClearAll: () => void;
  filterOptions: {
    categorias: string[];
    prioridades: string[];
    responsaveis: string[];
    statuses: string[];
    stages: string[];
  };
  isVisible: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFilterChange,
  onRemoveFilter,
  onClearAll,
  filterOptions,
  isVisible,
}) => {
  const hasActiveFilters = Object.keys(filters).length > 0;

  if (!isVisible) return null;

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Limpar todos
          </button>
        )}
      </div>

      {/* Filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            
            const filterKey = key as keyof SearchFiltersType;
            const label = getFilterLabel(filterKey);
            
            return (
              <div
                key={key}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
              >
                <span>{label}: {value}</span>
                <button
                  onClick={() => onRemoveFilter(filterKey)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Controles de filtro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Categoria */}
        <FilterSelect
          label="Categoria"
          value={filters.categoria || ''}
          options={filterOptions.categorias}
          onChange={(value) => onFilterChange('categoria', value)}
          placeholder="Todas as categorias"
        />

        {/* Prioridade */}
        <FilterSelect
          label="Prioridade"
          value={filters.prioridade || ''}
          options={filterOptions.prioridades}
          onChange={(value) => onFilterChange('prioridade', value)}
          placeholder="Todas as prioridades"
        />

        {/* Responsável */}
        <FilterSelect
          label="Responsável"
          value={filters.responsavel || ''}
          options={filterOptions.responsaveis}
          onChange={(value) => onFilterChange('responsavel', value)}
          placeholder="Todos os responsáveis"
        />

        {/* Status */}
        <FilterSelect
          label="Status"
          value={filters.status || ''}
          options={filterOptions.statuses}
          onChange={(value) => onFilterChange('status', value)}
          placeholder="Todos os status"
        />

        {/* Stage */}
        <FilterSelect
          label="Estágio"
          value={filters.stage || ''}
          options={filterOptions.stages}
          onChange={(value) => onFilterChange('stage', value)}
          placeholder="Todos os estágios"
        />
      </div>
    </div>
  );
};

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder,
}) => {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="
          w-full px-3 py-2 text-sm
          border border-gray-300 rounded-md
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          bg-white
        "
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

const getFilterLabel = (key: keyof SearchFiltersType): string => {
  const labels: Record<keyof SearchFiltersType, string> = {
    categoria: 'Categoria',
    prioridade: 'Prioridade',
    responsavel: 'Responsável',
    status: 'Status',
    stage: 'Estágio',
    dateRange: 'Data',
  };
  return labels[key] || key;
};

export default SearchFilters;