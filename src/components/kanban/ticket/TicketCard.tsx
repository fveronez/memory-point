import React from 'react';
import {
  Clock,
  Flag,
  Eye,
  Edit3,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Target,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';
import { formatTimeElapsed } from '../../../utils/kanbanLogic';

interface TicketCardProps {
  ticket: any;
  onSelect: (ticket: any) => void;
  onEdit: (ticket: any) => void;
  isDragging?: boolean;
  showSLA?: boolean;
  compact?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onSelect,
  onEdit,
  isDragging = false,
  showSLA = true,
  compact = false
}) => {
  const timeElapsed = formatTimeElapsed(new Date(ticket.dataCriacao || Date.now()));
  
  const getPriorityIcon = (prioridade: any) => {
    switch (prioridade?.nome) {
      case 'Crítica': return <AlertCircle className="text-red-500" size={14} />;
      case 'Alta': return <ArrowUpDown className="text-orange-500" size={14} />;
      case 'Média': return <Target className="text-yellow-500" size={14} />;
      case 'Baixa': return <CheckCircle className="text-green-500" size={14} />;
      default: return <Target className="text-gray-500" size={14} />;
    }
  };

  const getPriorityColor = (prioridade: any) => {
    switch (prioridade?.nome) {
      case 'Crítica': return 'bg-red-100 text-red-800';
      case 'Alta': return 'bg-orange-100 text-orange-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSLAStatus = (ticket: any) => {
    const now = new Date();
    const created = new Date(ticket.dataCriacao || Date.now());
    const slaHours = ticket.prioridade?.sla || 24;
    
    const elapsedHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = slaHours - elapsedHours;
    const percentage = Math.max(0, Math.min(100, (hoursRemaining / slaHours) * 100));
    
    let status = 'ok';
    let color = 'bg-green-500';
    
    if (hoursRemaining <= 0) {
      status = 'overdue';
      color = 'bg-red-500';
    } else if (percentage <= 25) {
      status = 'critical';
      color = 'bg-orange-500';
    } else if (percentage <= 50) {
      status = 'warning';
      color = 'bg-yellow-500';
    }
    
    return { status, color, percentage, hoursRemaining };
  };

  const slaInfo = getSLAStatus(ticket);

  return (
    <div 
      className={`bg-white rounded-lg border-2 p-3 shadow-sm hover:shadow-md transition-all duration-200 ${
        isDragging ? 'border-blue-400 shadow-lg opacity-75' : 'border-gray-200'
      } ${ticket.repriorizadoManualmente ? 'border-l-4 border-l-orange-400' : ''} ${
        compact ? 'p-2' : 'p-3'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {ticket.chave || ticket.id}
          </span>
          {ticket.repriorizadoManualmente && (
            <Flag size={12} className="text-orange-500" title="Repriorizado manualmente" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(ticket);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 rounded"
            title="Visualizar"
          >
            <Eye size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(ticket);
            }}
            className="p-1 text-gray-400 hover:text-green-600 rounded"
            title="Editar"
          >
            <Edit3 size={12} />
          </button>
        </div>
      </div>

      {/* Título */}
      <h3 className={`font-medium text-gray-900 mb-2 line-clamp-2 leading-tight ${
        compact ? 'text-xs' : 'text-sm'
      }`}>
        {ticket.titulo || ticket.title || 'Título não informado'}
      </h3>

      {/* Badges */}
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        {ticket.categoria && (
          <span className={`text-xs px-2 py-1 rounded-full text-white ${
            ticket.categoria.cor || 'bg-gray-500'
          }`}>
            {ticket.categoria.nome}
          </span>
        )}
        {ticket.prioridade && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            getPriorityColor(ticket.prioridade)
          }`}>
            {getPriorityIcon(ticket.prioridade)}
            <span>{ticket.prioridade.nome}</span>
          </div>
        )}
      </div>

      {/* SLA Progress Bar */}
      {showSLA && !compact && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <div className="flex items-center gap-1">
              <Clock size={10} />
              <span>{timeElapsed}</span>
            </div>
            <span className={`font-medium ${
              slaInfo.status === 'overdue' ? 'text-red-600' :
              slaInfo.status === 'critical' ? 'text-orange-600' :
              slaInfo.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {slaInfo.status === 'overdue' 
                ? 'Vencido' 
                : `${Math.round(slaInfo.hoursRemaining)}h`
              }
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${slaInfo.color}`}
              style={{ width: `${slaInfo.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
            {ticket.usuario?.iniciais || ticket.assignedTo?.[0] || 'U'}
          </div>
          <span className="text-gray-600 truncate max-w-16">
            {ticket.usuario?.nome || ticket.assignedTo || 'Usuário'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <div className="flex items-center gap-1">
            <MessageSquare size={10} />
            <span>{ticket.comentarios?.length || 0}</span>
          </div>
          {ticket.justificativaPriorizacao && (
            <AlertTriangle size={10} className="text-orange-600" title={ticket.justificativaPriorizacao} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
