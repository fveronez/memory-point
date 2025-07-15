import { useState } from 'react';
import { useTicket } from '../contexts/TicketContext';
import { useToast } from '../components/ui/Toast';

export const useExcelImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { addMultipleTickets } = useTicket();
  const { success, error } = useToast();

  const handleImport = async (data: any[]) => {
    setIsImporting(true);
    try {
      addMultipleTickets(data);
      success(
        'Importação concluída!', 
        `${data.length} tickets foram importados com sucesso`
      );
    } catch (err) {
      error(
        'Erro na importação',
        err instanceof Error ? err.message : 'Erro desconhecido'
      );
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    handleImport
  };
};
