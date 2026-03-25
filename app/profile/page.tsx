"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import {
  Loader2, Upload, X, Music, Guitar, Eye, Edit3, Camera,
  Save, XCircle, Plus, Sparkles
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"
import { FloatingFigures } from "@/components/common/FloatingFigures"
import { WaveformBackground } from "@/components/common/WaveformBackground"
import { ProjectService, type Project as ServiceProject } from "@/services/project-service"
import { fixImageUrl } from "@/lib/utils"
import { API_URL } from "@/lib/api-config"
import "./modern-profile.css"

export default function ProfilePage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [instruments, setInstruments] = useState<string[]>([])
  const [experience, setExperience] = useState("")
  const [newInstrument, setNewInstrument] = useState("")

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [projectsFetched, setProjectsFetched] = useState(false)

  const [projects, setProjects] = useState<ServiceProject[]>([])
  const [collaborations, setCollaborations] = useState<ServiceProject[]>([])

  const fetchUserProjects = async () => {
    if (!token || !user || projectsFetched) return

    setIsLoading(true)
    try {
      const [userProjects, collaboratingProjects] = await Promise.all([
        ProjectService.getUserProjects(token),
        ProjectService.getUserCollaborations(token)
      ])

      setProjects(userProjects)
      setCollaborations(collaboratingProjects.slice(0, 6))
      setProjectsFetched(true)
    } catch (error) {
      setProjectsFetched(true)
      toast({
        title: "Erro ao carregar projetos",
        description: "Não foi possível carregar seus projetos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        })
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem de capa deve ter no máximo 10MB.",
          variant: "destructive",
        })
        return
      }

      setCoverImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setCoverImagePreview(event.target?.result as string)
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

  const openEditDialog = () => {
    if (user) {
      setName(user.name)
      setBio(user.bio || "")
      setInstruments(user.instruments || [])
      setExperience(user.experience || "")
    }
    setIsEditDialogOpen(true)
  }

  const cancelEdit = () => {
    setAvatarPreview(null)
    setCoverImagePreview(null)
    setAvatarFile(null)
    setCoverImageFile(null)
    setIsEditDialogOpen(false)
  }

  const saveProfile = async () => {
    if (!token || !name.trim()) {
      toast({
        title: "Erro de validação",
        description: "O nome é obrigatório.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('bio', bio || '')
      formData.append('experience', experience || '')
      formData.append('instruments', JSON.stringify(instruments || []))

      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      if (coverImageFile) {
        formData.append('coverImage', coverImageFile)
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao atualizar perfil')
      }

      const updatedUser = await response.json()

      setAvatarPreview(null)
      setCoverImagePreview(null)
      setAvatarFile(null)
      setCoverImageFile(null)

      if (typeof window !== 'undefined') {
        const event = new CustomEvent('user:update', { detail: updatedUser })
        window.dispatchEvent(event)
      }

      toast({
        title: "✨ Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      })

      setIsEditDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Não foi possível salvar suas alterações.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const instrumentOptions = [
    "Violão/Guitarra", "Baixo", "Bateria", "Piano/Teclado",
    "Violino", "Viola", "Violoncelo", "Contrabaixo",
    "Flauta", "Saxofone", "Trompete", "Trombone",
    "Voz", "Percussão", "Produção/Beatmaking", "Sintetizador",
    "Acordeão", "Gaita", "DJ/Turntablism", "Harmônica"
  ]

  const experienceOptions = [
    "Iniciante (0-2 anos)",
    "Intermediário (2-5 anos)",
    "Avançado (5-10 anos)",
    "Profissional (10+ anos)",
  ]

  useEffect(() => {
    if (authLoading) return
    if (user && token && !projectsFetched) {
      fetchUserProjects()
    }
  }, [user, token, projectsFetched, authLoading])

  return (
    <AuthGuard>
      <div className="relative bg-background overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f9fafb] via-[#fcd34d]/10 to-[#2c1e4a]/10 dark:from-[#0f0c18] dark:via-[#3b2010]/15 dark:to-[#2c1e4a]/25 pointer-events-none" />
        <WaveformBackground />
        <div className="absolute inset-0 pointer-events-none">
          <div className="scale-175 opacity-60 dark:opacity-65">
            <FloatingFigures />
          </div>
        </div>
        <div className="relative z-10">

        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-6 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 w-full">

            <div className="lg:col-span-1">
              <Card className="glass-card lg:sticky lg:top-4 overflow-hidden border border-black/5 dark:border-white/10 bg-white/70 dark:bg-[#111827]/70 backdrop-blur-md shadow-xl">
                <div className="relative h-24 sm:h-28 w-full overflow-hidden">
                  {user?.coverImageUrl ? (
                    <Image
                      src={fixImageUrl(user.coverImageUrl)}
                      alt="Cover"
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2c1e4a]/40 via-[#6d28d9]/20 to-[#0f0c18]/50 dark:from-[#2c1e4a]/70 dark:via-[#3b2010]/40 dark:to-[#0f0c18]/90" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="relative pt-0 pb-4">
                  <div className="flex justify-center -mt-12">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <Avatar className="h-32 w-32 aspect-square border-4 border-background shadow-2xl ring-4 ring-primary/20 relative z-10">
                        <AvatarImage
                          src={fixImageUrl(user?.avatarUrl || "")}
                          alt={user?.name || "User"}
                          className="object-cover w-full h-full"
                        />
                        <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="absolute -bottom-2 -right-2 z-20">
                        <Badge variant="default" className="shadow-lg backdrop-blur-sm bg-primary/90">
                          {user?.role === "COMPOSER" ? (
                            <>
                              <Music className="h-3 w-3 mr-1" />
                              Compositor
                            </>
                          ) : (
                            <>
                              <Guitar className="h-3 w-3 mr-1" />
                              Músico
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <CardHeader className="text-center pt-0 space-y-1">
                  <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#2c1e4a] to-[#6d28d9] dark:from-[#fcd34d] dark:to-[#f97316] bg-clip-text text-transparent">
                    {user?.name}
                  </CardTitle>
                  <CardDescription className="text-sm dark:text-gray-400">{user?.email}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 px-4 pb-4">
                  <div className="flex gap-2">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          className="flex-1 group hover:scale-105 transition-transform"
                          onClick={openEditDialog}
                        >
                          <Edit3 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                          Editar Perfil
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Editar Perfil
                          </DialogTitle>
                          <DialogDescription>
                            Personalize suas informações e deixe seu perfil único!
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Foto de Perfil</Label>
                              <div className="relative group">
                                <Avatar className="h-32 w-32 mx-auto border-2 border-dashed border-muted-foreground/50 group-hover:border-primary transition-colors">
                                  <AvatarImage
                                    src={avatarPreview || fixImageUrl(user?.avatarUrl || "")}
                                    alt="Preview"
                                  />
                                  <AvatarFallback className="text-4xl">
                                    {name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                  <Camera className="h-8 w-8 text-white" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Imagem de Capa</Label>
                              <div className="relative h-32 border-2 border-dashed border-muted-foreground/50 hover:border-primary transition-colors rounded-lg overflow-hidden group cursor-pointer">
                                {(coverImagePreview || user?.coverImageUrl) ? (
                                  <Image
                                    src={coverImagePreview || fixImageUrl(user?.coverImageUrl || "")}
                                    alt="Cover preview"
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
                                )}
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                  <Upload className="h-8 w-8 text-white" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverImageChange}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Nome *</Label>
                              <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome completo"
                                className="focus:ring-2 focus:ring-primary"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="bio">Biografia</Label>
                              <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Conte sua história musical, suas influências e o que te inspira..."
                                rows={4}
                                maxLength={500}
                                className="resize-none focus:ring-2 focus:ring-primary"
                              />
                              <p className="text-xs text-muted-foreground">{bio.length}/500 caracteres</p>
                            </div>

                            {user?.role === "MUSICIAN" && (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="experience">Nível de Experiência</Label>
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
                                  <Label>Instrumentos & Habilidades</Label>
                                  <div className="flex gap-2">
                                    <Select value={newInstrument} onValueChange={setNewInstrument}>
                                      <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Escolha um instrumento" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {instrumentOptions.map((instrument) => (
                                          <SelectItem key={instrument} value={instrument}>
                                            {instrument}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      type="button"
                                      onClick={addInstrument}
                                      disabled={!newInstrument}
                                      size="icon"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  {instruments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {instruments.map((instrument) => (
                                        <Badge
                                          key={instrument}
                                          variant="secondary"
                                          className="pl-3 pr-1 py-1 hover:bg-destructive/20 transition-colors group"
                                        >
                                          {instrument}
                                          <button
                                            type="button"
                                            onClick={() => removeInstrument(instrument)}
                                            className="ml-2 rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <DialogFooter className="gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelEdit}
                            disabled={isSaving}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            onClick={saveProfile}
                            disabled={isSaving || !name.trim()}
                            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Alterações
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      asChild
                      className="group hover:scale-105 transition-transform"
                    >
                      <Link href={`/profile/${user?.id}`}>
                        <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        Visualizar
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {user?.bio && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Biografia
                        </h3>
                        <p className="text-sm leading-relaxed text-foreground/80 dark:text-gray-300">{user.bio}</p>
                      </div>
                    )}

                    {user?.role === "MUSICIAN" && (
                      <>
                        {user.experience && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                              Experiência
                            </h3>
                            <Badge variant="outline" className="font-normal">
                              {user.experience}
                            </Badge>
                          </div>
                        )}

                        {user.instruments && user.instruments.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                              <Guitar className="h-4 w-4" />
                              Instrumentos
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {user.instruments.map((instrument) => (
                                <Badge
                                  key={instrument}
                                  variant="secondary"
                                  className="bg-gradient-to-r from-primary/10 to-secondary/10"
                                >
                                  {instrument}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="projects" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <TabsTrigger value="projects" className="text-base">
                    <Music className="h-4 w-4 mr-2" />
                    Meus Projetos
                    {projects.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {projects.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="collaborations" className="text-base">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Colaborações
                    {collaborations.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {collaborations.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="projects" className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-foreground dark:text-gray-100">Projetos Criados</h2>
                    {user?.role === "COMPOSER" && (
                      <Button asChild size="sm" className="hover:scale-105 transition-transform">
                        <Link href="/projects/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Projeto
                        </Link>
                      </Button>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {projects.map((project) => (
                        <Card
                          key={project.id}
                          className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden border border-black/5 dark:border-white/10 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm"
                        >
                          <div className="relative h-40 w-full overflow-hidden">
                            <Image
                              src={fixImageUrl(project.imageUrl) || "/placeholder.svg?height=200&width=400"}
                              alt={project.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <h3 className="font-bold truncate text-lg group-hover:text-primary transition-colors text-foreground dark:text-gray-100">
                                {project.title}
                              </h3>
                              <p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-2">
                                {project.description || "Sem descrição"}
                              </p>
                            </div>
                            <div className="flex justify-between items-center">
                              <Badge variant="outline" className="dark:border-white/20 dark:text-gray-300">{project.genre}</Badge>
                              <Button asChild size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground dark:text-gray-300">
                                <Link href={`/projects/${project.id}`}>
                                  Ver Projeto →
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed border-black/15 dark:border-white/15 bg-white/40 dark:bg-[#111827]/40">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Music className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-foreground dark:text-gray-200">Nenhum projeto ainda</h3>
                        <p className="text-muted-foreground dark:text-gray-400 mb-6 max-w-sm">
                          Comece sua jornada musical criando seu primeiro projeto!
                        </p>
                        {user?.role === "COMPOSER" && (
                          <Button asChild>
                            <Link href="/projects/new">
                              <Plus className="h-4 w-4 mr-2" />
                              Criar Primeiro Projeto
                            </Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="collaborations" className="mt-6 space-y-4">
                  <h2 className="text-xl font-bold text-foreground dark:text-gray-100">Projetos em Colaboração</h2>

                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : collaborations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {collaborations.map((project) => (
                        <Card
                          key={project.id}
                          className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden border border-black/5 dark:border-white/10 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm"
                        >
                          <div className="relative h-40 w-full overflow-hidden">
                            <Image
                              src={fixImageUrl(project.imageUrl) || "/placeholder.svg?height=200&width=400"}
                              alt={project.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-primary/90 backdrop-blur-sm">
                                Colaborando
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <h3 className="font-bold truncate text-lg group-hover:text-primary transition-colors text-foreground dark:text-gray-100">
                                {project.title}
                              </h3>
                              <p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-2">
                                {project.description || "Sem descrição"}
                              </p>
                            </div>
                            <div className="flex justify-between items-center">
                              <Badge variant="outline" className="dark:border-white/20 dark:text-gray-300">{project.genre}</Badge>
                              <Button asChild size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground dark:text-gray-300">
                                <Link href={`/projects/${project.id}`}>
                                  Ver Projeto →
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed border-black/15 dark:border-white/15 bg-white/40 dark:bg-[#111827]/40">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Sparkles className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-foreground dark:text-gray-200">Nenhuma colaboração ainda</h3>
                        <p className="text-muted-foreground dark:text-gray-400 mb-6 max-w-sm">
                          Explore projetos e comece a colaborar com outros artistas!
                        </p>
                        <Button asChild>
                          <Link href="/explore">
                            <Music className="h-4 w-4 mr-2" />
                            Explorar Projetos
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        </div>
      </div>
    </AuthGuard>
  )
}
