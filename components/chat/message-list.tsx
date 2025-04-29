"use client";

import { memo } from "react";
import { ChatMessage, ChatParticipant } from "@/services/chat-service";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, CheckCheck } from "lucide-react";
import AudioPlayer from "../audio/audio-player";

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
		return message.sender.name.substring(0, 2).toUpperCase();
	};

	// Renderizar o conteúdo da mensagem com base no tipo
	const renderMessageContent = (message: ChatMessage) => {
		// Se tiver anexos, renderizar os anexos
		if (message.attachments && message.attachments.length > 0) {
			const attachment = message.attachments[0]; // Por enquanto, lidar com um anexo por vez

			switch (attachment.fileType) {
				case 'AUDIO':
					return (
						<div className="mt-2">
							<AudioPlayer
								src={attachment.fileUrl}
								autoPlay={false}
								showWaveform={true}
								duration={attachment.duration || 0}
							/>
						</div>
					);

				case 'VIDEO':
					return (
						<div className="mt-2 rounded-md overflow-hidden">
							<video
								className="max-w-full"
								controls
								src={attachment.fileUrl}
							/>
						</div>
					);

				case 'IMAGE':
					return (
						<div className="mt-2 rounded-md overflow-hidden">
							<img
								className="max-w-full"
								src={attachment.fileUrl}
								alt="Imagem enviada"
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
								href={attachment.fileUrl}
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
		return <p>{message.content}</p>;
	};

	// Renderizar mensagens agrupadas por dia
	const renderMessages = () => {
		if (messages.length === 0) {
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
					const isMine = message.senderId === currentUserId;
					const showAvatar = !isSameSender(message, index);

					return (
						<div
							key={message.id}
							className={`flex mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}
						>
							<div className={`flex ${isMine ? 'flex-row-reverse' : 'flex-row'} items-end`}>
								{showAvatar ? (
									<Avatar className={`h-8 w-8 ${isMine ? 'ml-2' : 'mr-2'}`}>
										<AvatarImage src={message.sender.avatarUrl || ''} />
										<AvatarFallback>{getSenderInitials(message)}</AvatarFallback>
									</Avatar>
								) : (
									<div className={`w-8 ${isMine ? 'ml-2' : 'mr-2'}`} />
								)}

								<div className="flex flex-col">
									{showAvatar && !isMine && (
										<span className="text-xs text-muted-foreground ml-1 mb-1">
											{message.sender.name}
										</span>
									)}

									<div
										className={`px-3 py-2 rounded-lg max-w-md break-words ${isMine
											? 'bg-primary text-primary-foreground'
											: 'bg-accent text-accent-foreground'
											}`}
									>
										{renderMessageContent(message)}
									</div>

									<div className={`flex items-center mt-1 text-xs text-muted-foreground ${isMine ? 'justify-end' : 'justify-start'
										}`}>
										<span>{formatMessageTime(message.createdAt)}</span>

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