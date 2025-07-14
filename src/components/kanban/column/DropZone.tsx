// src/components/kanban/column/DropZone.tsx
import React from 'react';
import { TicketStatus, DragItem } from '../../dnd/DndTypes';
import useDropZone from '../../../hooks/dnd/useDropZone';

interface Props {
  targetStatus: TicketStatus;
  onDrop: (item: DragItem, targetStatus: TicketStatus) => void;
  children: React.ReactNode;
}

export const DropZone: React.FC<Props> = ({ targetStatus, onDrop, children }) => {
  const { isOver, canDrop, drop } = useDropZone({ targetStatus, onDrop });

  return (
    <div
      ref={drop}
      className={`
        min-h-[200px] p-4 rounded-lg transition-colors duration-200
        ${isOver && canDrop ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : ''}
        ${isOver && !canDrop ? 'bg-red-50 border-2 border-red-200 border-dashed' : ''}
        ${!isOver ? 'bg-gray-50 border-2 border-transparent' : ''}
      `}
    >
      {children}
      
      {/* Indicador visual de drop */}
      {isOver && (
        <div className="flex items-center justify-center p-8 text-center">
          <div className={`
            text-sm font-medium
            ${canDrop ? 'text-blue-600' : 'text-red-600'}
          `}>
            {canDrop ? 'Solte aqui para mover' : 'Não é possível mover aqui'}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;