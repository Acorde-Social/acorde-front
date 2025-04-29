"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatService } from "@/hooks/use-chat-service";
import { useAuth } from "@/contexts/auth-context";
import { chatService } from "@/services/chat-service";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fixImageUrl } from "@/lib/utils";

interface ConversationParticipant {
	id: string;
	name: string;
	avatarUrl?: string;
}

interface Conversation {
	id: string;
	name?: string;
	isGroup: boolean;
	lastMessage?: any;
	participants: ConversationParticipant[];
	unreadCount: number;
	updatedAt: string;
}

interface FloatingChatProps {
	conversation: Conversation;
	onClose: () => void;
}

export default function FloatingChat({ conversation, onClose }: FloatingChatProps) {
	const { user } = useAuth();
	const { getMessages, sendMessage, markMessagesAsRead } = useChatService();
	const [messages, setMessages] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isTyping, setIsTyping] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [otherUser, setOtherUser] = useState<ConversationParticipant | null>(null);

	const socketRef = useRef<WebSocket | null>(null);

	// Determinar o outro participante da conversa (para conversas 1:1)
	useEffect(() => {
		if (!conversation.isGroup && user) {
			const other = conversation.participants.find(p => p.id !== user.id);
			if (other) {
				setOtherUser(other);
			}
		}
	}, [conversation, user]);

	// Carregar mensagens iniciais
	useEffect(() => {
		const loadMessages = async () => {
			setIsLoading(true);
			try {
				const result = await getMessages(conversation.id);
				setMessages(result.messages.reverse()); // Mensagens mais recentes embaixo

				// Marcar mensagens como lidas
				if (conversation.unreadCount > 0) {
					await markMessagesAsRead(conversation.id);
				}
			} catch (error) {
				console.error("Erro ao carregar mensagens:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadMessages();
	}, [conversation.id, conversation.unreadCount, getMessages, markMessagesAsRead]);

	// Conectar ao websocket para receber mensagens em tempo real
	useEffect(() => {
		// Obter token de autenticação
		const token = localStorage.getItem('auth_token');
		if (!token) return;

		// Conectar ao websocket
		const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/chat?token=${token}`);

		socket.onopen = () => {
			console.log('WebSocket conectado');
		};

		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);

				// Lidar com diferentes tipos de eventos
				switch (data.event) {
					case 'message': {
						// Verificar se a mensagem é para esta conversa
						if (data.payload.conversationId === conversation.id) {
							setMessages(prev => [...prev, data.payload]);

							// Se não for minha mensagem, marcar como lida
							if (data.payload.senderId !== user?.id) {
								markMessagesAsRead(conversation.id);
							}
						}
						break;
					}
					case 'typing': {
						// Atualizar estado de digitação se for desta conversa
						if (data.payload.conversationId === conversation.id && data.payload.userId !== user?.id) {
							setIsTyping(data.payload.isTyping);
						}
						break;
					}
				}
			} catch (error) {
				console.error('Erro ao processar mensagem do WebSocket:', error);
			}
		};

		socket.onerror = (error) => {
			console.error('Erro no WebSocket:', error);
		};

		socket.onclose = () => {
			console.log('WebSocket desconectado');
		};

		socketRef.current = socket;

		// Limpar na desmontagem
		return () => {
			if (socket.readyState === WebSocket.OPEN) {
				socket.close();
			}
		};
	}, [conversation.id, markMessagesAsRead, user?.id]);

	// Enviar notificação de digitação
	const handleTyping = (isTyping: boolean) => {
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			socketRef.current.send(JSON.stringify({
				event: 'typing',
				payload: {
					conversationId: conversation.id,
					isTyping
				}
			}));
		}
	};

	// Enviar mensagem
	const handleSendMessage = async (content: string, attachment?: File) => {
		try {
			const newMessage = await sendMessage(conversation.id, content, attachment);

			// Não precisamos adicionar manualmente, pois receberemos via WebSocket
			// Mas adicionamos como fallback caso o WebSocket falhe
			setMessages(prev => {
				// Verificar se já temos esta mensagem (para evitar duplicação)
				const exists = prev.some(msg => msg.id === newMessage.id);
				if (!exists) {
					return [...prev, newMessage];
				}
				return prev;
			});

			return newMessage;
		} catch (error) {
			console.error("Erro ao enviar mensagem:", error);
			throw error;
		}
	};

	// Alternar estado minimizado
	const toggleMinimized = () => {
		setIsMinimized(!isMinimized);
	};

	return (
		<div className="fixed bottom-0 right-6 z-50 flex flex-col">
			<Card className={`w-80 shadow-lg transition-all ${isMinimized ? 'h-12' : 'h-96'}`}>
				{/* Cabeçalho do chat */}
				<CardHeader className="p-3 flex flex-row items-center justify-between cursor-pointer" onClick={toggleMinimized}>
					<div className="flex items-center">
						{otherUser && (
							<Avatar className="h-6 w-6 mr-2">
								<AvatarImage src={fixImageUrl(otherUser.avatarUrl || "")} alt={otherUser.name} />
								<AvatarFallback>{otherUser.name?.charAt(0) || "U"}</AvatarFallback>
							</Avatar>
						)}
						<span className="font-medium text-sm truncate">
							{conversation.isGroup
								? conversation.name || "Grupo"
								: otherUser?.name || "Chat"}
						</span>
					</div>
					<div className="flex items-center gap-1">
						<Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleMinimized}>
							{isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
						</Button>
						<Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>

				{/* Corpo do chat (escondido quando minimizado) */}
				{!isMinimized && (
					<>
						{/* Lista de mensagens */}
						<CardContent className="p-3 pt-0 flex-1 overflow-y-auto h-[calc(100%-6rem)]">
							{isLoading ? (
								<div className="flex items-center justify-center h-full">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
							) : (
								<MessageList
									messages={messages}
									isTyping={isTyping}
									currentUserId={user?.id || ""}
								/>
							)}
						</CardContent>

						{/* Input de mensagem */}
						<CardFooter className="p-3 pt-0">
							<MessageInput
								onSendMessage={handleSendMessage}
								onTyping={handleTyping}
							/>
						</CardFooter>
					</>
				)}
			</Card>
		</div>
	);
}