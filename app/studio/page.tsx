"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AudioRecorder } from "@/components/audio-recorder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Music } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ProjectService, type ProjectDetail } from "@/services/project-service"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"

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

  const { toast } = useToast()
  const { token } = useAuth()

  useEffect(() => {
    if (projectId && token) {
      fetchProject()
    }
  }, [projectId, token])

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
              <CardTitle>Selecione um Projeto</CardTitle>
              <CardDescription>Para começar a gravar ou mixar, você precisa selecionar um projeto</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Music className="h-12 w-12 text-primary" />
              </div>
              <p className="text-center mb-6 max-w-md">
                Você precisa selecionar um projeto para usar o estúdio virtual. Escolha um projeto existente ou crie um
                novo.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/projects">Meus Projetos</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/collaborations">Colaborações</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/projects/new">Criar Novo Projeto</Link>
                </Button>
              </div>
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

