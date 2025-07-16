// src/components/config/permissions/PermissionHistory.tsx
import React, { useState } from 'react';
import { History, Download } from 'lucide-react';

import { formatDate, getActionColors, getActionLabels } from './PermissionTypes';
import { useToast } from '../../ui/Toast';

interface PermissionHistoryProps {
  isOpen: boolean;
  history: any[];
  users: any[];
  permissions: any[];
  onClose: () => void;
}

const PermissionHistory: React.FC<PermissionHistoryProps> = ({
  isOpen,
  history,
  users,
  permissions,
  onClose
}) => {
  const { warning } = useToast();
  const [userFilter, setUserFilter] = useState('');

  const filteredHistory = history.filter(change => 
    !userFilter || change.userName.toLowerCase().includes(userFilter.toLowerCase())
  );

  const handleExport = () => {
    warning('Em desenvolvimento', 'Exportação de histórico será implementada em breve');
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
          Histórico de Alterações ({filteredHistory.length})
        </h4>
        <div className="flex items-center gap-2">
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os usuários</option>
            {users.map(user => (
              <option key={user.id} value={user.nome}>
                {user.nome}
              </option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Lista de Histórico */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {filteredHistory.length > 0 ? (
            filteredHistory
              .slice(0, 50) // Mostrar últimas 50 mudanças
              .map(change => {
                const actionColors = getActionColors(change.action);
                const actionLabels = getActionLabels(change.action);
                const permission = permissions.find(p => p.id === change.permission);

                return (
                  <div key={change.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <History className="text-gray-600" size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h5 className="font-medium text-gray-900">{change.userName}</h5>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${actionColors}`}>
                              {actionLabels}
                            </span>
                            <span className="text-sm text-gray-600">
                              {permission?.label || change.permission}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>
                              Por: {change.changedBy}
                            </span>
                            <span>
                              {formatDate(change.changedAt)}
                            </span>
                            {change.reason && (
                              <span>
                                Motivo: {change.reason}
                              </span>
                            )}
                          </div>
                          {permission && (
                            <p className="text-xs text-gray-500 mt-1">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {change.previousValue !== undefined && (
                            <span className="text-xs text-gray-500">
                              {change.previousValue ? '✅' : '❌'} → {change.newValue ? '✅' : '❌'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <History size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhuma alteração registrada</p>
              <p className="text-sm mt-1">
                {userFilter 
                  ? `Nenhuma alteração encontrada para "${userFilter}"`
                  : 'As mudanças de permissões aparecerão aqui'
                }
              </p>
            </div>
          )}
        </div>
        
        {filteredHistory.length > 50 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Mostrando últimas 50 alterações de {filteredHistory.length} total
            </p>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">+</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Concedidas</p>
              <p className="text-lg font-bold text-green-600">
                {filteredHistory.filter(h => h.action === 'grant').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-semibold text-sm">-</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Revogadas</p>
              <p className="text-lg font-bold text-red-600">
                {filteredHistory.filter(h => h.action === 'revoke').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">↓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Herdadas</p>
              <p className="text-lg font-bold text-blue-600">
                {filteredHistory.filter(h => h.action === 'inherit').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 font-semibold text-sm">⚡</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Sobrepostas</p>
              <p className="text-lg font-bold text-yellow-600">
                {filteredHistory.filter(h => h.action === 'override').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para facilitar o uso do componente
export const usePermissionHistory = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openHistory = () => setIsOpen(true);
  const closeHistory = () => setIsOpen(false);

  return {
    isOpen,
    openHistory,
    closeHistory
  };
};

export default PermissionHistory;