import { useState, useCallback } from 'react';
import { isTransitionValid } from '../utils/kanbanLogic';
import { useToast } from '../components/ui/Toast';

interface UseValidatedDragDropProps {
  onTicketMove: (ticketId: string, newStatus: string) => void;
  onTicketReorder?: (tickets: any[]) => void;
  stage?: string;
}

export const useValidatedDragDrop = ({
  onTicketMove,
  onTicketReorder,
  stage = 'cliente'
}: UseValidatedDragDropProps) => {
  const [draggedTicket, setDraggedTicket] = useState<any>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const { success, error } = useToast();

  const handleDragStart = useCallback((e: React.DragEvent, ticket: any) => {
    setDraggedTicket(ticket);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ticket.id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetColumn?: string, targetIndex?: number) => {
    e.preventDefault();
    
    if (targetColumn && draggedTicket) {
      const canMove = isTransitionValid(draggedTicket.status, targetColumn, stage);
      
      if (canMove) {
        setDragOverColumn(targetColumn);
        e.dataTransfer.dropEffect = 'move';
      } else {
        e.dataTransfer.dropEffect = 'none';
        setDragOverColumn(null);
      }
    }
    
    if (typeof targetIndex === 'number') {
      setDragOverIndex(targetIndex);
    }
  }, [draggedTicket, stage]);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetColumn?: string, targetIndex?: number) => {
    e.preventDefault();
    
    const ticketId = e.dataTransfer.getData('text/plain');
    
    if (targetColumn && draggedTicket) {
      const canMove = isTransitionValid(draggedTicket.status, targetColumn, stage);
      
      if (canMove) {
        onTicketMove(ticketId, targetColumn);
        success('Ticket movido!', `Ticket movido para "${targetColumn}"`);
      } else {
        error('Transição inválida', `Não é possível mover de "${draggedTicket.status}" para "${targetColumn}"`);
      }
    }
    
    // Reset states
    setDraggedTicket(null);
    setDragOverColumn(null);
    setDragOverIndex(null);
  }, [draggedTicket, onTicketMove, success, error, stage]);

  const isValidDropTarget = useCallback((targetColumn: string): boolean => {
    if (!draggedTicket) return false;
    return isTransitionValid(draggedTicket.status, targetColumn, stage);
  }, [draggedTicket, stage]);

  return {
    draggedTicket,
    dragOverColumn,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isValidDropTarget
  };
};
