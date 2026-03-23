export interface Message {
    id: string | null;
    conversation_id: string | null;
    content: string; 
    role: string;
    created_at: Date | null;
  }

  