// src/components/kanban/ticket/TicketCard.tsx
import React from 'react';
import { TicketData } from '../../dnd/DndTypes';
import TicketInfo from './TicketInfo';
import TicketActions from './TicketActions';

interface Props {
  ticket: TicketData;
  isDragging?: boolean;
  onView?: (ticket: TicketData) => void;
  onEdit?: (ticket: TicketData) => void;
}

export const TicketCard: React.FC<Props> = ({ 
  ticket, 
  isDragging = false, 
  onView, 
  onEdit 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'média':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm border p-4 mb-3 cursor-move
        hover:shadow-md transition-all duration-200
        ${isDragging ? 'opacity-50 transform rotate-2 scale-105' : 'opacity-100'}
      `}
    >
      {/* Header com título e prioridade */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight">
          {ticket.title}
        </h3>
        <span className={`
          px-2 py-1 rounded text-xs font-medium border
          ${getPriorityColor(ticket.priority)}
        `}>
          {ticket.priority}
        </span>
      </div>

      {/* Informações do ticket */}
      <TicketInfo ticket={ticket} />

      {/* Ações do ticket */}
      <TicketActions 
        ticket={ticket} 
        onView={onView} 
        onEdit={onEdit} 
      />
    </div>
  );
};

export default TicketCard;