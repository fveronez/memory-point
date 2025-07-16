import React from 'react';
import { Zap, Plus } from 'lucide-react';
import TicketCard from './ticket/TicketCard';

interface KanbanColumnProps {
  title: string;
  status: string;
  tickets: any[];
  onTicketSelect: (ticket: any) => void;
  onTicketEdit: (ticket: any) => void;
  onDragStart: (e: React.DragEvent, ticket: any) => void;
  onDragOver: (e: React.DragEvent, targetColumn?: string, targetIndex?: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, targetColumn?: string, targetIndex?: number) => void;
  isDragOver: boolean;
  isValidDropTarget: boolean;
  onAddTicket?: () => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  tickets,
  onTicketSelect,
  onTicketEdit,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver,
  isValidDropTarget,
  onAddTicket
}) => {
  const getColumnColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-gray-100 border-gray-300';
      case 'andamento': return 'bg-blue-100 border-blue-300';
      case 'revisao': return 'bg-yellow-100 border-yellow-300';
      case 'concluido': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getColumnIcon = (status: string) => {
    switch (status) {
      case 'andamento': return <Zap size={16} className="text-blue-600" />;
      default: return null;
    }
  };

  return (
    <div 
      className={`flex-1 min-w-80 ${getColumnColor(status)} rounded-lg border-2 transition-all duration-200 ${
        isDragOver && isValidDropTarget ? 'border-blue-500 shadow-lg scale-105' : 
        isDragOver && !isValidDropTarget ? 'border-red-500 shadow-lg' : ''
      }`}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Header da coluna */}
      <div className="p-4 border-b border-gray-200 bg-white bg-opacity-70 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            {title}
            {getColumnIcon(status)}
          </h3>
          <div className="flex items-center gap-2">
            <span className="bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded-full border">
              {tickets.length}
            </span>
            {onAddTicket && (
              <button
                onClick={onAddTicket}
                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                title="Adicionar ticket"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de tickets */}
      <div className="p-4 space-y-3 min-h-96 max-h-96 overflow-y-auto">
        {tickets.map((ticket, index) => (
          <div
            key={ticket.id}
            draggable
            onDragStart={(e) => onDragStart(e, ticket)}
            className="relative"
          >
            <TicketCard
              ticket={ticket}
              onSelect={onTicketSelect}
              onEdit={onTicketEdit}
              showSLA={true}
              compact={false}
            />
          </div>
        ))}
        
        {tickets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-3xl mb-3">📝</div>
            <p className="text-sm font-medium">Nenhum ticket</p>
            <p className="text-xs mt-1">Arraste tickets aqui</p>
          </div>
        )}
        
        {/* Indicador de drop válido/inválido */}
        {isDragOver && (
          <div className={`absolute inset-0 rounded-lg border-2 border-dashed ${
            isValidDropTarget 
              ? 'border-green-400 bg-green-50 bg-opacity-50' 
              : 'border-red-400 bg-red-50 bg-opacity-50'
          } flex items-center justify-center pointer-events-none`}>
            <div className={`text-center ${
              isValidDropTarget ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className="text-2xl mb-2">
                {isValidDropTarget ? '✅' : '❌'}
              </div>
              <p className="text-sm font-medium">
                {isValidDropTarget ? 'Solte aqui' : 'Movimento inválido'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
