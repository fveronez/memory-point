export const TicketUtils = {
  generateTicketNumber: (id: number) => `TK-${id.toString().padStart(4, '0')}`
};
