"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Music, FileText, Users, X, Plus, FileAudio } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TrackService } from "@/services/track-service"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { AudioConverter } from "@/components/audio/audio-converter"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AudioPostCreatorProps {
	onPostCreated?: () => void
	onCancel?: () => void
}

interface Credit {
	role: string
	authors: string[]
}

export function AudioPostCreator({ onPostCreated, onCancel }: AudioPostCreatorProps) {
	const [title, setTitle] = useState("")
	const [postDescription, setPostDescription] = useState("")
	const [lyrics, setLyrics] = useState("")
	const [chords, setChords] = useState("")
	const [audioFile, setAudioFile] = useState<File | null>(null)
	const [overdubFiles, setOverdubFiles] = useState<File[]>([])
	const [credits, setCredits] = useState<Credit[]>([
		{ role: "Melodia", authors: [] },
		{ role: "Harmonia", authors: [] },
		{ role: "Arranjo", authors: [] }
	])
	const [newAuthor, setNewAuthor] = useState<{ [key: string]: string }>({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [activeTab, setActiveTab] = useState("audio")
	const [showConverter, setShowConverter] = useState(false)
	const [largeFile, setLargeFile] = useState<File | null>(null)

	const { toast } = useToast()
	const { token, user } = useAuth()

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			// Validar tipo de arquivo
			if (!file.type.startsWith('audio/')) {
				toast({
					title: "Arquivo inválido",
					description: "Por favor, selecione um arquivo de áudio válido.",
					variant: "destructive"
				})
				return
			}

			// Validar tamanho (50MB) - sugerir conversão se for maior
			if (file.size > 50 * 1024 * 1024) {
				setLargeFile(file)
				setShowConverter(true)
				toast({
					title: "Arquivo muito grande",
					description: "Arquivo maior que 50MB. Use o conversor para reduzir o tamanho.",
					variant: "default"
				})
				return
			}

			setAudioFile(file)
			setShowConverter(false)
		}
	}

	const handleConvertedFile = (mp3File: File) => {
		setAudioFile(mp3File)
		setShowConverter(false)
		setLargeFile(null)
		toast({
			title: "Arquivo convertido!",
			description: "Arquivo MP3 pronto para upload.",
		})
	}

	const handleOverdubsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (!files || files.length === 0) return
		const arr = Array.from(files)
		// validate types and sizes
		const valid = arr.filter(f => f.type.startsWith('audio/') && f.size <= 50 * 1024 * 1024)
		setOverdubFiles(prev => [...prev, ...valid])
	}

	const removeOverdub = (index: number) => {
		const updated = [...overdubFiles]
		updated.splice(index, 1)
		setOverdubFiles(updated)
	}

	const addAuthorToCredit = (roleIndex: number) => {
		const author = newAuthor[roleIndex]
		if (!author || author.trim() === "") return

		const updatedCredits = [...credits]
		if (!updatedCredits[roleIndex].authors.includes(author.trim())) {
			updatedCredits[roleIndex].authors.push(author.trim())
			setCredits(updatedCredits)
		}

		// Limpar input
		setNewAuthor({ ...newAuthor, [roleIndex]: "" })
	}

	const removeAuthorFromCredit = (roleIndex: number, authorIndex: number) => {
		const updatedCredits = [...credits]
		updatedCredits[roleIndex].authors.splice(authorIndex, 1)
		setCredits(updatedCredits)
	}

	const handleSubmit = async () => {
		if (!title.trim()) {
			toast({
				title: "Título obrigatório",
				description: "Por favor, adicione um título para sua postagem.",
				variant: "destructive"
			})
			return
		}

		if (!audioFile) {
			toast({
				title: "Arquivo obrigatório",
				description: "Por favor, faça upload de um arquivo de áudio.",
				variant: "destructive"
			})
			return
		}

		if (!token) {
			toast({
				title: "Não autenticado",
				description: "Você precisa estar logado para criar uma postagem.",
				variant: "destructive"
			})
			return
		}

		setIsSubmitting(true)

		try {
			// Obter duração do áudio
			const duration = await getAudioDuration(audioFile)

			// Obter durações dos overdubs (se houver)
			let overdubDurations: number[] = []
			if (overdubFiles.length > 0) {
				overdubDurations = await Promise.all(overdubFiles.map(f => getAudioDuration(f)))
			}

			// Formatar créditos em JSON
			const formattedCredits: { [key: string]: string[] } = {}
			credits.forEach(credit => {
				if (credit.authors.length > 0) {
					const key = credit.role.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
					formattedCredits[key] = credit.authors
				}
			})

			// Criar postagem
			await TrackService.createTrack(
				{
					name: title,
					projectId: "simplified",
					duration,
					lyrics: lyrics.trim() || undefined,
					chords: chords.trim() || undefined,
					credits: Object.keys(formattedCredits).length > 0 ? JSON.stringify(formattedCredits) : undefined,
					postDescription: postDescription.trim() || undefined,
				},
				audioFile,
				token,
				overdubFiles.length > 0 ? overdubFiles : undefined,
				overdubDurations.length > 0 ? overdubDurations : undefined,
			)

			toast({
				title: "Postagem criada!",
				description: "Sua música foi publicada com sucesso."
			})

			// Resetar formulário
			setTitle("")
			setLyrics("")
			setChords("")
			setAudioFile(null)
			setCredits([
				{ role: "Melodia", authors: [] },
				{ role: "Harmonia", authors: [] },
				{ role: "Arranjo", authors: [] }
			])

			if (onPostCreated) {
				onPostCreated()
			}
		} catch (error) {
			console.error("Erro ao criar postagem:", error)
			toast({
				title: "Erro ao publicar",
				description: "Não foi possível criar sua postagem. Tente novamente.",
				variant: "destructive"
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const getAudioDuration = (file: File): Promise<number> => {
		return new Promise((resolve) => {
			const audio = new Audio()
			audio.preload = 'metadata'

			const onLoadedMetadata = () => {
				const duration = isFinite(audio.duration) ? audio.duration : 180
				URL.revokeObjectURL(audio.src)
				audio.removeEventListener('loadedmetadata', onLoadedMetadata)
				audio.remove()
				resolve(duration)
			}

			const timeoutId = setTimeout(() => {
				audio.removeEventListener('loadedmetadata', onLoadedMetadata)
				URL.revokeObjectURL(audio.src)
				audio.remove()
				resolve(180) // 3 minutos default
			}, 2000)

			audio.addEventListener('loadedmetadata', onLoadedMetadata)
			audio.addEventListener('error', () => {
				clearTimeout(timeoutId)
				URL.revokeObjectURL(audio.src)
				resolve(180)
			})

			audio.src = URL.createObjectURL(file)
			audio.load()
		})
	}

	return (
		<div className="space-y-6">
			{/* Conversor de Áudio (aparece quando arquivo > 50MB) */}
			{showConverter && largeFile && (
				<Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
					<FileAudio className="h-4 w-4 text-yellow-600" />
					<AlertDescription>
						<p className="font-medium mb-3">Arquivo muito grande ({(largeFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
						<p className="text-sm mb-4">Converta para MP3 para reduzir o tamanho e fazer upload:</p>
						<AudioConverter
							onConversionComplete={handleConvertedFile}
							showDownloadButton={false}
							maxFileSizeMB={100}
						/>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setShowConverter(false)
								setLargeFile(null)
							}}
							className="mt-3"
						>
							Cancelar
						</Button>
					</AlertDescription>
				</Alert>
			)}

			{/* Upload de Áudio */}
			<div>
				<Label htmlFor="audio-file">Arquivo de Áudio *</Label>
				<div className="mt-2">
					{audioFile ? (
						<div className="flex items-center gap-3 p-4 border-2 border-primary bg-primary/5 rounded-lg">
							<Music className="h-8 w-8 text-primary" />
							<div className="flex-1 min-w-0">
								<p className="font-medium truncate">{audioFile.name}</p>
								<p className="text-sm text-muted-foreground">
									{(audioFile.size / (1024 * 1024)).toFixed(2)} MB
								</p>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => setAudioFile(null)}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					) : (
						<>
							<label htmlFor="audio-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<Upload className="h-10 w-10 mb-2 text-muted-foreground" />
									<p className="mb-2 text-sm text-muted-foreground">
										<span className="font-semibold">Clique para fazer upload</span> ou arraste o arquivo
									</p>
									<p className="text-xs text-muted-foreground">MP3, WAV, OGG (MAX. 50MB)</p>
								</div>
								<input
									id="audio-file"
									type="file"
									className="hidden"
									accept="audio/*"
									onChange={handleFileChange}
								/>
							</label>
							<Alert className="mt-3 border-blue-500/50 bg-blue-50 dark:bg-blue-950/30">
								<FileAudio className="h-4 w-4 text-blue-600 dark:text-blue-400" />
								<AlertDescription>
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
										<div>
											<p className="font-medium text-sm mb-1">💡 Arquivo muito grande?</p>
											<p className="text-xs text-muted-foreground">
												Converta WAV, FLAC e outros formatos para MP3 e reduza o tamanho em até 90%
											</p>
										</div>
										<Button
											variant="default"
											size="sm"
											className="shrink-0 shadow-sm"
											asChild
										>
											<a
												href="/tools/audio-converter"
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-2"
											>
												<FileAudio className="h-4 w-4" />
												Conversor de Áudio
											</a>
										</Button>
									</div>
								</AlertDescription>
							</Alert>
						</>
					)}
				</div>
			</div>

			{/* Overdubs (opcional) */}
			<div>
				<Label htmlFor="overdubs">Overdubs (faixas adicionais) — opcional</Label>
				<div className="mt-2">
					<label className="flex items-center gap-2">
						<input id="overdubs" type="file" accept="audio/*" multiple className="hidden" onChange={handleOverdubsChange} />
						<Button variant="outline" onClick={() => document.getElementById('overdubs')?.click()}>
							<Upload className="h-4 w-4 mr-2" /> Adicionar overdubs
						</Button>
					</label>
					{overdubFiles.length > 0 && (
						<div className="mt-2 space-y-2">
							{overdubFiles.map((f, i) => (
								<div key={i} className="flex items-center justify-between gap-3 p-2 border rounded">
									<div className="min-w-0">
										<p className="truncate">{f.name}</p>
										<p className="text-sm text-muted-foreground">{(f.size / (1024 * 1024)).toFixed(2)} MB</p>
									</div>
									<Button variant="ghost" size="sm" onClick={() => removeOverdub(i)}>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Título */}
			<div>
				<Label htmlFor="title">Título da Música *</Label>
				<Input
					id="title"
					placeholder="Ex: Minha Composição"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="mt-2"
				/>
			</div>

			{/* Descrição do post (separada do título) */}
			<div>
				<Label htmlFor="post-description">Descrição do Post</Label>
				<Textarea
					id="post-description"
					placeholder="Conte algo sobre esta postagem (contexto, instruções, agradecimentos...)"
					value={postDescription}
					onChange={(e) => setPostDescription(e.target.value)}
					className="mt-2"
					rows={3}
				/>
			</div>

			{/* Tabs para Letra, Cifra e Créditos */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="lyrics">
						<FileText className="h-4 w-4 mr-2" />
						Letra
					</TabsTrigger>
					<TabsTrigger value="chords">
						<Music className="h-4 w-4 mr-2" />
						Cifra
					</TabsTrigger>
					<TabsTrigger value="credits">
						<Users className="h-4 w-4 mr-2" />
						Créditos
					</TabsTrigger>
				</TabsList>

				{/* Letra */}
				<TabsContent value="lyrics" className="mt-4">
					<Textarea
						placeholder="Digite a letra da música aqui..."
						value={lyrics}
						onChange={(e) => setLyrics(e.target.value)}
						className="min-h-[300px] font-mono"
					/>
				</TabsContent>

				{/* Cifra */}
				<TabsContent value="chords" className="mt-4">
					<Textarea
						placeholder="Digite a cifra/acordes aqui... Ex:&#10;&#10;C       G       Am      F&#10;Verso 1 aqui..."
						value={chords}
						onChange={(e) => setChords(e.target.value)}
						className="min-h-[300px] font-mono"
					/>
				</TabsContent>

				{/* Créditos */}
				<TabsContent value="credits" className="mt-4 space-y-4">
					{credits.map((credit, roleIndex) => (
						<Card key={roleIndex}>
							<CardHeader className="pb-3">
								<CardTitle className="text-base">{credit.role}</CardTitle>
								<CardDescription>
									Adicione os autores que contribuíram para {credit.role.toLowerCase()}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{/* Lista de autores */}
								{credit.authors.length > 0 && (
									<div className="flex flex-wrap gap-2">
										{credit.authors.map((author, authorIndex) => (
											<Badge key={authorIndex} variant="secondary" className="gap-1">
												{author}
												<button
													type="button"
													onClick={() => removeAuthorFromCredit(roleIndex, authorIndex)}
													className="ml-1 hover:text-destructive"
												>
													<X className="h-3 w-3" />
												</button>
											</Badge>
										))}
									</div>
								)}

								{/* Input para adicionar autor */}
								<div className="flex gap-2">
									<Input
										placeholder="Nome do autor"
										value={newAuthor[roleIndex] || ""}
										onChange={(e) => setNewAuthor({ ...newAuthor, [roleIndex]: e.target.value })}
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												addAuthorToCredit(roleIndex)
											}
										}}
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={() => addAuthorToCredit(roleIndex)}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</TabsContent>
			</Tabs>

			{/* Botões de ação */}
			<div className="flex gap-3 justify-end pt-4 border-t">
				{onCancel && (
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isSubmitting}
					>
						Cancelar
					</Button>
				)}
				<Button
					onClick={handleSubmit}
					disabled={isSubmitting || !title.trim() || !audioFile}
				>
					{isSubmitting ? "Publicando..." : "Publicar Música"}
				</Button>
			</div>
		</div>
	)
}
