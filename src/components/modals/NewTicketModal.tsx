import React, { useState } from 'react';
import {
  X,
  Save,
  AlertTriangle,
  User,
  FileText,
  Tag,
  Star,
  Building2
} from 'lucide-react';

// Importar contextos
import { useTicket } from '../../contexts/TicketContext';
import { useCategory } from '../../contexts/CategoryContext';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../ui/Toast';

interface NewTicketModalProps {
  onClose: () => void;
}

interface TicketFormData {
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  cliente: string;
  tags: string;
}

const NewTicketModal: React.FC<NewTicketModalProps> = ({ onClose }) => {
  const { addTicket, validateTicketForm } = useTicket();
  const { categories } = useCategory();
  const { currentUser } = useUser();
  const { success, error } = useToast();

  const [formData, setFormData] = useState<TicketFormData>({
    titulo: '',
    descricao: '',
    categoria: 'bug',
    prioridade: 'media',
    cliente: '',
    tags: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorities = [
    { id: 'baixa', label: 'Baixa', cor: 'bg-green-500', icon: '🟢' },
    { id: 'media', label: 'Média', cor: 'bg-yellow-500', icon: '🟡' },
    { id: 'alta', label: 'Alta', cor: 'bg-red-500', icon: '🔴' }
  ];

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
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
      error('Dados inválidos', 'Verifique os campos obrigatórios');
      return;
    }

    try {
      // Processar tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Criar ticket
      const ticketData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: formData.categoria,
        prioridade: formData.prioridade,
        cliente: formData.cliente,
        tags: tagsArray,
        responsavel: null
      };

      const newTicket = addTicket(ticketData);
      
      // Feedback de sucesso
      success('Ticket criado!', `Ticket ${newTicket.chave} criado com sucesso`);
      
      onClose();
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      error('Erro ao criar ticket', 'Tente novamente em alguns instantes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Novo Ticket</h2>
              <p className="text-sm text-gray-600">Criar um novo ticket de suporte</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.cliente ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Ex: Empresa Alpha Ltda"
              maxLength={100}
            />
            {errors.cliente && (
              <p className="mt-1 text-sm text-red-600">{errors.cliente}</p>
            )}
          </div>

          {/* Categoria e Prioridade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline mr-2" size={16} />
                Categoria
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>
                    {priority.icon} {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline mr-2" size={16} />
              Tags (opcional)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: urgente, login, crítico (separadas por vírgula)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separe as tags por vírgula para melhor organização
            </p>
          </div>

          {/* Informações do usuário */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <User size={16} />
              <span className="font-medium">Criado por: {currentUser?.nome}</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              O ticket será criado no estágio "Cliente" com status "Novo"
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Criar Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTicketModal;