"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { socketService } from "@/services/socket-service"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  type: "collaboration_request" | "collaboration_accepted" | "new_comment" | "new_track"
  projectId: string
  projectTitle: string
  userId?: string
  userName?: string
  message: string
  read: boolean
  createdAt: string
}

export function Notifications() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Buscar notificações iniciais
  useEffect(() => {
    if (user && token) {
      // Em uma implementação real, você buscaria as notificações da API
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "collaboration_request",
          projectId: "project-1",
          projectTitle: "Melodia do Amanhecer",
          userId: "user-1",
          userName: "Maria Costa",
          message: "Maria Costa solicitou para colaborar em seu projeto",
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutos atrás
        },
        {
          id: "2",
          type: "new_comment",
          projectId: "project-2",
          projectTitle: "Ritmos Urbanos",
          userId: "user-2",
          userName: "Pedro Alves",
          message: "Pedro Alves comentou em seu projeto",
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
        },
        {
          id: "3",
          type: "collaboration_accepted",
          projectId: "project-3",
          projectTitle: "Sinfonia Eletrônica",
          userId: "user-3",
          userName: "Ana Santos",
          message: "Ana Santos aceitou sua solicitação de colaboração",
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
        },
      ]

      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter((n) => !n.read).length)
    }
  }, [user, token])

  // Configurar listener de WebSocket para novas notificações
  useEffect(() => {
    if (!user) return

    const handleNewNotification = (notification: Notification) => {
      // Adicionar nova notificação à lista
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)

      // Mostrar toast para notificação
      toast({
        title: "Nova notificação",
        description: notification.message,
      })
    }

    // Registrar listener
    socketService.on("notification", handleNewNotification)

    // Limpar listener ao desmontar
    return () => {
      socketService.off("notification", handleNewNotification)
    }
  }, [user, toast])

  const markAsRead = (notificationId: string) => {
    // Em uma implementação real, você enviaria uma requisição para a API
    setNotifications(
      notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    )

    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    // Em uma implementação real, você enviaria uma requisição para a API
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/5 h-8 w-8 sm:h-10 sm:w-10">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary text-[10px] sm:text-xs text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7 hover:text-primary hover:bg-primary/5">
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-4 px-2 text-center text-sm text-muted-foreground">Nenhuma notificação</div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              asChild
              className={`p-3 cursor-pointer ${notification.read ? "" : "bg-primary/5"}`}
              onSelect={() => markAsRead(notification.id)}
            >
              <Link href={`/projects/${notification.projectId}`}>
                <div className="flex flex-col gap-1">
                  <div className="font-medium">{notification.message}</div>
                  <div className="text-xs text-muted-foreground">Projeto: {notification.projectTitle}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

