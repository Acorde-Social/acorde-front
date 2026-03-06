import axios from 'axios';
import { API_URL } from '@/lib/api-config';
import { getAuthToken } from '@/utils/auth';
import { io, Socket } from 'socket.io-client';
import { notification } from '@/lib/notification';

export interface ChatAttachment {
  id: string;
  fileUrl: string;
  fileType: 'AUDIO' | 'VIDEO' | 'IMAGE' | 'FILE';
  fileName: string;
  fileSize: number;
  duration?: number;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  content?: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  attachments: ChatAttachment[];
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatParticipant {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    login?: string;
    avatarUrl?: string;
  };
  lastReadAt?: Date;
}

export interface ChatConversation {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConversationDTO {
  name?: string;
  isGroup?: boolean;
  participantIds: string[];
}

export interface CreateMessageDTO {
  conversationId: string;
  content?: string;
  attachment?: {
    fileUrl: string;
    fileType: 'AUDIO' | 'VIDEO' | 'IMAGE' | 'FILE';
    fileName: string;
    fileSize: number;
    duration?: number;
  };
}

class ChatService {
  private socket: Socket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  async getUserConversations(customToken?: string): Promise<ChatConversation[]> {
    try {
      const token = customToken || getAuthToken();
      if (!token) {
        notification.error('Você precisa estar logado para ver conversas');
        return [];
      }
      
      const response = await axios.get(`${API_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        notification.error('Sessão expirada. Faça login novamente.');
      } else {
        notification.error('Erro ao carregar conversas. Tente novamente.');
      }
      return [];
    }
  }

  async createConversation(data: CreateConversationDTO, customToken?: string): Promise<ChatConversation | null> {
    try {
      const token = customToken || getAuthToken();
      if (!token) {
        notification.error('Você precisa estar logado para criar conversas');
        return null;
      }
      
      if (!data.participantIds || data.participantIds.length === 0) {
        notification.error('Selecione pelo menos um participante');
        return null;
      }
      
      const uniqueParticipantIds = Array.from(new Set(data.participantIds));
      const payload = { ...data, participantIds: uniqueParticipantIds };
      
      const response = await axios.post(`${API_URL}/api/chat/conversations`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      notification.success('Conversa criada com sucesso!');
      return response.data;
      
    } catch (error: any) {
      if (error.response?.status === 400) {
        notification.error('Dados inválidos para criar conversa');
      } else if (error.response?.status === 401) {
        notification.error('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 403) {
        notification.error('Sem permissão para criar esta conversa');
      } else if (error.response?.status === 404) {
        notification.error('Um ou mais usuários não foram encontrados');
      } else {
        notification.error('Erro ao criar conversa. Tente novamente.');
      }
      return null;
    }
  }

  async getConversationMessages(
    conversationId: string,
    limit = 50,
    cursor?: string,
    customToken?: string
  ): Promise<ChatMessage[]> {
    try {
      const token = customToken || getAuthToken();
      if (!token) {
        notification.error('Você precisa estar logado para ver mensagens');
        return [];
      }

      if (!conversationId) {
        notification.error('ID da conversa não fornecido');
        return [];
      }
      
      let url = `${API_URL}/api/chat/conversations/${conversationId}/messages?limit=${limit}`;
      if (cursor) url += `&cursor=${cursor}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        notification.error('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 403) {
        notification.error('Você não tem acesso a esta conversa');
      } else if (error.response?.status === 404) {
        notification.error('Conversa não encontrada');
      } else {
        notification.error('Erro ao carregar mensagens. Tente novamente.');
      }
      return [];
    }
  }

  async sendMessage(data: CreateMessageDTO, customToken?: string): Promise<ChatMessage | null> {
    try {
      const token = customToken || getAuthToken();
      if (!token) {
        notification.error('Você precisa estar logado para enviar mensagens');
        return null;
      }

      if (!data.conversationId) {
        notification.error('ID da conversa não fornecido');
        return null;
      }

      if (!data.content && !data.attachment) {
        notification.error('Mensagem não pode estar vazia');
        return null;
      }
      
      const response = await axios.post(
        `${API_URL}/api/chat/conversations/${data.conversationId}/messages`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data;
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        notification.error('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 403) {
        notification.error('Você não pode enviar mensagens nesta conversa');
      } else if (error.response?.status === 404) {
        notification.error('Conversa não encontrada');
      } else {
        notification.error('Erro ao enviar mensagem. Tente novamente.');
      }
      return null;
    }
  }

  async markConversationAsRead(conversationId: string, customToken?: string): Promise<boolean> {
    try {
      const token = customToken || getAuthToken();
      if (!token) {
        return false;
      }

      if (!conversationId) {
        return false;
      }
      
      await axios.post(
        `${API_URL}/api/chat/conversations/${conversationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return true;
      
    } catch (error: any) {
      return false;
    }
  }

  async uploadAttachment(file: File, customToken?: string): Promise<string | null> {
    try {
      const token = customToken || getAuthToken();
      if (!token) {
        notification.error('Você precisa estar logado para enviar arquivos');
        return null;
      }

      if (!file) {
        notification.error('Nenhum arquivo selecionado');
        return null;
      }

      const allowedTypes = ['audio/', 'video/', 'image/'];
      const isValidType = allowedTypes.some(type => file.type.startsWith(type));
      
      if (!isValidType) {
        notification.error('Tipo de arquivo não suportado');
        return null;
      }

      if (file.size > 10 * 1024 * 1024) { 
        notification.error('Arquivo muito grande. Máximo 10MB.');
        return null;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_URL}/api/uploads/chat`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.fileUrl;
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        notification.error('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 413) {
        notification.error('Arquivo muito grande.');
      } else {
        notification.error('Erro ao enviar arquivo. Tente novamente.');
      }
      return null;
    }
  }

  connectToWebSocket(userId: string, token: string) {
    try {
      if (this.socket && this.socket.connected) return;

      this.socket = io(`${API_URL.replace('/api', '')}`, {
        auth: { token, userId },
      });

      this.socket.on('connect_error', (err) => {
        notification.error('Erro na conexão em tempo real');
      });

      this.socket.on('connect', () => {
        this.setupEventListeners();
      });

    } catch (error) {
      notification.error('Erro ao conectar ao chat');
    }
  }

  disconnectFromWebSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('new_message', (data) => this.notifyListeners('new_message', data));
    this.socket.on('user_typing', (data) => this.notifyListeners('user_typing', data));
    this.socket.on('messages_read', (data) => this.notifyListeners('messages_read', data));
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) callbacks.splice(index, 1);
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  joinConversation(conversationId: string) {
    if (this.socket) this.socket.emit('join_conversation', { conversationId });
  }

  leaveConversation(conversationId: string) {
    if (this.socket) this.socket.emit('leave_conversation', { conversationId });
  }

  sendTypingStatus(conversationId: string, isTyping: boolean) {
    if (this.socket) this.socket.emit('typing', { conversationId, isTyping });
  }

  sendMessageSocket(data: CreateMessageDTO): Promise<ChatMessage | null> {
    return new Promise((resolve) => {
      if (!this.socket) {
        notification.error('Conexão perdida. Tente novamente.');
        resolve(null);
        return;
      }

      this.socket.emit('send_message', data, (response: any) => {
        if (response.error) {
          notification.error('Erro ao enviar mensagem');
          resolve(null);
        } else {
          resolve(response);
        }
      });
    });
  }

  markAsReadSocket(conversationId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve(false);
        return;
      }

      this.socket.emit('mark_as_read', { conversationId }, (response: any) => {
        resolve(!response.error);
      });
    });
  }
}

export const chatService = new ChatService();