// src/utils/search/searchHelpers.ts
export interface SearchableTicket {
    id: string;
    chave: string;
    titulo: string;
    descricao: string;
    categoria: string;
    prioridade: string;
    responsavel: string;
    cliente: string;
    status: string;
    stage: string;
    tags?: string[];
    dataCriacao: string;
  }
  
  export interface SearchResult {
    ticket: SearchableTicket;
    matches: SearchMatch[];
    score: number;
  }
  
  export interface SearchMatch {
    field: string;
    value: string;
    highlightedValue: string;
  }
  
  export const searchTickets = (
    tickets: SearchableTicket[],
    query: string
  ): SearchResult[] => {
    if (!query.trim()) return [];
  
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    const results: SearchResult[] = [];
  
    tickets.forEach(ticket => {
      const matches: SearchMatch[] = [];
      let score = 0;
  
      // Buscar em diferentes campos
      const searchFields = [
        { field: 'titulo', value: ticket.titulo, weight: 3 },
        { field: 'chave', value: ticket.chave, weight: 2 },
        { field: 'descricao', value: ticket.descricao, weight: 2 },
        { field: 'categoria', value: ticket.categoria, weight: 1 },
        { field: 'responsavel', value: ticket.responsavel, weight: 1 },
        { field: 'cliente', value: ticket.cliente, weight: 1 },
        { field: 'tags', value: ticket.tags?.join(' ') || '', weight: 1 },
      ];
  
      searchFields.forEach(({ field, value, weight }) => {
        if (value && typeof value === 'string') {
          const lowerValue = value.toLowerCase();
          const fieldMatches = searchTerms.filter(term => 
            lowerValue.includes(term)
          );
  
          if (fieldMatches.length > 0) {
            matches.push({
              field,
              value,
              highlightedValue: highlightMatches(value, fieldMatches)
            });
            score += fieldMatches.length * weight;
          }
        }
      });
  
      if (matches.length > 0) {
        results.push({ ticket, matches, score });
      }
    });
  
    return results.sort((a, b) => b.score - a.score);
  };
  
  const highlightMatches = (text: string, terms: string[]): string => {
    let result = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    });
    return result;
  };