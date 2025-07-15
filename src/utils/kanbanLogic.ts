// Regras de transição válidas entre colunas por estágio
export const TRANSITION_RULES: Record<string, Record<string, string[]>> = {
  cliente: {
    'novo': ['aguardando-info'],
    'aguardando-info': ['novo', 'aprovado'],
    'aprovado': ['aguardando-info']
  },
  gestao: {
    'em-analise': ['planejado'],
    'planejado': ['em-analise', 'atribuido'],
    'atribuido': ['planejado']
  },
  dev: {
    'em-desenvolvimento': ['code-review'],
    'code-review': ['em-desenvolvimento', 'teste'],
    'teste': ['code-review', 'concluido'],
    'concluido': ['teste']
  }
};

// Função para validar se uma transição é permitida
export const isTransitionValid = (fromStatus: string, toStatus: string, stage: string = 'cliente'): boolean => {
  const stageRules = TRANSITION_RULES[stage] || TRANSITION_RULES.cliente;
  const validTransitions = stageRules[fromStatus] || [];
  return validTransitions.includes(toStatus);
};

// Função para formatar tempo decorrido
export const formatTimeElapsed = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m atrás`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h atrás`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  }
};
