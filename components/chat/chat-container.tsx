"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { ChatConversation, ChatMessage } from "@/services/chat-service";
import { chatService } from "@/services/chat-service";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Info, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MessageList from "./message-list";
import MessageInput from "./message-input";

interface ChatContainerProps {
	conversation: ChatConversation;
	currentUserId: string;
}

export default function ChatContainer({
	conversation,
	currentUserId,
}: ChatContainerProps) {
	const { user } = useAuth();
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoadingMessages, setIsLoadingMessages] = useState(true);
	const [isTyping, setIsTyping] = useState(false);
	const [typingUser, setTypingUser] = useState<string | null>(null);
	const [hasMoreMessages, setHasMoreMessages] = useState(true);
	const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
	const [cursor, setCursor] = useState<string | undefined>(undefined);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Obter mensagens iniciais da conversa
	useEffect(() => {
		loadMessages();

		// Configurar listeners para digitação
		chatService.on('user_typing', handleUserTyping);

		return () => {
			// Limpar listeners ao desmontar
			chatService.off('user_typing', handleUserTyping);
		};
	}, [conversation.id]);

	// Rolar para o final quando mensagens forem carregadas
	useEffect(() => {
		if (!isLoadingMessages && messages.length > 0) {
			scrollToBottom();
		}
	}, [isLoadingMessages]);

	// Função para carregar mensagens
	const loadMessages = async () => {
		try {
			setIsLoadingMessages(true);
			const data = await chatService.getConversationMessages(conversation.id);
			setMessages(data.reverse()); // Inverter para mostrar as mais antigas primeiro

			if (data.length > 0) {
				setCursor(data[0].id);
			}

			setHasMoreMessages(data.length === 50); // Se 50 mensagens foram retornadas, há mais
			setIsLoadingMessages(false);
		} catch (error) {
			console.error('Erro ao carregar mensagens:', error);
			setIsLoadingMessages(false);
		}
	};

	// Função para carregar mais mensagens (paginação)
	const loadMoreMessages = async () => {
		if (!hasMoreMessages || loadingMoreMessages || !cursor) return;

		try {
			setLoadingMoreMessages(true);
			const data = await chatService.getConversationMessages(conversation.id, 50, cursor);

			if (data.length > 0) {
				setMessages(prev => [...data.reverse(), ...prev]);
				setCursor(data[0].id);
				setHasMoreMessages(data.length === 50);
			} else {
				setHasMoreMessages(false);
			}

			setLoadingMoreMessages(false);
		} catch (error) {
			console.error('Erro ao carregar mais mensagens:', error);
			setLoadingMoreMessages(false);
		}
	};

	// Handler para eventos de digitação
	const handleUserTyping = (data: { userId: string; isTyping: boolean; conversationId: string }) => {
		if (data.conversationId !== conversation.id || data.userId === currentUserId) return;

		const typingParticipant = conversation.participants.find(p => p.userId === data.userId);
		if (!typingParticipant) return;

		setIsTyping(data.isTyping);
		setTypingUser(data.isTyping ? typingParticipant.user.name : null);

		// Esconder indicador de digitação após 5 segundos se não receber outro evento
		if (data.isTyping) {
			setTimeout(() => {
				setIsTyping(false);
				setTypingUser(null);
			}, 5000);
		}
	};

	// Enviar um evento de digitação quando o usuário começa a digitar
	const handleTyping = (isTyping: boolean) => {
		chatService.sendTypingStatus(conversation.id, isTyping);
	};

	// Função para enviar uma mensagem
	const handleSendMessage = async (content: string, attachment?: File) => {
		try {
			let attachmentData;

			// Se houver um anexo, fazer upload primeiro
			if (attachment) {
				const fileUrl = await chatService.uploadAttachment(attachment);

				attachmentData = {
					fileUrl,
					fileType: getFileType(attachment.type),
					fileName: attachment.name,
					fileSize: attachment.size,
					duration: attachment.type.startsWith('audio/') || attachment.type.startsWith('video/') ? 0 : undefined, // Duração será atualizada depois
				};
			}

			// Enviar a mensagem
			const message = await chatService.sendMessage({
				conversationId: conversation.id,
				content,
				attachment: attachmentData,
			});

			// Adicionar a mensagem localmente (será duplicada se recebida via websocket, mas isso pode ser tratado)
			setMessages(prev => [...prev, message]);

			// Rolar para o final
			scrollToBottom();

			return message;
		} catch (error) {
			console.error('Erro ao enviar mensagem:', error);
			throw error;
		}
	};

	// Função auxiliar para determinar o tipo de arquivo
	const getFileType = (mimeType: string): 'AUDIO' | 'VIDEO' | 'IMAGE' | 'FILE' => {
		if (mimeType.startsWith('audio/')) return 'AUDIO';
		if (mimeType.startsWith('video/')) return 'VIDEO';
		if (mimeType.startsWith('image/')) return 'IMAGE';
		return 'FILE';
	};

	// Rolar para o final da conversa
	const scrollToBottom = () => {
		setTimeout(() => {
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		}, 100);
	};

	// Obter o nome de exibição para o cabeçalho da conversa
	const getDisplayName = () => {
		if (conversation.isGroup) {
			return conversation.name || 'Conversa em grupo';
		}

		// Para conversas 1:1, mostrar o nome do outro participante
		const otherParticipant = conversation.participants.find(
			p => p.userId !== currentUserId
		);

		return otherParticipant?.user.name || 'Conversa';
	};

	// Obter o avatar para o cabeçalho da conversa
	const getDisplayAvatar = () => {
		if (conversation.isGroup) {
			return null; // Poderia ser uma imagem de grupo
		}

		const otherParticipant = conversation.participants.find(
			p => p.userId !== currentUserId
		);

		return otherParticipant?.user.avatarUrl;
	};

	// Obter iniciais para o fallback do avatar
	const getAvatarInitials = () => {
		const name = getDisplayName();
		return name.substring(0, 2).toUpperCase();
	};

	return (
		<div className="flex flex-col h-full">
			{/* Cabeçalho do chat */}
			<div className="px-4 py-3 border-b border-border flex items-center justify-between">
				<div className="flex items-center">
					<Avatar className="h-10 w-10 mr-3">
						<AvatarImage src={getDisplayAvatar() || ''} />
						<AvatarFallback>{getAvatarInitials()}</AvatarFallback>
					</Avatar>

					<div>
						<h3 className="font-medium">{getDisplayName()}</h3>
						{isTyping && typingUser && (
							<p className="text-xs text-muted-foreground">
								{typingUser} está digitando...
							</p>
						)}
					</div>
				</div>

				<div className="flex items-center">
					<Button variant="ghost" size="icon" title="Informações da conversa">
						<Info className="h-5 w-5" />
					</Button>

					<Button variant="ghost" size="icon" title="Mais opções">
						<MoreVertical className="h-5 w-5" />
					</Button>
				</div>
			</div>

			{/* Lista de mensagens */}
			<div className="flex-1 overflow-y-auto p-4">
				{hasMoreMessages && (
					<div className="flex justify-center mb-4">
						<Button
							variant="ghost"
							size="sm"
							disabled={loadingMoreMessages}
							onClick={loadMoreMessages}
						>
							{loadingMoreMessages ? 'Carregando...' : 'Carregar mensagens anteriores'}
						</Button>
					</div>
				)}

				{isLoadingMessages ? (
					<div className="space-y-4">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
								<div className={`flex ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-start max-w-[70%]`}>
									{i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full mr-2" />}
									<div className="space-y-2">
										<Skeleton className="h-4 w-20" />
										<Skeleton className={`h-16 w-${Math.floor(Math.random() * 40) + 20}`} />
									</div>
									{i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full ml-2" />}
								</div>
							</div>
						))}
					</div>
				) : (
					<MessageList
						messages={messages}
						currentUserId={currentUserId}
						participants={conversation.participants}
					/>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input para mensagens */}
			<div className="border-t border-border p-3">
				<MessageInput
					onSendMessage={handleSendMessage}
					onTyping={handleTyping}
				/>
			</div>
		</div>
	);
}