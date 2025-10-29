"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { ChatConversation, ChatMessage } from "@/services/chat-service";
import { chatService } from "@/services/chat-service";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Info, MoreVertical, ArrowLeft, Trash2, BellOff, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MessageList from "./message-list";
import MessageInput from "./message-input";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatContainerProps {
	conversation: ChatConversation;
	currentUserId: string;
	onBack?: () => void;
}

export default function ChatContainer({
	conversation,
	currentUserId,
	onBack,
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
	
	// Estados para modais e dropdowns
	const [showInfoDialog, setShowInfoDialog] = useState(false);
	const [showDeleteAlert, setShowDeleteAlert] = useState(false);

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

		const typingParticipant = conversation.participants.find(p => p.user.id === data.userId);
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
			p => p.user.id !== currentUserId
		);

		return otherParticipant?.user.name || 'Conversa';
	};

	// Obter o login do outro participante para link do perfil
	const getOtherParticipantLogin = () => {
		if (conversation.isGroup) return null;

		const otherParticipant = conversation.participants.find(
			p => p.user.id !== currentUserId
		);

		return otherParticipant?.user.login || null;
	};

	// Obter o avatar para o cabeçalho da conversa
	const getDisplayAvatar = () => {
		if (conversation.isGroup) {
			return null; // Poderia ser uma imagem de grupo
		}

		const otherParticipant = conversation.participants.find(
			p => p.user.id !== currentUserId
		);

		return otherParticipant?.user.avatarUrl;
	};

	// Obter iniciais para o fallback do avatar
	const getAvatarInitials = () => {
		const name = getDisplayName();
		return name.substring(0, 2).toUpperCase();
	};

	// Handler para apagar conversa
	const handleDeleteConversation = async () => {
		// TODO: Implementar endpoint no backend para deletar conversa
		console.log('Apagar conversa:', conversation.id);
		setShowDeleteAlert(false);
		// Após implementar o endpoint:
		// await chatService.deleteConversation(conversation.id);
		// onBack?.(); // Voltar para lista de conversas
	};

	return (
		<div className="flex flex-col h-full">
			{/* Cabeçalho do chat */}
			<div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card">
				<div className="flex items-center flex-1 min-w-0">
					{/* Botão voltar (mobile apenas) */}
					{onBack && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onBack}
							className="mr-2 md:hidden flex-shrink-0"
						>
							<ArrowLeft className="h-5 w-5" />
						</Button>
					)}

					{getOtherParticipantLogin() ? (
						<Link
							href={`/u/${getOtherParticipantLogin()}`}
							className="flex-shrink-0"
						>
							<Avatar className="h-10 w-10 mr-3 aspect-square hover:ring-2 hover:ring-primary transition-all">
								<AvatarImage src={getDisplayAvatar() || ''} className="object-cover w-full h-full" />
								<AvatarFallback>{getAvatarInitials()}</AvatarFallback>
							</Avatar>
						</Link>
					) : (
						<Avatar className="h-10 w-10 mr-3 flex-shrink-0 aspect-square">
							<AvatarImage src={getDisplayAvatar() || ''} className="object-cover w-full h-full" />
							<AvatarFallback>{getAvatarInitials()}</AvatarFallback>
						</Avatar>
					)}

					<div className="min-w-0 flex-1">
						<h3 className="font-medium truncate">{getDisplayName()}</h3>
						{isTyping && typingUser && (
							<p className="text-xs text-muted-foreground truncate">
								{typingUser} está digitando...
							</p>
						)}
					</div>
				</div>

			<div className="flex items-center flex-shrink-0">
				<Button 
					variant="ghost" 
					size="icon" 
					onClick={() => setShowInfoDialog(true)}
					title="Informações da conversa"
				>
					<Info className="h-5 w-5" />
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" title="Mais opções">
							<MoreVertical className="h-5 w-5" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuItem 
							className="text-destructive focus:text-destructive cursor-pointer"
							onClick={() => setShowDeleteAlert(true)}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Apagar conversa
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="cursor-pointer">
							<BellOff className="h-4 w-4 mr-2" />
							Silenciar notificações
						</DropdownMenuItem>
						<DropdownMenuItem className="cursor-pointer">
							<Archive className="h-4 w-4 mr-2" />
							Arquivar conversa
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
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

			{/* Dialog de Informações */}
			<Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Informações da Conversa</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						{/* Participantes */}
						<div>
							<h4 className="text-sm font-medium mb-3">Participantes</h4>
							<div className="space-y-2">
								{conversation.participants.map((participant) => (
									<div key={participant.user.id} className="flex items-center gap-3">
										<Avatar className="h-10 w-10 aspect-square">
											<AvatarImage 
												src={participant.user.avatarUrl || ''} 
												className="object-cover w-full h-full"
											/>
											<AvatarFallback>
												{participant.user.name.substring(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<p className="font-medium text-sm">{participant.user.name}</p>
											{participant.user.login && (
												<p className="text-xs text-muted-foreground">@{participant.user.login}</p>
											)}
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Informações da conversa */}
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Criada em:</span>
								<span className="font-medium">
									{new Date(conversation.createdAt).toLocaleDateString('pt-BR', {
										day: '2-digit',
										month: 'long',
										year: 'numeric'
									})}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Última atividade:</span>
								<span className="font-medium">
									{formatDistanceToNow(new Date(conversation.updatedAt), {
										addSuffix: true,
										locale: ptBR
									})}
								</span>
							</div>
							{conversation.lastMessage && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Total de mensagens:</span>
									<span className="font-medium">{messages.length}</span>
								</div>
							)}
						</div>
					</div>
					<DialogFooter>
						<Button onClick={() => setShowInfoDialog(false)}>Fechar</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Alert de Confirmação para Apagar */}
			<AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Apagar conversa?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta ação não pode ser desfeita. Todas as mensagens desta conversa 
							serão permanentemente removidas para você.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction 
							onClick={handleDeleteConversation}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Apagar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}