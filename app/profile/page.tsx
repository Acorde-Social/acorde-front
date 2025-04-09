"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, X, Music, Guitar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"
import { ProjectService, type Project } from "@/services/project-service"
import Link from "next/link"
import Image from "next/image"

export default function ProfilePage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [instruments, setInstruments] = useState<string[]>([])
  const [experience, setExperience] = useState("")
  const [newInstrument, setNewInstrument] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [projectsFetched, setProjectsFetched] = useState(false)

  const [projects, setProjects] = useState<Project[]>([])
  const [collaborations, setCollaborations] = useState<Project[]>([])

  useEffect(() => {
    if (user) {
      setName(user.name)
      setBio(user.bio || "")
      setInstruments(user.instruments || [])
      setExperience(user.experience || "")
      setAvatarPreview(user.avatarUrl || null)
    }
  }, [user])

  useEffect(() => {
    if (user && token && !projectsFetched) {
      fetchUserProjects()
    }
  }, [user, token, projectsFetched])

  const fetchUserProjects = async () => {
    if (!token || !user || projectsFetched) return

    setIsLoading(true)
    try {
      // Em uma implementação real, você teria endpoints específicos para buscar projetos do usuário
      // e projetos em que o usuário colabora. Aqui estamos simulando isso.
      const allProjects = await ProjectService.getProjects({}, token)
      
      // Set projects right away to avoid triggering re-renders
      const userProjects = allProjects.filter((project) => project.authorId === user.id)
      const userCollaborations = allProjects.filter((project) => project.authorId !== user.id)
      
      setProjects(userProjects)
      setCollaborations(userCollaborations.slice(0, 3)) // Limitar a 3 para exemplo
      
      // Mark projects as fetched to prevent repeated API calls
      setProjectsFetched(true)
    } catch (error) {
      console.error("Erro ao buscar projetos:", error)
      // Still mark as fetched even on error to prevent infinite loops
      setProjectsFetched(true)
      toast({
        title: "Erro ao carregar projetos",
        description: "Não foi possível carregar seus projetos. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)

      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addInstrument = () => {
    if (newInstrument && !instruments.includes(newInstrument)) {
      setInstruments([...instruments, newInstrument])
      setNewInstrument("")
    }
  }

  const removeInstrument = (instrumentToRemove: string) => {
    setInstruments(instruments.filter((instrument) => instrument !== instrumentToRemove))
  }

  const saveProfile = async () => {
    if (!token) return

    setIsSaving(true)

    try {
      // Em uma implementação real, você enviaria os dados para a API
      // Aqui estamos apenas simulando o sucesso

      // Simular atraso da API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      toast({
        title: "Erro ao atualizar perfil",
        description: "Não foi possível salvar suas alterações. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const instrumentOptions = [
    "Violão/Guitarra",
    "Baixo",
    "Bateria",
    "Piano/Teclado",
    "Violino",
    "Viola",
    "Violoncelo",
    "Contrabaixo",
    "Flauta",
    "Saxofone",
    "Trompete",
    "Trombone",
    "Voz",
    "Percussão",
    "Produção/Beatmaking",
    "Sintetizador",
    "Acordeão",
    "Gaita",
  ]

  const experienceOptions = [
    "Iniciante (0-2 anos)",
    "Intermediário (2-5 anos)",
    "Avançado (5-10 anos)",
    "Profissional (10+ anos)",
  ]

  return (
    <AuthGuard>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Editar Perfil
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={avatarPreview || ""} alt={name} />
                          <AvatarFallback className="text-2xl">{name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer">
                          <Upload className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Conte um pouco sobre você e sua experiência musical..."
                        rows={4}
                      />
                    </div>

                    {user?.role === "MUSICIAN" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="experience">Experiência</Label>
                          <Select value={experience} onValueChange={setExperience}>
                            <SelectTrigger id="experience">
                              <SelectValue placeholder="Selecione sua experiência" />
                            </SelectTrigger>
                            <SelectContent>
                              {experienceOptions.map((exp) => (
                                <SelectItem key={exp} value={exp}>
                                  {exp}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Instrumentos</Label>
                          <div className="flex gap-2">
                            <Select value={newInstrument} onValueChange={setNewInstrument}>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Selecione um instrumento" />
                              </SelectTrigger>
                              <SelectContent>
                                {instrumentOptions.map((instrument) => (
                                  <SelectItem key={instrument} value={instrument}>
                                    {instrument}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button type="button" onClick={addInstrument} disabled={!newInstrument}>
                              Adicionar
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2">
                            {instruments.map((instrument) => (
                              <Badge key={instrument} variant="secondary" className="flex items-center gap-1">
                                {instrument}
                                <button
                                  type="button"
                                  onClick={() => removeInstrument(instrument)}
                                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">Remover {instrument}</span>
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button onClick={saveProfile} disabled={isSaving} className="flex-1">
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          "Salvar Alterações"
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || ""} />
                        <AvatarFallback className="text-2xl">{user?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="text-center">
                      <h2 className="text-xl font-bold">{user?.name}</h2>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <div className="flex justify-center mt-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {user?.role === "COMPOSER" ? (
                            <>
                              <Music className="h-3 w-3" />
                              Compositor
                            </>
                          ) : (
                            <>
                              <Guitar className="h-3 w-3" />
                              Músico
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>

                    {bio && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Biografia</h3>
                        <p className="text-sm">{bio}</p>
                      </div>
                    )}

                    {user?.role === "MUSICIAN" && (
                      <>
                        {experience && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Experiência</h3>
                            <p className="text-sm">{experience}</p>
                          </div>
                        )}

                        {instruments && instruments.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Instrumentos</h3>
                            <div className="flex flex-wrap gap-2">
                              {instruments.map((instrument) => (
                                <Badge key={instrument} variant="secondary">
                                  {instrument}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="projects">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="projects">Meus Projetos</TabsTrigger>
                <TabsTrigger value="collaborations">Colaborações</TabsTrigger>
              </TabsList>

              <TabsContent value="projects" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Projetos Criados</CardTitle>
                      {user?.role === "COMPOSER" && (
                        <Button asChild size="sm">
                          <Link href="/projects/new">Criar Novo Projeto</Link>
                        </Button>
                      )}
                    </div>
                    <CardDescription>Projetos musicais que você criou</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : projects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map((project) => (
                          <Card key={project.id} className="overflow-hidden">
                            <div className="relative h-32 w-full">
                              <Image
                                src={project.imageUrl || "/placeholder.svg?height=200&width=400"}
                                alt={project.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-bold truncate">{project.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {project.description || "Sem descrição"}
                              </p>
                              <div className="flex justify-between items-center">
                                <Badge variant="outline">{project.genre}</Badge>
                                <Button asChild size="sm" variant="outline">
                                  <Link href={`/projects/${project.id}`}>Ver Projeto</Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">Você ainda não criou nenhum projeto.</p>
                        {user?.role === "COMPOSER" && (
                          <Button asChild>
                            <Link href="/projects/new">Criar Meu Primeiro Projeto</Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                  {projects.length > 0 && (
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/projects">Ver Todos os Projetos</Link>
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="collaborations" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Minhas Colaborações</CardTitle>
                    <CardDescription>Projetos em que você está colaborando</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : collaborations.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {collaborations.map((project) => (
                          <Card key={project.id} className="overflow-hidden">
                            <div className="relative h-32 w-full">
                              <Image
                                src={project.imageUrl || "/placeholder.svg?height=200&width=400"}
                                alt={project.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-bold truncate">{project.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {project.description || "Sem descrição"}
                              </p>
                              <div className="flex justify-between items-center">
                                <Badge variant="outline">{project.genre}</Badge>
                                <Button asChild size="sm" variant="outline">
                                  <Link href={`/projects/${project.id}`}>Ver Projeto</Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">Você ainda não está colaborando em nenhum projeto.</p>
                        <Button asChild>
                          <Link href="/explore">Explorar Projetos</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  {collaborations.length > 0 && (
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/collaborations">Ver Todas as Colaborações</Link>
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

