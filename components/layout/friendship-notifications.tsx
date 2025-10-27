"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { UserPlus, Check, X, Loader2, Users, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn, fixImageUrl } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useNotificationCounts } from "@/hooks/use-notification-counts"
import {
	getPendingFriendships,
	getFriendshipSuggestions,
	acceptFriendship,
	declineFriendship,
	sendFriendshipRequest,
	type Friendship,
	type FriendSuggestion,
} from "@/services/friendships.service"

export function FriendshipNotifications() {
	const { token } = useAuth()
	const { toast } = useToast()
	const router = useRouter()
	const pathname = usePathname()
	const { friendships: unreadCount, refetch: refetchCounts } = useNotificationCounts()
	const [isOpen, setIsOpen] = useState(false)
	const [pendingRequests, setPendingRequests] = useState<Friendship[]>([])
	const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
	const [isMobile, setIsMobile] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Detectar mobile
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 1024)
		}
		checkMobile()
		window.addEventListener("resize", checkMobile)
		return () => window.removeEventListener("resize", checkMobile)
	}, [])

	// Fechar ao clicar fora
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => window.removeEventListener("mousedown", handleClickOutside)
	}, [])

	// Buscar dados quando abrir - APENAS uma vez ao abrir E não estiver na página /friends
	useEffect(() => {
		if (isOpen && !isMobile && token && pathname !== "/friends") {
			fetchData()
		}
	}, [isOpen, isMobile, token, pathname])

	const fetchData = async () => {
		if (!token) return

		setIsLoading(true)
		try {
			const [requests, friendSuggestions] = await Promise.all([
				getPendingFriendships(token),
				getFriendshipSuggestions(token, 5),
			])
			setPendingRequests(requests)
			setSuggestions(friendSuggestions)
		} catch (error) {
			console.error("Error fetching friendship data:", error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleAccept = async (friendshipId: string) => {
		if (!token) return

		setProcessingIds((prev) => new Set(prev).add(friendshipId))
		try {
			await acceptFriendship(token, friendshipId)
			setPendingRequests((prev) => prev.filter((f) => f.id !== friendshipId))
			refetchCounts() // Atualizar contador
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
			setPendingRequests((prev) => prev.filter((f) => f.id !== friendshipId))
			refetchCounts() // Atualizar contador
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

	const handleSendRequest = async (login: string, suggestionId: string) => {
		if (!token) return

		setProcessingIds((prev) => new Set(prev).add(suggestionId))
		try {
			await sendFriendshipRequest(token, login)
			setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
			refetchCounts() // Atualizar contador
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

	const totalCount = pendingRequests.length

	const handleClick = () => {
		if (isMobile || pathname === "/friends") {
			// No mobile ou se já estiver na página, redireciona/mantém na página
			router.push("/friends")
			setIsOpen(false)
		} else {
			// No desktop em outras páginas, abre o dropdown
			setIsOpen(!isOpen)
		}
	}

	return (
		<div ref={dropdownRef} className="relative">
			{/* Botão de notificações */}
			<Button
				variant="ghost"
				size="icon"
				onClick={handleClick}
				className="relative h-10 w-10 hover:bg-primary/5"
			>
				<Users className="h-5 w-5" />
				{totalCount > 0 && (
					<span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
						{totalCount > 9 ? "9+" : totalCount}
					</span>
				)}
				<span className="sr-only">Pedidos de amizade</span>
			</Button>

			{/* Dropdown - apenas desktop */}
			{isOpen && !isMobile && (
				<div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-background border border-border rounded-lg shadow-xl overflow-hidden z-50">
					{/* Header */}
					<div className="p-4 border-b border-border/50">
						<h3 className="font-semibold text-lg flex items-center gap-2">
							<Users className="h-5 w-5 text-primary" />
							Amizades
						</h3>
					</div>

					{/* Content */}
					<ScrollArea className="max-h-[500px]">
						{isLoading ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
						) : (
							<>
								{/* Pedidos Pendentes */}
								{pendingRequests.length > 0 && (
									<div className="p-2">
										<div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
											<UserPlus className="h-3 w-3" />
											Pedidos de Acorde ({pendingRequests.length})
										</div>
										<div className="space-y-1">
											{pendingRequests.map((request) => (
												<div
													key={request.id}
													className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
												>
													<Link href={`/${request.requester?.login}`} onClick={() => setIsOpen(false)}>
														<Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary">
															<AvatarImage
																src={fixImageUrl(request.requester?.avatarUrl || "")}
																alt={request.requester?.name}
																className="object-cover"
															/>
															<AvatarFallback className="text-sm">
																{request.requester?.name[0]?.toUpperCase()}
															</AvatarFallback>
														</Avatar>
													</Link>
													<div className="flex-1 min-w-0">
														<Link
															href={`/${request.requester?.login}`}
															onClick={() => setIsOpen(false)}
															className="font-medium text-sm hover:underline truncate block"
														>
															{request.requester?.name}
														</Link>
														<p className="text-xs text-muted-foreground">
															@{request.requester?.login}
														</p>
														<div className="flex gap-2 mt-2">
															<Button
																size="sm"
																onClick={() => handleAccept(request.id)}
																disabled={processingIds.has(request.id)}
																className="h-7 text-xs flex-1"
															>
																{processingIds.has(request.id) ? (
																	<Loader2 className="h-3 w-3 animate-spin" />
																) : (
																	<>
																		<Check className="h-3 w-3 mr-1" />
																		Aceitar
																	</>
																)}
															</Button>
															<Button
																size="sm"
																variant="outline"
																onClick={() => handleDecline(request.id)}
																disabled={processingIds.has(request.id)}
																className="h-7 text-xs"
															>
																<X className="h-3 w-3" />
															</Button>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Separador */}
								{pendingRequests.length > 0 && suggestions.length > 0 && (
									<Separator className="my-2" />
								)}

								{/* Sugestões */}
								{suggestions.length > 0 && (
									<div className="p-2">
										<div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
											<Sparkles className="h-3 w-3" />
											Sugestões
										</div>
										<div className="space-y-1">
											{suggestions.map((suggestion) => (
												<div
													key={suggestion.id}
													className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
												>
													<Link href={`/${suggestion.login}`} onClick={() => setIsOpen(false)}>
														<Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary">
															<AvatarImage
																src={fixImageUrl(suggestion.avatarUrl || "")}
																alt={suggestion.name}
																className="object-cover"
															/>
															<AvatarFallback className="text-sm">
																{suggestion.name[0]?.toUpperCase()}
															</AvatarFallback>
														</Avatar>
													</Link>
													<div className="flex-1 min-w-0">
														<Link
															href={`/${suggestion.login}`}
															onClick={() => setIsOpen(false)}
															className="font-medium text-sm hover:underline truncate block"
														>
															{suggestion.name}
														</Link>
														<p className="text-xs text-muted-foreground truncate">
															@{suggestion.login}
														</p>
														{suggestion.bio && (
															<p className="text-xs text-muted-foreground line-clamp-1 mt-1">
																{suggestion.bio}
															</p>
														)}
														<Button
															size="sm"
															variant="outline"
															onClick={() => handleSendRequest(suggestion.login, suggestion.id)}
															disabled={processingIds.has(suggestion.id)}
															className="h-7 text-xs mt-2 w-full"
														>
															{processingIds.has(suggestion.id) ? (
																<Loader2 className="h-3 w-3 animate-spin" />
															) : (
																<>
																	<UserPlus className="h-3 w-3 mr-1" />
																	Fazer Acorde
																</>
															)}
														</Button>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Empty State */}
								{pendingRequests.length === 0 && suggestions.length === 0 && (
									<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
										<Users className="h-16 w-16 text-muted-foreground/20 mb-4" />
										<h4 className="font-semibold mb-1">Nenhuma notificação</h4>
										<p className="text-sm text-muted-foreground">
											Quando alguém enviar um pedido de acorde, ele aparecerá aqui
										</p>
									</div>
								)}
							</>
						)}
					</ScrollArea>

					{/* Footer */}
					{(pendingRequests.length > 0 || suggestions.length > 0) && !isLoading && (
						<div className="p-3 border-t border-border/50">
							<Button
								variant="ghost"
								size="sm"
								className="w-full text-xs"
								asChild
							>
								<Link href="/friends" onClick={() => setIsOpen(false)}>
									Ver todos os amigos
								</Link>
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
