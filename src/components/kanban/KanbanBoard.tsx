import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Eye,
  Trash2,
  FileText,
  Save,
  X,
  User,
  MessageCircle,
  Clock,
  GripVertical
} from 'lucide-react';

// Importar novos contextos e utilitários
import { useTicket } from '../../contexts/TicketContext';
import { useUser } from '../../contexts/UserContext';
import { useCategory } from '../../contexts/CategoryContext';
import { formatDate, getCategoryInfo, getPriorityInfo, getColorClass, isTicketOverdue, formatStatusTitle } from '../../utils/formatters';

// ============================================================================
// TICKET CARD COMPONENT
// ============================================================================
const TicketCard = ({ ticket, onEdit, onView, onDelete }: any) => {
  const [isDragging, setIsDragging] = useState(false);

  const categoryInfo = getCategoryInfo(ticket.categoria);
  const priorityInfo = getPriorityInfo(ticket.prioridade);

  const handleDragStart = (e: any) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', ticket.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-move relative ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      } ${isTicketOverdue(ticket) ? 'ring-2 ring-red-200 border-red-300' : ''}`}
    >
      {isTicketOverdue(ticket) && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {ticket.chave}
          </span>
          {ticket.prioridade === 'alta' && (
            <span className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded">
              ⚡ URGENTE
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(ticket);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Visualizar"
          >
            <Eye size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(ticket);
            }}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Editar"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Tem certeza que deseja excluir este ticket?')) {
                onDelete(ticket.id);
              }
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Excluir"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
        {ticket.titulo}
      </h3>

      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
        {ticket.descricao}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getColorClass(priorityInfo.cor)}`}>
          {priorityInfo.label}
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getColorClass(categoryInfo.cor)}`}>
          {categoryInfo.icone} {categoryInfo.label}
        </span>
      </div>

      {ticket.tags && ticket.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {ticket.tags.slice(0, 2).map((tag: string) => (
            <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
              #{tag}
            </span>
          ))}
          {ticket.tags.length > 2 && (
            <span className="text-xs text-gray-500">+{ticket.tags.length - 2}</span>
          )}
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <User size={10} />
          <span className="truncate max-w-24">{ticket.cliente}</span>
        </div>
        <div className="flex items-center gap-2">
          {ticket.comentarios && ticket.comentarios.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle size={10} />
              <span>{ticket.comentarios.length}</span>
            </div>
          )}
          <span>{formatDate(ticket.dataCriacao)}</span>
        </div>
      </div>

      {ticket.responsavel && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <User size={10} />
            <span>Responsável: {ticket.responsavel}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// KANBAN COLUMN COMPONENT
// ============================================================================
const KanbanColumn = ({ title, status, tickets, stage, onTicketMove, onTicketEdit, onTicketView, onTicketDelete }: any) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAddingTicket, setIsAddingTicket] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState('');

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: any) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragOver(false);

    const ticketId = parseInt(e.dataTransfer.getData('text/plain'));
    if (ticketId) {
      onTicketMove(ticketId, status, stage);
    }
  };

  const priorityOrder = { 'alta': 1, 'media': 2, 'baixa': 3 };
  const sortedTickets = [...tickets].sort((a: any, b: any) => {
    const priorityA = priorityOrder[a.prioridade as keyof typeof priorityOrder] || 999;
    const priorityB = priorityOrder[b.prioridade as keyof typeof priorityOrder] || 999;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return new Date(a.dataCriacao).getTime() - new Date(b.dataCriacao).getTime();
  });

  return (
    <div
      className={`bg-gray-50 rounded-lg p-4 min-h-96 flex-1 transition-all duration-200 ${
        isDragOver ? 'bg-blue-50 ring-2 ring-blue-300 ring-opacity-50' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            tickets.length > 0
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {tickets.length}
          </span>
        </div>
        <button
          onClick={() => setIsAddingTicket(true)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors"
          title="Adicionar ticket rápido"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {isAddingTicket && (
          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <input
              type="text"
              placeholder="Título do ticket..."
              value={newTicketTitle}
              onChange={(e) => setNewTicketTitle(e.target.value)}
              className="w-full text-sm border-none outline-none"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newTicketTitle.trim()) {
                  setNewTicketTitle('');
                  setIsAddingTicket(false);
                }
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  if (newTicketTitle.trim()) {
                    setNewTicketTitle('');
                    setIsAddingTicket(false);
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                <Save size={12} />
                Salvar
              </button>
              <button
                onClick={() => {
                  setIsAddingTicket(false);
                  setNewTicketTitle('');
                }}
                className="flex items-center gap-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
              >
                <X size={12} />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {sortedTickets.map((ticket: any) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onEdit={onTicketEdit}
            onView={onTicketView}
            onDelete={onTicketDelete}
          />
        ))}

        {tickets.length === 0 && !isAddingTicket && (
          <div className="text-center py-8 text-gray-400">
            <FileText size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum ticket</p>
            <button
              onClick={() => setIsAddingTicket(true)}
              className="text-xs text-blue-600 hover:text-blue-700 mt-1"
            >
              Adicionar primeiro ticket
            </button>
          </div>
        )}
      </div>

      {isDragOver && (
        <div className="mt-4 p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 text-center">
          <p className="text-sm text-blue-600 font-medium">
            Solte o ticket aqui
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// KANBAN BOARD MAIN COMPONENT
// ============================================================================
const KanbanBoard = ({ stage, onTicketEdit, onTicketView }: { stage: string; onTicketEdit: any; onTicketView: any }) => {
  const { tickets, workflow, moveTicket, deleteTicket } = useTicket();
  const { categories } = useCategory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterResponsible, setFilterResponsible] = useState('');

  const stageTickets = tickets.filter((t: any) => t.stage === stage);

  const filteredTickets = stageTickets.filter((ticket: any) => {
    const matchesSearch = ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.chave.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !filterPriority || ticket.prioridade === filterPriority;
    const matchesCategory = !filterCategory || ticket.categoria === filterCategory;
    const matchesResponsible = !filterResponsible || ticket.responsavel === filterResponsible;

    return matchesSearch && matchesPriority && matchesCategory && matchesResponsible;
  });

  const getTicketsByStatus = (status: string) => {
    return filteredTickets.filter((t: any) => t.status === status);
  };

  const handleTicketMove = (ticketId: number, newStatus: string, newStage: string) => {
    moveTicket(ticketId, newStatus, newStage);
  };

  const responsibleOptions = [...new Set(tickets.filter((t: any) => t.responsavel).map((t: any) => t.responsavel))];

  const priorities = [
    { nome: "baixa", label: "Baixa" },
    { nome: "media", label: "Média" },
    { nome: "alta", label: "Alta" }
  ];

  return (
    <div className="space-y-6">
      {/* Filtros Avançados */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar tickets
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por título, descrição, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as prioridades</option>
              {priorities.map(priority => (
                <option key={priority.nome} value={priority.nome}>{priority.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category: any) => (
                <option key={category.nome} value={category.nome}>{category.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsável
            </label>
            <select
              value={filterResponsible}
              onChange={(e) => setFilterResponsible(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os responsáveis</option>
              {responsibleOptions.map((responsible: any) => (
                <option key={responsible} value={responsible}>{responsible}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || filterPriority || filterCategory || filterResponsible) && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredTickets.length} de {stageTickets.length} tickets encontrados
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterPriority('');
                setFilterCategory('');
                setFilterResponsible('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {workflow[stage as keyof typeof workflow]?.map((status: string) => (
          <KanbanColumn
            key={status}
            title={formatStatusTitle(status)}
            status={status}
            stage={stage}
            tickets={getTicketsByStatus(status)}
            onTicketMove={handleTicketMove}
            onTicketEdit={onTicketEdit}
            onTicketView={onTicketView}
            onTicketDelete={deleteTicket}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
