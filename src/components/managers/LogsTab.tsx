import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Filter, 
  Calendar, 
  User, 
  Search, 
  RefreshCw,
  FileText,
  Trash2,
  Edit3,
  Plus,
  Settings,
  AlertTriangle,
  Clock
} from 'lucide-react';

// IMPORTAR DO NOVO CONTEXTO
import { useTicket } from '../../contexts/TicketContext';
import { useUser } from '../../contexts/UserContext';
import { formatDate } from '../../utils/formatters';

const LogsTab: React.FC = () => {
  // USAR NOVOS CONTEXTOS
  const { logs } = useTicket();
  const { users, currentUser } = useUser();
  
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [termoBusca, setTermoBusca] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Tipos de atividade disponíveis
  const tiposAtividade = [
    { value: 'todos', label: 'Todas as Atividades', icon: Activity, color: 'gray' },
    { value: 'sistema', label: 'Sistema', icon: Settings, color: 'blue' },
    { value: 'criacao', label: 'Criação', icon: Plus, color: 'green' },
    { value: 'edicao', label: 'Edição', icon: Edit3, color: 'yellow' },
    { value: 'exclusao', label: 'Exclusão', icon: Trash2, color: 'red' },
    { value: 'comentario', label: 'Comentário', icon: FileText, color: 'purple' },
    { value: 'erro', label: 'Erro', icon: AlertTriangle, color: 'red' }
  ];

  // Filtrar logs
  const logsFiltrados = useMemo(() => {
    if (!logs || !Array.isArray(logs)) {
      return [];
    }

    return logs.filter(log => {
      // Filtro por tipo
      if (filtroTipo !== 'todos' && log.tipoAtividade !== filtroTipo) {
        return false;
      }

      // Filtro por usuário
      if (filtroUsuario !== 'todos' && log.usuario?.nome !== filtroUsuario) {
        return false;
      }

      // Filtro por termo de busca
      if (termoBusca && !log.detalhes.toLowerCase().includes(termoBusca.toLowerCase())) {
        return false;
      }

      // Filtro por data
      const logDate = new Date(log.dataHora);
      if (dataInicio && logDate < new Date(dataInicio)) {
        return false;
      }
      if (dataFim && logDate > new Date(dataFim + 'T23:59:59')) {
        return false;
      }

      return true;
    });
  }, [logs, filtroTipo, filtroUsuario, termoBusca, dataInicio, dataFim]);

  // Obter usuários únicos dos logs
  const usuariosLogs = useMemo(() => {
    if (!logs || !Array.isArray(logs)) {
      return [];
    }
    
    const usuariosUnicos = [...new Set(logs.map(log => log.usuario?.nome).filter(Boolean))];
    return usuariosUnicos;
  }, [logs]);

  // Obter ícone do tipo de atividade
  const getActivityIcon = (tipo: string) => {
    const tipoInfo = tiposAtividade.find(t => t.value === tipo);
    return tipoInfo ? tipoInfo.icon : Activity;
  };

  // Obter cor do tipo de atividade
  const getActivityColor = (tipo: string) => {
    const tipoInfo = tiposAtividade.find(t => t.value === tipo);
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      red: 'text-red-600 bg-red-100',
      purple: 'text-purple-600 bg-purple-100',
      gray: 'text-gray-600 bg-gray-100'
    };
    return colors[tipoInfo?.color as keyof typeof colors] || colors.gray;
  };

  const limparFiltros = () => {
    setFiltroTipo('todos');
    setFiltroUsuario('todos');
    setTermoBusca('');
    setDataInicio('');
    setDataFim('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Activity className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Logs de Atividade</h2>
            <p className="text-sm text-gray-600">
              {logs ? logs.length : 0} registros de atividade • Usuário atual: {currentUser?.nome}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={limparFiltros}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} />
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Busca */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar nos detalhes
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar atividades..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tipo de Atividade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Atividade
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {tiposAtividade.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
          </div>

          {/* Usuário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuário
            </label>
            <select
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="todos">Todos os Usuários</option>
              {usuariosLogs.map(usuario => (
                <option key={usuario} value={usuario}>{usuario}</option>
              ))}
            </select>
          </div>

          {/* Data Início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Lista de Logs */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Cabeçalho da tabela */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Atividades Recentes ({logsFiltrados.length} registros)
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={12} />
              <span>Ordenado por mais recente</span>
            </div>
          </div>
        </div>

        {/* Conteúdo da tabela */}
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {logsFiltrados.length > 0 ? (
            logsFiltrados.map((log, index) => {
              const Icon = getActivityIcon(log.tipoAtividade);
              const colorClass = getActivityColor(log.tipoAtividade);

              return (
                <div key={log.id || index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Ícone */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                      <Icon size={14} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {log.usuario?.nome || 'Sistema'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                            {tiposAtividade.find(t => t.value === log.tipoAtividade)?.label || log.tipoAtividade}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(log.dataHora)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 break-words">
                        {log.detalhes}
                      </p>
                      
                      {log.entidade && log.entidade !== 'sistema' && (
                        <div className="mt-1 text-xs text-gray-400">
                          {log.entidade} ID: {log.entidadeId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <Activity size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atividade encontrada</h3>
              <p className="text-gray-500">
                {termoBusca || filtroTipo !== 'todos' || filtroUsuario !== 'todos' || dataInicio || dataFim
                  ? 'Tente ajustar os filtros para ver mais resultados.'
                  : 'Ainda não há registros de atividade no sistema.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsTab;