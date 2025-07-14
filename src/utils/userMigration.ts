// utils/userMigration.ts
// Script para migrar dados existentes para suporte a subusuários

export const migrateUserData = () => {
  try {
    // Verificar se há dados no localStorage
    const existingData = localStorage.getItem('sistema-usuarios');
    
    if (!existingData) {
      console.log('✅ Nenhum dado de usuário encontrado para migrar');
      return;
    }

    const users = JSON.parse(existingData, (key, value) => {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });

    if (!Array.isArray(users)) {
      console.log('❌ Dados de usuário inválidos encontrados');
      return;
    }

    // Verificar se já foram migrados
    const needsMigration = users.some(user => 
      typeof user.isSubUser === 'undefined' || 
      typeof user.subUsers === 'undefined'
    );

    if (!needsMigration) {
      console.log('✅ Dados já migrados para suporte a subusuários');
      return;
    }

    // Aplicar migração
    const migratedUsers = users.map(user => ({
      ...user,
      isSubUser: user.isSubUser ?? false,
      subUsers: user.subUsers ?? [],
      parentUserId: user.parentUserId ?? undefined,
      // Garantir que dataCriacao seja uma data válida
      dataCriacao: user.dataCriacao instanceof Date ? user.dataCriacao : new Date(user.dataCriacao || Date.now()),
      ultimoLogin: user.ultimoLogin instanceof Date ? user.ultimoLogin : (user.ultimoLogin ? new Date(user.ultimoLogin) : undefined)
    }));

    // Salvar dados migrados
    const migratedData = JSON.stringify(migratedUsers, (key, value) => {
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    });

    localStorage.setItem('sistema-usuarios', migratedData);
    
    console.log('✅ Migração de dados de usuários concluída com sucesso!');
    console.log(`📊 ${migratedUsers.length} usuários migrados`);
    
    return migratedUsers;
    
  } catch (error) {
    console.error('❌ Erro durante migração de dados:', error);
    throw error;
  }
};

// Função para executar migração automática
export const autoMigrateOnLoad = () => {
  // Executar apenas uma vez
  const migrationKey = 'user-migration-v1.1.0-completed';
  
  if (localStorage.getItem(migrationKey)) {
    return; // Já foi executada
  }
  
  try {
    migrateUserData();
    localStorage.setItem(migrationKey, 'true');
  } catch (error) {
    console.error('Falha na migração automática:', error);
  }
};

// Função para criar dados de exemplo com subusuários
export const createSampleSubUsers = () => {
  try {
    const existingData = localStorage.getItem('sistema-usuarios');
    if (!existingData) return;

    const users = JSON.parse(existingData, (key, value) => {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });

    // Encontrar Ana Santos (ID: 2) para adicionar subusuários
    const anaUser = users.find((u: any) => u.id === '2');
    if (!anaUser) return;

    // Verificar se já não tem subusuários
    const hasSubUsers = users.some((u: any) => u.parentUserId === '2');
    if (hasSubUsers) {
      console.log('✅ Subusuários de exemplo já existem');
      return;
    }

    // Criar subusuários de exemplo
    const nextId = Math.max(...users.map((u: any) => parseInt(u.id) || 0)) + 1;
    
    const subUser1 = {
      id: String(nextId),
      nome: 'Pedro Santos',
      email: 'pedro.santos@empresa.com',
      role: 'dev',
      status: 'ativo',
      iniciais: 'PS',
      dataCriacao: new Date(),
      permissions: ['create', 'read', 'update'],
      isSubUser: true,
      parentUserId: '2',
      subUsers: []
    };

    const subUser2 = {
      id: String(nextId + 1),
      nome: 'Lucas Santos',
      email: 'lucas.santos@empresa.com',
      role: 'suporte',
      status: 'ativo',
      iniciais: 'LS',
      dataCriacao: new Date(),
      permissions: ['read', 'update'],
      isSubUser: true,
      parentUserId: '2',
      subUsers: []
    };

    // Atualizar Ana Santos para incluir os subusuários
    const updatedUsers = users.map((u: any) => {
      if (u.id === '2') {
        return {
          ...u,
          subUsers: [String(nextId), String(nextId + 1)]
        };
      }
      return u;
    });

    // Adicionar os novos subusuários
    updatedUsers.push(subUser1, subUser2);

    // Salvar no localStorage
    const finalData = JSON.stringify(updatedUsers, (key, value) => {
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    });

    localStorage.setItem('sistema-usuarios', finalData);
    
    console.log('✅ Subusuários de exemplo criados para Ana Santos!');
    
  } catch (error) {
    console.error('❌ Erro ao criar subusuários de exemplo:', error);
  }
};