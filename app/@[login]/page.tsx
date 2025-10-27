"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Music, Guitar, Calendar, Lock, UserPlus, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { fixImageUrl } from "@/lib/utils"
import { API_URL } from "@/lib/api-config"

interface PublicProfile {
	name: string
	login: string
	role: "COMPOSER" | "MUSICIAN" | "PRODUCER"
	bio?: string
	avatarUrl?: string
	coverImageUrl?: string
	experience?: string
	instruments?: string[]
	socialLinks?: {
		website?: string
		soundcloud?: string
		youtube?: string
	}
	projectsCount: number
	collaborationsCount: number
	createdAt: string
}

export default function PublicProfilePage() {
	const params = useParams()
	const { user, token } = useAuth()
	const [profile, setProfile] = useState<PublicProfile | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showAuthModal, setShowAuthModal] = useState(false)
	const [authModalFeature, setAuthModalFeature] = useState("")

	// Extrair login do parâmetro (remover @ se houver)
	const login = typeof params.login === 'string' 
		? params.login.replace('@', '') 
		: ''

	useEffect(() => {
		if (!login) return

		const fetchProfile = async () => {
			setIsLoading(true)
			setError(null)

			try {
				const response = await fetch(`${API_URL}/users/profile/@${login}`)

				if (!response.ok) {
					if (response.status === 404) {
						setError('Usuário não encontrado')
					} else {
						setError('Erro ao carregar perfil')
					}
					return
				}

				const data = await response.json()
				setProfile(data)
			} catch (err) {
				console.error('Error fetching public profile:', err)
				setError('Erro ao carregar perfil')
			} finally {
				setIsLoading(false)
			}
		}

		fetchProfile()
	}, [login])

	const handleProtectedAction = (feature: string) => {
		if (!user) {
			setAuthModalFeature(feature)
			setShowAuthModal(true)
			return false
		}
		return true
	}

	const getRoleBadge = () => {
		if (!profile) return null

		const roleConfig = {
			COMPOSER: { icon: Music, label: "Compositor" },
			MUSICIAN: { icon: Guitar, label: "Músico" },
			PRODUCER: { icon: Sparkles, label: "Produtor" },
		}

		const config = roleConfig[profile.role]
		const Icon = config.icon

		return (
			<Badge variant="default" className="shadow-lg backdrop-blur-sm bg-primary/90">
				<Icon className="h-3 w-3 mr-1" />
				{config.label}
			</Badge>
		)
	}

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	if (error || !profile) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Card className="w-full max-w-md">
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<UserPlus className="h-16 w-16 text-muted-foreground/50 mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							{error || 'Perfil não encontrado'}
						</h3>
						<p className="text-muted-foreground mb-6">
							Não foi possível encontrar o perfil @{login}
						</p>
						<Button asChild>
							<Link href="/">Voltar ao início</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	// Se o usuário está autenticado e é o próprio perfil, redirecionar para /profile
	if (user && user.login === profile.login) {
		window.location.href = '/profile'
		return null
	}

	return (
		<>
			<div className="w-full min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
				{/* Hero Header */}
				<div className="relative h-[280px] md:h-[320px] w-full overflow-hidden">
					{profile.coverImageUrl ? (
						<Image
							src={fixImageUrl(profile.coverImageUrl)}
							alt="Cover"
							fill
							className="object-cover"
							priority
						/>
					) : (
						<div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/20" />
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
				</div>

				{/* Profile Content */}
				<div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 -mt-24 relative z-10">
					<div className="max-w-4xl mx-auto">
						<Card className="glass-card overflow-hidden">
							<div className="relative pt-8 pb-4">
								<div className="flex justify-center">
									<div className="relative group">
										<Avatar className="h-32 w-32 aspect-square border-4 border-background shadow-2xl ring-4 ring-primary/20">
											<AvatarImage
												src={fixImageUrl(profile.avatarUrl || "")}
												alt={profile.name}
												className="object-cover w-full h-full"
											/>
											<AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
												{profile.name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<div className="absolute -bottom-2 -right-2 z-20">
											{getRoleBadge()}
										</div>
									</div>
								</div>
							</div>

							<CardHeader className="text-center pt-0 space-y-1">
								<CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
									{profile.name}
								</CardTitle>
								<p className="text-sm text-muted-foreground">@{profile.login}</p>
								<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
									<Calendar className="h-3 w-3" />
									Membro desde {new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
								</div>
							</CardHeader>

							<CardContent className="space-y-6 px-4 md:px-6 pb-6">
								{/* Biografia */}
								{profile.bio && (
									<div className="space-y-2">
										<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
											Biografia
										</h3>
										<p className="text-sm leading-relaxed">{profile.bio}</p>
									</div>
								)}

								{/* Experiência */}
								{profile.experience && (
									<div className="space-y-2">
										<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
											Experiência
										</h3>
										<Badge variant="outline" className="font-normal">
											{profile.experience}
										</Badge>
									</div>
								)}

								{/* Instrumentos */}
								{profile.instruments && profile.instruments.length > 0 && (
									<div className="space-y-2">
										<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
											<Guitar className="h-4 w-4" />
											Instrumentos
										</h3>
										<div className="flex flex-wrap gap-2">
											{profile.instruments.map((instrument) => (
												<Badge
													key={instrument}
													variant="secondary"
													className="bg-gradient-to-r from-primary/10 to-secondary/10"
												>
													{instrument}
												</Badge>
											))}
										</div>
									</div>
								)}

								{/* Estatísticas */}
								<div className="grid grid-cols-2 gap-4 pt-4">
									<Card className="border-dashed cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleProtectedAction("ver projetos completos")}>
										<CardContent className="flex flex-col items-center justify-center py-6">
											<Music className="h-8 w-8 text-muted-foreground/50 mb-2" />
											<p className="text-2xl font-bold">{profile.projectsCount}</p>
											<p className="text-xs text-muted-foreground">Projetos</p>
											{!user && (
												<Lock className="h-3 w-3 text-muted-foreground mt-1" />
											)}
										</CardContent>
									</Card>
									<Card className="border-dashed cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleProtectedAction("ver colaborações completas")}>
										<CardContent className="flex flex-col items-center justify-center py-6">
											<Sparkles className="h-8 w-8 text-muted-foreground/50 mb-2" />
											<p className="text-2xl font-bold">{profile.collaborationsCount}</p>
											<p className="text-xs text-muted-foreground">Colaborações</p>
											{!user && (
												<Lock className="h-3 w-3 text-muted-foreground mt-1" />
											)}
										</CardContent>
									</Card>
								</div>

								{/* Links Sociais */}
								{profile.socialLinks && (
									<div className="space-y-2">
										<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
											Links
										</h3>
										<div className="flex flex-wrap gap-2">
											{profile.socialLinks.website && (
												<Button variant="outline" size="sm" asChild>
													<a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer">
														Website
													</a>
												</Button>
											)}
											{profile.socialLinks.soundcloud && (
												<Button variant="outline" size="sm" asChild>
													<a href={profile.socialLinks.soundcloud} target="_blank" rel="noopener noreferrer">
														SoundCloud
													</a>
												</Button>
											)}
											{profile.socialLinks.youtube && (
												<Button variant="outline" size="sm" asChild>
													<a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
														YouTube
													</a>
												</Button>
											)}
										</div>
									</div>
								)}

								{/* Call to Action para usuários não autenticados */}
								{!user && (
									<Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
										<CardContent className="flex flex-col items-center justify-center py-6 text-center space-y-4">
											<Lock className="h-12 w-12 text-primary opacity-50" />
											<div>
												<h4 className="font-semibold mb-1">
													Quer ver os projetos e colaborações de {profile.name}?
												</h4>
												<p className="text-sm text-muted-foreground">
													Faça login ou crie uma conta para explorar o perfil completo
												</p>
											</div>
											<div className="flex gap-2">
												<Button onClick={() => handleProtectedAction("ver perfil completo")}>
													<UserPlus className="h-4 w-4 mr-2" />
													Criar Conta
												</Button>
												<Button variant="outline" asChild>
													<Link href="/login">Fazer Login</Link>
												</Button>
											</div>
										</CardContent>
									</Card>
								)}

								{/* Botão de ação para usuários autenticados */}
								{user && (
									<div className="flex gap-2 pt-4">
										<Button className="flex-1" onClick={() => handleProtectedAction("fazer acorde")}>
											<UserPlus className="h-4 w-4 mr-2" />
											Fazer Acorde
										</Button>
										<Button variant="outline" onClick={() => handleProtectedAction("enviar mensagem")}>
											Mensagem
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* Auth Modal */}
			<AuthModal
				isOpen={showAuthModal}
				onClose={() => setShowAuthModal(false)}
				feature={authModalFeature}
			/>
		</>
	)
}
