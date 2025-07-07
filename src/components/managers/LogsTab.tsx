import React from 'react';
import { Activity, User, Clock, FileText } from 'lucide-react';

interface Log {
  id: number;
  usuario: any;
  dataHora: Date;
  tipoAtividade: string;
  entidade: string;
  entidadeId: number;
  detalhes: string;
}

interface LogsTabProps {
  logs: Log[];
  formatDate: (date: Date) => string;
}

const LogsTab: React.FC<LogsTabProps> = ({ logs, formatDate }) => {
  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'criacao':
        return <FileText size={16} className="text-green-500" />;
      case 'sistema':
        return <Activity size={16} className="text-blue-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Activity className="text-indigo-600" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Sistema de Logs</h2>
          <p className="text-sm text-gray-600">Histórico de atividades do sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">
            Atividades Recentes ({logs.length})
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhuma atividade registrada</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {logs.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(log.tipoAtividade)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {log.usuario?.nome || 'Sistema'}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {log.tipoAtividade}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(log.dataHora)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{log.detalhes}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsTab;