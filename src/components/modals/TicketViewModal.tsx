import React, { useState } from 'react';
import {
  X,
  Edit3,
  Trash2,
  Calendar,
  User,
  Building2,
  Tag,
  Star,
  MessageCircle,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Send
} from 'lucide-react';

// Importar contextos e utilitários
import { useTicket } from '../../contexts/TicketContext';
import { useUser } from '../../contexts/UserContext';
import { formatDate, getCategoryInfo, getPriorityInfo, getColorClass, isTicketOverdue } from '../../utils/formatters';
import { useToast, ConfirmDialog } from '../ui/Toast';
import ErrorBoundary, { useErrorTest } from '../error/ErrorBoundary';

interface TicketViewModalProps {
  ticket: any;
  onClose: () => void;
  onEdit: (ticket: any) => void;
}

const TicketViewModal: React.FC<TicketViewModalProps> = ({ ticket, onClose, onEdit }) => {
  const { deleteTicket, updateTicket } = useTicket();
  const { currentUser } = useUser();
  const { success, error, warning } = useToast();
  const { throwError } = useErrorTest();
  
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shouldThrowError, setShouldThrowError] = useState(false);

  // Simular erro de renderização para testar Error Boundary
  if (shouldThrowError) {
    throw new Error('Teste Error Boundary TicketViewModal - Erro de Renderização');
  }

  const categoryInfo = getCategoryInfo(ticket.categoria);
  const priorityInfo = getPriorityInfo(ticket.prioridade);

  const handleDelete = () => {
    try {
      deleteTicket(ticket.id);
      success('Ticket excluído', `Ticket ${ticket.chave} foi excluído com sucesso`);
      onClose();
    } catch (err) {
      error('Erro ao excluir', 'Não foi possível excluir o ticket. Tente novamente.');
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      warning('Campo obrigatório', 'Digite um comentário antes de enviar');
      return;
    }

    try {
      const comment = {
        id: Math.max(...(ticket.comentarios?.map((c: any) => c.id) || [0]), 0) + 1,
        autor: currentUser?.nome || 'Usuário',
        conteudo: newComment.trim(),
        data: new Date()
      };

      const updatedComments = [...(ticket.comentarios || []), comment];
      updateTicket(ticket.id, { comentarios: updatedComments });
      
      success('Comentário adicionado!', 'Seu comentário foi salvo com sucesso');
      setNewComment('');
      setIsAddingComment(false);
    } catch (err) {
      error('Erro ao comentar', 'Não foi possível adicionar o comentário. Tente novamente.');
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      'novo': { label: 'Novo', color: 'bg-blue-500', icon: Activity },
      'aguardando-info': { label: 'Aguardando Info', color: 'bg-yellow-500', icon: Clock },
      'aprovado': { label: 'Aprovado', color: 'bg-green-500', icon: CheckCircle },
      'em-analise': { label: 'Em Análise', color: 'bg-purple-500', icon: Eye },
      'planejado': { label: 'Planejado', color: 'bg-indigo-500', icon: Calendar },
      'atribuido': { label: 'Atribuído', color: 'bg-cyan-500', icon: User },
      'em-desenvolvimento': { label: 'Em Desenvolvimento', color: 'bg-orange-500', icon: Activity },
      'code-review': { label: 'Code Review', color: 'bg-pink-500', icon: Eye },
      'teste': { label: 'Teste', color: 'bg-teal-500', icon: CheckCircle },
      'concluido': { label: 'Concluído', color: 'bg-green-600', icon: CheckCircle }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-500', icon: Activity };
  };

  const statusInfo = getStatusInfo(ticket.status);
  const StatusIcon = statusInfo.icon;

  return (
    <ErrorBoundary isolate={true}>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleOverlayClick}
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${categoryInfo.cor}`}>
                <span className="text-xl">{categoryInfo.icone}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold text-gray-900">{ticket.chave}</h2>
                  {isTicketOverdue(ticket) && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                      <AlertTriangle size={12} className="inline mr-1" />
                      Atrasado
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">Visualização detalhada do ticket</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Botão de teste apenas em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => setShouldThrowError(true)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Testar Error Boundary"
                >
                  🐛
                </button>
              )}
              
              <button
                onClick={() => onEdit(ticket)}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                title="Editar ticket"
              >
                <Edit3 size={20} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Excluir ticket"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Conteúdo Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Título */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.titulo}</h3>
              </div>

              {/* Descrição */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.descricao}</p>
                </div>
              </div>

              {/* Tags */}
              {ticket.tags && ticket.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        <Tag size={12} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comentários */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">
                    Comentários ({ticket.comentarios?.length || 0})
                  </h4>
                  <button
                    onClick={() => setIsAddingComment(!isAddingComment)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {isAddingComment ? 'Cancelar' : 'Adicionar comentário'}
                  </button>
                </div>

                {/* Formulário de novo comentário */}
                {isAddingComment && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Digite seu comentário..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleAddComment}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        <Send size={14} />
                        Enviar
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingComment(false);
                          setNewComment('');
                        }}
                        className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de comentários */}
                <div className="space-y-4">
                  {ticket.comentarios && ticket.comentarios.length > 0 ? (
                    ticket.comentarios.map((comment: any) => (
                      <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {comment.autor.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">{comment.autor}</span>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(comment.data)}</span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.conteudo}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                      <p>Nenhum comentário ainda</p>
                      <p className="text-sm">Seja o primeiro a comentar neste ticket</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar com informações */}
            <div className="space-y-6">
              {/* Status e Prioridade */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Status e Prioridade</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <StatusIcon size={16} className="text-gray-600" />
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star size={16} className="text-gray-600" />
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getColorClass(priorityInfo.cor)}`}>
                      {priorityInfo.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informações do Cliente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Cliente</h4>
                <div className="flex items-center gap-3">
                  <Building2 size={16} className="text-gray-600" />
                  <span className="text-gray-700">{ticket.cliente}</span>
                </div>
              </div>

              {/* Responsável */}
              {ticket.responsavel && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Responsável</h4>
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-600" />
                    <span className="text-gray-700">{ticket.responsavel}</span>
                  </div>
                </div>
              )}

              {/* Categoria */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Categoria</h4>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{categoryInfo.icone}</span>
                  <span className="text-gray-700">{categoryInfo.label}</span>
                </div>
              </div>

              {/* Datas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Informações de Data</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-gray-600" />
                    <div>
                      <p className="text-gray-600">Criado em</p>
                      <p className="font-medium">{formatDate(ticket.dataCriacao)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={14} className="text-gray-600" />
                    <div>
                      <p className="text-gray-600">Última atualização</p>
                      <p className="font-medium">{formatDate(ticket.ultimaAtualizacao)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Excluir Ticket"
        message={`Tem certeza que deseja excluir o ticket ${ticket.chave}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDelete();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </ErrorBoundary>
  );
};

export default TicketViewModal;