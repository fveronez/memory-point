import React, { createContext, useContext, useState } from 'react';
import { Ticket, Comment, TicketStats } from '../types/Ticket';

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticketData: Partial<Ticket>) => Ticket;
  updateTicket: (id: number, ticketData: Partial<Ticket>) => void;
  addComment: (ticketId: number, comment: string, authorId: number) => void;
  getTicketStats: () => TicketStats;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 1, title: 'Bug na autenticação', description: 'Usuários não conseguem fazer login no sistema',
      client: 'Cliente A', stage: 'cliente', status: 'novo', priority: 'alta', category: 'bug',
      assignedTo: null, createdBy: 1, createdAt: new Date('2024-07-01T09:00:00'),
      updatedAt: new Date('2024-07-01T09:00:00'), comments: [], attachments: []
    },
    {
      id: 2, title: 'Dashboard administrativo', description: 'Criar novo dashboard para administradores',
      client: 'Cliente B', stage: 'gestao', status: 'em-analise', priority: 'media', category: 'nova-funcionalidade',
      assignedTo: 2, createdBy: 2, createdAt: new Date('2024-06-30T14:30:00'),
      updatedAt: new Date('2024-07-01T08:15:00'), comments: [
        { id: 1, text: 'Analisando requisitos iniciais', author: 2, createdAt: new Date('2024-07-01T08:15:00') }
      ], attachments: []
    },
    {
      id: 3, title: 'Performance do sistema', description: 'Sistema lento durante horários de pico',
      client: 'Cliente C', stage: 'dev', status: 'em-desenvolvimento', priority: 'media', category: 'melhoria',
      assignedTo: 1, createdBy: 3, createdAt: new Date('2024-06-28T10:00:00'),
      updatedAt: new Date('2024-07-01T16:30:00'), comments: [], attachments: []
    }
  ]);

  const addTicket = (ticketData: Partial<Ticket>): Ticket => {
    const newTicket: Ticket = {
      id: Date.now(),
      title: ticketData.title || '',
      description: ticketData.description || '',
      client: ticketData.client || '',
      stage: 'cliente',
      status: 'novo',
      priority: ticketData.priority || 'media',
      category: ticketData.category || 'suporte',
      assignedTo: ticketData.assignedTo || null,
      createdBy: ticketData.createdBy || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
      attachments: []
    };
    setTickets(prev => [...prev, newTicket]);
    return newTicket;
  };

  const updateTicket = (id: number, ticketData: Partial<Ticket>): void => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === id ? { ...ticket, ...ticketData, updatedAt: new Date() } : ticket
    ));
  };

  const addComment = (ticketId: number, comment: string, authorId: number): void => {
    const newComment: Comment = { 
      id: Date.now(), 
      text: comment, 
      author: authorId, 
      createdAt: new Date() 
    };
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { 
        ...ticket, 
        comments: [...ticket.comments, newComment],
        updatedAt: new Date()
      } : ticket
    ));
  };

  const getTicketStats = (): TicketStats => ({
    total: tickets.length,
    byStage: {
      cliente: tickets.filter(t => t.stage === 'cliente').length,
      gestao: tickets.filter(t => t.stage === 'gestao').length,
      dev: tickets.filter(t => t.stage === 'dev').length
    },
    byPriority: {
      baixa: tickets.filter(t => t.priority === 'baixa').length,
      media: tickets.filter(t => t.priority === 'media').length,
      alta: tickets.filter(t => t.priority === 'alta').length
    }
  });

  return (
    <TicketContext.Provider value={{ tickets, addTicket, updateTicket, addComment, getTicketStats }}>
      {children}
    </TicketContext.Provider>
  );
};
