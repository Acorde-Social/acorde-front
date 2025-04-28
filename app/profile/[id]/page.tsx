"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Music, Guitar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { UserService } from "@/services/user-service"
import { useToast } from "@/hooks/use-toast"
import { fixImageUrl } from "@/lib/utils"
import type { User } from "@/types"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UserProfilePage() {
	const params = useParams()
	const { token } = useAuth()
	const { toast } = useToast()
	const [userProfile, setUserProfile] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const userId = params.id as string

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

	// Basic profile display - can be expanded significantly
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
			<div className="container -mt-16">
				<Card className="overflow-visible">
					<CardHeader className="flex flex-col items-center text-center pt-8">
						<Avatar className="h-32 w-32 border-4 border-background shadow-lg -mt-24 mb-4">
							<AvatarImage src={fixImageUrl(userProfile.avatarUrl || "")} alt={userProfile.name} />
							<AvatarFallback className="text-4xl bg-primary text-primary-foreground">
								{userProfile.name?.charAt(0) || "U"}
							</AvatarFallback>
						</Avatar>
						<CardTitle className="text-2xl">{userProfile.name}</CardTitle>
						<CardDescription>{userProfile.email}</CardDescription> {/* Consider hiding email based on privacy settings */}
						<Badge variant="outline" className="mt-2">
							{userProfile.role}
						</Badge>
					</CardHeader>
					<CardContent className="text-center space-y-4 pb-8">
						{userProfile.bio && (
							<div>
								<h3 className="text-sm font-medium text-muted-foreground mb-1">Biografia</h3>
								<p className="text-sm max-w-prose mx-auto">{userProfile.bio}</p>
							</div>
						)}
						{userProfile.instruments && userProfile.instruments.length > 0 && (
							<div>
								<h3 className="text-sm font-medium text-muted-foreground mb-1">Instrumentos</h3>
								<div className="flex flex-wrap justify-center gap-2">
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
						{/* Add sections for user's projects, tracks, collaborations etc. here */}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
