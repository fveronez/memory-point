import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useToast } from '../components/ui/Toast';

// Interfaces
interface Ticket {
  id: string;
  chave: string;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  cliente: string;
  responsavel: string | null;
  stage: string;
  status: string;
  tags: string[];
  dataCriacao: Date;
  ultimaAtualizacao: Date;
  comentarios: Array<{
    id: number;
    autor: string;
    conteudo: string;
    data: Date;
  }>;
}

interface TicketContextType {
  tickets: Ticket[];
  workflow: Record<string, string[]>;
  addTicket: (data: Partial<Ticket>) => Ticket;
addMultipleTickets: (tickets: Partial<Ticket>[]) => void;  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  getStats: () => any;
  validateTicketForm: (data: any) => { isValid: boolean; errors: Record<string, string> };
}

// Workflow padrão do sistema
const defaultWorkflow = {
  cliente: ['novo', 'aguardando-info', 'aprovado'],
  gestao: ['em-analise', 'planejado', 'atribuido'],
  dev: ['em-desenvolvimento', 'code-review', 'teste', 'concluido']
};

// Tickets iniciais (apenas se não existir no localStorage)
const initialTickets: Ticket[] = [
  {
    id: '1',
    chave: 'TICK-001',
    titulo: 'Sistema de autenticação não funciona',
    descricao: 'Usuários não conseguem fazer login no sistema. O erro aparece após inserir credenciais válidas.',
    categoria: 'bug',
    prioridade: 'alta',
    cliente: 'Empresa Alpha Ltda',
    responsavel: null,
    stage: 'cliente',
    status: 'novo',
    tags: ['login', 'urgente'],
    dataCriacao: new Date('2024-01-15T09:30:00'),
    ultimaAtualizacao: new Date('2024-01-15T09:30:00'),
    comentarios: []
  },
  {
    id: '2',
    chave: 'TICK-002',
    titulo: 'Implementar dashboard de relatórios',
    descricao: 'Criar dashboard com métricas de vendas e performance para o módulo administrativo.',
    categoria: 'feature',
    prioridade: 'media',
    cliente: 'Beta Corp',
    responsavel: 'João Silva',
    stage: 'gestao',
    status: 'planejado',
    tags: ['dashboard', 'relatórios'],
    dataCriacao: new Date('2024-01-14T14:20:00'),
    ultimaAtualizacao: new Date('2024-01-16T11:45:00'),
    comentarios: [
      {
        id: 1,
        autor: 'Ana Santos',
        conteudo: 'Revisei os requisitos. Parece estar tudo em ordem.',
        data: new Date('2024-01-16T10:30:00')
      }
    ]
  },
  {
    id: '3',
    chave: 'TICK-003',
    titulo: 'Otimizar performance da página inicial',
    descricao: 'A página inicial está carregando muito lentamente. Precisa de otimização.',
    categoria: 'improvement',
    prioridade: 'media',
    cliente: 'Gamma Solutions',
    responsavel: 'Carlos Lima',
    stage: 'dev',
    status: 'em-desenvolvimento',
    tags: ['performance', 'frontend'],
    dataCriacao: new Date('2024-01-12T16:15:00'),
    ultimaAtualizacao: new Date('2024-01-17T09:20:00'),
    comentarios: [
      {
        id: 1,
        autor: 'Carlos Lima',
        conteudo: 'Identificei alguns gargalos no carregamento de imagens.',
        data: new Date('2024-01-17T09:20:00')
      }
    ]
  }
];

// Contexto
const TicketContext = createContext<TicketContextType | undefined>(undefined);

// Provider
export const TicketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Usar localStorage para persistir tickets
  const [tickets, setTickets] = useLocalStorage('sistema-tickets', initialTickets, {
    // Serialização customizada para Dates
    serialize: (tickets) => JSON.stringify(tickets, (key, value) => {
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    }),
    deserialize: (str) => JSON.parse(str, (key, value) => {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    }),
    syncAcrossTabs: true
  });

  const { success } = useToast();

  // Função para gerar chave única do ticket
  const generateTicketKey = (): string => {
    const lastTicket = tickets
      .map(t => parseInt(t.chave.replace('TICK-', '')))
      .filter(n => !isNaN(n))
      .sort((a, b) => b - a)[0] || 0;
    
    return `TICK-${String(lastTicket + 1).padStart(3, '0')}`;
  };

  // Adicionar ticket
  const addTicket = (data: Partial<Ticket>): Ticket => {
    const now = new Date();
    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      chave: generateTicketKey(),
      titulo: data.titulo || '',
      descricao: data.descricao || '',
      categoria: data.categoria || 'bug',
      prioridade: data.prioridade || 'media',
      cliente: data.cliente || '',
      responsavel: data.responsavel || null,
      stage: 'cliente',
      status: 'novo',
      tags: data.tags || [],
      dataCriacao: now,
      ultimaAtualizacao: now,
      comentarios: []
    };

    setTickets(prev => [...prev, newTicket]);
    return newTicket;
  };

  // Atualizar ticket
  const updateTicket = (id: string, updates: Partial<Ticket>): void => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === id 
        ? { 
            ...ticket, 
            ...updates, 
            ultimaAtualizacao: new Date()
          }
        : ticket
    ));
  };

  // Deletar ticket
  const deleteTicket = (id: string): void => {
    setTickets(prev => prev.filter(ticket => ticket.id !== id));
  };

  // Obter estatísticas
  const getStats = () => {
    const totalTickets = tickets.length;
    
    const ticketsByStage = {
      cliente: tickets.filter(t => t.stage === 'cliente').length,
      gestao: tickets.filter(t => t.stage === 'gestao').length,
      dev: tickets.filter(t => t.stage === 'dev').length
    };

    const ticketsByPriority = [
      {
        nome: 'Alta',
        count: tickets.filter(t => t.prioridade === 'alta').length,
        cor: 'bg-red-500'
      },
      {
        nome: 'Média',
        count: tickets.filter(t => t.prioridade === 'media').length,
        cor: 'bg-yellow-500'
      },
      {
        nome: 'Baixa',
        count: tickets.filter(t => t.prioridade === 'baixa').length,
        cor: 'bg-green-500'
      }
    ];

    const ticketsByCategory = [
      {
        nome: 'Bug',
        count: tickets.filter(t => t.categoria === 'bug').length,
        icone: '🐛'
      },
      {
        nome: 'Feature',
        count: tickets.filter(t => t.categoria === 'feature').length,
        icone: '✨'
      },
      {
        nome: 'Improvement',
        count: tickets.filter(t => t.categoria === 'improvement').length,
        icone: '🚀'
      },
      {
        nome: 'Task',
        count: tickets.filter(t => t.categoria === 'task').length,
        icone: '📋'
      }
    ];

    return {
      totalTickets,
      ticketsByStage,
      ticketsByPriority,
      ticketsByCategory
    };
  };

  // Validar formulário de ticket
  const validateTicketForm = (data: any): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!data.titulo?.trim()) {
      errors.titulo = 'Título é obrigatório';
    } else if (data.titulo.length < 5) {
      errors.titulo = 'Título deve ter pelo menos 5 caracteres';
    }

    if (!data.descricao?.trim()) {
      errors.descricao = 'Descrição é obrigatória';
    } else if (data.descricao.length < 10) {
      errors.descricao = 'Descrição deve ter pelo menos 10 caracteres';
    }

    if (!data.cliente?.trim()) {
      errors.cliente = 'Cliente é obrigatório';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };


// Adicionar múltiplos tickets (para importação Excel)
const addMultipleTickets = (ticketsData: Partial<Ticket>[]): void => {
const now = new Date();
const newTickets: Ticket[] = ticketsData.map((data, index) => ({
id: Math.random().toString(36).substr(2, 9),
chave: data.chave || generateTicketKey(),
titulo: data.titulo || "",
descricao: data.descricao || "",
categoria: data.categoria || "suporte",
prioridade: data.prioridade || "media",
cliente: data.cliente || "",
responsavel: data.responsavel || null,
stage: data.stage || "cliente",
status: data.status || "novo",
tags: data.tags || [],
dataCriacao: data.dataCriacao || now,
ultimaAtualizacao: now,
comentarios: []
}));

setTickets(prev => [...prev, ...newTickets]);
};
  const value: TicketContextType = {
    tickets,
    workflow: defaultWorkflow,
    addTicket,
addMultipleTickets,    updateTicket,
    deleteTicket,
    getStats,
    validateTicketForm
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
};

// Hook para usar o contexto
export const useTicket = (): TicketContextType => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicket deve ser usado dentro de TicketProvider');
  }
  return context;
};

export default TicketContext;

  // Adicionar múltiplos tickets (para importação Excel)
  const addMultipleTickets = (ticketsData: Partial<Ticket>[]): void => {
    const now = new Date();
    const newTickets: Ticket[] = ticketsData.map((data, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      chave: data.chave || generateTicketKey(),
      titulo: data.titulo || '',
      descricao: data.descricao || '',
      categoria: data.categoria || 'suporte',
      prioridade: data.prioridade || 'media',
      cliente: data.cliente || '',
      responsavel: data.responsavel || null,
      stage: data.stage || 'cliente',
      status: data.status || 'novo',
      tags: data.tags || [],
      dataCriacao: data.dataCriacao || now,
      ultimaAtualizacao: now,
      comentarios: []
    }));
    
    setTickets(prev => [...prev, ...newTickets]);
  };
