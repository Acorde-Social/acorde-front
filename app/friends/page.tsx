"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useFriendshipsData } from "@/hooks/use-friendships-data"
import {
	acceptFriendship,
	declineFriendship,
	removeFriendship,
	sendFriendshipRequest,
} from "@/services/friendships.service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Users, Loader2, UserMinus, Check, X, Sparkles } from "lucide-react"
import Link from "next/link"

export default function FriendsPage() {
	const { user, token, isLoading: authLoading } = useAuth()
	const router = useRouter()
	const { toast } = useToast()

	const {
		friends,
		pending: pendingRequests,
		suggestions,
		isLoading: loading,
		refetch: refetchAllData,
	} = useFriendshipsData(true)

	const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

	useEffect(() => {
		if (authLoading) {
			return
		}

		if (!user || !token) {
			router.push("/login")
			return
		}
	}, [authLoading, user, token, router])

	const handleAccept = async (friendshipId: string) => {
		if (!token) return

		setProcessingIds((prev) => new Set(prev).add(friendshipId))
		try {
			await acceptFriendship(token, friendshipId)
			refetchAllData()
			toast({
				title: "Acorde aceito!",
				description: "Agora vocês são amigos",
			})
		} catch (error) {
			toast({
				title: "Erro",
				description: error instanceof Error ? error.message : "Erro ao aceitar pedido",
				variant: "destructive",
			})
		} finally {
			setProcessingIds((prev) => {
				const next = new Set(prev)
				next.delete(friendshipId)
				return next
			})
		}
	}

	const handleDecline = async (friendshipId: string) => {
		if (!token) return

		setProcessingIds((prev) => new Set(prev).add(friendshipId))
		try {
			await declineFriendship(token, friendshipId)
			refetchAllData()
			toast({
				title: "Pedido recusado",
				description: "O pedido foi removido",
			})
		} catch (error) {
			toast({
				title: "Erro",
				description: error instanceof Error ? error.message : "Erro ao recusar pedido",
				variant: "destructive",
			})
		} finally {
			setProcessingIds((prev) => {
				const next = new Set(prev)
				next.delete(friendshipId)
				return next
			})
		}
	}

	const handleRemoveFriend = async (friendshipId: string) => {
		if (!token) return
		if (!confirm("Tem certeza que deseja desfazer este acorde?")) return

		setProcessingIds((prev) => new Set(prev).add(friendshipId))
		try {
			await removeFriendship(token, friendshipId)
			refetchAllData()
			toast({
				title: "Acorde desfeito",
				description: "A amizade foi removida",
			})
		} catch (error) {
			toast({
				title: "Erro",
				description: error instanceof Error ? error.message : "Erro ao remover amizade",
				variant: "destructive",
			})
		} finally {
			setProcessingIds((prev) => {
				const next = new Set(prev)
				next.delete(friendshipId)
				return next
			})
		}
	}

	const handleSendRequest = async (login: string, suggestionId: string) => {
		if (!token) return

		setProcessingIds((prev) => new Set(prev).add(suggestionId))
		try {
			await sendFriendshipRequest(token, login)
			refetchAllData()
			toast({
				title: "Pedido enviado!",
				description: "Aguarde a resposta do usuário",
			})
		} catch (error) {
			toast({
				title: "Erro",
				description: error instanceof Error ? error.message : "Erro ao enviar pedido",
				variant: "destructive",
			})
		} finally {
			setProcessingIds((prev) => {
				const next = new Set(prev)
				next.delete(suggestionId)
				return next
			})
		}
	}

	if (!user) {
		return null
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Acordes</h1>
				<p className="text-muted-foreground">
					Gerencie suas amizades e conexões na plataforma
				</p>
			</div>

			<Tabs defaultValue="friends" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="friends">
						<Users className="h-4 w-4 mr-2" />
						Amigos ({friends.length})
					</TabsTrigger>
					<TabsTrigger value="requests">
						<UserPlus className="h-4 w-4 mr-2" />
						Pedidos ({pendingRequests.length})
					</TabsTrigger>
					<TabsTrigger value="suggestions">
						<Sparkles className="h-4 w-4 mr-2" />
						Sugestões ({suggestions.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="friends" className="mt-6">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : friends.length === 0 ? (
						<Card>
							<CardContent className="pt-6">
								<div className="text-center py-8">
									<Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
									<p className="text-muted-foreground">
										Você ainda não tem amigos na plataforma
									</p>
									<p className="text-sm text-muted-foreground mt-2">
										Explore as sugestões para fazer novos acordes!
									</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-4">
							{friends.map((friend) => (
								<Card key={friend.friendshipId}>
									<CardContent className="pt-6">
										<div className="flex items-center justify-between">
											<Link
												href={`/u/${friend.login}`}
												className="flex items-center gap-4 hover:opacity-80 transition-opacity flex-1"
											>
												<Avatar className="h-12 w-12">
													<AvatarImage src={friend.avatarUrl || undefined} className="object-cover w-full h-full" />
													<AvatarFallback>
														{friend.name.slice(0, 2).toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1">
													<p className="font-semibold">{friend.name}</p>
													<p className="text-sm text-muted-foreground">
														@{friend.login}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														{friend.role === "musician" ? "Músico" : "Produtor"}
													</p>
												</div>
											</Link>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleRemoveFriend(friend.friendshipId)}
												disabled={processingIds.has(friend.friendshipId)}
											>
												{processingIds.has(friend.friendshipId) ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<>
														<UserMinus className="h-4 w-4 mr-2" />
														Desfazer Acorde
													</>
												)}
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="requests" className="mt-6">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : pendingRequests.length === 0 ? (
						<Card>
							<CardContent className="pt-6">
								<div className="text-center py-8">
									<UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
									<p className="text-muted-foreground">
										Nenhum pedido de amizade pendente
									</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-4">
							{pendingRequests.map((request) => {
								if (!request.requester) return null

								return (
									<Card key={request.id}>
										<CardContent className="pt-6">
											<div className="flex items-center justify-between">
												<Link
													href={`/u/${request.requester.login}`}
													className="flex items-center gap-4 hover:opacity-80 transition-opacity flex-1"
												>
													<Avatar className="h-12 w-12">
														<AvatarImage
															src={request.requester.avatarUrl || undefined}
															className="object-cover w-full h-full"
														/>
														<AvatarFallback>
															{request.requester.name.slice(0, 2).toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1">
														<p className="font-semibold">{request.requester.name}</p>
														<p className="text-sm text-muted-foreground">
															@{request.requester.login}
														</p>
														<p className="text-xs text-muted-foreground mt-1">
															{request.requester.role === "musician"
																? "Músico"
																: "Produtor"}
														</p>
													</div>
												</Link>
												<div className="flex gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDecline(request.id)}
														disabled={processingIds.has(request.id)}
													>
														{processingIds.has(request.id) ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<>
																<X className="h-4 w-4 mr-2" />
																Recusar
															</>
														)}
													</Button>
													<Button
														size="sm"
														onClick={() => handleAccept(request.id)}
														disabled={processingIds.has(request.id)}
													>
														{processingIds.has(request.id) ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<>
																<Check className="h-4 w-4 mr-2" />
																Aceitar
															</>
														)}
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								)
							})}
						</div>
					)}
				</TabsContent>

				<TabsContent value="suggestions" className="mt-6">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : suggestions.length === 0 ? (
						<Card>
							<CardContent className="pt-6">
								<div className="text-center py-8">
									<Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
									<p className="text-muted-foreground">
										Nenhuma sugestão no momento
									</p>
									<p className="text-sm text-muted-foreground mt-2">
										Volte mais tarde para ver novas sugestões!
									</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-4">
							{suggestions.map((suggestion) => (
								<Card key={suggestion.id}>
									<CardContent className="pt-6">
										<div className="flex items-center justify-between">
											<Link
												href={`/u/${suggestion.login}`}
												className="flex items-center gap-4 hover:opacity-80 transition-opacity flex-1"
											>
												<Avatar className="h-12 w-12">
													<AvatarImage
														src={suggestion.avatarUrl || undefined}
														className="object-cover w-full h-full"
													/>
													<AvatarFallback>
														{suggestion.name.slice(0, 2).toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1">
													<p className="font-semibold">{suggestion.name}</p>
													<p className="text-sm text-muted-foreground">
														@{suggestion.login}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														{suggestion.role === "musician"
															? "Músico"
															: "Produtor"}
													</p>
													{suggestion.instruments && suggestion.instruments.length > 0 && (
														<p className="text-xs text-muted-foreground mt-1">
															{suggestion.instruments.join(", ")}
														</p>
													)}
													{suggestion.bio && (
														<p className="text-sm mt-2 line-clamp-2">
															{suggestion.bio}
														</p>
													)}
												</div>
											</Link>
											<Button
												size="sm"
												onClick={() =>
													handleSendRequest(suggestion.login, suggestion.id)
												}
												disabled={processingIds.has(suggestion.id)}
											>
												{processingIds.has(suggestion.id) ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<>
														<UserPlus className="h-4 w-4 mr-2" />
														Fazer Acorde
													</>
												)}
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	)
}
