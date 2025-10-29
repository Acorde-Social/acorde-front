"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AudioRecorder } from "@/components/audio-recorder"
import { ProjectService, type Project } from "@/services/project-service"
import { Loader2, Music, Mic, RefreshCw, Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AudioFeed } from "@/components/audio/audio-feed"
import { HowItWorks } from "@/components/how-it-works"
import { fixImageUrl } from "@/lib/utils"

export default function Home() {
  const { user, token, isLoading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [activeTab, setActiveTab] = useState("audio")  // Alterado de "all" para "audio"
  const { toast } = useToast()
  const [quickRecordMode, setQuickRecordMode] = useState(false)

  useEffect(() => {
    if (token) {
      fetchFeed()
    }
  }, [token])

  const fetchFeed = async () => {
    setLoadingProjects(true)
    try {
      const data = await ProjectService.getProjects(undefined, token || '')
      setProjects(data)
    } catch (error) {
      console.error("Erro ao carregar feed:", error)
      toast({
        title: "Erro ao carregar feed",
        description: "Não foi possível carregar as postagens. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleTrackSaved = () => {
    fetchFeed()
    setQuickRecordMode(false)
    toast({
      title: "Áudio publicado!",
      description: "Seu áudio foi publicado com sucesso no feed.",
    })
  }

  // Landing page para usuários não autenticados
  if (!user && !isLoading) {
    return (
      <>
        <div className="bg-background">
          <section className="space-y-2 pb-1 pt-4 md:pb-2 md:pt-6 lg:py-8">
            <div className="container flex max-w-[64rem] flex-col items-center gap-1 text-center">
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                Conectando <span className="text-primary">sua música</span>{" "}
                com <span className="text-primary">músicos</span> do mundo inteiro!
              </h1>
              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                Compartilhe suas composições, colabore com músicos talentosos e expanda seu network musical. Tudo em uma
                única plataforma.
              </p>
            </div>
          </section>
          <HowItWorks />
        </div>
      </>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  // Feed social para usuários autenticados
  return (
    <div className="px-4 py-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Sidebar com perfil e links rápidos */}
        <div className="hidden md:block space-y-6">
          <Card className="card-hover border border-border overflow-hidden">
            <CardHeader className="pb-2 relative">
              <div className="flex justify-center">
                <Avatar className="h-20 w-20 border-2 border-border">
                  <AvatarImage src={fixImageUrl(user?.avatarUrl || "")} alt={user?.name || ""} className="object-cover w-full h-full" />
                  <AvatarFallback className="bg-primary text-primary-foreground">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-center mt-2">{user?.name}</CardTitle>
              <CardDescription className="text-center">
                {user?.role === "MUSICIAN" ? "Músico" : "Compositor"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user?.instruments && user.instruments.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3 justify-center">
                  {user.instruments.map((instrument, i) => (
                    <Badge key={i} variant="outline" className="bg-primary/5">
                      {instrument}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="text-sm text-muted-foreground text-center">
                {user?.bio || "Adicione uma biografia ao seu perfil"}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" asChild size="sm">
                <Link href="/profile">Editar perfil</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-lg">Links Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start hover:bg-primary/5 transition-colors" asChild>
                <Link href="/projects">
                  <Music className="mr-2 h-4 w-4 text-primary" />
                  Meus Projetos
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-primary/5 transition-colors" asChild>
                <Link href="/collaborations">
                  <Music className="mr-2 h-4 w-4 text-primary" />
                  Colaborações
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-primary/5 transition-colors" asChild>
                <Link href="/explore">
                  <Music className="mr-2 h-4 w-4 text-primary" />
                  Explorar Projetos
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-primary/5 transition-colors" asChild>
                <Link href="/studio">
                  <Mic className="mr-2 h-4 w-4 text-primary" />
                  Estúdio Virtual
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feed principal */}
        <div className="md:col-span-3 space-y-6">
          {/* Criar nova postagem / Gravador rápido */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-lg">Compartilhe sua música</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {quickRecordMode ? (
                <div className="space-y-4">
                  <AudioRecorder
                    onTrackSaved={handleTrackSaved}
                    simplified={true}
                    onCancel={() => setQuickRecordMode(false)}
                  />
                </div>
              ) : (
                <div
                  className="flex items-center gap-3 p-4 border rounded-md cursor-pointer hover:bg-primary/5 transition-all"
                  onClick={() => setQuickRecordMode(true)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={fixImageUrl(user?.avatarUrl || "")} alt={user?.name || ""} className="object-cover w-full h-full" />
                    <AvatarFallback className="bg-primary text-primary-foreground">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-muted-foreground">Grave e compartilhe um áudio...</div>
                  <Mic className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs para filtrar o feed */}
          <Tabs defaultValue="audio" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="audio">Áudios</TabsTrigger>
              <TabsTrigger value="all">Projetos</TabsTrigger>
              <TabsTrigger value="following">Seguindo</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Feed de áudios e projetos baseado na tab selecionada */}
          {activeTab === "audio" ? (
            // Feed de áudios
            <div className="mt-6">
              {/* Importamos e usamos o componente AudioFeed */}
              <AudioFeed />
            </div>
          ) : (
            // Feed de projetos
            loadingProjects ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : projects.length > 0 ? (
              <div className="space-y-6">
                {projects.map((project) => (
                  <Card key={project.id} className="card-hover overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={fixImageUrl(project.author.avatarUrl || "")} alt={project.author.name} className="object-cover w-full h-full" />
                          <AvatarFallback className="bg-primary text-primary-foreground">{project.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{project.author.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(project.createdAt), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="ml-auto">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    {project.imageUrl && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={fixImageUrl(project.imageUrl)}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform hover:scale-105 duration-700"
                        />
                      </div>
                    )}

                    <CardContent className="pt-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{project.title}</h3>
                          <Badge variant="outline">{project.genre}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{project.description}</p>

                        {/* Reprodutor de áudio (simplificado) */}
                        {project._count?.tracks && project._count.tracks > 0 ? (
                          <div className="mt-2 p-2 bg-accent/20 rounded-md">
                            <audio controls className="w-full">
                              <source src="#" type="audio/mpeg" />
                              Seu navegador não suporta o elemento de áudio.
                            </audio>
                          </div>
                        ) : (
                          <div className="mt-2 p-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-md">
                            Este projeto não possui faixas de áudio.
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                          <div className="flex items-center">
                            <Music className="mr-1 h-4 w-4 text-primary" />
                            <span>{project.key}</span>
                            <span className="mx-2">•</span>
                            <span>{project.bpm} BPM</span>
                          </div>
                          <div>
                            {project._count?.collaborations || 0} colaboradores
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="border-t px-6 py-3">
                      <div className="flex justify-between w-full">
                        <Button variant="ghost" size="sm" className="gap-1 hover:text-primary">
                          <Heart className="h-4 w-4" />
                          <span>Curtir</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 hover:text-primary" asChild>
                          <Link href={`/projects/${project.id}`}>
                            <MessageCircle className="h-4 w-4" />
                            <span>Comentar</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 hover:text-primary">
                          <Share2 className="h-4 w-4" />
                          <span>Compartilhar</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <Music className="h-12 w-12 text-primary opacity-75" />
                </div>
                <h3 className="mb-2 text-lg font-medium">Nenhum projeto encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando seu primeiro projeto musical ou explorando a plataforma.
                </p>
                <div className="flex justify-center gap-4">
                  <Button asChild>
                    <Link href="/projects/new">Criar Projeto</Link>
                  </Button>
                  <Button variant="outline" onClick={fetchFeed}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar
                  </Button>
                </div>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  )
}

