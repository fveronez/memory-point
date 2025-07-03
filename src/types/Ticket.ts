export interface Ticket {
  id: number;
  title: string;
  description: string;
  client: string;
  stage: 'cliente' | 'gestao' | 'dev';
  status: 'novo' | 'em-analise' | 'em-desenvolvimento' | 'aguardando-info';
  priority: 'baixa' | 'media' | 'alta';
  category: string;
  assignedTo: number | null;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
  attachments: Attachment[];
}

export interface Comment {
  id: number;
  text: string;
  author: number;
  createdAt: Date;
}

export interface Attachment {
  id: number;
  filename: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: number;
  uploadedAt: Date;
}

export interface TicketStats {
  total: number;
  byStage: {
    cliente: number;
    gestao: number;
    dev: number;
  };
  byPriority: {
    baixa: number;
    media: number;
    alta: number;
  };
}
