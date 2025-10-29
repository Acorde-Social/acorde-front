"use client";

import { memo, useEffect, useRef } from "react";
import { ChatMessage, ChatParticipant } from "@/services/chat-service";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, CheckCheck } from "lucide-react";
import { fixImageUrl } from "@/lib/utils";
import ChatAudioPlayer from "./audio/ChatAudioPlayer";

interface MessageListProps {
	messages: ChatMessage[];
	currentUserId: string;
	participants?: ChatParticipant[];
	isTyping?: boolean;
}

function MessageList({ messages, currentUserId, participants, isTyping }: MessageListProps) {
	// Função para formatar a hora da mensagem
	const formatMessageTime = (date: Date) => {
		return format(new Date(date), 'HH:mm', { locale: ptBR });
	};

	// Verificar se uma mensagem é do mesmo remetente que a anterior
	const isSameSender = (message: ChatMessage, index: number) => {
		if (index === 0) return false;
		return message.senderId === messages[index - 1].senderId;
	};

	// Obter as iniciais do remetente para o avatar
	const getSenderInitials = (message: ChatMessage) => {
		return message.sender && message.sender.name
			? message.sender.name.substring(0, 2).toUpperCase()
			: "??";
	};

	// Renderizar o conteúdo da mensagem com base no tipo
	const renderMessageContent = (message: ChatMessage) => {
		// Se tiver anexos, renderizar os anexos
		if (message.attachments && message.attachments.length > 0) {
			const attachment = message.attachments[0]; // Por enquanto, lidar com um anexo por vez

			switch (attachment.fileType) {
				case 'AUDIO':
					return (
						<div className="w-full -mx-3 my-0">
							<ChatAudioPlayer
								src={fixImageUrl(attachment.fileUrl)}
								className="w-full px-0"
								duration={attachment.duration || 0}
								onError={(e) => {
									console.error("Erro ao carregar áudio:", attachment.fileUrl, e);
								}}
							/>
						</div>
					);

				case 'VIDEO':
					return (
						<div className="mt-1 rounded-md overflow-hidden">
							<video
								className="w-full h-auto object-contain"
								controls
								src={fixImageUrl(attachment.fileUrl)}
							/>
						</div>
					);

				case 'IMAGE':
					return (
						<div className="mt-1 rounded-md overflow-hidden">
							<img
								className="w-full h-auto object-contain rounded"
								src={fixImageUrl(attachment.fileUrl)}
								alt="Imagem enviada"
								onError={(e) => {
									console.error("Erro ao carregar imagem:", attachment.fileUrl);
									e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
									e.currentTarget.onerror = null;
								}}
							/>
						</div>
					);

				default:
					return (
						<div className="mt-2 p-2 bg-accent rounded-md flex items-center">
							<div className="truncate">
								<p className="text-xs text-muted-foreground">Arquivo</p>
								<p className="truncate">{attachment.fileName}</p>
							</div>
							<a
								href={fixImageUrl(attachment.fileUrl)}
								target="_blank"
								rel="noopener noreferrer"
								className="ml-2 text-primary text-sm"
							>
								Download
							</a>
						</div>
					);
			}
		}

		// Se não tiver anexos ou tiver conteúdo de texto, mostrar o texto
		return message.content ? <p>{message.content}</p> : null;
	};

	// Renderizar mensagens agrupadas por dia
	const renderMessages = () => {
		if (!messages || messages.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
					<p className="text-center">Nenhuma mensagem encontrada</p>
					<p className="text-center text-sm">Envie uma mensagem para iniciar a conversa</p>
				</div>
			);
		}

		return (
			<>
				{messages.map((message, index) => {
					// Verificar se a mensagem tem dados válidos
					if (!message || !message.id) {
						console.warn("Mensagem inválida recebida:", message);
						return null;
					}

					const isMine = message.senderId === currentUserId;
					const showAvatar = !isSameSender(message, index);

					return (
						<div
							key={message.id}
							className={`flex mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}
						>
							<div className={`flex ${isMine ? 'flex-row-reverse' : 'flex-row'} items-end`}>
								{showAvatar ? (
									<Avatar className={`h-8 w-8 aspect-square ${isMine ? 'ml-2' : 'mr-2'}`}>
										<AvatarImage
											src={message.sender && message.sender.avatarUrl ?
												fixImageUrl(message.sender.avatarUrl) : ''}
											className="object-cover w-full h-full"
										/>
										<AvatarFallback>{getSenderInitials(message)}</AvatarFallback>
									</Avatar>
								) : (
									<div className={`w-8 ${isMine ? 'ml-2' : 'mr-2'}`} />
								)}								<div className="flex flex-col">
									{showAvatar && !isMine && message.sender && (
										<span className="text-xs text-muted-foreground ml-1 mb-1">
											{message.sender.name}
										</span>
									)}

									<div
										className={`px-3 py-2 rounded-lg max-w-[500px] break-words ${isMine
											? 'bg-primary text-black dark:text-white'
											: 'bg-gray-200 border border-gray-300 text-black dark:bg-accent dark:border-accent-foreground dark:text-white'
											}`}
									>
										{renderMessageContent(message)}
									</div>

									<div className={`flex items-center mt-1 text-xs text-muted-foreground ${isMine ? 'justify-end' : 'justify-start'
										}`}>
										<span>{message.createdAt ? formatMessageTime(message.createdAt) : '--:--'}</span>

										{isMine && (
											<span className="ml-1">
												{message.isRead ? (
													<CheckCheck className="h-3 w-3" />
												) : (
													<Check className="h-3 w-3" />
												)}
											</span>
										)}
									</div>
								</div>
							</div>
						</div>
					);
				})}

				{/* Indicador de digitação */}
				{isTyping && (
					<div className="flex mb-3 justify-start">
						<div className="bg-accent text-accent-foreground px-3 py-2 rounded-lg">
							<div className="flex space-x-1 items-center">
								<div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }}></div>
								<div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }}></div>
								<div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }}></div>
							</div>
						</div>
					</div>
				)}
			</>
		);
	};

	return <div className="space-y-1">{renderMessages()}</div>;
}

// Usar memo para evitar renderizações desnecessárias
export default memo(MessageList);