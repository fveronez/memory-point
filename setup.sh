#!/bin/bash

echo "🚀 Iniciando setup do Memory Point..."

# Criar estrutura de pastas
mkdir -p src/{components/{common,kanban,managers,modals},contexts,utils,types,hooks}
mkdir -p public
mkdir -p .github/workflows

echo "📁 Estrutura de pastas criada"

# Criar package.json
cat > package.json << 'PACKAGE_EOF'
{
  "name": "memory-point",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
PACKAGE_EOF

echo "✅ Setup completo!"
