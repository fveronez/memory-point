import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  AlertTriangle,
  User,
  FileText,
  Tag,
  Star,
  Building2,
  Calendar,
  Activity
} from 'lucide-react';

// Importar contextos
import { useTicket } from '../../contexts/TicketContext';
import { useCategory } from '../../contexts/CategoryContext';
import { useUser } from '../../contexts/UserContext';
import { formatDate } from '../../utils/formatters';

interface TicketEditModalProps {
  ticket: any;
  onClose: () => void;
}

interface TicketFormData {
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  cliente: string;
  responsavel: string;
  status: string;
  tags: string;
}

const TicketEditModal: React.FC<TicketEditModalProps> = ({ ticket, onClose }) => {
  const { updateTicket, validateTicketForm, workflow } = useTicket();
  const { categories } = useCategory();
  const { users, currentUser } = useUser();

  const [formData, setFormData] = useState<TicketFormData>({
    titulo: '',
    descricao: '',
    categoria: '',
    prioridade: '',
    cliente: '',
    responsavel: '',
    status: '',
    tags: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Inicializar formulário com dados do ticket
  useEffect(() => {
    if (ticket) {
      const initialData = {
        titulo: ticket.titulo || '',
        descricao: ticket.descricao || '',
        categoria: ticket.categoria || '',
        prioridade: ticket.prioridade || '',
        cliente: ticket.cliente || '',
        responsavel: ticket.responsavel || '',
        status: ticket.status || '',
        tags: ticket.tags ? ticket.tags.join(', ') : ''
      };
      setFormData(initialData);
    }
  }, [ticket]);

  const priorities = [
    { id: 'baixa', label: 'Baixa', cor: 'bg-green-500', icon: '🟢' },
    { id: 'media', label: 'Média', cor: 'bg-yellow-500', icon: '🟡' },
    { id: 'alta', label: 'Alta', cor: 'bg-red-500', icon: '🔴' }
  ];

  // Status disponíveis baseados no estágio atual
  const getAvailableStatuses = () => {
    const stageStatuses = workflow[ticket.stage] || [];
    return stageStatuses.map(status => ({
      id: status,
      label: formatStatusTitle(status)
    }));
  };

  const formatStatusTitle = (status: string): string => {
    const statusMap: Record<string, string> = {
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

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setHasChanges(true);
    
    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validar formulário
    const validation = validateTicketForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Processar tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Preparar dados atualizados
      const updatedData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: formData.categoria,
        prioridade: formData.prioridade,
        cliente: formData.cliente,
        responsavel: formData.responsavel || null,
        status: formData.status,
        tags: tagsArray
      };

      updateTicket(ticket.id, updatedData);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error);
      setErrors({ submit: 'Erro ao atualizar ticket. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (hasChanges) {
        if (window.confirm('Você tem alterações não salvas. Tem certeza que deseja sair?')) {
          onClose();
        }
      } else {
        onClose();
      }
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('Você tem alterações não salvas. Tem certeza que deseja sair?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const activeUsers = users.filter(user => user.status === 'ativo');

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Editar Ticket</h2>
              <p className="text-sm text-gray-600">
                {ticket.chave} • Criado em {formatDate(ticket.dataCriacao)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                Alterações não salvas
              </span>
            )}
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Erro geral */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertTriangle className="text-red-600" size={20} />
                  <p className="text-red-800">{errors.submit}</p>
                </div>
              )}

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline mr-2" size={16} />
                  Título do Ticket *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.titulo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Bug crítico na autenticação do sistema"
                  maxLength={100}
                />
                {errors.titulo && (
                  <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline mr-2" size={16} />
                  Descrição Detalhada *
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none ${
                    errors.descricao ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Descreva o problema ou solicitação em detalhes..."
                  maxLength={500}
                />
                {errors.descricao && (
                  <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.descricao.length}/500 caracteres
                </p>
              </div>

              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="inline mr-2" size={16} />
                  Cliente/Empresa *
                </label>
                <input
                  type="text"
                  value={formData.cliente}
                  onChange={(e) => handleInputChange('cliente', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.cliente ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Empresa Alpha Ltda"
                  maxLength={100}
                />
                {errors.cliente && (
                  <p className="mt-1 text-sm text-red-600">{errors.cliente}</p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="inline mr-2" size={16} />
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: urgente, login, crítico (separadas por vírgula)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separe as tags por vírgula para melhor organização
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Activity className="inline mr-2" size={16} />
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {getAvailableStatuses().map(status => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Status disponíveis para o estágio "{ticket.stage}"
                </p>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="inline mr-2" size={16} />
                  Categoria
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.nome}>
                      {category.icone} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prioridade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Star className="inline mr-2" size={16} />
                  Prioridade
                </label>
                <select
                  value={formData.prioridade}
                  onChange={(e) => handleInputChange('prioridade', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {priorities.map(priority => (
                    <option key={priority.id} value={priority.id}>
                      {priority.icon} {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Responsável */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline mr-2" size={16} />
                  Responsável
                </label>
                <select
                  value={formData.responsavel}
                  onChange={(e) => handleInputChange('responsavel', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Nenhum responsável</option>
                  {activeUsers.map(user => (
                    <option key={user.id} value={user.nome}>
                      {user.nome} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Informações do usuário */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-800 mb-2">
                  <User size={16} />
                  <span className="font-medium">Editado por: {currentUser?.nome}</span>
                </div>
                <p className="text-sm text-orange-600">
                  <Calendar size={12} className="inline mr-1" />
                  Última atualização: {formatDate(ticket.ultimaAtualizacao)}
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketEditModal;
