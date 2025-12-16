"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Music, Loader2, PlusCircle, Search, Calendar, Users, ArrowRight, RefreshCw, PlusIcon, Mic2, Mic, Mic2Icon, Music2, Music3, Music4, MicIcon } from "lucide-react"
import { ProjectService, type Project } from "@/services/project-service"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { fixImageUrl } from "@/lib/utils"

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [collaborations, setCollaborations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("my-projects")

  const router = useRouter()
  const { user, token } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    fetchUserProjects()
  }, [user, token, router])

  const fetchUserProjects = async () => {
    setLoading(true)
    try {
      // Buscar projetos do usuário
      if (!token || !user) {
        throw new Error("Token and user are required to fetch user projects.")
      }
      const userProjects = await ProjectService.getUserProjects(token)
      setProjects(userProjects)

      // Buscar projetos em que o usuário colabora
      const collaborationProjects = await ProjectService.getUserCollaborations(token)
      setCollaborations(collaborationProjects)
    } catch (error) {
      console.error("Erro ao buscar projetos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus projetos. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.genre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCollaborations = collaborations.filter(collab =>
    collab.project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collab.project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collab.project.genre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="px-4 py-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Meus Projetos</h1>
          <p className="text-muted-foreground">Gerencie e acompanhe seus projetos musicais</p>
        </div>
        {filteredProjects.length > 0 && (
        <Button asChild>
          <Link href="/projects/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Criar Projeto
          </Link>
        </Button>
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar projetos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={fetchUserProjects} title="Atualizar">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-projects">Meus Projetos</TabsTrigger>
          <TabsTrigger value="collaborations">Colaborações</TabsTrigger>
        </TabsList>

        <TabsContent value="my-projects" className="mt-6">
          {filteredProjects.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="flex justify-center mb-4">
                  <Music className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Você ainda não tem projetos</h3>
                <p className="text-muted-foreground mb-6">
                  Crie seu primeiro projeto musical para começar a colaborar com outros músicos
                </p>
                <Button asChild>
                  <Link href="/projects/new" className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Criar Projeto
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden group">
                  <div className="relative h-40">
                    <Image
                      src={fixImageUrl(project.imageUrl)}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h3 className="font-bold text-lg">{project.title}</h3>
                      <Badge variant="outline" className="bg-primary/20 text-white border-primary/50">
                        {project.genre}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {project.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {formatDistanceToNow(new Date(project.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{project._count?.collaborations || 0} colaboradores</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/studio?project=${project.id}`}>
                        Estúdio
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/projects/${project.id}`} className="flex items-center gap-1">
                        Ver Detalhes
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="collaborations" className="mt-6">
          {filteredCollaborations.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="flex justify-center mb-4">
                  <Users className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhuma colaboração encontrada</h3>
                <p className="text-muted-foreground mb-6">
                  Você ainda não está colaborando em nenhum projeto. Explore a plataforma para encontrar projetos interessantes.
                </p>
                <Button asChild>
                  <Link href="/explore">Explorar Projetos</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollaborations.map((collab) => (
                <Card key={collab.id} className="overflow-hidden group">
                  <div className="relative h-40">
                    <Image
                      src={fixImageUrl(collab.project.imageUrl)}
                      alt={collab.project.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h3 className="font-bold text-lg">{collab.project.title}</h3>
                      <Badge variant="outline" className="bg-primary/20 text-white border-primary/50">
                        {collab.project.genre}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {collab.status === "PENDING" ? "Pendente" :
                          collab.status === "ACCEPTED" ? "Aceito" :
                            collab.status === "REJECTED" ? "Rejeitado" : "Colaborador"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Criado por {collab.project.author.name}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {collab.project.description}
                    </p>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex justify-end">
                    <Button size="sm" asChild>
                      <Link href={`/projects/${collab.project.id}`} className="flex items-center gap-1">
                        Ver Projeto
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}