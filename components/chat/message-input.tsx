"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, File as FileIcon, Image, Video, Send, X, Loader2, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

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
		audioBlob
	} = useAudioRecorder();

	// Monitorar o estado de gravação de áudio
	useEffect(() => {
		setIsRecording(audioIsRecording);
	}, [audioIsRecording]);

	// Quando o audioBlob estiver disponível, criar arquivo e anexar
	useEffect(() => {
		if (audioBlob && !audioIsRecording) {
			// Corrigindo a criação do arquivo para evitar erros de TypeScript
			const fileName = `audio_${Date.now()}.wav`;
			const audioFile = new File([audioBlob], fileName, { type: 'audio/wav' });

			handleAttachment(audioFile);
		}
	}, [audioBlob, audioIsRecording]);

	// Ativar resize automático do textarea
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
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

		// Criar preview para imagens e vídeos
		if (file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setAttachmentPreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		} else if (file.type.startsWith('video/')) {
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
		<div className="relative">
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

					{(!attachmentType?.startsWith('image/') && !attachmentType?.startsWith('video/')) && (
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

			{/* Input de mensagem */}
			<div className="flex items-end gap-2">
				<div className="flex-1 relative">
					<Textarea
						ref={textareaRef}
						value={message}
						onChange={handleMessageChange}
						onKeyDown={handleKeyDown}
						placeholder={isRecording ? "Gravando áudio..." : "Digite uma mensagem..."}
						disabled={isRecording}
						className="min-h-[2.5rem] max-h-40 py-2 pr-10 resize-none"
					/>

					{/* Botões de anexo */}
					<div className="absolute right-2 bottom-2">
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 rounded-full"
									disabled={loading || isRecording}
								>
									<Paperclip className="h-4 w-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-48 p-2" side="top">
								<div className="flex flex-col space-y-1">
									<Button
										variant="ghost"
										className="flex justify-start"
										onClick={() => handleAttachmentClick('image')}
									>
										<Image className="h-4 w-4 mr-2" />
										<span>Imagem</span>
									</Button>
									<Button
										variant="ghost"
										className="flex justify-start"
										onClick={() => handleAttachmentClick('video')}
									>
										<Video className="h-4 w-4 mr-2" />
										<span>Vídeo</span>
									</Button>
									<Button
										variant="ghost"
										className="flex justify-start"
										onClick={() => handleAttachmentClick('file')}
									>
										<FileIcon className="h-4 w-4 mr-2" />
										<span>Arquivo</span>
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				{/* Botão de gravação de áudio */}
				{!isRecording ? (
					<Button
						variant="ghost"
						size="icon"
						className="h-10 w-10 rounded-full"
						onClick={handleStartRecording}
						disabled={loading || !!attachment}
					>
						<Mic className="h-5 w-5" />
					</Button>
				) : (
					<Button
						variant="destructive"
						size="icon"
						className="h-10 w-10 rounded-full"
						onClick={handleStopRecording}
					>
						<X className="h-5 w-5" />
					</Button>
				)}

				{/* Botão de enviar */}
				<Button
					variant="secondary"
					size="icon"
					className="h-10 w-10 rounded-full"
					onClick={handleSendMessage}
					disabled={loading || isRecording || (!message.trim() && !attachment)}
				>
					{loading ? (
						<Loader2 className="h-5 w-5 animate-spin" />
					) : (
						<Send className="h-5 w-5" />
					)}
				</Button>
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