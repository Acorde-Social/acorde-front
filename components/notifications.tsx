"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, X, Heart, MessageCircle, UserPlus, Sparkles, Megaphone, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useNotificationCounts } from "@/hooks/use-notification-counts"
import { fixImageUrl } from "@/lib/utils"
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type Notification,
} from "@/services/notifications.service"

export function Notifications() {
  const { token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const { notifications: unreadCount, refetch: refetchCounts } = useNotificationCounts()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [isMobile, setIsMobile] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && !isMobile && token && pathname !== "/notifications") {
      fetchNotifications()
    }
  }, [isOpen, isMobile, token, pathname])

  const fetchNotifications = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const data = await getNotifications(token, 20, false)
      setNotifications(data)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = () => {
    if (isMobile || pathname === "/notifications") {
      router.push("/notifications")
      setIsOpen(false)
    } else {
      setIsOpen(!isOpen)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    if (!token) return

    setProcessingIds((prev) => new Set(prev).add(notificationId))
    try {
      await markNotificationAsRead(token, notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
      refetchCounts()
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
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      refetchCounts()
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

  const handleDelete = async (notificationId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!token) return

    setProcessingIds((prev) => new Set(prev).add(notificationId))
    try {
      await deleteNotification(token, notificationId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      refetchCounts()
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
        return <Heart className="h-4 w-4 text-warning" />
      case "COMMENT_NEW":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case "COLLABORATION_INVITE":
      case "COLLABORATION_ACCEPTED":
        return <Sparkles className="h-4 w-4 text-purple-500" />
      case "FRIEND_NEW_POST":
        return <UserPlus className="h-4 w-4 text-green-500" />
      case "SYSTEM_ANNOUNCEMENT":
        return <Megaphone className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className="relative h-10 w-10 hover:bg-primary/5"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="sr-only">Notificações</span>
      </Button>

      {isOpen && !isMobile && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-background border border-border rounded-lg shadow-xl overflow-hidden z-50">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs h-7"
              >
                <Check className="h-3 w-3 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>

          <ScrollArea className="max-h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="h-16 w-16 text-muted-foreground/20 mb-4" />
                <h4 className="font-semibold mb-1">Nenhuma notificação</h4>
                <p className="text-sm text-muted-foreground">
                  Suas notificações aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => {
                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors relative ${!notification.read ? "bg-primary/5" : ""
                        }`}
                    >
                      {notification.actionUrl ? (
                        <Link
                          href={notification.actionUrl}
                          onClick={() => setIsOpen(false)}
                          className="flex items-start gap-3 flex-1"
                        >
                          {notification.actor ? (
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={fixImageUrl(notification.actor.avatarUrl || "")}
                                alt={notification.actor.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-sm">
                                {notification.actor.name[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium line-clamp-2">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-start gap-3 flex-1">
                          {notification.actor ? (
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={fixImageUrl(notification.actor.avatarUrl || "")}
                                alt={notification.actor.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-sm">
                                {notification.actor.name[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium line-clamp-2">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={processingIds.has(notification.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleDelete(notification.id, e)}
                          disabled={processingIds.has(notification.id)}
                          className="h-7 w-7 p-0 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
