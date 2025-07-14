// src/components/dnd/DndTypes.ts
export const DND_TYPES = {
    TICKET: 'ticket',
  } as const;
  
  export type TicketStatus = 'todo' | 'doing' | 'done';
  
  export interface TicketData {
    id: string;
    title: string;
    status: TicketStatus;
    priority: string;
    category: string;
    assignee: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface DragItem {
    type: string;
    id: string;
    ticket: TicketData;
    sourceStatus: TicketStatus;
  }
  
  export interface DropResult {
    targetStatus: TicketStatus;
  }