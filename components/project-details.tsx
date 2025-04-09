"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ProjectService, type ProjectDetail } from "@/services/project-service"

interface ProjectDetailsProps {
  project: ProjectDetail
  onProjectUpdated?: () => void
}

export function ProjectDetails({ project, onProjectUpdated }: ProjectDetailsProps) {
  const [projectName, setProjectName] = useState(project.title)
  const [bpm, setBpm] = useState([project.bpm])
  const [key, setKey] = useState(project.key)
  const [genre, setGenre] = useState(project.genre)
  const [description, setDescription] = useState(project.description || "")
  const [neededInstruments, setNeededInstruments] = useState<string[]>(project.neededInstruments || [])
  const [newInstrument, setNewInstrument] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { toast } = useToast()
  const { user, token } = useAuth()

  // Atualizar estado quando o projeto mudar
  useEffect(() => {
    setProjectName(project.title)
    setBpm([project.bpm])
    setKey(project.key)
    setGenre(project.genre)
    setDescription(project.description || "")
    setNeededInstruments(project.neededInstruments || [])
  }, [project])

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
      setNeededInstruments([...neededInstruments, newInstrument])
      setNewInstrument("")
    }
  }

  const removeInstrument = (instrumentToRemove: string) => {
    setNeededInstruments(neededInstruments.filter((instrument) => instrument !== instrumentToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addInstrument()
    }
  }

  const saveProject = async () => {
    if (!token) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para editar o projeto.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      await ProjectService.updateProject(
        project.id,
        {
          title: projectName,
          description,
          genre,
          key,
          bpm: bpm[0],
          neededInstruments,
        },
        token,
      )

      toast({
        title: "Projeto atualizado",
        description: "As alterações foram salvas com sucesso.",
      })

      setIsEditing(false)

      if (onProjectUpdated) {
        onProjectUpdated()
      }
    } catch (error) {
      console.error("Erro ao atualizar projeto:", error)
      toast({
        title: "Erro ao atualizar projeto",
        description: "Não foi possível salvar as alterações. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const isAuthor = user?.id === project.authorId

  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detalhes do Projeto</CardTitle>
          {isAuthor && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">{projectName}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description || "Sem descrição"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Gênero</p>
              <p className="font-medium">{genre}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tonalidade</p>
              <p className="font-medium">{key}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">BPM (Andamento)</p>
            <p className="font-medium">{project.bpm}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Instrumentos necessários</p>
            {neededInstruments.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {neededInstruments.map((instrument) => (
                  <Badge key={instrument} variant="secondary">
                    {instrument}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm">Nenhum instrumento específico necessário</p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Detalhes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Nome do Projeto</Label>
          <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="key">Tonalidade</Label>
            <Select value={key} onValueChange={setKey}>
              <SelectTrigger id="key">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {musicalKeys.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Gênero</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger id="genre">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>BPM (Andamento)</Label>
            <span className="text-sm text-muted-foreground">{bpm[0]}</span>
          </div>
          <Slider value={bpm} onValueChange={(value) => setBpm(value)} min={40} max={220} step={1} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva seu projeto musical..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instruments">Instrumentos Necessários</Label>
          <div className="flex">
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
            <Button type="button" onClick={addInstrument} className="ml-2" disabled={!newInstrument}>
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
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={saveProject} disabled={isSaving} className="flex-1">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Projeto"
            )}
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

