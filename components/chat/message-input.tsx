"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, File as FileIcon, Image, Video, Send, X, Loader2, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

interface MessageInputProps {
	onSendMessage: (content: string, attachment?: File) => Promise<any>;
	onTyping: (isTyping: boolean) => void;
}

export default function MessageInput({ onSendMessage, onTyping }: MessageInputProps) {
	const { toast } = useToast();
	const [message, setMessage] = useState('');
	const [attachment, setAttachment] = useState<File | null>(null);
	const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
	const [attachmentType, setAttachmentType] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
	const [isRecording, setIsRecording] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Hook para gravação de áudio
	const {
		startRecording,
		stopRecording,
		isRecording: audioIsRecording,
		audioBlob,
		audioURL
	} = useAudioRecorder();

	// Monitorar o estado de gravação de áudio
	useEffect(() => {
		setIsRecording(audioIsRecording);
	}, [audioIsRecording]);

	// Quando o audioBlob estiver disponível, criar arquivo e anexar
	useEffect(() => {
		if (audioBlob && !audioIsRecording) {
			// Determinar o tipo de arquivo adequado com base no navegador
			const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
			const extension = mimeType === 'audio/webm' ? '.webm' : '.ogg';

			// Criar arquivo com o tipo correto
			const fileName = `audio_${Date.now()}${extension}`;
			const audioFile = new File([audioBlob], fileName, { type: mimeType });

			handleAttachment(audioFile);
		}
	}, [audioBlob, audioIsRecording]);

	// Ativar resize automático do textarea
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			const newHeight = Math.min(textareaRef.current.scrollHeight, 100); // Limitando altura máxima
			textareaRef.current.style.height = `${newHeight}px`;
		}
	}, [message]);

	// Manipular mudanças no textarea, com detecção de digitação
	const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(e.target.value);

		// Enviar evento de digitação
		onTyping(true);

		// Reiniciar timeout para parar o evento de digitação
		if (typingTimeout) {
			clearTimeout(typingTimeout);
		}

		const timeout = setTimeout(() => {
			onTyping(false);
		}, 2000);

		setTypingTimeout(timeout);
	};

	// Enviar mensagem quando Enter for pressionado (sem shift)
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	// Lidar com clique no botão de anexo
	const handleAttachmentClick = (type: 'image' | 'video' | 'file') => {
		if (!fileInputRef.current) return;

		// Definir os tipos de arquivo aceitos com base no tipo selecionado
		switch (type) {
			case 'image':
				fileInputRef.current.accept = 'image/*';
				break;
			case 'video':
				fileInputRef.current.accept = 'video/*';
				break;
			case 'file':
				fileInputRef.current.accept = '*/*';
				break;
		}

		fileInputRef.current.click();
	};

	// Processar o arquivo anexado
	const handleAttachment = (file: File) => {
		// Validar tamanho do arquivo (max 100MB)
		if (file.size > 100 * 1024 * 1024) {
			toast({
				title: "Arquivo muito grande",
				description: "O tamanho máximo do arquivo é 100MB",
				variant: "destructive",
			});
			return;
		}

		setAttachment(file);
		setAttachmentType(file.type);

		// Criar preview para imagens, vídeos e áudios
		if (file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setAttachmentPreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		} else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
			const url = URL.createObjectURL(file);
			setAttachmentPreview(url);
		}
	};

	// Lidar com seleção de arquivo
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		handleAttachment(file);

		// Resetar o input para permitir selecionar o mesmo arquivo novamente
		e.target.value = '';
	};

	// Remover anexo
	const handleRemoveAttachment = () => {
		setAttachment(null);
		setAttachmentPreview(null);
		setAttachmentType(null);

		// Limpar URLs de objeto se houver
		if (attachmentPreview && !attachmentPreview.startsWith('data:')) {
			URL.revokeObjectURL(attachmentPreview);
		}
	};

	// Iniciar gravação de áudio
	const handleStartRecording = () => {
		startRecording();
	};

	// Parar gravação de áudio
	const handleStopRecording = () => {
		stopRecording();
	};

	// Enviar mensagem
	const handleSendMessage = async () => {
		// Verificar se há mensagem ou anexo
		if (!message.trim() && !attachment) return;

		try {
			setLoading(true);

			// Enviar mensagem
			await onSendMessage(message.trim(), attachment || undefined);

			// Limpar campos
			setMessage('');
			if (textareaRef.current) {
				textareaRef.current.style.height = 'auto';
			}
			setAttachment(null);
			setAttachmentPreview(null);
			setAttachmentType(null);

			// Limpar URLs de objeto se houver
			if (attachmentPreview && !attachmentPreview.startsWith('data:')) {
				URL.revokeObjectURL(attachmentPreview);
			}
		} catch (error) {
			console.error('Erro ao enviar mensagem:', error);
			toast({
				title: "Erro ao enviar mensagem",
				description: "Tente novamente mais tarde",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full">
			{/* Preview de anexo */}
			{attachment && (
				<div className="mb-2 p-2 border border-border rounded-md bg-accent/30 relative">
					<Button
						variant="ghost"
						size="icon"
						className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 hover:bg-background"
						onClick={handleRemoveAttachment}
					>
						<X className="h-4 w-4" />
					</Button>

					{attachmentType?.startsWith('image/') && attachmentPreview && (
						<div className="max-h-48 overflow-hidden rounded-md">
							<img
								src={attachmentPreview}
								alt="Anexo"
								className="object-contain max-h-full max-w-full"
							/>
						</div>
					)}

					{attachmentType?.startsWith('video/') && attachmentPreview && (
						<div className="max-h-48 overflow-hidden rounded-md">
							<video
								src={attachmentPreview}
								controls
								className="max-h-full max-w-full"
							/>
						</div>
					)}

					{attachmentType?.startsWith('audio/') && (
						<div className="w-full py-2">
							<audio src={attachmentPreview || audioURL || ''} controls className="w-full" />
						</div>
					)}

					{(!attachmentType?.startsWith('image/') && !attachmentType?.startsWith('video/') && !attachmentType?.startsWith('audio/')) && (
						<div className="flex items-center p-2">
							<div className="mr-2">
								{attachmentType?.startsWith('audio/') ? (
									<Mic className="h-6 w-6 text-primary" />
								) : (
									<FileIcon className="h-6 w-6 text-primary" />
								)}
							</div>
							<div className="truncate">
								<p className="text-sm font-medium truncate">{attachment.name}</p>
								<p className="text-xs text-muted-foreground">
									{Math.round(attachment.size / 1024)} KB
								</p>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Estado de gravação */}
			{isRecording && (
				<div className="mb-2 p-2 border border-border rounded-md bg-red-500/10 flex items-center">
					<div className="h-3 w-3 rounded-full bg-red-500 animate-pulse mr-2" />
					<span className="text-sm">Gravando áudio...</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleStopRecording}
						className="ml-auto"
					>
						Parar
					</Button>
				</div>
			)}

			{/* Input de mensagem redesenhado */}
			<div className="flex items-center border border-input bg-background rounded-full px-3 py-1">
				{/* Seletor de Emojis */}
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 rounded-full mr-1"
						>
							<Smile className="h-5 w-5 text-muted-foreground" />
						</Button>
					</PopoverTrigger>
					<PopoverContent side="top" align="start" className="w-auto p-0 border-none">
						<EmojiPicker
							onEmojiClick={(emoji: EmojiClickData) => {
								setMessage(prev => prev + emoji.emoji);
								if (textareaRef.current) {
									textareaRef.current.focus();
								}
							}}
							theme={Theme.LIGHT}
						/>
					</PopoverContent>
				</Popover>

				{/* Área expandida para texto */}
				<Textarea
					ref={textareaRef}
					value={message}
					onChange={handleMessageChange}
					onKeyDown={handleKeyDown}
					placeholder={isRecording ? "Gravando áudio..." : "Digite uma mensagem..."}
					disabled={isRecording}
					className="min-h-[36px] max-h-[100px] py-2 pr-2 resize-none border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden bg-transparent"
					rows={1}
				/>

				{/* Menu de 3 pontos com todas as ações */}
				<div className="flex items-center space-x-1">
					{/* Botão de enviar mensagem */}
					<Button
						variant="ghost"
						size="icon"
						className={`h-9 w-9 rounded-full shrink-0 ${(!message.trim() && !attachment) ? 'text-muted-foreground' : 'text-primary'}`}
						onClick={handleSendMessage}
						disabled={loading || isRecording || (!message.trim() && !attachment)}
					>
						{loading ? (
							<Loader2 className="h-5 w-5 animate-spin" />
						) : (
							<Send className="h-5 w-5" />
						)}
					</Button>

					{/* Menu de ações */}
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9 rounded-full"
								disabled={loading || isRecording}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<circle cx="12" cy="12" r="1" />
									<circle cx="19" cy="12" r="1" />
									<circle cx="5" cy="12" r="1" />
								</svg>
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-52 p-2" side="top" align="end">
							<div className="flex flex-col space-y-1">
								{/* Opção para gravar áudio */}
								<Button
									variant="ghost"
									className="flex justify-start"
									onClick={handleStartRecording}
									disabled={!!attachment}
								>
									<Mic className="h-4 w-4 mr-2" />
									<span>Gravar áudio</span>
								</Button>

								{/* Opção para anexar imagem */}
								<Button
									variant="ghost"
									className="flex justify-start"
									onClick={() => handleAttachmentClick('image')}
								>
									<Image className="h-4 w-4 mr-2" />
									<span>Enviar imagem</span>
								</Button>

								{/* Opção para anexar vídeo */}
								<Button
									variant="ghost"
									className="flex justify-start"
									onClick={() => handleAttachmentClick('video')}
								>
									<Video className="h-4 w-4 mr-2" />
									<span>Enviar vídeo</span>
								</Button>

								{/* Opção para anexar arquivo */}
								<Button
									variant="ghost"
									className="flex justify-start"
									onClick={() => handleAttachmentClick('file')}
								>
									<FileIcon className="h-4 w-4 mr-2" />
									<span>Enviar arquivo</span>
								</Button>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			{/* Input de arquivo oculto */}
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				className="hidden"
			/>
		</div>
	);
}