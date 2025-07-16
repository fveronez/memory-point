// src/components/config/permissions/UserPermissionManager.tsx
import React, { useState } from 'react';
import { X, Save, Settings } from 'lucide-react';

import { UserPermissionModalData, getCategoryColor } from './PermissionTypes';
import { useUser } from '../../../contexts/UserContext';
import { usePermission } from '../../../contexts/PermissionContext';
import { useToast } from '../../ui/Toast';

interface UserPermissionManagerProps {
  isOpen: boolean;
  userData: UserPermissionModalData | null;
  permissions: any[];
  onClose: () => void;
}

const UserPermissionManager: React.FC<UserPermissionManagerProps> = ({
  isOpen,
  userData,
  permissions,
  onClose
}) => {
  const { users, updateUser, currentUser } = useUser();
  const { addPermissionChange } = usePermission();
  const { success } = useToast();

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    userData?.currentPermissions || []
  );
  const [showInherited, setShowInherited] = useState(true);

  // Atualizar selectedPermissions quando userData mudar
  React.useEffect(() => {
    if (userData) {
      setSelectedPermissions(userData.currentPermissions);
    }
  }, [userData]);

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = () => {
    if (!userData) return;

    const user = users.find(u => u.id === userData.userId);
    if (!user) return;

    const oldPermissions = user.permissions || [];
    const newPermissions = selectedPermissions;
    
    // Registrar mudanças no histórico
    const added = newPermissions.filter(p => !oldPermissions.includes(p));
    const removed = oldPermissions.filter(p => !newPermissions.includes(p));

    added.forEach(permission => {
      addPermissionChange({
        userId: userData.userId,
        userName: user.nome,
        action: 'grant',
        permission: permission,
        previousValue: false,
        newValue: true,
        changedBy: currentUser?.nome || 'Sistema'
      });
    });

    removed.forEach(permission => {
      addPermissionChange({
        userId: userData.userId,
        userName: user.nome,
        action: 'revoke',
        permission: permission,
        previousValue: true,
        newValue: false,
        changedBy: currentUser?.nome || 'Sistema'
      });
    });

    updateUser(userData.userId, { permissions: newPermissions });
    success('Permissões atualizadas!', `Permissões de ${user.nome} foram atualizadas`);
    onClose();
  };

  if (!isOpen || !userData) return null;

  const inheritedPermissions = userData.parentPermissions || [];
  const isInherited = (permissionId: string) => inheritedPermissions.includes(permissionId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Gerenciar Permissões: {userData.userName}
            </h3>
            {userData.parentPermissions && (
              <p className="text-sm text-gray-600">
                Subusuário • Pode herdar permissões do usuário principal
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {userData.parentPermissions && (
            <div className="mb-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={showInherited}
                  onChange={(e) => setShowInherited(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mostrar permissões herdadas do usuário principal
                </span>
              </label>
            </div>
          )}

          <div className="space-y-6">
            {['basic', 'advanced', 'admin'].map(category => {
              const categoryPermissions = permissions.filter(p => p.category === category);
              
              if (categoryPermissions.length === 0) return null;

              return (
                <div key={category}>
                  <h4 className="font-medium text-gray-900 mb-3 capitalize">
                    {category === 'basic' ? 'Básicas' : category === 'advanced' ? 'Avançadas' : 'Administrativas'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryPermissions.map(permission => {
                      const isSelected = selectedPermissions.includes(permission.id);
                      const inherited = isInherited(permission.id);
                      
                      return (
                        <label
                          key={permission.id}
                          className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-blue-200 bg-blue-50' 
                              : inherited && showInherited
                                ? 'border-green-200 bg-green-50'
                                : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected || (inherited && showInherited)}
                            onChange={() => togglePermission(permission.id)}
                            disabled={inherited && showInherited}
                            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{permission.label}</p>
                              {inherited && showInherited && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Herdada
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                            <code className="text-xs text-gray-500">{permission.id}</code>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Save size={16} />
              Salvar Permissões
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para facilitar o uso do componente
export const useUserPermissionManager = () => {
  const { users } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<UserPermissionModalData | null>(null);

  const openModal = (user: any) => {
    const parentUser = user.parentUserId ? users.find(u => u.id === user.parentUserId) : null;
    
    setUserData({
      userId: user.id,
      userName: user.nome,
      currentPermissions: user.permissions || [],
      parentPermissions: parentUser?.permissions || undefined
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setUserData(null);
  };

  return {
    isOpen,
    userData,
    openModal,
    closeModal
  };
};

export default UserPermissionManager;