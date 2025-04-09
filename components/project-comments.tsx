"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, Loader2 } from "lucide-react"
import type { Comment } from "@/services/project-service"
import { CommentService } from "@/services/comment-service"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ProjectCommentsProps {
  projectId: string
  comments: Comment[]
  onCommentAdded?: () => void
}

export function ProjectComments({ projectId, comments, onCommentAdded }: ProjectCommentsProps) {
  const [commentText, setCommentText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [liking, setLiking] = useState<Record<string, boolean>>({})
  const { user, token } = useAuth()
  const { toast } = useToast()

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user || !token) return

    setSubmitting(true)
    try {
      await CommentService.createComment(
        {
          text: commentText,
          projectId,
        },
        token,
      )

      setCommentText("")
      if (onCommentAdded) {
        onCommentAdded()
      }

      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi adicionado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error)
      toast({
        title: "Erro ao adicionar comentário",
        description: "Não foi possível adicionar seu comentário. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!user || !token) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para curtir comentários.",
        variant: "destructive",
      })
      return
    }

    setLiking((prev) => ({ ...prev, [commentId]: true }))
    try {
      await CommentService.likeComment(commentId, token)
      if (onCommentAdded) {
        onCommentAdded()
      }
    } catch (error) {
      console.error("Erro ao curtir comentário:", error)
      toast({
        title: "Erro ao curtir comentário",
        description: "Não foi possível curtir o comentário. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLiking((prev) => ({ ...prev, [commentId]: false }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comentários</CardTitle>
        <CardDescription>Discussões e feedback sobre o projeto</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {user && (
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Adicione um comentário..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="resize-none"
                />
                <Button onClick={handleSubmitComment} disabled={!commentText.trim() || submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Comentar"
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.author.avatarUrl || ""} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    <p className="mt-1">{comment.text}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground"
                        onClick={() => handleLikeComment(comment.id)}
                        disabled={liking[comment.id]}
                      >
                        {liking[comment.id] ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <ThumbsUp className="mr-1 h-4 w-4" />
                        )}
                        {comment.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                        Responder
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            )}
          </div>

          {comments.length > 5 && (
            <Button variant="outline" className="w-full">
              Ver mais comentários
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

