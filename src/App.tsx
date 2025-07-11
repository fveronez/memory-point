import React from 'react';
import { UserProvider } from './contexts/UserContext';
import { TicketProvider } from './contexts/TicketContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { PriorityProvider } from './contexts/PriorityContext';
import { ToastProvider } from './contexts/ToastContext';
import SistemaTickets from './SistemaFuncional';

const App: React.FC = () => {
  return (
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
  );
};

export default App;