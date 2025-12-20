"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AudioRecorder } from "@/components/audio-recorder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, Music, PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ProjectService, type ProjectDetail, type Project } from "@/services/project-service"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import Image from "next/image"
import { fixImageUrl } from "@/lib/utils"

// Lazy load heavy components
const LazyAudioMixer = lazy(() => import("@/components/audio-mixer").then((mod) => ({ default: mod.AudioMixer })))
const LazyProjectDetails = lazy(() =>
  import("@/components/project-details").then((mod) => ({ default: mod.ProjectDetails })),
)

export default function StudioPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project")

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("recorder")
  const [userProjects, setUserProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  const { toast } = useToast()
  const { token } = useAuth()

  useEffect(() => {
    if (projectId && token) {
      fetchProject()
    } else if (token) {
      fetchUserProjects()
    }
  }, [projectId, token])

  const fetchUserProjects = async () => {
    if (!token) return
    
    setLoadingProjects(true)
    try {
      const projects = await ProjectService.getUserProjects(token)
      setUserProjects(projects)
    } catch (error) {
      console.error("Erro ao buscar projetos do usuário:", error)
      toast({
        title: "Erro ao carregar projetos",
        description: "Não foi possível carregar seus projetos. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoadingProjects(false)
    }
  }

  const fetchProject = async () => {
    if (!projectId) return

    setLoading(true)
    try {
      const data = await ProjectService.getProjectById(projectId, token || undefined)
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

  const handleTrackSaved = () => {
    fetchProject()
    toast({
      title: "Faixa adicionada",
      description: "Sua faixa foi adicionada ao projeto com sucesso!",
    })
  }

  return (
    <AuthGuard>
      <div className="px-4 py-6 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Estúdio Virtual</h1>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !projectId ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Meus Projetos</CardTitle>
              <CardDescription>Selecione um projeto para começar a gravar ou mixar no estúdio virtual</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProjects ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProjects.map((project) => (
                    <Card key={project.id} className="overflow-hidden h-full flex flex-col hover:shadow-md transition-all">
                      <div className="relative h-36">
                        <Image
                          src={fixImageUrl(project.imageUrl)}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.description || "Sem descrição"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 py-2">
                        <div className="flex justify-between text-sm">
                          <span>Gênero: {project.genre}</span>
                          <span>BPM: {project.bpm}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tom: {project.key}</span>
                          <span>Faixas: {project._count?.tracks || 0}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 mt-auto">
                        <Button className="w-full" asChild>
                          <Link href={`/studio?project=${project.id}`}>
                            Selecionar Projeto
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="rounded-full bg-muted p-4 inline-flex mb-4">
                    <Music className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Você ainda não tem projetos</h3>
                  <p className="text-muted-foreground mb-6">
                    Crie seu primeiro projeto musical para começar a gravar e mixar no estúdio virtual
                  </p>
                  <Button asChild>
                    <Link href="/projects/new" className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Criar Novo Projeto
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : project ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="recorder" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="recorder">Gravador</TabsTrigger>
                  <TabsTrigger value="mixer">Mixer</TabsTrigger>
                </TabsList>
                <TabsContent value="recorder" className="mt-4">
                  <AudioRecorder projectId={projectId} onTrackSaved={handleTrackSaved} />
                </TabsContent>
                <TabsContent value="mixer" className="mt-4">
                  {activeTab === "mixer" && (
                    <Suspense
                      fallback={
                        <div className="flex justify-center items-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      }
                    >
                      <LazyAudioMixer project={project} onTrackUpdated={handleTrackSaved} />
                    </Suspense>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            <div className="space-y-6">
              <Suspense
                fallback={
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }
              >
                <LazyProjectDetails project={project} onProjectUpdated={fetchProject} />
              </Suspense>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <p className="text-center text-muted-foreground">
                Projeto não encontrado ou você não tem permissão para acessá-lo.
              </p>
              <Button asChild className="mt-4">
                <Link href="/projects">Ver Meus Projetos</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  )
}

