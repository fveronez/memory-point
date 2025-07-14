// src/components/search/SearchResults.tsx
import React from 'react';
import { Eye, Edit3, Calendar, User, Tag } from 'lucide-react';
import { SearchResult } from '../../utils/search/searchHelpers';
import { HighlightedText, getTextPreview } from '../../utils/search/searchHighlight';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  selectedIndex: number;
  onResultClick: (ticket: any) => void;
  onView?: (ticket: any) => void;
  onEdit?: (ticket: any) => void;
  maxResults?: number;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  selectedIndex,
  onResultClick,
  onView,
  onEdit,
  maxResults = 10,
}) => {
  const displayResults = results.slice(0, maxResults);
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);

  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="text-sm">Nenhum resultado encontrado</div>
        <div className="text-xs text-gray-400 mt-1">
          Tente usar termos diferentes ou remover filtros
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {/* Header com contagem */}
      {results.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600">
            {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            {results.length > maxResults && ` (mostrando ${maxResults})`}
          </div>
        </div>
      )}

      {/* Lista de resultados */}
      <div className="divide-y divide-gray-100">
        {displayResults.map((result, index) => (
          <SearchResultItem
            key={result.ticket.id}
            result={result}
            searchTerms={searchTerms}
            isSelected={index === selectedIndex}
            onClick={() => onResultClick(result.ticket)}
            onView={onView}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Footer com mais resultados */}
      {results.length > maxResults && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            +{results.length - maxResults} resultados adicionais
          </div>
        </div>
      )}
    </div>
  );
};

interface SearchResultItemProps {
  result: SearchResult;
  searchTerms: string[];
  isSelected: boolean;
  onClick: () => void;
  onView?: (ticket: any) => void;
  onEdit?: (ticket: any) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  searchTerms,
  isSelected,
  onClick,
  onView,
  onEdit,
}) => {
  const { ticket } = result;

  return (
    <div
      className={`
        p-4 cursor-pointer transition-colors duration-150
        ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}
      `}
      onClick={onClick}
    >
      {/* Header com chave e ações */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-gray-600">
            <HighlightedText text={ticket.chave} searchTerms={searchTerms} />
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">{ticket.categoria}</span>
        </div>
        
        <div className="flex gap-1">
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(ticket);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
              title="Visualizar"
            >
              <Eye size={14} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(ticket);
              }}
              className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
              title="Editar"
            >
              <Edit3 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Título */}
      <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
        <HighlightedText text={ticket.titulo} searchTerms={searchTerms} />
      </h4>

      {/* Descrição com preview */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        <HighlightedText 
          text={getTextPreview(ticket.descricao, searchTerms, 120)} 
          searchTerms={searchTerms} 
        />
      </p>

      {/* Footer com informações */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          {ticket.responsavel && (
            <div className="flex items-center gap-1">
              <User size={12} />
              <span>{ticket.responsavel}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{new Date(ticket.dataCriacao).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${ticket.prioridade === 'Alta' ? 'bg-red-100 text-red-800' : 
              ticket.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-green-100 text-green-800'}
          `}>
            {ticket.prioridade}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;