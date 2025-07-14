// src/components/kanban/ticket/DraggableWrapper.tsx
import React from 'react';
import { TicketData } from '../../dnd/DndTypes';
import useDragTicket from '../../../hooks/dnd/useDragTicket';
import TicketCard from './TicketCard';

interface Props {
  ticket: TicketData;
  onView?: (ticket: TicketData) => void;
  onEdit?: (ticket: TicketData) => void;
}

export const DraggableWrapper: React.FC<Props> = ({ ticket, onView, onEdit }) => {
  const { isDragging, drag } = useDragTicket({ ticket });

  return (
    <div ref={drag}>
      <TicketCard 
        ticket={ticket} 
        isDragging={isDragging}
        onView={onView} 
        onEdit={onEdit} 
      />
    </div>
  );
};

export default DraggableWrapper;