"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, X, Music, Guitar, LayoutTemplate, LayoutDashboard, Layout } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"
import { ProjectService } from "@/services/project-service"
import { cn, fixImageUrl } from "@/lib/utils"
import { LayoutContainer } from "@/components/layout/layout-container"
import { ThemePreview } from "@/components/theme-preview"
import { useThemeCustomization, type ThemeLayout } from "@/hooks/use-theme-customization"
import { API_URL } from "@/lib/api-config"
import type { Project } from "@/types"
import "./profile.css"

export default function ProfilePage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { themeConfig, setThemeConfig } = useThemeCustomization()

  // Swatch palette for color customization
  const colorOptions = [
    '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD',
    '#6C757D', '#495057', '#343A40', '#212529', '#FF3366', '#3366FF',
    '#33CC66', '#9933FF', '#FF9933', '#000000'
  ]

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [instruments, setInstruments] = useState<string[]>([])
  const [experience, setExperience] = useState("")
  const [newInstrument, setNewInstrument] = useState("")

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState(themeConfig.primaryColor || "#000000")
  const [secondaryColor, setSecondaryColor] = useState(themeConfig.secondaryColor || "#3366FF")
  const [backgroundColor, setBackgroundColor] = useState(themeConfig.backgroundColor || "#FFFFFF")
  const [fontFamily, setFontFamily] = useState(themeConfig.fontFamily || "Arial, Helvetica, sans-serif")
  const [fontSize, setFontSize] = useState(themeConfig.fontSize || "16px")
  const [borderRadius, setBorderRadius] = useState(themeConfig.borderRadius || "0.5rem")
  const [layout, setLayout] = useState(themeConfig.layout || "default")

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [projectsFetched, setProjectsFetched] = useState(false)

  const [projects, setProjects] = useState<Project[]>([])
  const [collaborations, setCollaborations] = useState<Project[]>([])

  const fetchUserProjects = async () => {
    if (!token || !user || projectsFetched) return

    setIsLoading(true)
    try {
      const [userProjects, collaboratingProjects] = await Promise.all([
        ProjectService.getUserProjects(token),
        ProjectService.getUserCollaborations(token)
      ])

      setProjects(userProjects)
      setCollaborations(collaboratingProjects.slice(0, 3)) // Limitando a 3 colaborações
      setProjectsFetched(true)
    } catch (error) {
      console.error("Erro ao buscar projetos:", error)
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

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
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

  const saveProfile = async () => {
    if (!token) return
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('bio', bio || '')
      formData.append('experience', experience || '')

      // Garantir que instruments seja enviado como um array válido
      const instrumentsArray = instruments || []
      formData.append('instruments', JSON.stringify(instrumentsArray))

      // Garantir que themeConfig seja enviado como um objeto válido
      const themeConfigObject = {
        primaryColor,
        secondaryColor,
        backgroundColor,
        fontFamily,
        fontSize,
        borderRadius,
        layout
      }
      formData.append('themeConfig', JSON.stringify(themeConfigObject))

      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      if (coverImageFile) {
        formData.append('coverImage', coverImageFile)
      }

      // Preparando dados para envio
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erro da API:', errorData)
        throw new Error(errorData.message || 'Erro ao atualizar perfil')
      }

      const updatedUser = await response.json()

      // Limpar os previews para usar as URLs do servidor
      setAvatarPreview(null)
      setCoverImagePreview(null)
      setAvatarFile(null)
      setCoverImageFile(null)

      // Atualizar contexto do usuário
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('user:update', { detail: updatedUser })
        window.dispatchEvent(event)
      }

      setThemeConfig({
        primaryColor,
        secondaryColor,
        backgroundColor,
        fontFamily,
        fontSize,
        borderRadius,
        layout
      })

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      })

      router.refresh()
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

  const handleLayoutChange = (value: ThemeLayout) => {
    setLayout(value)
    setThemeConfig({ ...themeConfig, layout: value })
  }

  useEffect(() => {
    if (user) {
      setName(user.name)
      setBio(user.bio || "")
      setInstruments(user.instruments || [])
      setExperience(user.experience || "")
      // NÃO definir previews aqui - eles são apenas para uploads locais
      // setAvatarPreview(user.avatarUrl || null)
      // setCoverImagePreview(user.coverImageUrl || null)
      setPrimaryColor(user.themeConfig?.primaryColor || "#000000")
      setSecondaryColor(user.themeConfig?.secondaryColor || "#3366FF")
      setBackgroundColor(user.themeConfig?.backgroundColor || "#FFFFFF")
      setFontFamily(user.themeConfig?.fontFamily || "Arial, Helvetica, sans-serif")
      setFontSize(user.themeConfig?.fontSize || "16px")
      setBorderRadius(user.themeConfig?.borderRadius || "0.5rem")
      setLayout(user.themeConfig?.layout || "default")
    }
  }, [user])

  useEffect(() => {
    if (user && token && !projectsFetched) {
      fetchUserProjects()
    }
  }, [user, token, projectsFetched])

  return (
    <AuthGuard>
      <div className={`w-full profile-layout-${layout}`}>
        {/* Header com imagem de capa */}
        <div className="profile-header">
          {coverImagePreview || user?.coverImageUrl ? (
            <Image
              src={coverImagePreview || fixImageUrl(user?.coverImageUrl || "")}
              alt="Cover"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-background" />
          )}
          {isEditing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 cover-upload-overlay">
              <label className="cursor-pointer group">
                <div className="flex flex-col items-center gap-3 text-white">
                  <div className="p-3 rounded-full bg-primary/90 group-hover:bg-primary transition-colors">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">Alterar imagem de capa</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Conteúdo principal */}
        <div className="profile-container px-4 lg:px-8">
          <div className="grid w-full grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna de perfil */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="profile-card">
                {/* Avatar do usuário */}
                <div className="avatar-edit-container flex justify-center">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                      <AvatarImage
                        src={avatarPreview || fixImageUrl(user?.avatarUrl || "")}
                        alt={name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                        {name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="avatar-edit-button">
                        <label className="cursor-pointer">
                          <Upload className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl">{name}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="mt-4"
                    >
                      Editar Perfil
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="edit-form">
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

                            <div className="instruments-container">
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

                      <div className="space-y-2">
                        <Label>Personalização</Label>

                        <div className="grid gap-4">
                          <ThemePreview
                            primaryColor={primaryColor}
                            secondaryColor={secondaryColor}
                            backgroundColor={backgroundColor}
                            fontFamily={fontFamily}
                            fontSize={fontSize}
                            borderRadius={borderRadius}
                            layout={layout}
                          />

                          <div className="space-y-2">
                            <Label htmlFor="primaryColor">Cor Primária</Label>
                            <div className="flex flex-wrap gap-2">
                              {colorOptions.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  className={cn(
                                    "w-8 h-8 rounded-full border-2",
                                    primaryColor === color ? "border-primary ring-2 ring-primary/30" : "border-muted"
                                  )}
                                  style={{ backgroundColor: color }}
                                  onClick={() => setPrimaryColor(color)}
                                />
                              ))}
                              <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-8 h-8 p-0 border-2 border-muted rounded"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="secondaryColor">Cor Secundária</Label>
                            <div className="flex flex-wrap gap-2">
                              {colorOptions.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  className={cn(
                                    "w-8 h-8 rounded-full border-2",
                                    secondaryColor === color ? "border-primary ring-2 ring-primary/30" : "border-muted"
                                  )}
                                  style={{ backgroundColor: color }}
                                  onClick={() => setSecondaryColor(color)}
                                />
                              ))}
                              <input
                                type="color"
                                value={secondaryColor}
                                onChange={(e) => setSecondaryColor(e.target.value)}
                                className="w-8 h-8 p-0 border-2 border-muted rounded"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                            <div className="flex flex-wrap gap-2">
                              {colorOptions.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  className={cn(
                                    "w-8 h-8 rounded-full border-2",
                                    backgroundColor === color ? "border-primary ring-2 ring-primary/30" : "border-muted"
                                  )}
                                  style={{ backgroundColor: color }}
                                  onClick={() => setBackgroundColor(color)}
                                />
                              ))}
                              <input
                                type="color"
                                value={backgroundColor}
                                onChange={(e) => setBackgroundColor(e.target.value)}
                                className="w-8 h-8 p-0 border-2 border-muted rounded"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="fontFamily">Fonte</Label>
                            <Select value={fontFamily} onValueChange={setFontFamily}>
                              <SelectTrigger>
                                <SelectValue placeholder="Escolha uma fonte" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Arial, Helvetica, sans-serif">Sans Serif</SelectItem>
                                <SelectItem value="'Courier New', Courier, monospace">Monospace</SelectItem>
                                <SelectItem value="'Georgia, serif'">Serif</SelectItem>
                                <SelectItem value="'Times New Roman', Times, serif">Times</SelectItem>
                                <SelectItem value="'Trebuchet MS', Helvetica, sans-serif">Trebuchet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="fontSize">Tamanho da Fonte</Label>
                            <Select value={fontSize} onValueChange={setFontSize}>
                              <SelectTrigger>
                                <SelectValue placeholder="Escolha um tamanho" />
                              </SelectTrigger>
                              <SelectContent>
                                {["12px", "14px", "16px", "18px", "20px", "24px"].map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="borderRadius">Raio da Borda</Label>
                            <Select value={borderRadius} onValueChange={setBorderRadius}>
                              <SelectTrigger>
                                <SelectValue placeholder="Escolha um raio" />
                              </SelectTrigger>
                              <SelectContent>
                                {["0.25rem", "0.5rem", "0.75rem", "1rem", "1.25rem", "1.5rem"].map((radius) => (
                                  <SelectItem key={radius} value={radius}>
                                    {radius}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="layout">Layout</Label>
                            <Select value={layout} onValueChange={handleLayoutChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Escolha um layout" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default">
                                  <div className="flex items-center gap-2">
                                    <LayoutTemplate className="h-4 w-4" />
                                    <span>Padrão</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="compact">
                                  <div className="flex items-center gap-2">
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Compacto</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="spacious">
                                  <div className="flex items-center gap-2">
                                    <Layout className="h-4 w-4" />
                                    <span>Espaçoso</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

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
                              <div className="instruments-container">
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

            {/* Coluna de projetos */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="projects" className="tabs-container">
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
                            <Card key={project.id} className="project-card">
                              <div className="relative h-32 w-full">
                                <Image
                                  src={project.image || "/placeholder.svg?height=200&width=400"}
                                  alt={project.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <CardContent className="p-4 card-content">
                                <h3 className="font-bold truncate">{project.title}</h3>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {project.description || "Sem descrição"}
                                </p>
                                <div className="flex justify-between items-center mt-auto">
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
                            <Card key={project.id} className="project-card">
                              <div className="relative h-32 w-full">
                                <Image
                                  src={project.image || "/placeholder.svg?height=200&width=400"}
                                  alt={project.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <CardContent className="p-4 card-content">
                                <h3 className="font-bold truncate">{project.title}</h3>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {project.description || "Sem descrição"}
                                </p>
                                <div className="flex justify-between items-center mt-auto">
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
      </div>
    </AuthGuard>
  )
}

