// src/components/kanban/ticket/TicketActions.tsx
import React from 'react';
import { TicketData } from '../../dnd/DndTypes';

interface Props {
  ticket: TicketData;
  onView?: (ticket: TicketData) => void;
  onEdit?: (ticket: TicketData) => void;
}

export const TicketActions: React.FC<Props> = ({ ticket, onView, onEdit }) => {
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.(ticket);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(ticket);
  };

  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={handleView}
        className="flex-1 bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-100 transition-colors"
      >
        Ver
      </button>
      <button
        onClick={handleEdit}
        className="flex-1 bg-green-50 text-green-600 px-3 py-1 rounded text-xs hover:bg-green-100 transition-colors"
      >
        Editar
      </button>
    </div>
  );
};

export default TicketActions;