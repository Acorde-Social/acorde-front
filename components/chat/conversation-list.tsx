"use client";

import { useState } from "react";
import { ChatConversation } from "@/services/chat-service";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationListProps {
	conversations: ChatConversation[];
	activeConversationId?: string;
	onSelectConversation: (conversation: ChatConversation) => void;
	isLoading: boolean;
}

export default function ConversationList({
	conversations,
	activeConversationId,
	onSelectConversation,
	isLoading,
}: ConversationListProps) {
	// Retorna o nome de exibição para uma conversa (nome do grupo ou nome do outro participante)
	const getDisplayName = (conversation: ChatConversation) => {
		return conversation.name || 'Conversa sem nome';
	};

	// Retorna a imagem para exibição (avatar do grupo ou do outro participante)
	const getDisplayAvatar = (conversation: ChatConversation) => {
		if (conversation.isGroup) {
			return null; // Pode ser uma imagem de grupo padrão
		}
		// Retorna o avatar do outro participante
		const otherParticipant = conversation.participants[0]; // Simplificado
		return otherParticipant?.user?.avatarUrl;
	};

	// Retorna as iniciais para o fallback do avatar
	const getAvatarInitials = (conversation: ChatConversation) => {
		const name = getDisplayName(conversation);
		return name.substring(0, 2).toUpperCase();
	};

	// Formata o tempo para exibição
	const formatTime = (date: Date) => {
		return formatDistanceToNow(new Date(date), {
			addSuffix: true,
			locale: ptBR
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-3 p-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="flex items-center space-x-3 p-2">
						<Skeleton className="h-10 w-10 rounded-full" />
						<div className="space-y-2 flex-1">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-3 w-1/2" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (conversations.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
				<p className="text-center">Nenhuma conversa encontrada</p>
				<p className="text-center text-sm">Inicie uma nova conversa usando o botão acima</p>
			</div>
		);
	}

	return (
		<div className="space-y-1">
			{conversations.map((conversation) => (
				<div
					key={conversation.id}
					className={`flex items-start p-3 hover:bg-accent/50 cursor-pointer transition-colors ${activeConversationId === conversation.id ? 'bg-accent' : ''
						}`}
					onClick={() => onSelectConversation(conversation)}
				>
					<Avatar className="h-10 w-10 mr-3 flex-shrink-0">
						<AvatarImage src={getDisplayAvatar(conversation) || ''} />
						<AvatarFallback>{getAvatarInitials(conversation)}</AvatarFallback>
					</Avatar>

					<div className="flex-1 min-w-0">
						<div className="flex justify-between items-start">
							<h3 className="font-medium text-sm truncate">
								{getDisplayName(conversation)}
							</h3>
							{conversation.lastMessage && (
								<span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
									{formatTime(conversation.lastMessage.createdAt)}
								</span>
							)}
						</div>

						<div className="flex justify-between items-center mt-1">
							{conversation.lastMessage ? (
								<p className="text-xs text-muted-foreground truncate">
									{conversation.lastMessage.content ||
										(conversation.lastMessage.attachments.length > 0
											? `${conversation.lastMessage.sender.name} enviou um ${conversation.lastMessage.attachments[0].fileType === 'AUDIO' ? 'áudio' :
												conversation.lastMessage.attachments[0].fileType === 'VIDEO' ? 'vídeo' :
													conversation.lastMessage.attachments[0].fileType === 'IMAGE' ? 'imagem' : 'arquivo'
											}`
											: 'Mensagem vazia')}
								</p>
							) : (
								<p className="text-xs text-muted-foreground">Nenhuma mensagem</p>
							)}

							{conversation.unreadCount && conversation.unreadCount > 0 && (
								<Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
									{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
								</Badge>
							)}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}