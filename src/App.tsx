import React from 'react';
import { UserProvider } from './contexts/UserContext';
import { TicketProvider } from './contexts/TicketContext';
import { CategoryProvider } from './contexts/CategoryContext';
import SistemaTickets from './SistemaFuncional';

const App: React.FC = () => {
  return (
        <CategoryProvider>
          <UserProvider>
            <TicketProvider>
              <SistemaTickets />
            </TicketProvider>
          </UserProvider>
      </CategoryProvider>
  );
};

export default App;