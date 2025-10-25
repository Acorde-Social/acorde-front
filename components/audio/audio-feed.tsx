"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Heart, Share2, MoreHorizontal, Trash2, Download, Mic, MessageSquare, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TrackService, PaginatedResponse } from "@/services/track-service"
import { CommentService } from "@/services/comment-service"
import { Comment as ServiceComment } from "@/services/project-service"
import { Track } from "@/types"
import { useAuth } from "@/contexts/auth-context"
import { AudioRecorder } from "@/components/audio-recorder"
import { TrackComments } from "@/components/track-comments"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { API_URL } from "@/lib/api-config"
import Link from "next/link"

interface AudioFeedProps {
  userId?: string // Se fornecido, mostra apenas os áudios deste usuário
  initialTracks?: Track[]
}

export function AudioFeed({ userId, initialTracks }: AudioFeedProps) {
  const [tracks, setTracks] = useState<Track[]>(initialTracks || [])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [collaborateTrack, setCollaborateTrack] = useState<Track | null>(null)
  const [isCollaborateDialogOpen, setIsCollaborateDialogOpen] = useState(false)
  const [commentTrack, setCommentTrack] = useState<Track | null>(null)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [trackComments, setTrackComments] = useState<ServiceComment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [likingTrack, setLikingTrack] = useState<Record<string, boolean>>({})
  const hasFetchedRef = useRef(false) // Proteção para evitar fetch duplicado inicial
  const isLoadingCommentsRef = useRef(false) // ✅ Proteção contra fetch duplicado de comentários
  const { toast } = useToast()
  const { token, user } = useAuth()
  const limit = 10

  useEffect(() => {
    // Evitar fetch duplicado no mount (React Strict Mode)
    if (hasFetchedRef.current) return;

    if (!initialTracks && token) {
      hasFetchedRef.current = true;
      fetchTracks()
    } else if (initialTracks) {
      setTracks(initialTracks)
    }
  }, [userId, token]) // Removido initialTracks da dependência para evitar loop

  const fetchTracks = async (reset = false) => {
    if (loading) return

    const currentPage = reset ? 1 : page
    setLoading(true)

    try {
      if (userId) {
        // Buscar áudios do usuário específico
        const response = await TrackService.getUserTracks(userId, currentPage, limit)
        handleTracksResponse(response, reset)
      } else if (token) {
        // Buscar feed de áudios (todos os áudios independentes)
        const response = await TrackService.getFeed(token, currentPage, limit)
        handleTracksResponse(response, reset)
      }
    } catch (error) {
      console.error("Erro ao carregar áudios:", error)
      toast({
        title: "Erro ao carregar áudios",
        description: "Não foi possível carregar os áudios. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTracksResponse = (
    response: PaginatedResponse<Track>,
    reset: boolean
  ) => {
    const { data, meta } = response

    if (reset) {
      setTracks(data)
    } else {
      setTracks((prev) => [...prev, ...data])
    }

    setHasMore(meta.hasNextPage)
    setPage(reset ? 2 : page + 1)
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchTracks()
    }
  }

  const handleDelete = async (trackId: string) => {
    if (!token) return

    try {
      await TrackService.deleteTrack(trackId, token)

      // Atualiza a lista de áudios removendo o áudio excluído
      setTracks((prev) => prev.filter((track) => track.id !== trackId))

      toast({
        title: "Áudio excluído",
        description: "O áudio foi excluído com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir áudio:", error)
      toast({
        title: "Erro ao excluir áudio",
        description: "Não foi possível excluir o áudio. Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const getFullAudioUrl = (url: string) => {
    // Se já for uma URL completa, retorna como está
    if (url.startsWith('http')) return url;

    // Garante que tenhamos a base URL
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

    // Trata diferentes formatos de caminhos
    if (url.startsWith('/uploads/')) {
      // Caminho começa com /uploads/
      return `${baseUrl}${url}`;
    } else if (url.startsWith('uploads/')) {
      // Caminho começa sem barra
      return `${baseUrl}/${url}`;
    } else {
      // Outros formatos - adiciona /uploads/ se necessário
      if (!url.includes('uploads/')) {
        return `${baseUrl}/uploads/${url}`;
      }
      // Caso contrário, apenas adiciona a base URL
      return `${baseUrl}/${url}`;
    }
  }

  const handleDownload = (track: Track) => {
    const audioUrl = getFullAudioUrl(track.audioUrl)
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `${track.name}.wav` // Alterado para .wav que é o formato correto
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCollaborationSaved = () => {
    toast({
      title: "Colaboração enviada",
      description: "Sua colaboração foi enviada para aprovação do autor original.",
    });
    setIsCollaborateDialogOpen(false);
    // Opcional: recarregar os dados
    fetchTracks(true);
  };

  const fetchTrackComments = async (trackId: string) => {
    // ✅ Proteção contra chamadas duplicadas
    if (isLoadingCommentsRef.current) {
      console.log('⚠️ Fetch de comentários já em andamento, ignorando...');
      return;
    }

    isLoadingCommentsRef.current = true;
    setLoadingComments(true);

    try {
      // ✅ Passar o token para o serviço que já traz isLiked em 1 query
      const comments = await CommentService.getTrackComments(trackId, token || undefined);
      setTrackComments(comments || []);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      setTrackComments([]);
      toast({
        title: 'Erro ao carregar comentários',
        description: 'Não foi possível carregar os comentários. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoadingComments(false);
      isLoadingCommentsRef.current = false;
    }
  }

  const handleCommentClick = (track: Track) => {
    setCommentTrack(track)
    fetchTrackComments(track.id)
    setIsCommentDialogOpen(true)
  }

  const handleCommentAdded = () => {
    if (commentTrack) {
      fetchTrackComments(commentTrack.id)
    }
  }

  const handleLike = async (trackId: string) => {
    if (!user || !token) {
      toast({
        title: 'Autenticação necessária',
        description: 'Você precisa estar logado para curtir esta faixa.',
        variant: 'destructive',
      })
      return
    }

    // Evitar múltiplos cliques
    if (likingTrack[trackId]) return;

    setLikingTrack(prev => ({ ...prev, [trackId]: true }));

    try {
      // Encontrar o track no estado local
      const track = tracks.find(t => t.id === trackId);
      if (!track) return;

      const isLiked = track.isLiked;

      if (isLiked) {
        // Descurtir
        const response = await TrackService.unlikeTrack(trackId, token);

        // Atualizar estado local com o novo count do backend
        setTracks(prev => prev.map(t =>
          t.id === trackId ? {
            ...t,
            isLiked: false,
            likesCount: response.likesCount ?? (t.likesCount ? t.likesCount - 1 : 0)
          } : t
        ));

        toast({
          title: 'Curtida removida',
          description: 'Você removeu sua curtida desta faixa.',
        });
      } else {
        // Curtir
        const response = await TrackService.likeTrack(trackId, token);

        // Atualizar estado local com o novo count do backend
        setTracks(prev => prev.map(t =>
          t.id === trackId ? {
            ...t,
            isLiked: true,
            likesCount: response.likesCount ?? (t.likesCount ? t.likesCount + 1 : 1)
          } : t
        ));

        toast({
          title: 'Faixa curtida',
          description: 'Você curtiu esta faixa com sucesso!',
        });
      }
    } catch (error) {
      console.error('Erro ao curtir faixa:', error);
      toast({
        title: 'Erro ao processar curtida',
        description: 'Não foi possível processar sua interação. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLikingTrack(prev => ({ ...prev, [trackId]: false }));
    }
  }

  if (loading && tracks.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {tracks.length === 0 ? (
          <Card className="p-6 text-center">
            <div className="text-muted-foreground">
              Nenhum áudio encontrado
            </div>
          </Card>
        ) : (
          tracks.map((track) => (
            <Card key={track.id} className="overflow-hidden card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Link href={`/profile/${track.author.id}`}>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={track.author.avatarUrl || ""} alt={track.author.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">{track.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link href={`/profile/${track.author.id}`} className="font-medium hover:underline">
                      {track.author.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(track.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  </div>

                  {/* Menu de opções para o próprio usuário */}
                  {user && (user.id === track.authorId) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-auto">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDownload(track)}
                          className="cursor-pointer"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          <span>Baixar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleteTarget(track.id)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-destructive cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-3">
                <div className="space-y-2">
                  <h3 className="font-medium">{track.name}</h3>

                  {/* Player de áudio */}
                  <div className="mt-2 p-2 bg-accent/20 rounded-md">
                    <audio controls className="w-full" preload="metadata">
                      <source
                        src={getFullAudioUrl(track.audioUrl)}
                        type={track.audioUrl.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg'}
                      />
                      Seu navegador não suporta o elemento de áudio.
                    </audio>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                    <div className="flex items-center">
                      {track.duration > 0 ? (
                        <>
                          Duração: {Math.floor(track.duration / 60)}:{Math.floor(track.duration % 60).toString().padStart(2, '0')}
                        </>
                      ) : (
                        <>Duração não disponível</>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t px-6 py-3">
                <div className="flex justify-between w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1 ${track.isLiked ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
                    onClick={() => handleLike(track.id)}
                    disabled={likingTrack[track.id]}
                  >
                    {likingTrack[track.id] ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Heart className={`h-4 w-4 mr-1 ${track.isLiked ? 'fill-current' : ''}`} />
                    )}
                    <span>{track.likesCount || 0}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 hover:text-primary"
                    onClick={() => handleCommentClick(track)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{track.commentsCount || 0}</span>
                  </Button>

                  {/* Botão para colaborar - só aparece se não for o próprio autor */}
                  {user && user.id !== track.authorId ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 hover:text-primary"
                      onClick={() => {
                        setCollaborateTrack(track);
                        setIsCollaborateDialogOpen(true);
                      }}
                    >
                      <Mic className="h-4 w-4" />
                      <span>Colaborar</span>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="gap-1 hover:text-primary">
                      <Share2 className="h-4 w-4" />
                      <span>Compartilhar</span>
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))
        )}

        {hasMore && tracks.length > 0 && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loading}
              className="w-full hover:bg-primary/5"
            >
              {loading ? "Carregando..." : "Carregar mais"}
            </Button>
          </div>
        )}
      </div>

      {/* Diálogo de confirmação para excluir áudio */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir áudio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este áudio? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  handleDelete(deleteTarget)
                }
                setIsDeleteDialogOpen(false)
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para colaboração */}
      <Dialog open={isCollaborateDialogOpen} onOpenChange={setIsCollaborateDialogOpen}>
        <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Colaborar com {collaborateTrack?.author?.name || "este áudio"}</DialogTitle>
            <DialogDescription>
              Grave sua colaboração sobre este áudio. O autor original receberá sua contribuição para aprovação.
            </DialogDescription>
          </DialogHeader>

          {collaborateTrack && (
            <div className="space-y-4">
              <div className="bg-accent/20 p-4 rounded-md">
                <h4 className="text-sm font-medium mb-2">Áudio original:</h4>
                <audio controls className="w-full">
                  <source
                    src={getFullAudioUrl(collaborateTrack.audioUrl)}
                    type={collaborateTrack.audioUrl.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg'}
                  />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>

              <AudioRecorder
                simplified={false}
                existingTrackUrl={getFullAudioUrl(collaborateTrack.audioUrl)}
                collaborationMode={true}
                originalTrackId={collaborateTrack.id}
                onTrackSaved={handleCollaborationSaved}
                onCancel={() => setIsCollaborateDialogOpen(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para comentários */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Comentários</DialogTitle>
            <DialogDescription>
              Comente e interaja com esta faixa de áudio
            </DialogDescription>
          </DialogHeader>

          {commentTrack && (
            <div className="space-y-4">
              <div className="bg-accent/20 p-4 rounded-md">
                <h4 className="text-sm font-medium mb-2">Faixa: {commentTrack.name}</h4>
                <audio controls className="w-full">
                  <source
                    src={getFullAudioUrl(commentTrack.audioUrl)}
                    type={commentTrack.audioUrl.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg'}
                  />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>

              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <TrackComments
                  trackId={commentTrack.id}
                  comments={trackComments}
                  onCommentAdded={handleCommentAdded}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}