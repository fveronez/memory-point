import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Tipos
interface Ticket {
  id: number;
  chave: string;
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta';
  categoria: 'bug' | 'feature' | 'suporte' | 'melhoria' | 'manutencao';
  cliente: string;
  status: string;
  stage: 'cliente' | 'gestao' | 'dev';
  responsavel: string | null;
  dataCriacao: Date;
  ultimaAtualizacao: Date;
  tags: string[];
  comentarios: Array<{
    id: number;
    autor: string;
    conteudo: string;
    data: Date;
  }>;
}

interface Log {
  id: number;
  usuario: any;
  dataHora: Date;
  tipoAtividade: string;
  entidade: string;
  entidadeId: number;
  detalhes: string;
}

interface TicketContextType {
  tickets: Ticket[];
  logs: Log[];
  workflow: Record<string, string[]>;
  addTicket: (ticketData: Partial<Ticket>) => Ticket;
  updateTicket: (ticketId: number, updates: Partial<Ticket>) => void;
  deleteTicket: (ticketId: number) => void;
  moveTicket: (ticketId: number, newStatus: string, newStage: string) => void;
  adicionarLog: (tipoAtividade: string, entidade: string, entidadeId: number, detalhes: string) => void;
  validateTicketForm: (formData: Partial<Ticket>) => { errors: Record<string, string>; isValid: boolean };
  getStats: () => any;
}

// Contexto
const TicketContext = createContext<TicketContextType | undefined>(undefined);

// Provider
export const TicketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estados migrados do AppProvider interno
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 1,
      chave: "TK-001",
      titulo: "Bug crítico na autenticação",
      descricao: "Usuários não conseguem fazer login no sistema. Erro aparece após inserir credenciais válidas.",
      prioridade: "alta",
      categoria: "bug",
      cliente: "Empresa Alpha Ltda",
      status: "novo",
      stage: "cliente",
      responsavel: null,
      dataCriacao: new Date('2024-01-15'),
      ultimaAtualizacao: new Date('2024-01-15'),
      tags: ["crítico", "login", "urgente"],
      comentarios: []
    },
    {
      id: 2,
      chave: "TK-002",
      titulo: "Dashboard administrativo completo",
      descricao: "Implementar dashboard completo com métricas, gráficos e relatórios para administradores do sistema.",
      prioridade: "media",
      categoria: "feature",
      cliente: "Empresa Beta Corp",
      status: "em-analise",
      stage: "gestao",
      responsavel: "João Silva",
      dataCriacao: new Date('2024-01-16'),
      ultimaAtualizacao: new Date('2024-01-16'),
      tags: ["dashboard", "admin", "relatórios"],
      comentarios: [
        { id: 1, autor: "João Silva", conteudo: "Iniciando análise dos requisitos", data: new Date('2024-01-16') }
      ]
    },
    {
      id: 3,
      chave: "TK-003",
      titulo: "Otimização de performance do sistema",
      descricao: "Melhorar velocidade de carregamento das páginas e otimizar consultas ao banco de dados.",
      prioridade: "media",
      categoria: "melhoria",
      cliente: "Empresa Gamma Inc",
      status: "em-desenvolvimento",
      stage: "dev",
      responsavel: "Maria Santos",
      dataCriacao: new Date('2024-01-17'),
      ultimaAtualizacao: new Date('2024-01-17'),
      tags: ["performance", "otimização"],
      comentarios: []
    },
    {
      id: 4,
      chave: "TK-004",
      titulo: "Solicitação de suporte técnico",
      descricao: "Cliente precisa de orientação para configurar integração com API externa.",
      prioridade: "baixa",
      categoria: "suporte",
      cliente: "Empresa Delta SA",
      status: "aguardando-info",
      stage: "cliente",
      responsavel: null,
      dataCriacao: new Date('2024-01-18'),
      ultimaAtualizacao: new Date('2024-01-18'),
      tags: ["api", "integração"],
      comentarios: []
    }
  ]);

  const [logs, setLogs] = useState<Log[]>([
    {
      id: 1,
      usuario: { nome: "Admin Sistema" },
      dataHora: new Date(),
      tipoAtividade: 'sistema',
      entidade: 'sistema',
      entidadeId: 0,
      detalhes: 'Sistema iniciado com sucesso'
    }
  ]);

  const [workflow] = useState({
    cliente: ["novo", "aguardando-info", "aprovado"],
    gestao: ["em-analise", "planejado", "atribuido"],
    dev: ["em-desenvolvimento", "code-review", "teste", "concluido"]
  });

  // Funções migradas do AppProvider interno
  const adicionarLog = useCallback((tipoAtividade: string, entidade: string, entidadeId: number, detalhes: string) => {
    const novoLog: Log = {
      id: Math.max(...logs.map(l => l.id), 0) + 1,
      usuario: { nome: "Usuário Atual" }, // Será integrado com UserContext depois
      dataHora: new Date(),
      tipoAtividade,
      entidade,
      entidadeId,
      detalhes
    };
    setLogs(prev => [novoLog, ...prev]);
  }, [logs]);

  const addTicket = useCallback((ticketData: Partial<Ticket>): Ticket => {
    const newTicket: Ticket = {
      ...ticketData,
      id: Math.max(...tickets.map(t => t.id), 0) + 1,
      chave: `TK-${String(Math.max(...tickets.map(t => t.id), 0) + 1).padStart(3, '0')}`,
      dataCriacao: new Date(),
      ultimaAtualizacao: new Date(),
      status: "novo",
      stage: "cliente",
      comentarios: [],
      tags: ticketData.tags || []
    } as Ticket;
    
    setTickets(prev => [...prev, newTicket]);

    // Log da criação
    adicionarLog('criacao', 'ticket', newTicket.id, `Criou ticket ${newTicket.chave}: "${newTicket.titulo}"`);

    return newTicket;
  }, [tickets, adicionarLog]);

  const updateTicket = useCallback((ticketId: number, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, ...updates, ultimaAtualizacao: new Date() }
        : ticket
    ));
  }, []);

  const deleteTicket = useCallback((ticketId: number) => {
    setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
  }, []);

  const moveTicket = useCallback((ticketId: number, newStatus: string, newStage: string) => {
    updateTicket(ticketId, { status: newStatus, stage: newStage });
  }, [updateTicket]);

  // Validações migradas
  const validateTicketForm = useCallback((formData: Partial<Ticket>) => {
    const errors: Record<string, string> = {};

    if (!formData.titulo?.trim()) {
      errors.titulo = 'Título é obrigatório';
    } else if (formData.titulo.length < 5) {
      errors.titulo = 'Título deve ter pelo menos 5 caracteres';
    }

    if (!formData.descricao?.trim()) {
      errors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.length < 10) {
      errors.descricao = 'Descrição deve ter pelo menos 10 caracteres';
    }

    if (!formData.cliente?.trim()) {
      errors.cliente = 'Cliente é obrigatório';
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  }, []);

  // Estatísticas migradas
  const getStats = useCallback(() => {
    return {
      totalTickets: tickets.length,
      ticketsByStage: {
        cliente: tickets.filter(t => t.stage === 'cliente').length,
        gestao: tickets.filter(t => t.stage === 'gestao').length,
        dev: tickets.filter(t => t.stage === 'dev').length
      },
      ticketsByPriority: [
        { nome: "Alta", count: tickets.filter(t => t.prioridade === 'alta').length, cor: "bg-red-500" },
        { nome: "Média", count: tickets.filter(t => t.prioridade === 'media').length, cor: "bg-yellow-500" },
        { nome: "Baixa", count: tickets.filter(t => t.prioridade === 'baixa').length, cor: "bg-green-500" }
      ],
      ticketsByCategory: [
        { nome: "Bug", count: tickets.filter(t => t.categoria === 'bug').length, icone: "🐛" },
        { nome: "Feature", count: tickets.filter(t => t.categoria === 'feature').length, icone: "✨" },
        { nome: "Suporte", count: tickets.filter(t => t.categoria === 'suporte').length, icone: "🤝" },
        { nome: "Melhoria", count: tickets.filter(t => t.categoria === 'melhoria').length, icone: "🔧" }
      ]
    };
  }, [tickets]);

  const value: TicketContextType = {
    tickets,
    logs,
    workflow,
    addTicket,
    updateTicket,
    deleteTicket,
    moveTicket,
    adicionarLog,
    validateTicketForm,
    getStats
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
};

// Hook
export const useTicket = (): TicketContextType => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicket deve ser usado dentro de TicketProvider');
  }
  return context;
};