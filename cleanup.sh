
# Copiar o conteúdo do artifact acima
# Salvar e sair (Ctrl+X, Y, Enter)#!/bin/bash

# 🧹 Memory Point v2.0.0 - Script de Limpeza Segura
# Execute este script na raiz do projeto

echo "🧹 Iniciando limpeza do Memory Point v2.0.0..."
echo ""

# Criar backup antes de qualquer alteração
echo "📦 Criando backup de segurança..."
BACKUP_BRANCH="cleanup-backup-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BACKUP_BRANCH"
git add .
git commit -m "backup: antes da limpeza automática"
git push origin "$BACKUP_BRANCH" 2>/dev/null || echo "⚠️  Backup local criado (push manual necessário)"
git checkout main

echo "✅ Backup criado na branch: $BACKUP_BRANCH"
echo ""

# Função para remover arquivo com segurança
safe_remove() {
    local file="$1"
    local reason="$2"
    
    if [ -f "$file" ]; then
        echo "🗑️  Removendo: $file"
        echo "   Motivo: $reason"
        git rm "$file" 2>/dev/null || rm "$file"
        echo "   ✅ Removido com sucesso"
    else
        echo "⚠️  Arquivo não encontrado: $file"
    fi
    echo ""
}

# Função para verificar se arquivo existe antes de remover
check_and_remove() {
    local file="$1"
    local reason="$2"
    local search_pattern="$3"
    
    if [ -f "$file" ]; then
        # Verificar se o arquivo é realmente usado
        if [ -n "$search_pattern" ]; then
            local usage=$(grep -r "$search_pattern" src/ --exclude="**/${file##*/}" 2>/dev/null | wc -l)
            if [ "$usage" -eq 0 ]; then
                safe_remove "$file" "$reason"
            else
                echo "⚠️  MANTENDO $file (ainda em uso: $usage ocorrências)"
                echo ""
            fi
        else
            safe_remove "$file" "$reason"
        fi
    fi
}

echo "🔍 Fase 1: Removendo arquivos confirmadamente obsoletos..."
echo ""

# 1. Remover KanbanBoard.tsx (versão antiga)
check_and_remove "src/components/kanban/KanbanBoard.tsx" "Substituído por ImprovedKanbanBoard" "KanbanBoard"

# 2. Remover arquivos de backup
safe_remove "src/components/kanban/KanbanBoard.tsx.backup" "Arquivo de backup desnecessário"

# 3. Remover useDragDrop básico (se não usado)
check_and_remove "src/hooks/dnd/useDragDrop.ts" "Substituído por useValidatedDragDrop" "useDragDrop"

# 4. Verificar e remover outros hooks DnD se não utilizados
echo "🔍 Verificando hooks DnD específicos..."
check_and_remove "src/hooks/dnd/useDragTicket.ts" "Hook específico não utilizado" "useDragTicket"
check_and_remove "src/hooks/dnd/useDropZone.ts" "Hook específico não utilizado" "useDropZone"

echo "🔍 Fase 2: Verificando utilitários DnD..."
echo ""

# 5. Verificar utilitários DnD
check_and_remove "src/utils/dnd/dragHelpers.ts" "Utilitário DnD não utilizado" "dragHelpers"
check_and_remove "src/utils/dnd/dropHelpers.ts" "Utilitário DnD não utilizado" "dropHelpers"

# 6. Remover pasta dnd se vazia
if [ -d "src/utils/dnd" ] && [ -z "$(ls -A src/utils/dnd)" ]; then
    echo "🗑️  Removendo pasta vazia: src/utils/dnd"
    rmdir "src/utils/dnd"
    echo "   ✅ Pasta removida"
    echo ""
fi

if [ -d "src/hooks/dnd" ] && [ -z "$(ls -A src/hooks/dnd)" ]; then
    echo "🗑️  Removendo pasta vazia: src/hooks/dnd"  
    rmdir "src/hooks/dnd"
    echo "   ✅ Pasta removida"
    echo ""
fi

echo "🔍 Fase 3: Verificando componentes de busca potencialmente redundantes..."
echo ""

# Verificar componentes search (mais cauteloso)
echo "🔍 Analisando sistema de busca..."
GLOBAL_SEARCH_USAGE=$(grep -r "GlobalSearch" src/ 2>/dev/null | wc -l)
SEARCH_BAR_USAGE=$(grep -r "SearchBar" src/ --exclude="**/SearchBar.tsx" 2>/dev/null | wc -l)

echo "   GlobalSearch usado em: $GLOBAL_SEARCH_USAGE lugares"
echo "   SearchBar usado em: $SEARCH_BAR_USAGE lugares"

if [ "$SEARCH_BAR_USAGE" -eq 0 ] && [ "$GLOBAL_SEARCH_USAGE" -gt 0 ]; then
    echo "   🤔 SearchBar pode ser redundante, mas vamos manter por segurança"
fi
echo ""

echo "🔍 Fase 4: Limpeza de imports não utilizados (manual)..."
echo ""
echo "📋 Para completar a limpeza, execute manualmente:"
echo "   npm install --save-dev eslint-plugin-unused-imports"
echo "   npx eslint src/ --ext .ts,.tsx --fix"
echo ""

echo "🧪 Fase 5: Testes de validação..."
echo ""

# Verificar se o projeto ainda compila
echo "🔧 Testando build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build passou com sucesso!"
else
    echo "❌ Build falhou! Verificar erros:"
    npm run build
    echo ""
    echo "🔄 Para reverter, execute:"
    echo "   git checkout $BACKUP_BRANCH"
    exit 1
fi

echo ""
echo "📊 Resumo da limpeza:"
echo ""

# Contar arquivos removidos
REMOVED_COUNT=$(git status --porcelain | grep "^D" | wc -l)
echo "   🗑️  Arquivos removidos: $REMOVED_COUNT"

# Mostrar arquivos removidos
if [ "$REMOVED_COUNT" -gt 0 ]; then
    echo "   📁 Arquivos removidos:"
    git status --porcelain | grep "^D" | sed 's/^D  /      - /'
fi

echo ""
echo "✅ Limpeza concluída com sucesso!"
echo ""
echo "🎯 Próximos passos:"
echo "   1. Testar funcionamento completo da aplicação"
echo "   2. Executar: npm run dev"
echo "   3. Verificar se todas as funcionalidades funcionam"
echo "   4. Commit das mudanças: git add . && git commit -m 'cleanup: remover arquivos obsoletos'"
echo "   5. Se tudo OK, deletar branch backup: git branch -D $BACKUP_BRANCH"
echo ""
echo "🔄 Em caso de problemas:"
echo "   git checkout $BACKUP_BRANCH"
echo "   git checkout main"
echo "   git reset --hard $BACKUP_BRANCH"
