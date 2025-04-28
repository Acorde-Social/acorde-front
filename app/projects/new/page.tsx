"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ProjectService } from "@/services/project-service"
import { AuthGuard } from "@/components/auth-guard"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { projectSchema } from "@/lib/validations"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import * as z from "zod"

// Defina o tipo explicitamente usando a inferência do Zod
type ProjectFormValues = {
  title: string
  description: string
  genre: string
  key: string
  bpm: number
  neededInstruments: string[]
  image?: any
}

export default function NewProjectPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const { toast } = useToast()

  const [projectImage, setProjectImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [neededInstruments, setNeededInstruments] = useState<string[]>([])
  const [newInstrument, setNewInstrument] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Define o formulário com tipagem explícita
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      genre: "",
      key: "",
      bpm: 120,
      neededInstruments: [],
    },
  })

  const musicalKeys = [
    "C Maior",
    "C#/Db Maior",
    "D Maior",
    "D#/Eb Maior",
    "E Maior",
    "F Maior",
    "F#/Gb Maior",
    "G Maior",
    "G#/Ab Maior",
    "A Maior",
    "A#/Bb Maior",
    "B Maior",
    "A Menor",
    "A#/Bb Menor",
    "B Menor",
    "C Menor",
    "C#/Db Menor",
    "D Menor",
    "D#/Eb Menor",
    "E Menor",
    "F Menor",
    "F#/Gb Menor",
    "G Menor",
    "G#/Ab Menor",
  ]

  const genres = [
    "Pop",
    "Rock",
    "Jazz",
    "Blues",
    "Clássica",
    "Eletrônica",
    "Hip Hop",
    "R&B",
    "Country",
    "Folk",
    "Reggae",
    "Metal",
    "Funk",
    "Soul",
    "Indie",
    "MPB",
    "Samba",
    "Bossa Nova",
    "Sertanejo",
    "Forró",
    "Trap",
    "Lo-fi",
    "Ambient",
    "Experimental",
  ]

  const instruments = [
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

  const addInstrument = () => {
    if (newInstrument && !neededInstruments.includes(newInstrument)) {
      const updatedInstruments = [...neededInstruments, newInstrument]
      setNeededInstruments(updatedInstruments)
      form.setValue("neededInstruments", updatedInstruments)
      setNewInstrument("")
    }
  }

  const removeInstrument = (instrumentToRemove: string) => {
    const updatedInstruments = neededInstruments.filter((instrument) => instrument !== instrumentToRemove)
    setNeededInstruments(updatedInstruments)
    form.setValue("neededInstruments", updatedInstruments)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validar tamanho do arquivo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        })
        return
      }

      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione uma imagem",
          variant: "destructive",
        })
        return
      }

      setProjectImage(file)

      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Função que lida com a submissão do formulário
  const onSubmit = async (values: ProjectFormValues) => {
    if (!token) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para criar um projeto.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Criar um objeto FormData para enviar os dados
      const formData = new FormData()
      formData.append("title", values.title)
      if (values.description) {
        formData.append("description", values.description)
      }
      formData.append("genre", values.genre)
      formData.append("key", values.key)
      formData.append("bpm", values.bpm.toString())

      // Sempre enviar o campo neededInstruments, mesmo que seja um array vazio
      formData.append("neededInstruments", JSON.stringify(neededInstruments))

      // Adicionar a imagem se existe (importante verificar se é um arquivo válido)
      if (projectImage && projectImage instanceof File) {
        formData.append("image", projectImage)
      }

      const newProject = await ProjectService.createProject(formData, token)

      toast({
        title: "Projeto criado com sucesso!",
        description: "Seu novo projeto foi criado e já está disponível.",
      })

      // Redirecionar para a página do projeto
      router.push(`/projects/${newProject.id}`)
    } catch (error) {
      console.error("Erro ao criar projeto:", error)
      toast({
        title: "Erro ao criar projeto",
        description: "Não foi possível criar o projeto. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthGuard requiredRole="COMPOSER">
      <div className="px-4 py-6 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Criar Novo Projeto</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                    <CardDescription>Defina os detalhes principais do seu projeto musical</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do Projeto *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Melodia do Amanhecer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva seu projeto musical, o que você busca, inspirações, etc."
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="genre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gênero Musical *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o gênero" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {genres.map((genre) => (
                                  <SelectItem key={genre} value={genre}>
                                    {genre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="key"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tonalidade *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a tonalidade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {musicalKeys.map((key) => (
                                  <SelectItem key={key} value={key}>
                                    {key}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bpm"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>BPM (Andamento)</FormLabel>
                            <span className="text-sm text-muted-foreground">{field.value}</span>
                          </div>
                          <FormControl>
                            <Controller
                              control={form.control as any}
                              name="bpm"
                              render={({ field: { onChange, value } }) => (
                                <Slider
                                  value={[value]}
                                  onValueChange={(values) => onChange(values[0])}
                                  min={40}
                                  max={220}
                                  step={1}
                                />
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Instrumentos Necessários</CardTitle>
                    <CardDescription>Indique quais instrumentos você está procurando para seu projeto</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Select value={newInstrument} onValueChange={setNewInstrument}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione um instrumento" />
                        </SelectTrigger>
                        <SelectContent>
                          {instruments.map((instrument) => (
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
                      {neededInstruments.map((instrument) => (
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

                      {neededInstruments.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Nenhum instrumento adicionado. Adicione os instrumentos que você precisa para seu projeto.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Imagem do Projeto</CardTitle>
                    <CardDescription>Adicione uma imagem para representar seu projeto</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      <div className="relative w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <>
                            <img
                              src={imagePreview || "/placeholder.svg"}
                              alt="Preview"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-8 w-8 p-0"
                              onClick={() => {
                                setProjectImage(null)
                                setImagePreview(null)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Clique para selecionar ou arraste uma imagem
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Finalizar</CardTitle>
                    <CardDescription>Revise as informações e crie seu projeto</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Após criar o projeto, você poderá adicionar faixas de áudio, convidar colaboradores e gerenciar
                      todos os aspectos da sua composição.
                    </p>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando projeto...
                        </>
                      ) : (
                        "Criar Projeto"
                      )}
                    </Button>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>
                      Cancelar
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AuthGuard>
  )
}

