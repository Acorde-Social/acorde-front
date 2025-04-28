import { io, type Socket } from "socket.io-client"
import { API_URL } from "@/lib/api-config"

interface NotificationPayload {
  id: string
  type: string
  message: string
  projectId: string
  projectTitle: string
  userId?: string
  userName?: string
  createdAt: string
}

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()

  // Inicializar conexão com o servidor de WebSocket
  connect(token: string) {
    if (this.socket) {
      this.disconnect()
    }

    this.socket = io(API_URL, {
      auth: {
        token,
      },
      transports: ["websocket"],
    })

    this.setupListeners()
  }

  // Desconectar do servidor
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Configurar listeners padrão
  private setupListeners() {
    if (!this.socket) return

    this.socket.on("connect", () => {
      // Socket conectado
    })

    this.socket.on("disconnect", () => {
      // Socket desconectado
    })

    this.socket.on("error", (error) => {
      // Erro silencioso no socket
    })

    // Listener para notificações
    this.socket.on("notification", (data: NotificationPayload) => {
      this.emit("notification", data)
    })
  }

  // Adicionar listener para eventos
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }

    this.listeners.get(event)?.push(callback)
  }

  // Remover listener
  off(event: string, callback: Function) {
    if (!this.listeners.has(event)) return

    const callbacks = this.listeners.get(event) || []
    this.listeners.set(
      event,
      callbacks.filter((cb) => cb !== callback),
    )
  }

  // Emitir evento para os listeners
  private emit(event: string, ...args: any[]) {
    if (!this.listeners.has(event)) return

    const callbacks = this.listeners.get(event) || []
    callbacks.forEach((callback) => {
      try {
        callback(...args)
      } catch (error) {
        // Erro silencioso ao executar callback
      }
    })
  }

  // Enviar mensagem para o servidor
  send(event: string, data: any) {
    if (!this.socket) {
      // Socket não conectado
      return
    }

    this.socket.emit(event, data)
  }

  // Verificar se está conectado
  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

// Exportar instância única
export const socketService = new SocketService()

