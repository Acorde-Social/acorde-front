"use client";

import { WaveformBackground } from "@/components/common/WaveformBackground"

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { chatService } from "@/services/chat-service";
import type { ChatConversation } from "@/services/chat-service";
import ConversationList from "@/components/chat/conversation-list";
import ChatContainer from "@/components/chat/chat-container";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import NewConversationModal from "@/components/chat/new-conversation-modal";
import { FloatingFigures } from "@/components/common/FloatingFigures";

function ChatContent() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const data = await chatService.getUserConversations();
        setConversations(data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();

    if (user.id && token) {
      chatService.connectToWebSocket(user.id, token);
    }

    chatService.on("new_message", (message) => {
      setConversations((prev) => {
        const updatedConversations = [...prev];
        const conversationIndex = updatedConversations.findIndex((c) => c.id === message.conversationId);

        if (conversationIndex > -1) {
          updatedConversations[conversationIndex] = {
            ...updatedConversations[conversationIndex],
            lastMessage: message,
            unreadCount:
              activeConversation?.id === message.conversationId
                ? 0
                : (updatedConversations[conversationIndex].unreadCount || 0) + 1,
          };

          const conversation = updatedConversations.splice(conversationIndex, 1)[0];
          updatedConversations.unshift(conversation);
        }

        return updatedConversations;
      });

      if (activeConversation && activeConversation.id === message.conversationId) {
        setActiveConversation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            lastMessage: message,
          };
        });
      }
    });

    chatService.on("messages_read", (data) => {
      if (data.userId !== user?.id) {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === data.conversationId) {
              return {
                ...conv,
                lastMessage: conv.lastMessage
                  ? {
                      ...conv.lastMessage,
                      isRead: true,
                    }
                  : undefined,
              };
            }

            return conv;
          }),
        );
      }
    });

    return () => {
      chatService.disconnectFromWebSocket();
    };
  }, [authLoading, user, token, router, activeConversation]);

  useEffect(() => {
    const conversationId = searchParams.get("conversationId");
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);
      }
    }
  }, [searchParams, conversations]);

  const handleSelectConversation = (conversation: ChatConversation) => {
    setActiveConversation(conversation);

    if (conversation.unreadCount && conversation.unreadCount > 0) {
      chatService
        .markConversationAsRead(conversation.id)
        .then(() => {
          setConversations((prev) =>
            prev.map((conv) => (conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv)),
          );
        })
        .catch(() => {});
    }

    chatService.joinConversation(conversation.id);
  };

  const handleCreateConversation = async (participantIds: string[], name?: string, isGroup = false) => {
    try {
      const newConversation = await chatService.createConversation({
        participantIds,
        name,
        isGroup,
      });

      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      setShowNewConversationModal(false);

      chatService.joinConversation(newConversation.id);
    } catch (error) {
    }
  };

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9fafb] via-[#fcd34d]/10 to-[#2c1e4a]/10 dark:from-[#0f0c18] dark:via-[#3b2010]/15 dark:to-[#2c1e4a]/25 pointer-events-none" />
      <WaveformBackground />
      <div className="absolute inset-0 pointer-events-none">
        <div className="scale-175 opacity-60 dark:opacity-65">
          <FloatingFigures />
        </div>
      </div>

      <div className="relative z-10 flex h-screen w-full">
        <div
          className={`
            w-full md:w-1/3 lg:w-1/4 border-r border-border h-full flex flex-col
            ${activeConversation ? "hidden md:flex" : "flex"}
          `}
        >
          <div className="p-4 border-b border-border flex justify-between items-center bg-card">
            <h2 className="text-xl font-bold">Conversas</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNewConversationModal(true)}
              className="hover:bg-primary/10"
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversation?.id}
              onSelectConversation={handleSelectConversation}
              isLoading={isLoading}
              currentUserId={user?.id}
            />
          </div>
        </div>

        <div
          className={`
            flex-1 flex flex-col
            ${activeConversation ? "flex" : "hidden md:flex"}
          `}
        >
          {activeConversation ? (
            <ChatContainer
              conversation={activeConversation}
              currentUserId={user?.id || ""}
              onBack={() => setActiveConversation(null)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-4">
              <PlusCircle className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg mb-4 text-center">Selecione uma conversa ou inicie uma nova</p>
              <Button
                onClick={() => setShowNewConversationModal(true)}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Nova Conversa</span>
              </Button>
            </div>
          )}
        </div>

        <NewConversationModal
          isOpen={showNewConversationModal}
          onClose={() => setShowNewConversationModal(false)}
          onCreateConversation={handleCreateConversation}
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
      <ChatContent />
    </Suspense>
  );
}
