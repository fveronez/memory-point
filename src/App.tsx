import React from 'react';
import { ToastProvider } from './components/ui/Toast';
import { CategoryProvider } from './contexts/CategoryContext';
import { UserProvider } from './contexts/UserContext';
import { TicketProvider } from './contexts/TicketContext';
import ErrorBoundary from './components/error/ErrorBoundary';
import SistemaTickets from './SistemaFuncional';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
  <ToastProvider>
    <CategoryProvider>
      <UserProvider>
        <TicketProvider>
          <SistemaTickets />
        </TicketProvider>
      </UserProvider>
    </CategoryProvider>
  </ToastProvider>
</ErrorBoundary>
  );
};

export default App;