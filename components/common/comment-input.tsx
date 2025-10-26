"use client"

import { useState, useRef, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Smile, Image as ImageIcon, X, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import type { EmojiClickData } from "emoji-picker-react"

// Lazy load do emoji picker para melhor performance
const EmojiPicker = lazy(() => import("emoji-picker-react"))

interface CommentInputProps {
	onSubmit: (data: { text?: string; media?: File }) => Promise<void>
	placeholder?: string
	submitLabel?: string
	initialText?: string
	allowMedia?: boolean
	maxImageSize?: number // em MB
}

export function CommentInput({
	onSubmit,
	placeholder = "Escreva um comentário...",
	submitLabel = "Comentar",
	initialText = "",
	allowMedia = true,
	maxImageSize = 2,
}: CommentInputProps) {
	const { toast } = useToast()
	const [text, setText] = useState(initialText)
	const [mediaFile, setMediaFile] = useState<File | null>(null)
	const [mediaPreview, setMediaPreview] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const handleEmojiClick = (emoji: EmojiClickData) => {
		// Inserir emoji diretamente no texto (como no chat)
		setText((prev) => prev + emoji.emoji)
		setEmojiPickerOpen(false)
		if (textareaRef.current) {
			textareaRef.current.focus()
		}
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		const isImage = file.type.startsWith("image/")

		// Validar tipo (apenas imagens)
		if (!isImage) {
			toast({
				variant: "destructive",
				title: "Tipo de arquivo inválido",
				description: "Apenas imagens (JPEG, PNG, GIF, WebP) são permitidas.",
			})
			return
		}

		// Validar tamanho
		const fileSizeMB = file.size / (1024 * 1024)

		if (fileSizeMB > maxImageSize) {
			toast({
				variant: "destructive",
				title: "Arquivo muito grande",
				description: `Imagens devem ter no máximo ${maxImageSize}MB. Seu arquivo tem ${fileSizeMB.toFixed(2)}MB.`,
			})
			return
		}

		// Criar preview
		const reader = new FileReader()
		reader.onloadend = () => {
			setMediaPreview(reader.result as string)
		}
		reader.readAsDataURL(file)
		setMediaFile(file)
	}

	const removeMedia = () => {
		setMediaFile(null)
		setMediaPreview(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	const handleSubmit = async () => {
		// Validar que tem pelo menos texto ou mídia
		if (!text.trim() && !mediaFile) {
			toast({
				variant: "destructive",
				title: "Comentário vazio",
				description: "Adicione texto ou mídia ao seu comentário.",
			})
			return
		}

		setLoading(true)
		try {
			await onSubmit({
				text: text.trim() || undefined,
				media: mediaFile || undefined,
			})

			// Limpar campos após sucesso
			setText("")
			setMediaFile(null)
			setMediaPreview(null)
			if (fileInputRef.current) {
				fileInputRef.current.value = ""
			}
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Erro ao enviar comentário",
				description: error instanceof Error ? error.message : "Tente novamente.",
			})
		} finally {
			setLoading(false)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			handleSubmit()
		}
	}

	return (
		<div className="space-y-3">
			{/* Preview de mídia */}
			{mediaPreview && (
				<div className="relative inline-block">
					<img
						src={mediaPreview}
						alt="Preview"
						className="max-w-xs max-h-48 rounded-lg border"
					/>
					<Button
						variant="destructive"
						size="icon"
						className="absolute top-2 right-2 h-6 w-6 rounded-full"
						onClick={removeMedia}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			)}

			{/* Input area */}
			<div className="flex items-end gap-2 p-3 border rounded-lg bg-background">
				<input
					ref={fileInputRef}
					type="file"
					accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
					className="hidden"
					onChange={handleFileChange}
				/>

				{/* Botões de ação à esquerda */}
				<div className="flex items-center gap-1">
					{/* Emoji picker com lazy loading */}
					<Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
						<PopoverTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
								<Smile className="h-5 w-5 text-muted-foreground" />
							</Button>
						</PopoverTrigger>
						<PopoverContent side="top" align="start" className="w-auto p-0 border-none">
							<Suspense fallback={<div className="p-4">Carregando emojis...</div>}>
								<EmojiPicker
									onEmojiClick={(emoji: EmojiClickData) => {
										handleEmojiClick(emoji)
										setEmojiPickerOpen(false)
									}}
									lazyLoadEmojis={true}
								/>
							</Suspense>
						</PopoverContent>
					</Popover>

					{/* Upload de imagem */}
					{allowMedia && (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 rounded-full"
							onClick={() => fileInputRef.current?.click()}
						>
							<ImageIcon className="h-5 w-5 text-muted-foreground" />
						</Button>
					)}
				</div>

				{/* Textarea */}
				<Textarea
					ref={textareaRef}
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className="min-h-[36px] max-h-[100px] py-2 resize-none border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 overflow-auto bg-transparent"
					rows={1}
				/>

				{/* Botão de enviar */}
				<Button
					size="sm"
					onClick={handleSubmit}
					disabled={loading || (!text.trim() && !mediaFile)}
					className="shrink-0"
				>
					{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
				</Button>
			</div>
		</div>
	)
}
