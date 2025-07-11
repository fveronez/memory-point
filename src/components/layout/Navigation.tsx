import React from 'react';
import {
  Users,
  Headphones,
  Code,
  Settings
} from 'lucide-react';

// Importar contextos
import { useUser } from '../../contexts/UserContext';
import { useTicket } from '../../contexts/TicketContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
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

export default Navigation;
