import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Copy,
  CheckCircle
} from 'lucide-react';

// Tipos
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // Se true, isola apenas este componente
}

// Componente de fallback elegante
const ErrorFallback: React.FC<{
  error: Error;
  errorInfo: ErrorInfo;
  errorId: string;
  onRetry: () => void;
  onHome: () => void;
  isolate?: boolean;
}> = ({ error, errorInfo, errorId, onRetry, onHome, isolate = false }) => {
  const [copied, setCopied] = React.useState(false);

  const copyErrorDetails = () => {
    const errorDetails = `
Error ID: ${errorId}
Error: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo.componentStack}
Timestamp: ${new Date().toISOString()}
    `.trim();

    navigator.clipboard.writeText(errorDetails).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const containerClass = isolate 
    ? "min-h-[200px] bg-red-50 border border-red-200 rounded-lg p-6"
    : "min-h-screen bg-red-50 flex items-center justify-center p-4";

  return (
    <div className={containerClass}>
      <div className="max-w-md w-full text-center">
        {/* Ícone de erro */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-red-900 mb-2">
          {isolate ? 'Componente com Erro' : 'Ops! Algo deu errado'}
        </h1>

        {/* Descrição */}
        <p className="text-red-700 mb-6">
          {isolate 
            ? 'Este componente encontrou um erro, mas o resto do sistema continua funcionando.'
            : 'Encontramos um problema inesperado. Não se preocupe, seus dados estão seguros.'
          }
        </p>

        {/* Detalhes do erro (modo desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-white border border-red-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <Bug size={16} />
              Detalhes do Erro (Desenvolvimento)
            </h3>
            <p className="text-sm text-red-800 mb-2">
              <strong>ID:</strong> {errorId}
            </p>
            <p className="text-sm text-red-800 mb-2">
              <strong>Mensagem:</strong> {error.message}
            </p>
            <div className="text-xs text-red-700 bg-red-50 p-2 rounded border max-h-32 overflow-y-auto">
              <strong>Stack Trace:</strong>
              <pre>{error.stack}</pre>
            </div>
          </div>
        )}

        {/* Informações do erro */}
        <div className="bg-white border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-900 mb-2">ID do Erro</h3>
          <p className="text-sm text-red-700 font-mono bg-red-50 p-2 rounded">
            {errorId}
          </p>
          <p className="text-xs text-red-600 mt-2">
            Use este ID ao reportar o problema para nossa equipe
          </p>
        </div>

        {/* Ações */}
        <div className="space-y-3">
          {/* Tentar novamente */}
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <RefreshCw size={18} />
            Tentar Novamente
          </button>

          {/* Voltar ao início (apenas para erros globais) */}
          {!isolate && (
            <button
              onClick={onHome}
              className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <Home size={18} />
              Voltar ao Início
            </button>
          )}

          {/* Copiar detalhes */}
          <button
            onClick={copyErrorDetails}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            {copied ? (
              <>
                <CheckCircle size={18} className="text-green-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copiar Detalhes do Erro
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-red-600">
          <p>
            Se o problema persistir, entre em contato com nossa equipe de suporte
          </p>
          <p className="mt-1">
            Sistema de Tickets v1.9.0 • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// Error Boundary Class Component
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Gerar ID único para o erro
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Atualizar estado com informações completas do erro
    this.setState({
      error,
      errorInfo
    });

    // Log do erro
    console.group('🚨 Error Boundary Capturou um Erro');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error ID:', this.state.errorId);
    console.groupEnd();

    // Chamar callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Em produção, enviar erro para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToMonitoring(error, errorInfo);
    }
  }

  private sendErrorToMonitoring(error: Error, errorInfo: ErrorInfo) {
    // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
    const errorData = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Exemplo de envio para API de monitoramento
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData)
    // }).catch(console.error);

    console.log('📊 Error enviado para monitoramento:', errorData);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleHome = () => {
    // Recarregar a página para voltar ao estado inicial
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Se um fallback customizado foi fornecido, usar ele
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Usar nosso componente de erro padrão
      return (
        <ErrorFallback
          error={this.state.error!}
          errorInfo={this.state.errorInfo!}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          onHome={this.handleHome}
          isolate={this.props.isolate}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// HOC para facilitar o uso
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary fallback={fallback} isolate={true}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook para testar erros (apenas desenvolvimento)
export const useErrorTest = () => {
  const throwError = (message = 'Erro de teste') => {
    if (process.env.NODE_ENV === 'development') {
      throw new Error(message);
    }
  };

  return { throwError };
};