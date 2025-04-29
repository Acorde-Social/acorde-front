"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ChatConversation } from "@/services/chat-service";
import { chatService } from "@/services/chat-service";
import ConversationList from "@/components/chat/conversation-list";
import ChatContainer from "@/components/chat/chat-container";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import NewConversationModal from "@/components/chat/new-conversation-modal";

export default function ChatPage() {
	const { user, token } = useAuth();
	const router = useRouter();
	const [conversations, setConversations] = useState<ChatConversation[]>([]);
	const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [showNewConversationModal, setShowNewConversationModal] = useState(false);

	useEffect(() => {
		if (!user) {
			router.push('/login');
			return;
		}

		// Carregar as conversas do usuário
		loadConversations();

		// Conectar ao WebSocket
		if (user.id && token) {
			chatService.connectToWebSocket(user.id, token);
		}

		// Configurar os listeners de WebSocket
		setupWebSocketListeners();

		return () => {
			// Limpar ao desmontar
			chatService.disconnectFromWebSocket();
		};
	}, [user, token]);

	const loadConversations = async () => {
		try {
			setIsLoading(true);
			const data = await chatService.getUserConversations();
			setConversations(data);
			setIsLoading(false);
		} catch (error) {
			console.error('Erro ao carregar conversas:', error);
			setIsLoading(false);
		}
	};

	const setupWebSocketListeners = () => {
		// Ouvir por novas mensagens
		chatService.on('new_message', (message) => {
			// Atualizar a lista de conversas quando uma nova mensagem chegar
			setConversations(prev => {
				const updatedConversations = [...prev];
				const conversationIndex = updatedConversations.findIndex(c => c.id === message.conversationId);

				if (conversationIndex > -1) {
					// Atualiza a última mensagem da conversa
					updatedConversations[conversationIndex] = {
						...updatedConversations[conversationIndex],
						lastMessage: message,
						unreadCount: activeConversation?.id === message.conversationId ? 0 :
							(updatedConversations[conversationIndex].unreadCount || 0) + 1
					};

					// Move esta conversa para o topo
					const conversation = updatedConversations.splice(conversationIndex, 1)[0];
					updatedConversations.unshift(conversation);
				}

				return updatedConversations;
			});

			// Se a conversa ativa for a que recebeu a mensagem, atualiza a conversa ativa
			if (activeConversation && activeConversation.id === message.conversationId) {
				setActiveConversation(prev => {
					if (!prev) return null;
					return {
						...prev,
						lastMessage: message
					};
				});
			}
		});

		// Ouvir por mensagens lidas
		chatService.on('messages_read', (data) => {
			if (data.userId !== user?.id) {
				// Atualizar status de leitura das mensagens
				setConversations(prev => {
					return prev.map(conv => {
						if (conv.id === data.conversationId) {
							return {
								...conv,
								lastMessage: conv.lastMessage ? {
									...conv.lastMessage,
									isRead: true
								} : undefined
							};
						}
						return conv;
					});
				});
			}
		});
	};

	const handleSelectConversation = (conversation: ChatConversation) => {
		setActiveConversation(conversation);

		// Marcar conversa como lida
		if (conversation.unreadCount && conversation.unreadCount > 0) {
			chatService.markConversationAsRead(conversation.id)
				.then(() => {
					// Atualizar contagem de não lidas
					setConversations(prev =>
						prev.map(conv =>
							conv.id === conversation.id
								? { ...conv, unreadCount: 0 }
								: conv
						)
					);
				})
				.catch(error => console.error('Erro ao marcar como lida:', error));
		}

		// Entrar na sala de chat via WebSocket
		chatService.joinConversation(conversation.id);
	};

	const handleCreateConversation = async (participantIds: string[], name?: string, isGroup = false) => {
		try {
			const newConversation = await chatService.createConversation({
				participantIds,
				name,
				isGroup
			});

			// Adicionar a nova conversa à lista e selecioná-la
			setConversations(prev => [newConversation, ...prev]);
			setActiveConversation(newConversation);
			setShowNewConversationModal(false);

			// Entrar na sala de chat via WebSocket
			chatService.joinConversation(newConversation.id);
		} catch (error) {
			console.error('Erro ao criar conversa:', error);
		}
	};

	return (
		<div className="flex h-screen bg-background">
			{/* Sidebar com lista de conversas */}
			<div className="w-1/4 border-r border-border h-full flex flex-col">
				<div className="p-4 border-b border-border flex justify-between items-center">
					<h2 className="text-xl font-bold">Conversas</h2>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setShowNewConversationModal(true)}
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
					/>
				</div>
			</div>

			{/* Área principal de chat */}
			<div className="flex-1 flex flex-col">
				{activeConversation ? (
					<ChatContainer
						conversation={activeConversation}
						currentUserId={user?.id || ''}
					/>
				) : (
					<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
						<p className="text-lg mb-4">Selecione uma conversa ou inicie uma nova</p>
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

			{/* Modal para criar nova conversa */}
			<NewConversationModal
				isOpen={showNewConversationModal}
				onClose={() => setShowNewConversationModal(false)}
				onCreateConversation={handleCreateConversation}
			/>
		</div>
	);
}