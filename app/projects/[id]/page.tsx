"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Headphones, MessageSquare, Music, Play, Plus, Share2, Users, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ProjectCollaborators } from "@/components/projects/project-collaborators"
import { ProjectComments } from "@/components/projects/project-comments"
import { ProjectService, type ProjectDetail } from "@/services/project-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { CollaborationService } from "@/services/collaboration-service"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { fixImageUrl } from "@/lib/utils"

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [collaborating, setCollaborating] = useState(false)
  const { toast } = useToast()
  const { user, token } = useAuth()

  useEffect(() => {
    fetchProject()
  }, [params.id])

  const fetchProject = async () => {
    setLoading(true)
    try {
      const data = await ProjectService.getProjectById(params.id, token || undefined)
      setProject(data)
    } catch (error) {
      console.error("Erro ao buscar projeto:", error)
      toast({
        title: "Erro ao carregar projeto",
        description: "Não foi possível carregar os detalhes do projeto. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCollaborate = async () => {
    if (!user || !token) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para colaborar em projetos.",
        variant: "destructive",
      })
      return
    }

    setCollaborating(true)
    try {
      await CollaborationService.requestCollaboration(
        {
          projectId: params.id,
        },
        token,
      )

      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de colaboração foi enviada com sucesso!",
      })

      fetchProject()
    } catch (error) {
      console.error("Erro ao solicitar colaboração:", error)
      toast({
        title: "Erro ao solicitar colaboração",
        description: "Não foi possível enviar sua solicitação. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setCollaborating(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Projeto não encontrado</h1>
        <p className="text-muted-foreground mb-6">O projeto que você está procurando não existe ou foi removido.</p>
        <Button asChild>
          <Link href="/explore">Explorar projetos</Link>
        </Button>
      </div>
    )
  }

  const isAuthor = user?.id === project.author.id
  const isCollaborator = project.collaborations.some((collab) => collab.userId === user?.id)
  const formattedDate = project.createdAt
    ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: ptBR })
    : ""

  return (
    <div className="px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden">
            <Image
              src={fixImageUrl(project.imageUrl)}
              alt={project.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={project.author.avatarUrl || ""} alt={project.author.name} />
                  <AvatarFallback>{project.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{project.author.name}</span>
              </div>
            </div>
            {project.tracks.length > 0 && (
              <Button size="icon" className="absolute bottom-6 right-6 rounded-full h-12 w-12">
                <Play className="h-6 w-6" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="text-sm">
              {project.genre}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Music className="mr-1 h-4 w-4" />
              <span>{project.key}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Headphones className="mr-1 h-4 w-4" />
              <span>{project.bpm} BPM</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-1 h-4 w-4" />
              <span>{project.collaborations.length} colaboradores</span>
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
              {!isAuthor && !isCollaborator && (
                <Button
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleCollaborate}
                  disabled={collaborating}
                >
                  {collaborating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Colaborar
                    </>
                  )}
                </Button>
              )}
              {isAuthor && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/projects/${project.id}/edit`}>Editar Projeto</Link>
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sobre este projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{project.description}</CardDescription>
            </CardContent>
          </Card>

          <Tabs defaultValue="tracks">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tracks">Faixas</TabsTrigger>
              <TabsTrigger value="collaborators">Colaboradores</TabsTrigger>
              <TabsTrigger value="comments">Comentários</TabsTrigger>
            </TabsList>

            <TabsContent value="tracks" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Faixas do projeto</CardTitle>
                  <CardDescription>Ouça as faixas existentes ou adicione sua contribuição</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project.tracks.length > 0 ? (
                      project.tracks.map((track) => (
                        <div key={track.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center gap-3">
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Play className="h-4 w-4" />
                            </Button>
                            <div>
                              <p className="font-medium">{track.name}</p>
                              <p className="text-sm text-muted-foreground">Por {track.author.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}
                            </span>
                            <span>
                              {formatDistanceToNow(new Date(track.createdAt), { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">Nenhuma faixa adicionada ainda.</p>
                    )}

                    {(isAuthor || isCollaborator) && (
                      <Button asChild className="w-full mt-4">
                        <Link href={`/studio?project=${project.id}`}>Adicionar nova faixa</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collaborators" className="mt-4">
              <ProjectCollaborators projectId={project.id} collaborations={project.collaborations} />
            </TabsContent>

            <TabsContent value="comments" className="mt-4">
              <ProjectComments
                projectId={project.id}
                comments={project.comments}
                onCommentAdded={fetchProject}
                onCommentCountChange={(count) => {
                  setProject(prev => prev ? { ...prev, commentsCount: count } : null)
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Instrumentos necessários</CardTitle>
              <CardDescription>O compositor está procurando estes instrumentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {project.neededInstruments.length > 0 ? (
                  project.neededInstruments.map((instrument, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <span>{instrument}</span>
                      {!isAuthor && user && (
                        <Button size="sm" variant="outline" onClick={handleCollaborate} disabled={collaborating}>
                          Oferecer
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-2">Nenhum instrumento específico necessário.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes do projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em</span>
                  <span>{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gênero</span>
                  <span>{project.genre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tonalidade</span>
                  <span>{project.key}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BPM</span>
                  <span>{project.bpm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Colaboradores</span>
                  <span>{project.collaborations.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contatar compositor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tem interesse em colaborar ou alguma dúvida sobre o projeto?
              </p>
              <Button className="w-full flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Enviar mensagem
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

