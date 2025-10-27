"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Music, Guitar, MessageCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { UserService } from "@/services/user-service"
import { ProjectService } from "@/services/project-service"
import { TrackService } from "@/services/track-service"
import { useToast } from "@/hooks/use-toast"
import { fixImageUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import type { User } from "@/types"
import { useChatService } from "@/hooks/use-chat-service"
import FloatingChat from "@/components/chat/floating-chat"

export default function UserProfilePage() {
	const params = useParams()
	const { user, token } = useAuth()
	const { toast } = useToast()
	const [userProfile, setUserProfile] = useState<User | null>(null)
	const [userProjects, setUserProjects] = useState<any[]>([])
	const [userTracks, setUserTracks] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isLoadingProjects, setIsLoadingProjects] = useState(false)
	const [isLoadingTracks, setIsLoadingTracks] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [chatOpen, setChatOpen] = useState(false)
	const { createConversation } = useChatService()
	const [activeConversation, setActiveConversation] = useState<any>(null)

	const userId = params.id as string
	const isOwnProfile = user?.id === userId

	useEffect(() => {
		const fetchUserProfile = async () => {
			if (!userId) return

			setIsLoading(true)
			setError(null)
			try {
				const data = await UserService.getUserById(userId, token || undefined)
				setUserProfile(data)
			} catch (err: any) {
				console.error("Erro ao carregar perfil do usuário:", err)
				setError(err.message || "Não foi possível carregar o perfil do usuário.")
				toast({
					title: "Erro ao carregar perfil",
					description: err.message || "Não foi possível carregar o perfil do usuário.",
					variant: "destructive",
				})
			} finally {
				setIsLoading(false)
			}
		}

		fetchUserProfile()
	}, [userId, token, toast])

	// Carregar projetos do usuário
	useEffect(() => {
		const fetchUserProjects = async () => {
			if (!userId) return

			setIsLoadingProjects(true)
			try {
				const projects = await ProjectService.getUserProjects(token || "")
				setUserProjects(projects)
			} catch (err) {
				console.error("Erro ao carregar projetos:", err)
			} finally {
				setIsLoadingProjects(false)
			}
		}

		fetchUserProjects()
	}, [userId, token])

	// Carregar tracks do usuário
	useEffect(() => {
		const fetchUserTracks = async () => {
			if (!userId) return

			setIsLoadingTracks(true)
			try {
				const tracks = await TrackService.getUserTracks(userId)
				setUserTracks(tracks)
			} catch (err) {
				console.error("Erro ao carregar gravações:", err)
			} finally {
				setIsLoadingTracks(false)
			}
		}

		fetchUserTracks()
	}, [userId])

	// Iniciar chat com o usuário
	const handleStartChat = async () => {
		if (!user || !userProfile || !token) {
			toast({
				title: "Erro ao iniciar chat",
				description: "Você precisa estar autenticado para enviar mensagens.",
				variant: "destructive"
			});
			return;
		}

		// Verificar se estamos tentando enviar mensagem para nós mesmos
		if (user.id === userId) {
			toast({
				title: "Operação não permitida",
				description: "Não é possível iniciar um chat com você mesmo.",
				variant: "destructive"
			});
			return;
		}

		// Verificar se o ID do usuário destino é válido
		if (!userId) {
			toast({
				title: "Erro ao iniciar chat",
				description: "ID do usuário destino é inválido.",
				variant: "destructive"
			});
			return;
		}

		try {
			// Adicionar indicador de carregamento
			const { dismiss: dismissToast } = toast({
				title: "Iniciando conversa",
				description: "Conectando com o usuário...",
				variant: "default"
			});

			// Garantir que apenas o ID do outro usuário é passado como participante
			// O backend já adiciona automaticamente o usuário atual como participante
			const conversation = await createConversation({
				participantIds: [userId],
				isGroup: false
			});

			// Fechar o toast de carregamento
			dismissToast();

			// Abrir o chat flutuante com esta conversa
			setActiveConversation(conversation);
			setChatOpen(true);
		} catch (err: any) {
			console.error("Erro ao iniciar chat:", err);

			// Mensagem de erro mais específica baseada no tipo de erro
			const errorMessage = err.response?.status === 500
				? "Houve um problema no servidor. Tente novamente mais tarde."
				: err.response?.status === 404
					? "Usuário não encontrado."
					: err.response?.status === 403
						? "Você não tem permissão para iniciar esta conversa."
						: "Não foi possível iniciar o chat com este usuário. Tente novamente mais tarde.";

			toast({
				title: "Erro ao iniciar chat",
				description: errorMessage,
				variant: "destructive"
			});
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<Loader2 className="h-12 w-12 animate-spin text-primary" />
			</div>
		)
	}

	if (error) {
		return (
			<div className="container py-12 text-center">
				<h1 className="text-2xl font-bold mb-4">Erro ao Carregar Perfil</h1>
				<p className="text-muted-foreground mb-6">{error}</p>
				<Button asChild>
					<Link href="/explore">Explorar</Link>
				</Button>
			</div>
		)
	}

	if (!userProfile) {
		return (
			<div className="container py-12 text-center">
				<h1 className="text-2xl font-bold mb-4">Usuário não encontrado</h1>
				<p className="text-muted-foreground mb-6">O perfil que você está procurando não existe.</p>
				<Button asChild>
					<Link href="/explore">Explorar</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="w-full">
			{/* Header with cover image */}
			<div className="relative h-48 md:h-64 w-full bg-muted">
				{userProfile.coverImageUrl ? (
					<Image
						src={fixImageUrl(userProfile.coverImageUrl)}
						alt={`${userProfile.name}'s cover image`}
						fill
						className="object-cover"
						priority
					/>
				) : (
					<div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-background" />
				)}
			</div>

			{/* Profile content */}
			<div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 -mt-16">
				<Card className="overflow-visible w-full">
					<CardHeader className="flex flex-col md:flex-row md:items-end md:justify-between text-center md:text-left pt-8">
						<div className="flex flex-col items-center md:items-start">
							<Avatar className="h-32 w-32 border-4 border-background shadow-lg -mt-24 mb-4 aspect-square">
								<AvatarImage
									src={fixImageUrl(userProfile.avatarUrl || "")}
									alt={userProfile.name}
									className="object-cover w-full h-full"
								/>
								<AvatarFallback className="text-4xl bg-primary text-primary-foreground">
									{userProfile.name?.charAt(0) || "U"}
								</AvatarFallback>
							</Avatar>
							<CardTitle className="text-2xl">{userProfile.name}</CardTitle>
							<CardDescription>{userProfile.email}</CardDescription>
							<Badge variant="outline" className="mt-2">
								{userProfile.role || "Músico"}
							</Badge>
						</div>

						{/* Botão de chat (apenas se não for o próprio perfil) */}
						{!isOwnProfile && user && (
							<Button
								className="mt-4 md:mt-0"
								onClick={handleStartChat}
							>
								<MessageCircle className="mr-2 h-4 w-4" />
								Enviar Mensagem
							</Button>
						)}
					</CardHeader>

					<CardContent className="pb-6 px-4 md:px-6">
						{userProfile.bio && (
							<div className="mb-4">
								<h3 className="text-sm font-medium text-muted-foreground mb-1">Biografia</h3>
								<p className="text-sm">{userProfile.bio}</p>
							</div>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
							{userProfile.instruments && userProfile.instruments.length > 0 && (
								<div>
									<h3 className="text-sm font-medium text-muted-foreground mb-1">Instrumentos</h3>
									<div className="flex flex-wrap gap-2">
										{userProfile.instruments.map((instrument) => (
											<Badge key={instrument} variant="secondary">
												{instrument}
											</Badge>
										))}
									</div>
								</div>
							)}

							{userProfile.experience && (
								<div>
									<h3 className="text-sm font-medium text-muted-foreground mb-1">Experiência</h3>
									<p className="text-sm">{userProfile.experience}</p>
								</div>
							)}

							{userProfile.socialLinks && Object.values(userProfile.socialLinks).some(link => !!link) && (
								<div>
									<h3 className="text-sm font-medium text-muted-foreground mb-1">Redes Sociais</h3>
									<div className="flex flex-wrap gap-2">
										{userProfile.socialLinks.website && (
											<Button variant="outline" size="sm" asChild>
												<a href={userProfile.socialLinks.website} target="_blank" rel="noopener noreferrer">Website</a>
											</Button>
										)}
										{userProfile.socialLinks.instagram && (
											<Button variant="outline" size="sm" asChild>
												<a href={userProfile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
											</Button>
										)}
										{userProfile.socialLinks.twitter && (
											<Button variant="outline" size="sm" asChild>
												<a href={userProfile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
											</Button>
										)}
										{userProfile.socialLinks.soundcloud && (
											<Button variant="outline" size="sm" asChild>
												<a href={userProfile.socialLinks.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud</a>
											</Button>
										)}
										{userProfile.socialLinks.youtube && (
											<Button variant="outline" size="sm" asChild>
												<a href={userProfile.socialLinks.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
											</Button>
										)}
									</div>
								</div>
							)}
						</div>

						{/* Tabs para projetos e gravações */}
						<Tabs defaultValue="projects" className="mt-6">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="projects">Projetos</TabsTrigger>
								<TabsTrigger value="tracks">Gravações</TabsTrigger>
							</TabsList>

							<TabsContent value="projects" className="mt-4">
								{isLoadingProjects ? (
									<div className="flex justify-center py-8">
										<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
									</div>
								) : userProjects.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{userProjects.map(project => (
											<Card key={project.id}>
												<CardContent className="p-4">
													<Link href={`/projects/${project.id}`}>
														<div className="relative h-32 mb-2 rounded-md overflow-hidden bg-muted">
															{project.coverImageUrl ? (
																<Image
																	src={fixImageUrl(project.coverImageUrl)}
																	alt={project.title}
																	fill
																	className="object-cover"
																/>
															) : (
																<div className="flex items-center justify-center h-full bg-primary/10">
																	<Music className="h-10 w-10 text-primary/50" />
																</div>
															)}
														</div>
														<h3 className="font-medium line-clamp-1">{project.title}</h3>
														<p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
													</Link>
												</CardContent>
											</Card>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<p className="text-muted-foreground">Nenhum projeto encontrado</p>
									</div>
								)}
							</TabsContent>

							<TabsContent value="tracks" className="mt-4">
								{isLoadingTracks ? (
									<div className="flex justify-center py-8">
										<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
									</div>
								) : userTracks.length > 0 ? (
									<div className="grid grid-cols-1 gap-4">
										{userTracks.map(track => (
											<Card key={track.id}>
												<CardContent className="flex items-center p-4 gap-4">
													<div className="h-16 w-16 flex-shrink-0 bg-primary/10 rounded-md flex items-center justify-center">
														<Music className="h-8 w-8 text-primary/50" />
													</div>
													<div className="flex-1 min-w-0">
														<h3 className="font-medium line-clamp-1">{track.title}</h3>
														<p className="text-sm text-muted-foreground">{new Date(track.createdAt).toLocaleDateString()}</p>
													</div>
													<Button variant="ghost" size="sm" asChild>
														<Link href={`/projects/${track.projectId}?track=${track.id}`}>
															Ver
														</Link>
													</Button>
												</CardContent>
											</Card>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<p className="text-muted-foreground">Nenhuma gravação encontrada</p>
									</div>
								)}
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
			</div>

			{/* Chat flutuante */}
			{chatOpen && activeConversation && (
				<FloatingChat
					conversation={activeConversation}
					onClose={() => setChatOpen(false)}
				/>
			)}
		</div>
	)
}
