"use client";

import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { chatService, CreateConversationDTO, CreateMessageDTO } from '@/services/chat-service';
import { useAuth } from '@/contexts/auth-context';

export function useChatService() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar conversas
  const getConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await chatService.getUserConversations(token || '');
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar conversas';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Criar nova conversa
  const createConversation = useCallback(async (data: CreateConversationDTO) => {
    if (!token) {
      const errorMessage = 'Você precisa estar autenticado para criar uma conversa';
      setError(errorMessage);
      toast({
        title: 'Erro de Autenticação',
        description: errorMessage,
        variant: 'destructive'
      });
      throw new Error(errorMessage);
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await chatService.createConversation(data, token);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar conversa';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Carregar mensagens de uma conversa
  const getMessages = useCallback(async (conversationId: string, limit = 20, cursor?: string) => {
    if (!token) {
      const errorMessage = 'Você precisa estar autenticado para carregar mensagens';
      setError(errorMessage);
      return { messages: [], hasMore: false };
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await chatService.getConversationMessages(conversationId, limit, cursor, token);
      return { messages: result, hasMore: result.length === limit };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar mensagens';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      return { messages: [], hasMore: false };
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Enviar mensagem
  const sendMessage = useCallback(async (
    conversationId: string, 
    content: string, 
    attachment?: File
  ) => {
    if (!token) {
      const errorMessage = 'Você precisa estar autenticado para enviar mensagens';
      setError(errorMessage);
      toast({
        title: 'Erro de Autenticação',
        description: errorMessage,
        variant: 'destructive'
      });
      throw new Error(errorMessage);
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Se tiver anexo, primeiro faz o upload do arquivo
      let fileData;
      if (attachment) {
        const fileUrl = await chatService.uploadAttachment(attachment, token);
        
        // Determinar o tipo de arquivo com tipo correto
        const fileType: 'AUDIO' | 'VIDEO' | 'IMAGE' | 'FILE' = attachment.type.startsWith('image/') 
          ? 'IMAGE' 
          : attachment.type.startsWith('audio/') 
            ? 'AUDIO' 
            : attachment.type.startsWith('video/') 
              ? 'VIDEO' 
              : 'FILE';
        
        fileData = {
          fileUrl,
          fileType,
          fileName: attachment.name,
          fileSize: attachment.size
        };
      }
      
      // Criar o objeto de mensagem
      const messageData: CreateMessageDTO = {
        conversationId,
        content: content.trim() || undefined,
        attachment: fileData
      };
      
      // Enviar a mensagem
      const result = await chatService.sendMessage(messageData, token);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao enviar mensagem';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Marcar mensagens como lidas
  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!token) return;
    
    try {
      await chatService.markConversationAsRead(conversationId, token);
    } catch (err) {
      console.error('Erro ao marcar mensagens como lidas:', err);
    }
  }, [token]);

  return {
    isLoading,
    error,
    getConversations,
    createConversation,
    getMessages,
    sendMessage,
    markMessagesAsRead
  };
}