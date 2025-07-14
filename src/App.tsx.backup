import { CategoryProvider } from './contexts/CategoryContext';
import { PriorityProvider } from './contexts/PriorityContext';
import { UserProvider } from './contexts/UserContext';
import { TicketProvider } from './contexts/TicketContext';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/error/ErrorBoundary';
import SistemaTickets from './SistemaFuncional';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <CategoryProvider>
          <PriorityProvider>
            <UserProvider>
              <TicketProvider>
                <SistemaTickets />
              </TicketProvider>
            </UserProvider>
          </PriorityProvider>
        </CategoryProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;