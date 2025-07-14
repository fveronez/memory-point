import { useEffect } from 'react';
import { CategoryProvider } from './contexts/CategoryContext';
import { PriorityProvider } from './contexts/PriorityContext';
import { UserProvider } from './contexts/UserContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { TicketProvider } from './contexts/TicketContext';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/error/ErrorBoundary';
import SistemaTickets from './SistemaFuncional';
import { autoMigrateOnLoad, createSampleSubUsers } from './utils/userMigration';

function App() {
  useEffect(() => {
    // Executar migração automática na inicialização
    autoMigrateOnLoad();
    
    // Opcional: criar dados de exemplo (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        createSampleSubUsers();
      }, 1000);
    }
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <CategoryProvider>
          <PriorityProvider>
            <UserProvider>
              <PermissionProvider>
                <TicketProvider>
                  <SistemaTickets />
                </TicketProvider>
              </PermissionProvider>
            </UserProvider>
          </PriorityProvider>
        </CategoryProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
