// src/hooks/dnd/useDropZone.ts
import { useDrop } from 'react-dnd';
import { DND_TYPES, DragItem, TicketStatus } from '../../components/dnd/DndTypes';

interface UseDropZoneProps {
  targetStatus: TicketStatus;
  onDrop: (item: DragItem, targetStatus: TicketStatus) => void;
}

export const useDropZone = ({ targetStatus, onDrop }: UseDropZoneProps) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: DND_TYPES.TICKET,
    drop: (item: DragItem) => {
      onDrop(item, targetStatus);
    },
    canDrop: (item: DragItem) => {
      return item.sourceStatus !== targetStatus;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return {
    isOver,
    canDrop,
    drop,
  };
};

export default useDropZone;