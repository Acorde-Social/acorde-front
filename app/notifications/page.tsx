"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import {
	getNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	deleteNotification,
	type Notification,
} from "@/services/notifications.service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
	Bell,
	Check,
	X,
	Heart,
	MessageCircle,
	UserPlus,
	Sparkles,
	Megaphone,
	Loader2,
	CheckCheck,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { fixImageUrl } from "@/lib/utils"

export default function NotificationsPage() {
	const { user, token } = useAuth()
	const router = useRouter()
	const { toast } = useToast()

	const [allNotifications, setAllNotifications] = useState<Notification[]>([])
	const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([])
	const [loading, setLoading] = useState(true)
	const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

	useEffect(() => {
		if (!user || !token) {
			router.push("/login")
			return
		}

		fetchNotifications()
	}, [user, token, router])

	const fetchNotifications = async () => {
		if (!token) return

		setLoading(true)
		try {
			const data = await getNotifications(token, 50, false)
			setAllNotifications(data)
			setUnreadNotifications(data.filter((n) => !n.read))
		} catch (error) {
			toast({
				title: "Erro",
				description: "Erro ao carregar notificações",
				variant: "destructive",
			})
		} finally {
			setLoading(false)
		}
	}

	const handleMarkAsRead = async (notificationId: string) => {
		if (!token) return

		setProcessingIds((prev) => new Set(prev).add(notificationId))
		try {
			await markNotificationAsRead(token, notificationId)
			await fetchNotifications()
		} catch (error) {
			toast({
				title: "Erro",
				description: error instanceof Error ? error.message : "Erro ao marcar notificação",
				variant: "destructive",
			})
		} finally {
			setProcessingIds((prev) => {
				const next = new Set(prev)
				next.delete(notificationId)
				return next
			})
		}
	}

	const handleMarkAllAsRead = async () => {
		if (!token) return

		try {
			await markAllNotificationsAsRead(token)
			await fetchNotifications()
			toast({
				title: "Sucesso",
				description: "Todas as notificações foram marcadas como lidas",
			})
		} catch (error) {
			toast({
				title: "Erro",
				description: "Erro ao marcar todas as notificações",
				variant: "destructive",
			})
		}
	}

	const handleDelete = async (notificationId: string) => {
		if (!token) return

		setProcessingIds((prev) => new Set(prev).add(notificationId))
		try {
			await deleteNotification(token, notificationId)
			await fetchNotifications()
		} catch (error) {
			toast({
				title: "Erro",
				description: error instanceof Error ? error.message : "Erro ao deletar notificação",
				variant: "destructive",
			})
		} finally {
			setProcessingIds((prev) => {
				const next = new Set(prev)
				next.delete(notificationId)
				return next
			})
		}
	}

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "TRACK_LIKE":
			case "COMMENT_LIKE":
				return <Heart className="h-5 w-5 text-red-500" />
			case "COMMENT_NEW":
				return <MessageCircle className="h-5 w-5 text-blue-500" />
			case "COLLABORATION_INVITE":
			case "COLLABORATION_ACCEPTED":
				return <Sparkles className="h-5 w-5 text-purple-500" />
			case "FRIEND_NEW_POST":
			case "FRIENDSHIP_REQUEST":
				return <UserPlus className="h-5 w-5 text-green-500" />
			case "SYSTEM_ANNOUNCEMENT":
				return <Megaphone className="h-5 w-5 text-orange-500" />
			default:
				return <Bell className="h-5 w-5 text-muted-foreground" />
		}
	}

	const renderNotification = (notification: Notification) => {
		return (
			<Card key={notification.id}>
				<CardContent className="p-4">
					<div className="flex items-start gap-4">
						{notification.actionUrl ? (
							<Link
								href={notification.actionUrl}
								className="flex items-start gap-4 flex-1 hover:opacity-80 transition-opacity"
							>
								{notification.actor ? (
									<Avatar className="h-12 w-12">
										<AvatarImage
											src={fixImageUrl(notification.actor.avatarUrl || "")}
											alt={notification.actor.name}
											className="object-cover"
										/>
										<AvatarFallback>
											{notification.actor.name[0]?.toUpperCase()}
										</AvatarFallback>
									</Avatar>
								) : (
									<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
										{getNotificationIcon(notification.type)}
									</div>
								)}

								<div className="flex-1 min-w-0">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1">
											<p className="font-semibold text-sm mb-1">
												{notification.title}
											</p>
											<p className="text-sm text-muted-foreground">
												{notification.message}
											</p>
											<p className="text-xs text-muted-foreground mt-2">
												{formatDistanceToNow(new Date(notification.createdAt), {
													addSuffix: true,
													locale: ptBR,
												})}
											</p>
										</div>
										{!notification.read && (
											<span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
										)}
									</div>
								</div>
							</Link>
						) : (
							<div className="flex items-start gap-4 flex-1">
								{notification.actor ? (
									<Avatar className="h-12 w-12">
										<AvatarImage
											src={fixImageUrl(notification.actor.avatarUrl || "")}
											alt={notification.actor.name}
											className="object-cover"
										/>
										<AvatarFallback>
											{notification.actor.name[0]?.toUpperCase()}
										</AvatarFallback>
									</Avatar>
								) : (
									<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
										{getNotificationIcon(notification.type)}
									</div>
								)}

								<div className="flex-1 min-w-0">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1">
											<p className="font-semibold text-sm mb-1">
												{notification.title}
											</p>
											<p className="text-sm text-muted-foreground">
												{notification.message}
											</p>
											<p className="text-xs text-muted-foreground mt-2">
												{formatDistanceToNow(new Date(notification.createdAt), {
													addSuffix: true,
													locale: ptBR,
												})}
											</p>
										</div>
										{!notification.read && (
											<span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
										)}
									</div>
								</div>
							</div>
						)}

						<div className="flex gap-1">
							{!notification.read && (
								<Button
									size="sm"
									variant="ghost"
									onClick={() => handleMarkAsRead(notification.id)}
									disabled={processingIds.has(notification.id)}
									title="Marcar como lida"
								>
									{processingIds.has(notification.id) ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Check className="h-4 w-4" />
									)}
								</Button>
							)}
							<Button
								size="sm"
								variant="ghost"
								onClick={() => handleDelete(notification.id)}
								disabled={processingIds.has(notification.id)}
								className="hover:text-destructive"
								title="Deletar"
							>
								{processingIds.has(notification.id) ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<X className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!user) {
		return null
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold mb-2">Notificações</h1>
					<p className="text-muted-foreground">
						Acompanhe todas as suas notificações
					</p>
				</div>
				{unreadNotifications.length > 0 && (
					<Button onClick={handleMarkAllAsRead} variant="outline">
						<CheckCheck className="h-4 w-4 mr-2" />
						Marcar todas como lidas
					</Button>
				)}
			</div>

			<Tabs defaultValue="all" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="all">
						<Bell className="h-4 w-4 mr-2" />
						Todas ({allNotifications.length})
					</TabsTrigger>
					<TabsTrigger value="unread">
						<Bell className="h-4 w-4 mr-2" />
						Não lidas ({unreadNotifications.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="mt-6">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : allNotifications.length === 0 ? (
						<Card>
							<CardContent className="pt-6">
								<div className="text-center py-12">
									<Bell className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
									<h3 className="font-semibold mb-1">Nenhuma notificação</h3>
									<p className="text-sm text-muted-foreground">
										Suas notificações aparecerão aqui
									</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-3">
							{allNotifications.map((notification) =>
								renderNotification(notification)
							)}
						</div>
					)}
				</TabsContent>

				<TabsContent value="unread" className="mt-6">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : unreadNotifications.length === 0 ? (
						<Card>
							<CardContent className="pt-6">
								<div className="text-center py-12">
									<CheckCheck className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
									<h3 className="font-semibold mb-1">Tudo em dia!</h3>
									<p className="text-sm text-muted-foreground">
										Você não tem notificações não lidas
									</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-3">
							{unreadNotifications.map((notification) =>
								renderNotification(notification)
							)}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	)
}
