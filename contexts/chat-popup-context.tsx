"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import FloatingChat from "@/components/chat/floating-chat"
import { chatService, ChatConversation } from "@/services/chat-service"
import { useAuth } from "./auth-context"

interface ChatPopupContextType {
	openChat: (userLogin: string) => Promise<void>
	openChatById: (conversationId: string) => Promise<void>
	closeChat: (conversationId: string) => void
	openChats: ChatConversation[]
}

const ChatPopupContext = createContext<ChatPopupContextType | undefined>(undefined)

export function ChatPopupProvider({ children }: { children: ReactNode }) {
	const { user, token } = useAuth()
	const [openChats, setOpenChats] = useState<ChatConversation[]>([])

	const openChat = async (userLogin: string) => {
		if (!user || !token) return

		try {
			// Buscar o usuário pelo login
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/@${userLogin}`, {
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			})

			if (!response.ok) {
				throw new Error('Usuário não encontrado')
			}

			const targetUser = await response.json()

			// Buscar ou criar conversa com esse usuário
			const conversations = await chatService.getUserConversations(token)
			let conversation = conversations.find(conv =>
				!conv.isGroup &&
				conv.participants.some(p => p.user.id === targetUser.id)
			)

			if (!conversation) {
				// Criar nova conversa
				conversation = await chatService.createConversation({
					participantIds: [targetUser.id],
					isGroup: false,
				}, token)
			}

			// Verificar se já está aberto
			const alreadyOpen = openChats.some(c => c.id === conversation!.id)
			if (!alreadyOpen) {
				setOpenChats(prev => [...prev, conversation!])
			}
		} catch (error) {
			console.error('Erro ao abrir chat:', error)
		}
	}

	const openChatById = async (conversationId: string) => {
		if (!token) return

		try {
			// Buscar conversa específica
			const conversations = await chatService.getUserConversations(token)
			const conversation = conversations.find(c => c.id === conversationId)

			if (!conversation) {
				throw new Error('Conversa não encontrada')
			}

			// Verificar se já está aberto
			const alreadyOpen = openChats.some(c => c.id === conversation.id)
			if (!alreadyOpen) {
				setOpenChats(prev => [...prev, conversation])
			}
		} catch (error) {
			console.error('Erro ao abrir chat:', error)
		}
	}

	const closeChat = (conversationId: string) => {
		setOpenChats(prev => prev.filter(c => c.id !== conversationId))
	}

	return (
		<ChatPopupContext.Provider value={{ openChat, openChatById, closeChat, openChats }}>
			{children}
			{/* Renderizar popups de chat flutuantes */}
			<div className="hidden md:block">
				{openChats.map((conversation, index) => (
					<div
						key={conversation.id}
						style={{
							position: 'fixed',
							bottom: 0,
							right: `${24 + index * 336}px`, // 24px margin + 320px width + 16px gap
							zIndex: 50,
						}}
					>
						<FloatingChat
							conversation={conversation as any}
							onClose={() => closeChat(conversation.id)}
						/>
					</div>
				))}
			</div>
		</ChatPopupContext.Provider>
	)
}

export function useChatPopup() {
	const context = useContext(ChatPopupContext)
	if (!context) {
		throw new Error('useChatPopup must be used within ChatPopupProvider')
	}
	return context
}
