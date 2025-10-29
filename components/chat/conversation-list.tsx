"use client";

import { useState } from "react";
import Link from "next/link";
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
	currentUserId?: string; // Adicionar ID do usuário atual
}

export default function ConversationList({
	conversations,
	activeConversationId,
	onSelectConversation,
	isLoading,
	currentUserId,
}: ConversationListProps) {
	// Retorna o nome de exibição para uma conversa (nome do grupo ou nome do outro participante)
	const getDisplayName = (conversation: ChatConversation) => {
		if (conversation.isGroup) {
			return conversation.name || 'Grupo sem nome';
		}
		// Retorna o nome do outro participante
		const otherParticipant = conversation.participants.find(
			(p) => p.user.id !== currentUserId
		);
		return otherParticipant?.user?.name || 'Usuário desconhecido';
	};

	// Retorna a imagem para exibição (avatar do grupo ou do outro participante)
	const getDisplayAvatar = (conversation: ChatConversation) => {
		if (conversation.isGroup) {
			return null; // Pode ser uma imagem de grupo padrão
		}
		// Retorna o avatar do outro participante
		const otherParticipant = conversation.participants.find(
			(p) => p.user.id !== currentUserId
		);
		return otherParticipant?.user?.avatarUrl || null;
	};

	// Retorna o login do outro participante para criar o link do perfil
	const getOtherParticipantLogin = (conversation: ChatConversation) => {
		if (conversation.isGroup) {
			return null;
		}
		const otherParticipant = conversation.participants.find(
			(p) => p.user.id !== currentUserId
		);
		return otherParticipant?.user?.login || null;
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
		<div className="divide-y divide-border/50">
			{conversations.map((conversation) => {
				const otherLogin = getOtherParticipantLogin(conversation);

				return (
					<div
						key={conversation.id}
						className={`flex items-start p-4 hover:bg-accent/60 cursor-pointer transition-all duration-200 ${activeConversationId === conversation.id ? 'bg-accent/80 border-l-4 border-primary' : ''
							}`}
						onClick={() => onSelectConversation(conversation)}
					>
						{otherLogin ? (
							<Link
								href={`/u/${otherLogin}`}
								onClick={(e) => e.stopPropagation()}
								className="flex-shrink-0 mr-3"
							>
								<Avatar className="h-12 w-12 aspect-square ring-2 ring-border/50 hover:ring-primary transition-all">
									<AvatarImage src={getDisplayAvatar(conversation) || ''} className="object-cover w-full h-full" />
									<AvatarFallback className="text-sm">{getAvatarInitials(conversation)}</AvatarFallback>
								</Avatar>
							</Link>
						) : (
							<Avatar className="h-12 w-12 mr-3 flex-shrink-0 aspect-square ring-2 ring-border/50">
								<AvatarImage src={getDisplayAvatar(conversation) || ''} className="object-cover w-full h-full" />
								<AvatarFallback className="text-sm">{getAvatarInitials(conversation)}</AvatarFallback>
							</Avatar>
						)}

						<div className="flex-1 min-w-0">
							<div className="flex justify-between items-start mb-1">
								<h3 className="font-semibold text-sm truncate">
									{getDisplayName(conversation)}
								</h3>
								{conversation.lastMessage && (
									<span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
										{formatTime(conversation.lastMessage.createdAt)}
									</span>
								)}
							</div>

							<div className="flex justify-between items-center">
								{conversation.lastMessage ? (
									<p className={`text-xs truncate ${conversation.unreadCount && conversation.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
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
									<Badge variant="default" className="ml-2 h-5 min-w-[20px] rounded-full px-1.5 text-[10px] font-bold flex items-center justify-center bg-primary">
										{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
									</Badge>
								)}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}