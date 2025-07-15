import React, { useState } from 'react';
import {
  Bell,
  User,
  Plus,
  Settings,
  ChevronDown,
  FileSpreadsheet
} from 'lucide-react';

// Importar contextos
import { useUser } from '../../contexts/UserContext';
import { useTicket } from '../../contexts/TicketContext';

// Importar sistema de busca
import GlobalSearch from '../search/GlobalSearch';

// Importar componente de importação Excel
import ExcelUploader from '../excel/ExcelUploader';
import { useExcelImport } from '../../hooks/useExcelImport';

interface HeaderProps {
  onNewTicket: () => void;
  onTicketView?: (ticket: any) => void;
  onTicketEdit?: (ticket: any) => void;
}

const Header: React.FC<HeaderProps> = ({ onNewTicket, onTicketView, onTicketEdit }) => {
  const { currentUser } = useUser();
  const { tickets } = useTicket();
  const { handleImport } = useExcelImport();
  const [showExcelUploader, setShowExcelUploader] = useState(false);

  const handleExcelImport = (data: any[]) => {
    handleImport(data);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MP</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Memory Point</h1>
                <p className="text-xs text-gray-500">Sistema de Gestão de Tickets</p>
              </div>
            </div>
          </div>

          {/* Busca Global */}
          <div className="flex-1 max-w-xl mx-8">
            <GlobalSearch 
              onTicketView={onTicketView}
              onTicketEdit={onTicketEdit}
            />
          </div>

          {/* Ações */}
          <div className="flex items-center gap-3">
            {/* Botão Novo Ticket */}
            <button
              onClick={onNewTicket}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Novo Ticket</span>
            </button>

            {/* Botão Importar Excel */}
            <button
              onClick={() => setShowExcelUploader(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Importar tickets do Excel"
            >
              <FileSpreadsheet size={16} />
              <span className="hidden sm:inline">Importar Excel</span>
            </button>

            {/* Notificações */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <Bell size={20} />
              {tickets.filter(t => t.status === 'novo').length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {tickets.filter(t => t.status === 'novo').length}
                </span>
              )}
            </button>

            {/* Perfil do Usuário */}
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="hidden sm:inline font-medium">
                  {currentUser?.nome || 'Usuário'}
                </span>
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Configurações */}
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Importação Excel */}
      <ExcelUploader
        isOpen={showExcelUploader}
        onClose={() => setShowExcelUploader(false)}
        onDataProcessed={handleExcelImport}
      />
    </>
  );
};

export default Header;
