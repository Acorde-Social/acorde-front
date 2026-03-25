"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Headphones, Music, Search, Users, Loader2, RefreshCw, AlertTriangle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ProjectService, type Project, type ProjectFilter } from "@/services/project-service"
import { useAsync } from "@/hooks/use-async"
import { AsyncBoundary } from "@/components/async-boundary"
import { ErrorBoundary } from "@/components/error-boundary"
import { fixImageUrl } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { FloatingFigures } from "@/components/common/FloatingFigures"
import { WaveformBackground } from "@/components/common/WaveformBackground"

export default function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const { user, token } = useAuth()

  const [filters, setFilters] = useState<ProjectFilter>({})
  const [bpmRange, setBpmRange] = useState<number[]>([40, 180])

  const {
    loading,
    error,
    execute: fetchProjects,
    reset,
  } = useAsync<Project[]>({
    onSuccess: (data) => {
      setProjects(data)
    },
    onError: () => {},
  })

  const loadProjects = useCallback(async () => {
    return ProjectService.getProjects(filters, token || "")
  }, [filters, token])

  useEffect(() => {
    let mounted = true;

    const doFetchProjects = async () => {
      if (mounted) {
        try {
          await fetchProjects(() => ProjectService.getProjects(filters, token || ""));
        } catch (err) {
        }
      }
    };

    doFetchProjects();

    return () => {
      mounted = false;
    };
  }, [filters, token]);

  const applyFilters = () => {
    const updatedFilters: ProjectFilter = {
      ...filters,
      minBpm: bpmRange[0],
      maxBpm: bpmRange[1],
    }
    setFilters(updatedFilters)
    fetchProjects(() => ProjectService.getProjects(updatedFilters, token || ""))
  }

  const handleRetry = () => {
    reset()
    fetchProjects(loadProjects)
  }

  const filteredProjects = projects
    .filter(
      (project) =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.genre.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy === "popular") {
        return (b._count?.collaborations || 0) - (a._count?.collaborations || 0)
      } else {
        return (b.neededInstruments?.length || 0) - (a.neededInstruments?.length || 0)
      }
    })

  return (
    <ErrorBoundary>
      <div className="bg-background relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f9fafb] via-[#fcd34d]/10 to-[#2c1e4a]/10 dark:from-[#0f0c18] dark:via-[#3b2010]/15 dark:to-[#2c1e4a]/25 pointer-events-none" />
        <WaveformBackground />
        <div className="absolute inset-0 pointer-events-none">
          <div className="scale-175 opacity-60 dark:opacity-65">
            <FloatingFigures />
          </div>
        </div>

        <div className="relative z-10 px-4 py-6">
          <h1 className="text-3xl font-bold mb-6">Explorar Projetos</h1>

          <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gênero</label>
                  <Select
                    value={filters.genre || "all"}
                    onValueChange={(value) => setFilters({ ...filters, genre: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os gêneros" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os gêneros</SelectItem>
                      <SelectItem value="Acústico">Acústico</SelectItem>
                      <SelectItem value="R&B">R&B</SelectItem>
                      <SelectItem value="Eletrônica">Eletrônica</SelectItem>
                      <SelectItem value="Jazz">Jazz</SelectItem>
                      <SelectItem value="Pop">Pop</SelectItem>
                      <SelectItem value="Rock">Rock</SelectItem>
                      <SelectItem value="Clássica">Clássica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Instrumento necessário</label>
                  <Select
                    value={filters.instrument || "all"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, instrument: value === "all" ? undefined : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os instrumentos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os instrumentos</SelectItem>
                      <SelectItem value="Guitarra">Guitarra/Violão</SelectItem>
                      <SelectItem value="Baixo">Baixo</SelectItem>
                      <SelectItem value="Bateria">Bateria</SelectItem>
                      <SelectItem value="Piano">Piano/Teclado</SelectItem>
                      <SelectItem value="Violino">Cordas</SelectItem>
                      <SelectItem value="Voz">Vocais</SelectItem>
                      <SelectItem value="Trompete">Metais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">BPM (Andamento)</label>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Lento</span>
                    <span>Rápido</span>
                  </div>
                  <Slider value={bpmRange} onValueChange={setBpmRange} min={40} max={220} step={1} />
                  <div className="flex justify-between text-xs">
                    <span>{bpmRange[0]} BPM</span>
                    <span>{bpmRange[1]} BPM</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tonalidade</label>
                  <Select
                    value={filters.key || "all"}
                    onValueChange={(value) => setFilters({ ...filters, key: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as tonalidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as tonalidades</SelectItem>
                      <SelectItem value="C Maior">C (Dó)</SelectItem>
                      <SelectItem value="G Maior">G (Sol)</SelectItem>
                      <SelectItem value="D Maior">D (Ré)</SelectItem>
                      <SelectItem value="A Maior">A (Lá)</SelectItem>
                      <SelectItem value="E Maior">E (Mi)</SelectItem>
                      <SelectItem value="B Maior">B (Si)</SelectItem>
                      <SelectItem value="F Maior">F (Fá)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" onClick={applyFilters}>
                  Aplicar Filtros
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar projetos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Tabs defaultValue={sortBy} onValueChange={setSortBy} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="recent">Recentes</TabsTrigger>
                  <TabsTrigger value="popular">Populares</TabsTrigger>
                  <TabsTrigger value="needs">Precisa de músicos</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <AsyncBoundary
              loading={loading}
              error={error}
              onRetry={handleRetry}
              loadingFallback={
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }
              errorFallback={
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Erro ao carregar projetos</h3>
                  <p className="text-muted-foreground mb-6">
                    {error?.message?.includes("Cannot GET")
                      ? "Não foi possível carregar os projetos. Tente novamente mais tarde."
                      : error?.message || "Não foi possível carregar os projetos. Tente novamente mais tarde."}
                  </p>
                  <Button onClick={handleRetry} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Tentar novamente
                  </Button>
                </div>
              }
            >
              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project: Project) => (
                    <Card key={project.id} className="overflow-hidden">
                      <div className="relative h-48 w-full">
                        <Image
                          src={fixImageUrl(project.imageUrl)}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{project.genre}</Badge>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{project._count?.collaborations || 0}</span>
                          </div>
                        </div>
                        <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={fixImageUrl(project.author?.avatarUrl || "")} alt={project.author?.name || "User"} />
                            <AvatarFallback>{project.author?.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{project.author?.name || "Unknown User"}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                        <div className="mt-4 flex space-x-4 text-sm">
                          <div className="flex items-center">
                            <Music className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span>{project.key}</span>
                          </div>
                          <div className="flex items-center">
                            <Headphones className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span>{project.bpm} BPM</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button asChild className="w-full">
                          <Link href={`/projects/${project.id}`}>Ver projeto</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum projeto encontrado com os filtros selecionados.</p>
                </div>
              )}

              {filteredProjects.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline">Carregar mais</Button>
                </div>
              )}
            </AsyncBoundary>
          </div>
        </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

