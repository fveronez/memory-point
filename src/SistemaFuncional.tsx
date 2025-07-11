import React, { useState } from 'react';
import {
  Users,
  Headphones,
  Code} from 'lucide-react';

// IMPORTAÇÕES DOS NOVOS CONTEXTOS E UTILITÁRIOS
import NewTicketModal from "./components/modals/NewTicketModal";
import TicketViewModal from "./components/modals/TicketViewModal";
import TicketEditModal from "./components/modals/TicketEditModal";

// IMPORTAR COMPONENTES EXTRAÍDOS
import KanbanBoard from './components/kanban/KanbanBoard';
import ConfigTab from "./components/config/ConfigTab";
import Header from "./components/layout/Header";
import Navigation from "./components/layout/Navigation";

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
                <Users className="text-white" size={24}         />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Atendimento ao Cliente</h2>
                <p className="text-sm text-gray-600">Gerenciamento de tickets do estágio inicial</p>
              </div>
            </div>
            <KanbanBoard stage="cliente" {...commonProps}         />
          </div>
        );
      case 'gestao':
        return (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Headphones className="text-white" size={24}         />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Gestão de Suporte</h2>
                <p className="text-sm text-gray-600">Análise e planejamento de tickets</p>
              </div>
            </div>
            <KanbanBoard stage="gestao" {...commonProps}         />
          </div>
        );
      case 'dev':
        return (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="text-white" size={24}         />
              </div>
              <div>
                <h2 className="text-xl font-semibent text-gray-900">Desenvolvimento</h2>
                <p className="text-sm text-gray-600">Implementação e testes de soluções</p>
              </div>
            </div>
            <KanbanBoard stage="dev" {...commonProps}         />
          </div>
        );
      case 'config':
        return <ConfigTab         />;
      default:
        return (
          <div className="p-6">
            <KanbanBoard stage="cliente" {...commonProps}         />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNewTicket={() => setShowNewTicketModal(true      )}         />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab}         />
      
      <main className="flex-1 pb-6">
        {renderActiveTab(      )}
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
        <NewTicketModal           onClose={() => setShowNewTicketModal(false      )}         />
      )}
      {viewingTicket && (
        <TicketViewModal
ticket=      {viewingTicket}
          onClose={() => setViewingTicket(null)}
          onEdit={(ticket) => {
            setViewingTicket(null);
            setEditingTicket(ticket);
}}
        />
)}
      {editingTicket && (
        <TicketEditModal
          ticket={editingTicket}
          onClose={() => setEditingTicket(null)}
        />
      )}
    </div>
  );
};

export default SistemaTickets;
