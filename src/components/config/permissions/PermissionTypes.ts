// src/components/config/permissions/PermissionTypes.ts
export interface PermissionFormData {
    id: string;
    label: string;
    description: string;
    category: 'basic' | 'advanced' | 'admin';
  }
  
  export interface UserPermissionModalData {
    userId: string;
    userName: string;
    currentPermissions: string[];
    parentPermissions?: string[];
  }
  
  export interface RoleTemplateFormData {
    name: string;
    role: 'admin' | 'gestor' | 'dev' | 'suporte';
    permissions: string[];
    isDefault: boolean;
  }
  
  export const validatePermissionForm = (data: PermissionFormData, existingPermissions: any[], editingId?: string): Record<string, string> => {
    const errors: Record<string, string> = {};
  
    if (!data.id.trim()) {
      errors.id = 'ID é obrigatório';
    } else if (!/^[a-z_]+$/.test(data.id)) {
      errors.id = 'ID deve conter apenas letras minúsculas e underscore';
    } else if (existingPermissions.some(p => p.id === data.id && p.id !== editingId)) {
      errors.id = 'Já existe uma permissão com este ID';
    }
  
    if (!data.label.trim()) {
      errors.label = 'Rótulo é obrigatório';
    } else if (data.label.length < 2) {
      errors.label = 'Rótulo deve ter pelo menos 2 caracteres';
    }
  
    if (!data.description.trim()) {
      errors.description = 'Descrição é obrigatória';
    } else if (data.description.length < 10) {
      errors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }
  
    return errors;
  };
  
  export const validateTemplateForm = (data: RoleTemplateFormData): Record<string, string> => {
    const errors: Record<string, string> = {};
  
    if (!data.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (data.name.length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres';
    }
  
    if (data.permissions.length === 0) {
      errors.permissions = 'Selecione pelo menos uma permissão';
    }
  
    return errors;
  };
  
  export const formatDate = (date: Date): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  export const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'basic': return 'text-green-600 bg-green-100';
      case 'advanced': return 'text-blue-600 bg-blue-100';
      case 'admin': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  export const getActionColors = (action: string): string => {
    switch (action) {
      case 'grant': return 'text-green-600 bg-green-100';
      case 'revoke': return 'text-red-600 bg-red-100';
      case 'inherit': return 'text-blue-600 bg-blue-100';
      case 'override': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  export const getActionLabels = (action: string): string => {
    switch (action) {
      case 'grant': return 'Concedida';
      case 'revoke': return 'Revogada';
      case 'inherit': return 'Herdada';
      case 'override': return 'Sobreposta';
      default: return 'Desconhecida';
    }
  };
  
  export const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basic': return 'CheckCircle';
      case 'advanced': return 'Settings';
      case 'admin': return 'Shield';
      default: return 'AlertTriangle';
    }
  };
