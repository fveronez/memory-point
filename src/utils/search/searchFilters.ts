// src/utils/search/searchFilters.ts
import { SearchableTicket } from './searchHelpers';

export interface SearchFilters {
  categoria?: string;
  prioridade?: string;
  responsavel?: string;
  status?: string;
  stage?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export const applyFilters = (
  tickets: SearchableTicket[],
  filters: SearchFilters
): SearchableTicket[] => {
  return tickets.filter(ticket => {
    // Filtro por categoria
    if (filters.categoria && ticket.categoria !== filters.categoria) {
      return false;
    }

    // Filtro por prioridade
    if (filters.prioridade && ticket.prioridade !== filters.prioridade) {
      return false;
    }

    // Filtro por responsável
    if (filters.responsavel && ticket.responsavel !== filters.responsavel) {
      return false;
    }

    // Filtro por status
    if (filters.status && ticket.status !== filters.status) {
      return false;
    }

    // Filtro por stage
    if (filters.stage && ticket.stage !== filters.stage) {
      return false;
    }

    // Filtro por data
    if (filters.dateRange) {
      const ticketDate = new Date(ticket.dataCriacao);
      if (ticketDate < filters.dateRange.start || ticketDate > filters.dateRange.end) {
        return false;
      }
    }

    return true;
  });
};

export const getFilterOptions = (tickets: SearchableTicket[]) => {
  const options = {
    categorias: [...new Set(tickets.map(t => t.categoria))].filter(Boolean),
    prioridades: [...new Set(tickets.map(t => t.prioridade))].filter(Boolean),
    responsaveis: [...new Set(tickets.map(t => t.responsavel))].filter(Boolean),
    statuses: [...new Set(tickets.map(t => t.status))].filter(Boolean),
    stages: [...new Set(tickets.map(t => t.stage))].filter(Boolean),
  };

  return options;
};