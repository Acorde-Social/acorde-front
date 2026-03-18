"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Loader2, MessageSquare, ThumbsDown, Trash2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CollaborationService } from "@/services/collaboration-service"
import { API_URL } from "@/lib/api-config"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

interface CollaborationMixerProps {
  originalTrack: string;
  collaborationTrack: string;
}

interface VolumeUpdate {
  (value: number[]): void;
}

const CollaborationMixer = ({ originalTrack, collaborationTrack }: CollaborationMixerProps) => {
  const [originalVolume, setOriginalVolume] = useState([70])
  const [collaborationVolume, setCollaborationVolume] = useState([70])
  const [originalAudio, setOriginalAudio] = useState<HTMLAudioElement | null>(null)
  const [collaborationAudio, setCollaborationAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (originalTrack && collaborationTrack) {
      const original = new Audio(originalTrack)
      const collaboration = new Audio(collaborationTrack)

      setOriginalAudio(original)
      setCollaborationAudio(collaboration)

      original.volume = originalVolume[0] / 100
      collaboration.volume = collaborationVolume[0] / 100

      return () => {
        original.pause()
        collaboration.pause()
        original.src = ""
        collaboration.src = ""
      }
    }
  }, [originalTrack, collaborationTrack])

  const handlePlay = () => {
    if (!originalAudio || !collaborationAudio) return

    if (isPlaying) {
      originalAudio.pause()
      collaborationAudio.pause()
      setIsPlaying(false)
    } else {
      originalAudio.currentTime = 0
      collaborationAudio.currentTime = 0

      originalAudio.play().catch(() => {})
      collaborationAudio.play().catch(() => {})
      setIsPlaying(true)

      const checkPlaybackEnd = setInterval(() => {
        if (originalAudio.ended && collaborationAudio.ended) {
          setIsPlaying(false)
          clearInterval(checkPlaybackEnd)
        }
      }, 500)
    }
  }

  const updateOriginalVolume: VolumeUpdate = (value) => {
    setOriginalVolume(value)
    if (originalAudio) {
      originalAudio.volume = value[0] / 100
    }
  }

  const updateCollaborationVolume: VolumeUpdate = (value) => {
    setCollaborationVolume(value)
    if (collaborationAudio) {
      collaborationAudio.volume = value[0] / 100
    }
  }

  return (
    <div className="space-y-4 border rounded-md p-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Mixer de Revisão</h3>
        <Button
          variant={isPlaying ? "secondary" : "default"}
          size="sm"
          onClick={handlePlay}
        >
          {isPlaying ? "Pausar" : "Reproduzir Juntos"}
        </Button>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Faixa Original</span>
            <span className="text-sm text-muted-foreground">{originalVolume[0]}%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-full">
              <input
                type="range"
                min="0"
                max="100"
                value={originalVolume[0]}
                onChange={(e) => updateOriginalVolume([parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Colaboração</span>
            <span className="text-sm text-muted-foreground">{collaborationVolume[0]}%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-full">
              <input
                type="range"
                min="0"
                max="100"
                value={collaborationVolume[0]}
                onChange={(e) => updateCollaborationVolume([parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReceivedCollaborationsPage() {
  const [collaborations, setCollaborations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { user, token, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user || !token) {
      router.push("/login")
      return
    }

    const fetchCollaborations = async () => {
      try {
        const data = await CollaborationService.getReceivedAudioCollaborations(token)
        setCollaborations(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load received collaborations. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollaborations()
  }, [authLoading, user, token, router, toast])

  const getFullAudioUrl = (url: string) => {
    if (!url) return ""
    return url.startsWith("http") ? url : `${API_URL}/${url}`
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pendente</Badge>
      case "ACCEPTED":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Aceita</Badge>
      case "REJECTED":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Rejeitada</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const handleAcceptCollaboration = async (id: string) => {
    if (!token) return

    setActionInProgress(id)
    try {
      await CollaborationService.updateAudioCollaborationStatus(id, "ACCEPTED", token)

      setCollaborations(collaborations.map(collab =>
        collab.id === id ? { ...collab, status: "ACCEPTED" } : collab
      ))

      toast({
        title: "Colaboração aceita",
        description: "A colaboração foi aceita com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível aceitar a colaboração. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  const handleRejectCollaboration = async (id: string) => {
    if (!token) return

    setActionInProgress(id)
    try {
      await CollaborationService.updateAudioCollaborationStatus(id, "REJECTED", token)

      setCollaborations(collaborations.map(collab =>
        collab.id === id ? { ...collab, status: "REJECTED" } : collab
      ))

      toast({
        title: "Colaboração rejeitada",
        description: "A colaboração foi rejeitada.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a colaboração. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  const handleDeleteCollaboration = async (id: string) => {
    if (!token) return

    setActionInProgress(id)
    try {
      await CollaborationService.removeAudioCollaboration(id, token)
      setCollaborations(collaborations.filter(collab => collab.id !== id))
      toast({
        title: "Colaboração removida",
        description: "A colaboração foi removida com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a colaboração. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Colaborações Recebidas</CardTitle>
          <CardDescription>
            Colaborações de áudio que outros usuários enviaram para suas faixas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {collaborations.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground mb-4">Você ainda não recebeu nenhuma colaboração de áudio.</p>
              <Button asChild>
                <Link href="/explore">Explorar Faixas</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {collaborations.map((collab) => (
                <Card key={collab.id} className="overflow-hidden">
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium">{collab.name}</h3>
                          {getStatusBadge(collab.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Colaboração para sua faixa <span className="font-medium">{collab.track.name}</span> por{" "}
                          <Link href={`/profile/${collab.author.id}`} className="text-primary hover:underline">
                            {collab.author.name}
                          </Link>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Recebida{" "}
                          {formatDistanceToNow(new Date(collab.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-4 md:mt-0">
                        {collab.status === "PENDING" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAcceptCollaboration(collab.id)}
                              disabled={actionInProgress === collab.id}
                            >
                              {actionInProgress === collab.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                              Aceitar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectCollaboration(collab.id)}
                              disabled={actionInProgress === collab.id}
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Colaboração</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta colaboração? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteCollaboration(collab.id)}
                              >
                                {actionInProgress === collab.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Excluir"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Faixa Original</h4>
                        <audio controls className="w-full" preload="none">
                          <source src={getFullAudioUrl(collab.track.audioUrl)} type="audio/mpeg" />
                          Seu navegador não suporta o elemento de áudio.
                        </audio>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Colaboração</h4>
                        <audio controls className="w-full" preload="none">
                          <source src={getFullAudioUrl(collab.audioUrl)} type="audio/mpeg" />
                          Seu navegador não suporta o elemento de áudio.
                        </audio>
                      </div>
                    </div>

                    <div className="mt-6">
                      <CollaborationMixer
                        originalTrack={getFullAudioUrl(collab.track.audioUrl)}
                        collaborationTrack={getFullAudioUrl(collab.audioUrl)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
