"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { chatService } from "@/services/chat-service"

export function ChatNotifications() {
	const { user, token } = useAuth()
	const [unreadCount, setUnreadCount] = useState(0)

	useEffect(() => {
		if (!user || !token) return

		// Carregar contador inicial
		loadUnreadCount()

		// Conectar ao WebSocket se ainda não estiver conectado
		if (user.id && token) {
			chatService.connectToWebSocket(user.id, token)
		}

		// Listener para atualizar contador quando novas mensagens chegarem
		const handleNewMessage = () => {
			loadUnreadCount()
		}

		const handleMessagesRead = () => {
			loadUnreadCount()
		}

		chatService.on('new_message', handleNewMessage)
		chatService.on('messages_read', handleMessagesRead)

		// Cleanup
		return () => {
			chatService.off('new_message', handleNewMessage)
			chatService.off('messages_read', handleMessagesRead)
		}
	}, [user, token])

	const loadUnreadCount = async () => {
		try {
			const conversations = await chatService.getUserConversations(token!)
			// Somar todas as mensagens não lidas de todas as conversas
			const total = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
			setUnreadCount(total)
		} catch (error) {
			console.error('Erro ao carregar contador de mensagens:', error)
		}
	}

	if (!user) return null

	return (
		<Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10" asChild>
			<Link href="/chat">
				<MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
				{unreadCount > 0 && (
					<span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
						{unreadCount > 99 ? '99+' : unreadCount}
					</span>
				)}
				<span className="sr-only">
					Mensagens{unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}
				</span>
			</Link>
		</Button>
	)
}
