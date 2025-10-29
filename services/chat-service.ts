import axios from 'axios';
import { API_URL } from '@/lib/api-config';
import { getAuthToken } from '@/utils/auth';
import { io, Socket } from 'socket.io-client';

// Tipos de chat
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

  // Obtém as conversas do usuário
  async getUserConversations(customToken?: string): Promise<ChatConversation[]> {
    try {
      const token = customToken || getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      const response = await axios.get(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter conversas:', error);
      throw error;
    }
  }

  // Cria uma nova conversa
  async createConversation(data: CreateConversationDTO, customToken?: string): Promise<ChatConversation> {
    try {
      const token = customToken || getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      // Validar entrada
      if (!data.participantIds || data.participantIds.length === 0) {
        throw new Error('É necessário especificar pelo menos um participante');
      }
      
      // Remover duplicados (caso haja)
      const uniqueParticipantIds = Array.from(new Set(data.participantIds));
      
      const payload = {
        ...data,
        participantIds: uniqueParticipantIds,
      };
      
      const response = await axios.post(`${API_URL}/chat/conversations`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar conversa:', error);
      
      // Verificar se é um erro do axios para extrair mais informações
      if (error.response) {
        // O servidor respondeu com um status de erro
        const status = error.response.status;
        const data = error.response.data;
        
        // Mensagens específicas com base no código de erro
        if (status === 400) {
          throw new Error(data.message || 'Dados inválidos para criar conversa');
        } else if (status === 401) {
          throw new Error('Você não está autenticado para criar esta conversa');
        } else if (status === 403) {
          throw new Error('Você não tem permissão para criar esta conversa');
        } else if (status === 404) {
          throw new Error('Um ou mais usuários não foram encontrados');
        } else if (status === 500) {
          throw new Error('Erro no servidor. Tente novamente mais tarde.');
        }
      }
      
      // Se não for um erro do axios ou não tiver informações específicas
      throw error;
    }
  }

  // Obtém mensagens de uma conversa com paginação
  async getConversationMessages(
    conversationId: string,
    limit = 50,
    cursor?: string,
    customToken?: string
  ): Promise<ChatMessage[]> {
    try {
      const token = customToken || getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      let url = `${API_URL}/chat/conversations/${conversationId}/messages?limit=${limit}`;
      
      if (cursor) {
        url += `&cursor=${cursor}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter mensagens:', error);
      throw error;
    }
  }

  // Envia uma mensagem (texto, áudio ou vídeo)
  async sendMessage(data: CreateMessageDTO, customToken?: string): Promise<ChatMessage> {
    try {
      const token = customToken || getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      const response = await axios.post(
        `${API_URL}/chat/conversations/${data.conversationId}/messages`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  // Marca a conversa como lida
  async markConversationAsRead(conversationId: string, customToken?: string): Promise<void> {
    try {
      const token = customToken || getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      await axios.post(
        `${API_URL}/chat/conversations/${conversationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error('Erro ao marcar conversa como lida:', error);
      throw error;
    }
  }

  // Upload de arquivos (áudio, vídeo, imagem)
  async uploadAttachment(file: File, customToken?: string): Promise<string> {
    try {
      const token = customToken || getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_URL}/uploads/chat`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.fileUrl;
    } catch (error) {
      console.error('Erro ao fazer upload de arquivo:', error);
      throw error;
    }
  }

  // WebSocket para comunicação em tempo real
  connectToWebSocket(userId: string, token: string) {
    if (this.socket && this.socket.connected) {
      return;
    }

    this.socket = io(`${API_URL.replace('/api', '')}`, {
      auth: {
        token,
        userId,
      },
    });

    this.socket.on('connect', () => {
      console.log('Conectado ao WebSocket do chat');
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado do WebSocket do chat');
    });
    
    // Configurar eventos padrão
    this.setupEventListeners();
  }

  disconnectFromWebSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Registrar callbacks para eventos do socket
    this.socket.on('new_message', (data) => {
      this.notifyListeners('new_message', data);
    });

    this.socket.on('user_typing', (data) => {
      this.notifyListeners('user_typing', data);
    });

    this.socket.on('messages_read', (data) => {
      this.notifyListeners('messages_read', data);
    });
  }

  // Método para adicionar listeners de eventos
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)?.push(callback);
  }

  // Método para remover listeners de eventos
  off(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  // Método para notificar todos os listeners de um evento
  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  // Métodos para enviar eventos via WebSocket
  joinConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  sendTypingStatus(conversationId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  // Envia mensagem via WebSocket para ter resposta imediata
  sendMessageSocket(data: CreateMessageDTO): Promise<ChatMessage> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('WebSocket não está conectado'));
        return;
      }

      this.socket.emit('send_message', data, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  markAsReadSocket(conversationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('WebSocket não está conectado'));
        return;
      }

      this.socket.emit('mark_as_read', { conversationId }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }
}

export const chatService = new ChatService();