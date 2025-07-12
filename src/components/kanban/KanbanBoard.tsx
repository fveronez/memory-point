import React, { useState } from 'react';
import {
  Eye,
  Edit3,
  Trash2,
  User,
  Calendar,
  Tag,
  Clock,
  AlertTriangle,
  Plus
} from 'lucide-react';

// Importar contextos e utilitários
import { useTicket } from '../../contexts/TicketContext';
import { useUser } from '../../contexts/UserContext';
import { formatDate, getCategoryInfo, getPriorityInfo, getColorClass, isTicketOverdue, formatStatusTitle } from '../../utils/formatters';
import { useToast, ConfirmDialog } from '../ui/Toast';
import ErrorBoundary, { useErrorTest } from '../error/ErrorBoundary';

interface KanbanBoardProps {
  stage: string;
  onTicketEdit: (ticket: any) => void;
  onTicketView: (ticket: any) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ stage, onTicketEdit, onTicketView }) => {
  const { tickets, workflow, updateTicket, deleteTicket } = useTicket();
  const { hasPermission } = useUser();
  const { success, error } = useToast();
  const { throwError } = useErrorTest();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<any>(null);
  const [shouldThrowError, setShouldThrowError] = useState(false);

  // Simular erro de renderização para testar Error Boundary
  if (shouldThrowError) {
    throw new Error('Teste Error Boundary KanbanBoard - Erro de Renderização');
  }

  // Filtrar tickets por estágio
  const stageTickets = tickets.filter(ticket => ticket.stage === stage);
  
  // Obter status disponíveis para este estágio
  const availableStatuses = workflow[stage] || [];
  
  // Agrupar tickets por status
  const ticketsByStatus = availableStatuses.reduce((acc, status) => {
    acc[status] = stageTickets.filter(ticket => ticket.status === status);
    return acc;
  }, {} as Record<string, any[]>);

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    updateTicket(ticketId, { status: newStatus });
    success('Status atualizado!', 'Ticket movido com sucesso');
  };

  const handleConfirmDelete = () => {
    if (ticketToDelete) {
      deleteTicket(ticketToDelete.id);
      success('Ticket excluído!', `Ticket ${ticketToDelete.chave} removido`);
    }
    setShowDeleteConfirm(false);
    setTicketToDelete(null);
  };

  const handleDeleteClick = (ticket: any) => {
    setTicketToDelete(ticket);
    setShowDeleteConfirm(true);
  };

  const onDragStart = (e: React.DragEvent, ticket: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(ticket));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const ticket = JSON.parse(e.dataTransfer.getData('application/json'));
    if (ticket.status !== newStatus) {
      handleStatusChange(ticket.id, newStatus);
    }
  };

  return (
    <ErrorBoundary isolate={true}>
      <div className="flex gap-6 overflow-x-auto pb-6">
        {/* Botão de teste apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="flex-shrink-0 w-32">
            <button
              onClick={() => setShouldThrowError(true)}
              className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
              title="Testar Error Boundary"
            >
              🐛 Teste Kanban
            </button>
          </div>
        )}

        {availableStatuses.map(status => {
          const statusTickets = ticketsByStatus[status] || [];
          
          return (
            <div
              key={status}
              className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {formatStatusTitle(status)}
                </h3>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                  {statusTickets.length}
                </span>
              </div>

              <div className="space-y-3">
                {statusTickets.map(ticket => {
                  const categoryInfo = getCategoryInfo(ticket.categoria);
                  const priorityInfo = getPriorityInfo(ticket.prioridade);
                  const isOverdue = isTicketOverdue(ticket);

                  return (
                    <div
                      key={ticket.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, ticket)}
                      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-move"
                    >
                      {/* Header do Ticket */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{categoryInfo.icone}</span>
                          <span className="text-sm font-medium text-gray-600">{ticket.chave}</span>
                          {isOverdue && (
                            <AlertTriangle size={14} className="text-red-500" />
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => onTicketView(ticket)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                            title="Visualizar"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => onTicketEdit(ticket)}
                            className="p-1 text-gray-400 hover:text-orange-600 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(ticket)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Título */}
                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {ticket.titulo}
                      </h4>

                      {/* Descrição */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {ticket.descricao}
                      </p>

                      {/* Prioridade */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getColorClass(priorityInfo.cor)}`}>
                          {priorityInfo.label}
                        </span>
                      </div>

                      {/* Tags */}
                      {ticket.tags && ticket.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {ticket.tags.slice(0, 2).map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                            >
                              <Tag size={10} className="mr-1" />
                              {tag}
                            </span>
                          ))}
                          {ticket.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{ticket.tags.length - 2} mais
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(ticket.dataCriacao)}
                        </div>
                        
                        {ticket.responsavel && (
                          <div className="flex items-center gap-1">
                            <User size={12} />
                            <span className="truncate max-w-20">{ticket.responsavel}</span>
                          </div>
                        )}
                      </div>

                      {/* Cliente */}
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <span className="font-medium">Cliente:</span>
                          <span className="truncate">{ticket.cliente}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Estado vazio */}
                {statusTickets.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus size={20} />
                    </div>
                    <p className="text-sm">Nenhum ticket neste status</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Excluir Ticket"
        message={`Tem certeza que deseja excluir o ticket ${ticketToDelete?.chave}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setTicketToDelete(null);
        }}
      />
    </ErrorBoundary>
  );
};

export default KanbanBoard;