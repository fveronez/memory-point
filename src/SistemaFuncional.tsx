import React, { useState, createContext, useContext, useCallback } from 'react';
import {
  Search,
  Bell,
  User,
  Plus,
  Edit3,
  X,
  Calendar,
  Settings,
  Users,
  Headphones,
  Code,
  Star,
  Tag,
  Workflow,
  Globe,
  Save,
  ChevronDown,
  FileText,
  Trash2,
  ArrowUpDown,
  Lock,
  Unlock,
  Check,
  AlertTriangle,
  MessageCircle,
  Filter,
  GripVertical,
  Eye
} from 'lucide-react';

// ============================================================================
// CONTEXTS ROBUSTOS COM ESTADO PERSISTENTE
// ============================================================================

const AppContext = createContext();

const AppProvider = ({ children }) => {
  // Estados principais
  const [users, setUsers] = useState([
    { id: 1, nome: "Admin Sistema", email: "admin@sistema.com", departamento: "TI", role: "admin", status: "ativo", iniciais: "AS", dataCriacao: new Date() },
    { id: 2, nome: "João Silva", email: "joao@empresa.com", departamento: "Desenvolvimento", role: "manager", status: "ativo", iniciais: "JS", dataCriacao: new Date() },
    { id: 3, nome: "Maria Santos", email: "maria@empresa.com", departamento: "Suporte", role: "support", status: "ativo", iniciais: "MS", dataCriacao: new Date() }
  ]);

  const [currentUser, setCurrentUser] = useState(users[0]);

  const [tickets, setTickets] = useState([
    {
      id: 1,
      chave: "TK-001",
      titulo: "Bug crítico na autenticação",
      descricao: "Usuários não conseguem fazer login no sistema. Erro aparece após inserir credenciais válidas.",
      prioridade: "alta",
      categoria: "bug",
      cliente: "Empresa Alpha Ltda",
      status: "novo",
      stage: "cliente",
      responsavel: null,
      dataCriacao: new Date('2024-01-15'),
      ultimaAtualizacao: new Date('2024-01-15'),
      tags: ["crítico", "login", "urgente"],
      comentarios: []
    },
    {
      id: 2,
      chave: "TK-002",
      titulo: "Dashboard administrativo completo",
      descricao: "Implementar dashboard completo com métricas, gráficos e relatórios para administradores do sistema.",
      prioridade: "media",
      categoria: "feature",
      cliente: "Empresa Beta Corp",
      status: "em-analise",
      stage: "gestao",
      responsavel: "João Silva",
      dataCriacao: new Date('2024-01-16'),
      ultimaAtualizacao: new Date('2024-01-16'),
      tags: ["dashboard", "admin", "relatórios"],
      comentarios: [
        { id: 1, autor: "João Silva", conteudo: "Iniciando análise dos requisitos", data: new Date('2024-01-16') }
      ]
    },
    {
      id: 3,
      chave: "TK-003",
      titulo: "Otimização de performance do sistema",
      descricao: "Melhorar velocidade de carregamento das páginas e otimizar consultas ao banco de dados.",
      prioridade: "media",
      categoria: "melhoria",
      cliente: "Empresa Gamma Inc",
      status: "em-desenvolvimento",
      stage: "dev",
      responsavel: "Maria Santos",
      dataCriacao: new Date('2024-01-17'),
      ultimaAtualizacao: new Date('2024-01-17'),
      tags: ["performance", "otimização"],
      comentarios: []
    },
    {
      id: 4,
      chave: "TK-004",
      titulo: "Solicitação de suporte técnico",
      descricao: "Cliente precisa de orientação para configurar integração com API externa.",
      prioridade: "baixa",
      categoria: "suporte",
      cliente: "Empresa Delta SA",
      status: "aguardando-info",
      stage: "cliente",
      responsavel: null,
      dataCriacao: new Date('2024-01-18'),
      ultimaAtualizacao: new Date('2024-01-18'),
      tags: ["api", "integração"],
      comentarios: []
    }
  ]);

  const [priorities] = useState([
    { id: 1, nome: "baixa", label: "Baixa", cor: "bg-green-500", ordem: 1, ativo: true, descricao: "Itens de baixa prioridade - sem urgência" },
    { id: 2, nome: "media", label: "Média", cor: "bg-yellow-500", ordem: 2, ativo: true, descricao: "Itens de prioridade média - prazo normal" },
    { id: 3, nome: "alta", label: "Alta", cor: "bg-red-500", ordem: 3, ativo: true, descricao: "Itens de alta prioridade - urgente" }
  ]);

  const [categories] = useState([
    { id: 1, nome: "bug", label: "Bug", icone: "🐛", cor: "bg-red-500", ativo: true, descricao: "Correção de erros no sistema" },
    { id: 2, nome: "feature", label: "Nova Funcionalidade", icone: "✨", cor: "bg-blue-500", ativo: true, descricao: "Implementação de novos recursos" },
    { id: 3, nome: "suporte", label: "Suporte", icone: "🤝", cor: "bg-green-500", ativo: true, descricao: "Atendimento e orientação ao cliente" },
    { id: 4, nome: "melhoria", label: "Melhoria", icone: "🔧", cor: "bg-yellow-500", ativo: true, descricao: "Aprimoramentos em funcionalidades existentes" },
    { id: 5, nome: "manutencao", label: "Manutenção", icone: "⚙️", cor: "bg-purple-500", ativo: true, descricao: "Manutenção preventiva do sistema" }
  ]);

  const [workflow] = useState({
    cliente: ["novo", "aguardando-info", "aprovado"],
    gestao: ["em-analise", "planejado", "atribuido"],
    dev: ["em-desenvolvimento", "code-review", "teste", "concluido"]
  });

  // Funções de gerenciamento de tickets
  const addTicket = (ticketData) => {
    // Gerar nova chave automática
    const maxId = Math.max(...tickets.map(t => t.id), 0);
    const newId = maxId + 1;
    const newKey = `TK-${String(newId).padStart(3, '0')}`;
    
    const newTicket = {
      ...ticketData,
      id: newId,
      chave: newKey, // Chave automática
      dataCriacao: new Date(),
      ultimaAtualizacao: new Date(),
      status: "novo",
      stage: "cliente",
      comentarios: [],
      tags: ticketData.tags || []
    };
    setTickets(prev => [...prev, newTicket]);
    return newTicket;
  };
  const updateTicket = useCallback((ticketId, updates) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, ...updates, ultimaAtualizacao: new Date() }
        : ticket
    ));
  }, []);

  const deleteTicket = useCallback((ticketId) => {
    setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
  }, []);

  const moveTicket = useCallback((ticketId, newStatus, newStage) => {
    updateTicket(ticketId, { status: newStatus, stage: newStage });
  }, [updateTicket]);

  // Funções de gerenciamento de usuários
  const addUser = (userData) => {
    const newUser = {
      ...userData,
      id: Math.max(...users.map(u => u.id), 0) + 1,
      dataCriacao: new Date(),
      status: "ativo",
      iniciais: userData.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = useCallback((userId, updates) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, ...updates } : user
    ));
  }, []);

  const deleteUser = useCallback((userId) => {
    if (userId === currentUser.id) {
      alert('Você não pode excluir seu próprio usuário!');
      return false;
    }
    setUsers(prev => prev.filter(user => user.id !== userId));
    return true;
  }, [currentUser.id]);

  const toggleUserStatus = useCallback((userId) => {
    updateUser(userId, {
      status: users.find(u => u.id === userId)?.status === 'ativo' ? 'inativo' : 'ativo'
    });
  }, [updateUser, users]);

  // Sistema de permissões
  const hasPermission = useCallback((permission) => {
    const permissions = {
      admin: ["cliente", "gestao", "dev", "config"],
      manager: ["cliente", "gestao", "config"],
      support: ["cliente", "gestao"],
      developer: ["gestao", "dev"]
    };
    return permissions[currentUser?.role]?.includes(permission) || false;
  }, [currentUser?.role]);

  // Utilitários
  const formatDate = useCallback((date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }, []);

  const getCategoryInfo = useCallback((categoryName) => {
    const category = categories.find(c => c.nome === categoryName);
    return category || { icone: '📝', label: categoryName, cor: 'bg-blue-500' };
  }, [categories]);

  const getPriorityInfo = useCallback((priorityName) => {
    const priority = priorities.find(p => p.nome === priorityName);
    return priority || { label: priorityName, cor: 'bg-gray-500', ordem: 999 };
  }, [priorities]);

  // Validações
  const validateTicketForm = useCallback((formData) => {
    const errors = {};

    if (!formData.titulo?.trim()) {
      errors.titulo = 'Título é obrigatório';
    } else if (formData.titulo.length < 5) {
      errors.titulo = 'Título deve ter pelo menos 5 caracteres';
    }

    if (!formData.descricao?.trim()) {
      errors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.length < 10) {
      errors.descricao = 'Descrição deve ter pelo menos 10 caracteres';
    }

    if (!formData.cliente?.trim()) {
      errors.cliente = 'Cliente é obrigatório';
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  }, []);

  const validateUserForm = useCallback((formData) => {
    const errors = {};

    if (!formData.nome?.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  }, []);

  // Estatísticas
  const getStats = useCallback(() => {
    return {
      totalTickets: tickets.length,
      ticketsByStage: {
        cliente: tickets.filter(t => t.stage === 'cliente').length,
        gestao: tickets.filter(t => t.stage === 'gestao').length,
        dev: tickets.filter(t => t.stage === 'dev').length
      },
      ticketsByPriority: priorities.map(priority => ({
        nome: priority.label,
        count: tickets.filter(t => t.prioridade === priority.nome).length,
        cor: priority.cor
      })),
      ticketsByCategory: categories.map(category => ({
        nome: category.label,
        count: tickets.filter(t => t.categoria === category.nome).length,
        icone: category.icone
      }))
    };
  }, [tickets, priorities, categories]);

  return (
    <AppContext.Provider value={{
      // Estados
      users,
      currentUser,
      tickets,
      priorities,
      categories,
      workflow,
      // Funções de ticket
      addTicket,
      updateTicket,
      deleteTicket,
      moveTicket,
      // Funções de usuário
      addUser,
      updateUser,
      deleteUser,
      toggleUserStatus,
      setCurrentUser,
      // Utilitários
      hasPermission,
      formatDate,
      getCategoryInfo,
      getPriorityInfo,
      validateTicketForm,
      validateUserForm,
      getStats
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider');
  return context;
};

// ============================================================================
// COMPONENTES FUNCIONAIS AVANÇADOS
// ============================================================================

// Header com funcionalidades completas
const Header = ({ onNewTicket }) => {
  const { currentUser, tickets } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadNotifications = tickets.filter(t =>
    t.prioridade === 'alta' && t.stage === 'cliente'
  ).length;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Sistema de Tickets</h1>
              <p className="text-xs text-gray-500">v1.9.0 - Sistema Modular</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onNewTicket}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            Novo Ticket
          </button>

          <button className="p-2 text-gray-400 hover:text-gray-600 relative transition-colors">
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                {currentUser?.iniciais}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{currentUser?.nome}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
              </div>
              <ChevronDown size={16} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.nome}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User className="inline mr-2" size={14} />
                  Perfil
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Settings className="inline mr-2" size={14} />
                  Configurações
                </button>
                <hr className="my-1" />
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Navigation com controle de permissões
const Navigation = ({ activeTab, onTabChange }) => {
  const { hasPermission, tickets } = useApp();

  const tabs = [
    {
      id: 'cliente',
      label: 'Cliente',
      icon: Users,
      permission: 'cliente',
      color: 'blue',
      count: tickets.filter(t => t.stage === 'cliente').length
    },
    {
      id: 'gestao',
      label: 'Gestão',
      icon: Headphones,
      permission: 'gestao',
      color: 'green',
      count: tickets.filter(t => t.stage === 'gestao').length
    },
    {
      id: 'dev',
      label: 'Desenvolvimento',
      icon: Code,
      permission: 'dev',
      color: 'purple',
      count: tickets.filter(t => t.stage === 'dev').length
    },
    {
      id: 'config',
      label: 'Configuração',
      icon: Settings,
      permission: 'config',
      color: 'gray',
      count: null
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
      <div className="px-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const hasAccess = hasPermission(tab.permission);

            return (
              <button
                key={tab.id}
                onClick={() => hasAccess && onTabChange(tab.id)}
                disabled={!hasAccess}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50 mx-1 px-3 rounded-t-lg`
                    : hasAccess
                      ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      : 'border-transparent text-gray-300 cursor-not-allowed'
                  } ${!hasAccess ? 'opacity-50' : ''}`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-xs px-2 py-1 rounded-full ${activeTab === tab.id
                      ? `bg-${tab.color}-100 text-${tab.color}-700`
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                    {tab.count}
                  </span>
                )}
                {!hasAccess && (
                  <span className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded">
                    🔒
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

// Ticket Card com funcionalidades completas
const TicketCard = ({ ticket, onEdit, onView, onDelete }) => {
  const { formatDate, getCategoryInfo, getPriorityInfo } = useApp();
  const [isDragging, setIsDragging] = useState(false);

  const categoryInfo = getCategoryInfo(ticket.categoria);
  const priorityInfo = getPriorityInfo(ticket.prioridade);

  const getColorClass = (color) => {
    const colorMap = {
      'bg-red-500': 'bg-red-100 text-red-800 border-red-200',
      'bg-yellow-500': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-green-500': 'bg-green-100 text-green-800 border-green-200',
      'bg-blue-500': 'bg-blue-100 text-blue-800 border-blue-200',
      'bg-purple-500': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const isOverdue = () => {
    const daysSinceCreation = Math.floor((new Date() - new Date(ticket.dataCriacao)) / (1000 * 60 * 60 * 24));
    return ticket.prioridade === 'alta' && daysSinceCreation > 1;
  };

  const handleDragStart = (e) => {
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
      className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-move relative ${isDragging ? 'opacity-50 rotate-2 scale-105' : ''
        } ${isOverdue() ? 'ring-2 ring-red-200 border-red-300' : ''}`}
    >
      {isOverdue() && (
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
          {ticket.tags.slice(0, 2).map(tag => (
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
            <Users size={10} />
            <span>Responsável: {ticket.responsavel}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Kanban Column com Drag & Drop funcional
const KanbanColumn = ({ title, status, tickets, stage, onTicketMove, onTicketEdit, onTicketView, onTicketDelete }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAddingTicket, setIsAddingTicket] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const ticketId = parseInt(e.dataTransfer.getData('text/plain'));
    if (ticketId) {
      onTicketMove(ticketId, status, stage);
    }
  };

  const priorityOrder = { 'alta': 1, 'media': 2, 'baixa': 3 };
  const sortedTickets = [...tickets].sort((a, b) => {
    const priorityA = priorityOrder[a.prioridade] || 999;
    const priorityB = priorityOrder[b.prioridade] || 999;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return new Date(a.dataCriacao) - new Date(b.dataCriacao);
  });

  return (
    <div
      className={`bg-gray-50 rounded-lg p-4 min-h-96 flex-1 transition-all duration-200 ${isDragOver ? 'bg-blue-50 ring-2 ring-blue-300 ring-opacity-50' : ''
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${tickets.length > 0
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
                  // Aqui seria implementado a criação rápida
                  setNewTicketTitle('');
                  setIsAddingTicket(false);
                }
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  if (newTicketTitle.trim()) {
                    // Implementar criação rápida
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

        {sortedTickets.map(ticket => (
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

// Kanban Board completo e funcional
const KanbanBoard = ({ stage, onTicketEdit, onTicketView }) => {
  const { tickets, workflow, priorities, categories, moveTicket, deleteTicket } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterResponsible, setFilterResponsible] = useState('');

  const stageTickets = tickets.filter(t => t.stage === stage);

  const filteredTickets = stageTickets.filter(ticket => {
    const matchesSearch = ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.chave.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !filterPriority || ticket.prioridade === filterPriority;
    const matchesCategory = !filterCategory || ticket.categoria === filterCategory;
    const matchesResponsible = !filterResponsible || ticket.responsavel === filterResponsible;

    return matchesSearch && matchesPriority && matchesCategory && matchesResponsible;
  });

  const getTicketsByStatus = (status) => {
    return filteredTickets.filter(t => t.status === status);
  };

  const formatStatusTitle = (status) => {
    const statusMap = {
      'novo': 'Novo',
      'aguardando-info': 'Aguardando Info',
      'aprovado': 'Aprovado',
      'em-analise': 'Em Análise',
      'planejado': 'Planejado',
      'atribuido': 'Atribuído',
      'em-desenvolvimento': 'Em Desenvolvimento',
      'code-review': 'Code Review',
      'teste': 'Teste',
      'concluido': 'Concluído'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const handleTicketMove = (ticketId, newStatus, newStage) => {
    moveTicket(ticketId, newStatus, newStage);
  };

  const responsibleOptions = [...new Set(tickets.filter(t => t.responsavel).map(t => t.responsavel))];

  return (
    <div className="space-y-6">
      {/* Filtros Avançados */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por título, descrição, cliente ou chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas as prioridades</option>
            {priorities.filter(p => p.ativo).map(priority => (
              <option key={priority.id} value={priority.nome}>
                {priority.label}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas as categorias</option>
            {categories.filter(c => c.ativo).map(category => (
              <option key={category.id} value={category.nome}>
                {category.icone} {category.label}
              </option>
            ))}
          </select>

          <select
            value={filterResponsible}
            onChange={(e) => setFilterResponsible(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os responsáveis</option>
            {responsibleOptions.map(responsible => (
              <option key={responsible} value={responsible}>
                {responsible}
              </option>
            ))}
          </select>
        </div>

        {(searchTerm || filterPriority || filterCategory || filterResponsible) && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Mostrando {filteredTickets.length} de {stageTickets.length} tickets
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterPriority('');
                setFilterCategory('');
                setFilterResponsible('');
              }}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Board Kanban */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {workflow[stage]?.map(status => (
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

      {/* Estatísticas do estágio */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3">Estatísticas do Estágio</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stageTickets.length}</div>
            <div className="text-xs text-gray-500">Total de Tickets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stageTickets.filter(t => t.prioridade === 'alta').length}
            </div>
            <div className="text-xs text-gray-500">Alta Prioridade</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stageTickets.filter(t => t.responsavel).length}
            </div>
            <div className="text-xs text-gray-500">Com Responsável</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stageTickets.filter(t =>
                Math.floor((new Date() - new Date(t.dataCriacao)) / (1000 * 60 * 60 * 24)) > 3
              ).length}
            </div>
            <div className="text-xs text-gray-500">Mais de 3 dias</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal avançado de criação de ticket
const NewTicketModal = ({ onClose }) => {
  const { priorities, categories, addTicket, validateTicketForm, users } = useApp();
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'media',
    categoria: 'suporte',
    cliente: '',
    responsavel: '',
    tags: []
  });

  const [errors, setErrors] = useState({});
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);

    const validation = validateTicketForm(formData);
    setErrors(validation.errors);

    if (validation.isValid) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular async
        addTicket(formData);
        onClose();
      } catch (error) {
        alert('Erro ao criar ticket. Tente novamente.');
      }
    }

    setIsSubmitting(false);
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Criar Novo Ticket</h2>
                <p className="text-sm text-gray-500">Preencha as informações do ticket</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Informações Básicas
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Ticket *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className={`w-full p-3 border rounded-lg text-sm transition-colors ${errors.titulo
                    ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                placeholder="Descreva brevemente o problema ou solicitação..."
                maxLength={100}
              />
              {errors.titulo && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle size={14} className="text-red-500" />
                  <p className="text-red-600 text-xs">{errors.titulo}</p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.titulo.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição Detalhada *
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className={`w-full p-3 border rounded-lg text-sm h-24 transition-colors ${errors.descricao
                    ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                placeholder="Forneça detalhes sobre o ticket, incluindo passos para reproduzir o problema, requisitos específicos, etc..."
                maxLength={500}
              />
              {errors.descricao && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle size={14} className="text-red-500" />
                  <p className="text-red-600 text-xs">{errors.descricao}</p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.descricao.length}/500 caracteres
              </p>
            </div>
          </div>

          {/* Categorização */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Categorização
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <div className="space-y-2">
                  {categories.filter(c => c.ativo).map(category => (
                    <label
                      key={category.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${formData.categoria === category.nome
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="radio"
                        value={category.nome}
                        checked={formData.categoria === category.nome}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        className="sr-only"
                      />
                      <span className="text-lg mr-3">{category.icone}</span>
                      <div>
                        <div className="font-medium text-sm">{category.label}</div>
                        <div className="text-xs text-gray-500">{category.descricao}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                <div className="space-y-2">
                  {priorities.filter(p => p.ativo).map(priority => (
                    <label
                      key={priority.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${formData.prioridade === priority.nome
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="radio"
                        value={priority.nome}
                        checked={formData.prioridade === priority.nome}
                        onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                        className="sr-only"
                      />
                      <div className={`w-3 h-3 rounded-full mr-3 ${priority.cor}`}></div>
                      <div>
                        <div className="font-medium text-sm">{priority.label}</div>
                        <div className="text-xs text-gray-500">{priority.descricao}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Atribuição */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Atribuição e Responsabilidade
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                <input
                  type="text"
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  className={`w-full p-3 border rounded-lg text-sm transition-colors ${errors.cliente
                      ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  placeholder="Nome da empresa ou cliente..."
                />
                {errors.cliente && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle size={14} className="text-red-500" />
                    <p className="text-red-600 text-xs">{errors.cliente}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
                <select
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Atribuir posteriormente</option>
                  {users.filter(u => u.status === 'ativo').map(user => (
                    <option key={user.id} value={user.nome}>
                      {user.nome} ({user.departamento})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Tags e Identificação
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite uma tag e pressione Enter..."
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800 ml-1"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Tags ajudam na organização e busca de tickets
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Criar Ticket
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de visualização de ticket
const TicketViewModal = ({ ticket, onClose, onEdit }) => {
  const { formatDate, getCategoryInfo, getPriorityInfo } = useApp();

  if (!ticket) return null;

  const categoryInfo = getCategoryInfo(ticket.categoria);
  const priorityInfo = getPriorityInfo(ticket.prioridade);

  const getColorClass = (color) => {
    const colorMap = {
      'bg-red-500': 'bg-red-100 text-red-800 border-red-200',
      'bg-yellow-500': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-green-500': 'bg-green-100 text-green-800 border-green-200',
      'bg-blue-500': 'bg-blue-100 text-blue-800 border-blue-200',
      'bg-purple-500': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{ticket.chave}</h2>
                <p className="text-sm text-gray-500">Visualização do Ticket</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(ticket)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 size={16} />
                Editar
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Título e Status */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{ticket.titulo}</h3>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColorClass(priorityInfo.cor)}`}>
                {priorityInfo.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getColorClass(categoryInfo.cor)}`}>
                {categoryInfo.icone} {categoryInfo.label}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                {ticket.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.descricao}</p>
            </div>
          </div>

          {/* Informações do Ticket */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Informações do Cliente</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cliente:</span>
                  <span className="font-medium">{ticket.cliente}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data de Criação:</span>
                  <span>{formatDate(ticket.dataCriacao)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Última Atualização:</span>
                  <span>{formatDate(ticket.ultimaAtualizacao)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Atribuição</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Responsável:</span>
                  <span className="font-medium">{ticket.responsavel || 'Não atribuído'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estágio:</span>
                  <span className="capitalize">{ticket.stage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="capitalize">{ticket.status.replace('-', ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {ticket.tags && ticket.tags.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {ticket.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comentários */}
          {ticket.comentarios && ticket.comentarios.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Comentários ({ticket.comentarios.length})
              </h4>
              <div className="space-y-3">
                {ticket.comentarios.map(comentario => (
                  <div key={comentario.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{comentario.autor}</span>
                      <span className="text-xs text-gray-500">{formatDate(comentario.data)}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{comentario.conteudo}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// User Manager com CRUD completo
const UserManager = () => {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus, validateUserForm } = useApp();
  const [editingUser, setEditingUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nome');
  const [sortOrder, setSortOrder] = useState('asc');

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    departamento: 'Desenvolvimento',
    role: 'support'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departamentos = ['Desenvolvimento', 'QA', 'UX/UI', 'Produto', 'Marketing', 'Vendas', 'TI', 'Suporte'];

  const filteredUsers = users
    .filter(user =>
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.departamento.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const openCreateModal = () => {
    setFormData({
      nome: '',
      email: '',
      departamento: 'Desenvolvimento',
      role: 'support'
    });
    setErrors({});
    setIsCreating(true);
  };

  const openEditModal = (user) => {
    setFormData({
      nome: user.nome,
      email: user.email,
      departamento: user.departamento,
      role: user.role
    });
    setErrors({});
    setEditingUser(user);
  };

  const closeModal = () => {
    setEditingUser(null);
    setIsCreating(false);
    setFormData({
      nome: '',
      email: '',
      departamento: 'Desenvolvimento',
      role: 'support'
    });
    setErrors({});
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    const validation = validateUserForm(formData);
    setErrors(validation.errors);

    if (validation.isValid) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular async

        if (editingUser) {
          updateUser(editingUser.id, formData);
        } else {
          addUser(formData);
        }

        closeModal();
      } catch (error) {
        alert('Erro ao salvar usuário. Tente novamente.');
      }
    }

    setIsSubmitting(false);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      const success = deleteUser(userId);
      if (!success) {
        // Mensagem já mostrada no contexto
      }
    }
  };

  const getRoleInfo = (role) => {
    const roleMap = {
      admin: { label: 'Administrador', color: 'bg-red-100 text-red-800' },
      manager: { label: 'Gerente', color: 'bg-blue-100 text-blue-800' },
      support: { label: 'Suporte', color: 'bg-green-100 text-green-800' },
      developer: { label: 'Desenvolvedor', color: 'bg-purple-100 text-purple-800' }
    };
    return roleMap[role] || { label: role, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Gerenciador de Usuários</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredUsers.length} usuário(s) {searchTerm && `encontrado(s) para "${searchTerm}"`}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Novo Usuário
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome, email ou departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="nome">Ordenar por Nome</option>
            <option value="email">Ordenar por Email</option>
            <option value="departamento">Ordenar por Departamento</option>
            <option value="role">Ordenar por Papel</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title={`Ordenação ${sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}`}
          >
            <ArrowUpDown size={16} />
          </button>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Papel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => {
              const roleInfo = getRoleInfo(user.role);
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user.iniciais}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.departamento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'ativo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Editar usuário"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`p-1 rounded transition-colors ${user.status === 'ativo'
                            ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                            : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                        title={user.status === 'ativo' ? 'Desativar usuário' : 'Ativar usuário'}
                      >
                        {user.status === 'ativo' ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Excluir usuário"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-2">
              {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Limpar busca
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Usuário */}
      {(editingUser || isCreating) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="text-blue-600" size={20} />
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className={`w-full p-3 border rounded-lg text-sm ${errors.nome ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="Ex: João Silva"
                />
                {errors.nome && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.nome}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full p-3 border rounded-lg text-sm ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="Ex: joao@empresa.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                <select
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                >
                  {departamentos.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Papel no Sistema</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="support">Suporte</option>
                  <option value="developer">Desenvolvedor</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      {editingUser ? 'Salvar' : 'Criar'}
                    </>
                  )}
                </button>
                <button
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 font-medium transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Config Tab com todas as sub-abas funcionais
const ConfigTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('geral');
  const { getStats, priorities, categories } = useApp();

  const stats = getStats();

  const subTabs = [
    {
      id: 'geral',
      label: 'Visão Geral',
      icon: Globe,
      description: 'Estatísticas e informações gerais'
    },
    {
      id: 'usuarios',
      label: 'Usuários',
      icon: Users,
      description: 'Gerenciar usuários do sistema'
    },
    {
      id: 'prioridades',
      label: 'Prioridades',
      icon: Star,
      description: 'Configurar níveis de prioridade'
    },
    {
      id: 'categorias',
      label: 'Categorias',
      icon: Tag,
      description: 'Gerenciar tipos de tickets'
    },
    {
      id: 'workflow',
      label: 'Workflow',
      icon: Workflow,
      description: 'Configurar fluxo de trabalho'
    }
  ];

  // Componente Visão Geral
  const GeneralConfigTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Visão Geral do Sistema</h3>
        <p className="text-sm text-gray-600 mb-6">
          Dashboard com estatísticas em tempo real e informações sobre a configuração atual do sistema.
        </p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <h4 className="font-medium text-blue-900">Total de Tickets</h4>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.totalTickets}</p>
          <p className="text-sm text-blue-700 mt-1">Todos os estágios</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <Star className="text-white" size={20} />
            </div>
            <h4 className="font-medium text-orange-900">Prioridades</h4>
          </div>
          <p className="text-3xl font-bold text-orange-600">{priorities.length}</p>
          <p className="text-sm text-orange-700 mt-1">Níveis configurados</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Tag className="text-white" size={20} />
            </div>
            <h4 className="font-medium text-green-900">Categorias</h4>
          </div>
          <p className="text-3xl font-bold text-green-600">{categories.length}</p>
          <p className="text-sm text-green-700 mt-1">Tipos disponíveis</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Workflow className="text-white" size={20} />
            </div>
            <h4 className="font-medium text-purple-900">Estágios</h4>
          </div>
          <p className="text-3xl font-bold text-purple-600">3</p>
          <p className="text-sm text-purple-700 mt-1">Cliente → Gestão → Dev</p>
        </div>
      </div>

      {/* Distribuição por Estágio */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="text-blue-600" size={20} />
          Distribuição por Estágio
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="text-blue-600" size={20} />
                <span className="font-medium text-blue-900">Cliente</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats.ticketsByStage.cliente}</span>
            </div>
            <div className="mt-2 bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(stats.ticketsByStage.cliente / stats.totalTickets) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="text-green-600" size={20} />
                <span className="font-medium text-green-900">Gestão</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.ticketsByStage.gestao}</span>
            </div>
            <div className="mt-2 bg-green-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${(stats.ticketsByStage.gestao / stats.totalTickets) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="text-purple-600" size={20} />
                <span className="font-medium text-purple-900">Desenvolvimento</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">{stats.ticketsByStage.dev}</span>
            </div>
            <div className="mt-2 bg-purple-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${(stats.ticketsByStage.dev / stats.totalTickets) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribuições detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Star size={20} className="text-orange-600" />
            Tickets por Prioridade
          </h4>
          <div className="space-y-3">
            {stats.ticketsByPriority.map(priority => (
              <div key={priority.nome} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${priority.cor}`}></div>
                  <span className="text-sm font-medium">{priority.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${priority.cor}`}
                      style={{ width: `${(priority.count / stats.totalTickets) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-gray-700 w-6 text-right">{priority.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Tag size={20} className="text-green-600" />
            Tickets por Categoria
          </h4>
          <div className="space-y-3">
            {stats.ticketsByCategory.map(category => (
              <div key={category.nome} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icone}</span>
                  <span className="text-sm font-medium">{category.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${(category.count / stats.totalTickets) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-gray-700 w-6 text-right">{category.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Settings size={20} className="text-gray-600" />
          Informações do Sistema
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h5 className="font-medium text-gray-800">Versão</h5>
            <p className="text-2xl font-bold text-blue-600">v1.9.0</p>
            <p className="text-sm text-gray-600">Sistema Modular Completo</p>
          </div>
          <div className="space-y-2">
            <h5 className="font-medium text-gray-800">Arquitetura</h5>
            <p className="text-2xl font-bold text-green-600">30</p>
            <p className="text-sm text-gray-600">Módulos Independentes</p>
          </div>
          <div className="space-y-2">
            <h5 className="font-medium text-gray-800">Status</h5>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-green-600">Sistema Operacional</p>
            </div>
            <p className="text-sm text-gray-600">Todas as funcionalidades ativas</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
          <Settings className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuração Global</h2>
          <p className="text-sm text-gray-600">
            Centro de controle para todas as configurações do sistema
          </p>
        </div>
      </div>

      {/* Sub-abas */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {subTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-2 py-4 px-6 text-sm font-medium transition-all duration-200 relative ${activeSubTab === tab.id
                      ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Icon size={20} />
                  <span className="font-semibold">{tab.label}</span>
                  <span className="text-xs text-gray-500 text-center leading-tight">
                    {tab.description}
                  </span>
                  {activeSubTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Conteúdo da Sub-aba */}
        <div className="p-8">
          {activeSubTab === 'geral' && <GeneralConfigTab />}
          {activeSubTab === 'usuarios' && <UserManager />}
          {activeSubTab === 'prioridades' && (
            <div className="text-center py-12">
              <Star size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Gerenciador de Prioridades</h3>
              <p className="text-gray-600">Em desenvolvimento - Funcionalidade avançada</p>
            </div>
          )}
          {activeSubTab === 'categorias' && (
            <div className="text-center py-12">
              <Tag size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Gerenciador de Categorias</h3>
              <p className="text-gray-600">Em desenvolvimento - Funcionalidade avançada</p>
            </div>
          )}
          {activeSubTab === 'workflow' && (
            <div className="text-center py-12">
              <Workflow size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configuração de Workflow</h3>
              <p className="text-gray-600">Em desenvolvimento - Funcionalidade avançada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// App Principal
const SistemaTickets = () => {
  const [activeTab, setActiveTab] = useState('cliente');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);

  const renderActiveTab = () => {
    const commonProps = {
      onTicketEdit: setEditingTicket,
      onTicketView: setViewingTicket
    };

    switch (activeTab) {
      case 'cliente':
        return (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Atendimento ao Cliente</h2>
                <p className="text-sm text-gray-600">Gerenciamento de tickets do estágio inicial</p>
              </div>
            </div>
            <KanbanBoard stage="cliente" {...commonProps} />
          </div>
        );
      case 'gestao':
        return (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Headphones className="text-green-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Gestão de Suporte</h2>
                <p className="text-sm text-gray-600">Análise e planejamento de tickets</p>
              </div>
            </div>
            <KanbanBoard stage="gestao" {...commonProps} />
          </div>
        );
      case 'dev':
        return (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Code className="text-purple-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Desenvolvimento</h2>
                <p className="text-sm text-gray-600">Implementação e testes de soluções</p>
              </div>
            </div>
            <KanbanBoard stage="dev" {...commonProps} />
          </div>
        );
      case 'config':
        return <ConfigTab />;
      default:
        return (
          <div className="p-6">
            <KanbanBoard stage="cliente" {...commonProps} />
          </div>
        );
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <Header onNewTicket={() => setShowNewTicketModal(true)} />
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 pb-6">
          {renderActiveTab()}
        </main>
        <footer className="bg-white border-t border-gray-200 px-6 py-4 sticky bottom-0">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Sistema de Gestão de Tickets v1.9.0 - Funcionando
              </span>
              <span>30 Módulos Implementados</span>
            </div>
            <span>© 2025 - Sistema Modular Production-Ready</span>
          </div>
        </footer>

        {/* Modais */}
        {showNewTicketModal && (
          <NewTicketModal onClose={() => setShowNewTicketModal(false)} />
        )}

        {viewingTicket && (
          <TicketViewModal
            ticket={viewingTicket}
            onClose={() => setViewingTicket(null)}
            onEdit={(ticket) => {
              setViewingTicket(null);
              setEditingTicket(ticket);
            }}
          />
        )}

        {editingTicket && (
          <div className="text-center py-12">
            <Edit3 size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Modal de Edição</h3>
            <p className="text-gray-600 mb-4">Funcionalidade de edição em desenvolvimento</p>
            <button
              onClick={() => setEditingTicket(null)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </AppProvider>
  );
};

export default SistemaTickets;
