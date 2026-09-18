interface Participant {
  username: string;
  full_name: string;
  avatar?: string | null;
  verified: boolean;
  last_active?: string | null;
  is_online?: boolean;
}

export interface Conversation {
  id: number;
  participant: Participant;
  listing_id?: number | null;
  listing_title?: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_username: string;
  content: string;
  image_url?: string | null;
  created_at: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
}

export interface MessagesResponse {
  messages: Message[];
  participant?: Participant | null;
}
