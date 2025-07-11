// Utilitários de formatação migrados do AppProvider interno

// Formatação de data
export const formatDate = (date: Date | string): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };
  
  // Informações de categoria
  export const getCategoryInfo = (categoryName: string) => {
    const categories = [
      { id: 1, nome: "bug", label: "Bug", icone: "🐛", cor: "bg-red-500", ativo: true, descricao: "Correção de erros no sistema" },
      { id: 2, nome: "feature", label: "Nova Funcionalidade", icone: "✨", cor: "bg-blue-500", ativo: true, descricao: "Implementação de novos recursos" },
      { id: 3, nome: "suporte", label: "Suporte", icone: "🤝", cor: "bg-green-500", ativo: true, descricao: "Atendimento e orientação ao cliente" },
      { id: 4, nome: "melhoria", label: "Melhoria", icone: "🔧", cor: "bg-yellow-500", ativo: true, descricao: "Aprimoramentos em funcionalidades existentes" },
      { id: 5, nome: "manutencao", label: "Manutenção", icone: "⚙️", cor: "bg-purple-500", ativo: true, descricao: "Manutenção preventiva do sistema" }
    ];
    
    const category = categories.find(c => c.nome === categoryName);
    return category || { icone: '📝', label: categoryName, cor: 'bg-blue-500' };
  };
  
  // Informações de prioridade
  export const getPriorityInfo = (priorityName: string) => {
    const priorities = [
      { id: 1, nome: "baixa", label: "Baixa", cor: "bg-green-500", ordem: 1, ativo: true, descricao: "Itens de baixa prioridade - sem urgência" },
      { id: 2, nome: "media", label: "Média", cor: "bg-yellow-500", ordem: 2, ativo: true, descricao: "Itens de prioridade média - prazo normal" },
      { id: 3, nome: "alta", label: "Alta", cor: "bg-red-500", ordem: 3, ativo: true, descricao: "Itens de alta prioridade - urgente" }
    ];
    
    const priority = priorities.find(p => p.nome === priorityName);
    return priority || { label: priorityName, cor: 'bg-gray-500', ordem: 999 };
  };
  
  // Classes de cor para componentes
  export const getColorClass = (color: string): string => {
    const colorMap: Record<string, string> = {
      'bg-red-500': 'bg-red-100 text-red-800 border-red-200',
      'bg-yellow-500': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-green-500': 'bg-green-100 text-green-800 border-green-200',
      'bg-blue-500': 'bg-blue-100 text-blue-800 border-blue-200',
      'bg-purple-500': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  // Verificar se ticket está atrasado
  export const isTicketOverdue = (ticket: any): boolean => {
    const daysSinceCreation = Math.floor((new Date().getTime() - new Date(ticket.dataCriacao).getTime()) / (1000 * 60 * 60 * 24));
    return ticket.prioridade === 'alta' && daysSinceCreation > 1;
  };
  
  // Formatação de status
  export const formatStatusTitle = (status: string): string => {
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