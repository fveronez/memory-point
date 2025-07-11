import React, { useState } from 'react';
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
  Eye,
  Activity
} from 'lucide-react';

// IMPORTAÇÕES DOS NOVOS CONTEXTOS E UTILITÁRIOS
import { useTicket } from "./contexts/TicketContext";
import { useUser } from "./contexts/UserContext";
import { useCategory } from "./contexts/CategoryContext";
import { formatDate, getCategoryInfo, getPriorityInfo, getColorClass, isTicketOverdue, formatStatusTitle } from "./utils/formatters";

// IMPORTAR COMPONENTES EXTRAÍDOS
import KanbanBoard from './components/kanban/KanbanBoard';
import ConfigTab from "./components/config/ConfigTab";
import LogsTab from './components/managers/LogsTab';

// ============================================================================
// HEADER COMPONENTE (será extraído depois)
// ============================================================================
const Header = ({ onNewTicket }: { onNewTicket: () => void }) => {
  const { currentUser } = useUser();
  const { tickets } = useTicket();
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

// ============================================================================
// NAVIGATION COMPONENTE (será extraído depois)
// ============================================================================
const Navigation = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => {
  const { hasPermission } = useUser();
  const { tickets } = useTicket();

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
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50 mx-1 px-3 rounded-t-lg`
                    : hasAccess
                      ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      : 'border-transparent text-gray-300 cursor-not-allowed'
                  } ${!hasAccess ? 'opacity-50' : ''}`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeTab === tab.id
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

// ============================================================================
// COMPONENTE PRINCIPAL ATUALIZADO
// ============================================================================
const SistemaTickets: React.FC = () => {
  const [activeTab, setActiveTab] = useState('cliente');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);

  // Props comuns para os KanbanBoards
  const commonProps = {
    onTicketEdit: setEditingTicket,
    onTicketView: setViewingTicket
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'cliente':
        return (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="text-white" size={24} />
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
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Headphones className="text-white" size={24} />
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
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibent text-gray-900">Desenvolvimento</h2>
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
              Sistema de Gestão de Tickets v1.9.0 - KANBAN RESTAURADO ✅
            </span>
            <span>REFATORAÇÃO EM PROGRESSO</span>
          </div>
          <span>© 2025 - Sistema Modular</span>
        </div>
      </footer>

      {/* Modais simplificados temporariamente */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Novo Ticket</h3>
            <p className="text-gray-600 mb-4">Modal será restaurado na próxima etapa</p>
            <button
              onClick={() => setShowNewTicketModal(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {viewingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Visualizar Ticket</h3>
            <p className="text-gray-600 mb-4">Modal será restaurado na próxima etapa</p>
            <button
              onClick={() => setViewingTicket(null)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {editingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Editar Ticket</h3>
            <p className="text-gray-600 mb-4">Modal será restaurado na próxima etapa</p>
            <button
              onClick={() => setEditingTicket(null)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SistemaTickets;
