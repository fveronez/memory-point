import React, { useState } from 'react';
import {
  Bell,
  User,
  Plus,
  Settings,
  ChevronDown
} from 'lucide-react';

// Importar contextos
import { useUser } from '../../contexts/UserContext';
import { useTicket } from '../../contexts/TicketContext';

// Importar sistema de busca
import GlobalSearch from '../search/GlobalSearch';

interface HeaderProps {
  onNewTicket: () => void;
  onTicketView?: (ticket: any) => void;
  onTicketEdit?: (ticket: any) => void;
}

const Header: React.FC<HeaderProps> = ({ onNewTicket, onTicketView, onTicketEdit }) => {
  const { currentUser } = useUser();
  const { tickets } = useTicket();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadNotifications = tickets.filter(t =>
    t.prioridade === 'alta' && t.stage === 'cliente'
  ).length;

  const handleTicketSelect = (ticket: any) => {
    // Por padrão, abrir para visualização
    onTicketView?.(ticket);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Logo e Título */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Sistema de Tickets</h1>
              <p className="text-xs text-gray-500">v2.0.0 - Sistema com Busca Global</p>
            </div>
          </div>
        </div>

        {/* Sistema de Busca Global - Centro */}
        <div className="flex-1 max-w-md mx-8">
          <GlobalSearch
            onTicketSelect={handleTicketSelect}
            onTicketView={onTicketView}
            onTicketEdit={onTicketEdit}
          />
        </div>

        {/* Botões e User Menu - Direita */}
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

export default Header;