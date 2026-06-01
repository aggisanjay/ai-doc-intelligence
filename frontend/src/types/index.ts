export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Document {
  id: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  status: "pending" | "processing" | "completed" | "failed";
  chunk_count: number;
  page_count: number;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}

export interface SourceCitation {
  document_name: string;
  page_number: number | null;
  chunk_text: string;
  relevance_score: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
  timestamp?: string;
}

export interface ChatQueryRequest {
  query: string;
  conversation_id?: string;
  document_ids: string[];
}

export interface ChatQueryResponse {
  answer: string;
  sources: SourceCitation[];
  conversation_id: string;
  tokens_used: number | null;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  document_id: string | null;
  document_ids: string[];
  created_at: string;
  updated_at: string;
}
