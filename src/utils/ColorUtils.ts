export const ColorUtils = {
  getPriorityColors: (priority: string) => {
    const colorMap = {
      baixa: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500' },
      media: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', dot: 'bg-yellow-500' },
      alta: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', dot: 'bg-red-500' }
    };
    return colorMap[priority as keyof typeof colorMap] || colorMap.baixa;
  },
  
  getStatusColors: (status: string) => {
    const colorMap = {
      novo: { bg: 'bg-blue-100', text: 'text-blue-800' },
      'em-analise': { bg: 'bg-orange-100', text: 'text-orange-800' },
      'em-desenvolvimento': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'aguardando-info': { bg: 'bg-yellow-100', text: 'text-yellow-800' }
    };
    return colorMap[status as keyof typeof colorMap] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  },
  
  getCategoryColors: (category: string) => {
    const colorMap = {
      bug: { bg: 'bg-red-100', text: 'text-red-600' },
      'nova-funcionalidade': { bg: 'bg-blue-100', text: 'text-blue-600' },
      suporte: { bg: 'bg-green-100', text: 'text-green-600' },
      melhoria: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      manutencao: { bg: 'bg-purple-100', text: 'text-purple-600' }
    };
    return colorMap[category as keyof typeof colorMap] || { bg: 'bg-gray-100', text: 'text-gray-600' };
  }
};
