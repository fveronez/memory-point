// src/components/kanban/ticket/TicketInfo.tsx
import React from 'react';
import { TicketData } from '../../dnd/DndTypes';

interface Props {
  ticket: TicketData;
}

export const TicketInfo: React.FC<Props> = ({ ticket }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-1 text-xs text-gray-600">
      <div className="flex items-center gap-2">
        <span className="font-medium">ID:</span>
        <span className="font-mono">{ticket.id}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="font-medium">Categoria:</span>
        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
          {ticket.category}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="font-medium">Responsável:</span>
        <span>{ticket.assignee}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="font-medium">Criado:</span>
        <span>{formatDate(ticket.createdAt)}</span>
      </div>
    </div>
  );
};

export default TicketInfo;