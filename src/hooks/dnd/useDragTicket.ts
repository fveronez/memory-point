// src/hooks/dnd/useDragTicket.ts
import { useDrag } from 'react-dnd';
import { DND_TYPES, TicketData } from '../../components/dnd/DndTypes';

interface UseDragTicketProps {
  ticket: TicketData;
}

export const useDragTicket = ({ ticket }: UseDragTicketProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: DND_TYPES.TICKET,
    item: {
      type: DND_TYPES.TICKET,
      id: ticket.id,
      ticket,
      sourceStatus: ticket.status,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return {
    isDragging,
    drag,
  };
};

export default useDragTicket;