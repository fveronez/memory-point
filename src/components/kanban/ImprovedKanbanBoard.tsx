import React from 'react';
import { useTicket } from '../../contexts/TicketContext';
import { useValidatedDragDrop } from '../../hooks/useValidatedDragDrop';
import EnhancedTicketCard from './ticket/EnhancedTicketCard';

interface ImprovedKanbanBoardProps {
  stage: 'cliente' | 'gestao' | 'dev';
  onTicketEdit: (ticket: any) => void;
  onTicketView: (ticket: any) => void;
}

const ImprovedKanbanBoard: React.FC<ImprovedKanbanBoardProps> = ({
  stage,
  onTicketEdit,
  onTicketView
}) => {
  const { tickets, updateTicket } = useTicket();

  const handleTicketMove = (ticketId: string, newStatus: string) => {
    updateTicket(ticketId, {
      status: newStatus,
      ultimaAtualizacao: new Date()
    });
  };

  const {
    draggedTicket,
    dragOverColumn,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isValidDropTarget
  } = useValidatedDragDrop({
    onTicketMove: handleTicketMove,
    stage
  });

  // Colunas baseadas no workflow real do sistema
  const getColumnsForStage = (stage: string) => {
    switch (stage) {
      case 'cliente':
        return [
          { id: 'novo', title: 'Novo', color: 'bg-gray-100' },
          { id: 'aguardando-info', title: 'Aguardando Info', color: 'bg-yellow-100' },
          { id: 'aprovado', title: 'Aprovado', color: 'bg-green-100' }
        ];
      case 'gestao':
        return [
          { id: 'em-analise', title: 'Em Análise', color: 'bg-purple-100' },
          { id: 'planejado', title: 'Planejado', color: 'bg-blue-100' },
          { id: 'atribuido', title: 'Atribuído', color: 'bg-green-100' }
        ];
      case 'dev':
        return [
          { id: 'em-desenvolvimento', title: 'Em Desenvolvimento', color: 'bg-blue-100' },
          { id: 'code-review', title: 'Code Review', color: 'bg-yellow-100' },
          { id: 'teste', title: 'Teste', color: 'bg-orange-100' },
          { id: 'concluido', title: 'Concluído', color: 'bg-green-100' }
        ];
      default:
        return [
          { id: 'novo', title: 'Novo', color: 'bg-gray-100' },
          { id: 'aguardando-info', title: 'Aguardando', color: 'bg-yellow-100' },
          { id: 'aprovado', title: 'Aprovado', color: 'bg-green-100' }
        ];
    }
  };

  const columns = getColumnsForStage(stage);

  const getTicketsByStatus = (status: string) => {
    return tickets
      .filter(ticket => ticket.status === status && ticket.stage === stage)
      .sort((a, b) => {
        // Ordenar por prioridade (alta, media, baixa)
        const priorityOrder = { 'alta': 1, 'media': 2, 'baixa': 3 };
        return (priorityOrder[a.prioridade] || 4) - (priorityOrder[b.prioridade] || 4);
      });
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map(column => (
        <div 
          key={column.id}
          className={`flex-1 min-w-80 ${column.color} rounded-lg border-2 transition-all duration-200 ${
            dragOverColumn === column.id && isValidDropTarget(column.id) 
              ? 'border-blue-500 shadow-lg scale-105' : 
            dragOverColumn === column.id && !isValidDropTarget(column.id) 
              ? 'border-red-500 shadow-lg' : 'border-gray-300'
          }`}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Header da coluna */}
          <div className="p-4 border-b border-gray-200 bg-white bg-opacity-70 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{column.title}</h3>
              <span className="bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded-full border">
                {getTicketsByStatus(column.id).length}
              </span>
            </div>
          </div>

          {/* Lista de tickets */}
          <div className="p-4 space-y-3 min-h-96 max-h-96 overflow-y-auto">
            {getTicketsByStatus(column.id).map((ticket) => (
              <div
                key={ticket.id}
                draggable
                onDragStart={(e) => handleDragStart(e, ticket)}
                className="relative"
              >
                <EnhancedTicketCard
                  ticket={ticket}
                  onSelect={onTicketView}
                  onEdit={onTicketEdit}
                  isDragging={draggedTicket?.id === ticket.id}
                  showSLA={true}
                  compact={false}
                />
              </div>
            ))}
            
            {getTicketsByStatus(column.id).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-3xl mb-3">📝</div>
                <p className="text-sm font-medium">Nenhum ticket</p>
                <p className="text-xs mt-1">Arraste tickets aqui</p>
              </div>
            )}
            
            {/* Indicador de drop válido/inválido */}
            {dragOverColumn === column.id && (
              <div className={`absolute inset-0 rounded-lg border-2 border-dashed ${
                isValidDropTarget(column.id) 
                  ? 'border-green-400 bg-green-50 bg-opacity-50' 
                  : 'border-red-400 bg-red-50 bg-opacity-50'
              } flex items-center justify-center pointer-events-none`}>
                <div className={`text-center ${
                  isValidDropTarget(column.id) ? 'text-green-600' : 'text-red-600'
                }`}>
                  <div className="text-2xl mb-2">
                    {isValidDropTarget(column.id) ? '✅' : '❌'}
                  </div>
                  <p className="text-sm font-medium">
                    {isValidDropTarget(column.id) ? 'Solte aqui' : 'Movimento inválido'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImprovedKanbanBoard;
