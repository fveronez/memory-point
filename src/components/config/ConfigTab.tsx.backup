import React, { useState } from 'react';
import {
  Globe,
  Users,
  Star,
  Tag,
  Workflow,
  Activity,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';

// Importar contextos e componentes
import { useTicket } from '../../contexts/TicketContext';
import { useUser } from '../../contexts/UserContext';
import { useCategory } from '../../contexts/CategoryContext';
import LogsTab from '../managers/LogsTab';
import CategoryManager from './CategoryManager';
import PriorityManager from './PriorityManager';
import UserManager from './UserManager';

// ============================================================================
// GENERAL CONFIG TAB COMPONENT
// ============================================================================
const GeneralConfigTab = () => {
  const { getStats } = useTicket();
  const stats = getStats();

  return (
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

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Users className="text-white" size={20} />
            </div>
            <h4 className="font-medium text-green-900">Cliente</h4>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.ticketsByStage.cliente}</p>
          <p className="text-sm text-green-700 mt-1">Em atendimento</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h4 className="font-medium text-yellow-900">Gestão</h4>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.ticketsByStage.gestao}</p>
          <p className="text-sm text-yellow-700 mt-1">Em análise</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
            <h4 className="font-medium text-purple-900">Desenvolvimento</h4>
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.ticketsByStage.dev}</p>
          <p className="text-sm text-purple-700 mt-1">Em desenvolvimento</p>
        </div>
      </div>

      {/* Gráficos por Prioridade */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Distribuição por Prioridade</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.ticketsByPriority.map((priority: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${priority.cor}`}></div>
                <span className="font-medium text-gray-900">{priority.nome}</span>
              </div>
              <span className="text-2xl font-bold text-gray-600">{priority.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos por Categoria */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Distribuição por Categoria</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.ticketsByCategory.map((category: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg">{category.icone}</span>
                <span className="font-medium text-gray-900">{category.nome}</span>
              </div>
              <span className="text-xl font-bold text-gray-600">{category.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CONFIG TAB MAIN COMPONENT
// ============================================================================
const ConfigTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('geral');

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
      description: 'Gerenciar categorias de tickets'
    },
    {
      id: 'workflow',
      label: 'Workflow',
      icon: Workflow,
      description: 'Configurar fluxo de trabalho'
    },
    {
      id: 'logs',
      label: 'Logs',
      icon: Activity,
      description: 'Visualizar atividades do sistema'
    }
  ];

  return (
    <div className="flex h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Sidebar de Sub-abas */}
      <div className="w-64 bg-gray-50 border-r border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Configurações</h2>
          <p className="text-sm text-gray-600">Sistema de gestão avançada</p>
        </div>
        
        <nav className="px-3 pb-6">
          {subTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors mb-1 ${
                  activeSubTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{tab.label}</p>
                  <p className="text-xs text-gray-500 truncate">{tab.description}</p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo da Sub-aba */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeSubTab === 'geral' && <GeneralConfigTab />}
        {activeSubTab === 'usuarios' && <UserManager />}
        {activeSubTab === 'prioridades' && <PriorityManager />}
        {activeSubTab === 'categorias' && <CategoryManager />}
        {activeSubTab === 'workflow' && (
          <div className="text-center py-12">
            <Workflow size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configuração de Workflow</h3>
            <p className="text-gray-600">Em desenvolvimento - Funcionalidade avançada</p>
          </div>
        )}
        {activeSubTab === 'logs' && <LogsTab />}
      </div>
    </div>
  );
};

export default ConfigTab;