"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Save, Download, Volume2, Mic, Music, Headphones, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import type { ProjectDetail } from "@/services/project-service"
import { TrackService } from "@/services/track-service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface AudioMixerProps {
  project: ProjectDetail
  onTrackUpdated?: () => void
}

interface TrackState {
  id: string
  name: string
  type: string
  volume: number[]
  pan: number[]
  mute: boolean
  solo: boolean
  audioElement?: HTMLAudioElement
}

export function AudioMixer({ project, onTrackUpdated }: AudioMixerProps) {
  const [tracks, setTracks] = useState<TrackState[]>([])
  const [masterVolume, setMasterVolume] = useState([80])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletingTrack, setIsDeletingTrack] = useState<string | null>(null)

  const { toast } = useToast()
  const { token } = useAuth()

  // Inicializar faixas do projeto
  useEffect(() => {
    if (project && project.tracks) {
      const initialTracks: TrackState[] = project.tracks.map((track) => ({
        id: track.id,
        name: track.name,
        type:
          track.name.toLowerCase().includes("voz") || track.name.toLowerCase().includes("vocal")
            ? "vocal"
            : "instrument",
        volume: [70],
        pan: [50],
        mute: false,
        solo: false,
      }))

      setTracks(initialTracks)
      setIsLoading(false)
    }
  }, [project])

  // Carregar áudios
  useEffect(() => {
    const loadAudio = async () => {
      const updatedTracks = [...tracks]

      for (let i = 0; i < updatedTracks.length; i++) {
        const track = updatedTracks[i]
        const projectTrack = project.tracks.find((t) => t.id === track.id)

        if (projectTrack && !track.audioElement) {
          const audio = new Audio(projectTrack.audioUrl)
          audio.volume = track.volume[0] / 100

          // Configurar pan (se suportado pelo navegador)
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const source = audioContext.createMediaElementSource(audio)
            const panNode = audioContext.createStereoPanner()

            // Converter valor de 0-100 para -1 a 1
            const panValue = (track.pan[0] - 50) / 50
            panNode.pan.value = panValue

            source.connect(panNode)
            panNode.connect(audioContext.destination)
          } catch (error) {
            console.error("Erro ao configurar pan:", error)
          }

          updatedTracks[i].audioElement = audio
        }
      }

      setTracks(updatedTracks)
    }

    if (tracks.length > 0 && !isLoading) {
      loadAudio()
    }

    // Cleanup
    return () => {
      tracks.forEach((track) => {
        if (track.audioElement) {
          track.audioElement.pause()
          track.audioElement.src = ""
        }
      })
    }
  }, [tracks, isLoading, project.tracks])

  const togglePlay = () => {
    if (isPlaying) {
      // Pausar todas as faixas
      tracks.forEach((track) => {
        if (track.audioElement) {
          track.audioElement.pause()
        }
      })
      setIsPlaying(false)
    } else {
      // Reproduzir faixas não silenciadas
      const soloTracks = tracks.filter((track) => track.solo)

      tracks.forEach((track) => {
        if (track.audioElement) {
          // Se alguma faixa estiver em solo, tocar apenas as faixas em solo
          if ((soloTracks.length === 0 && !track.mute) || track.solo) {
            track.audioElement.currentTime = 0
            track.audioElement.play().catch((error) => {
              console.error("Erro ao reproduzir áudio:", error)
            })
          }
        }
      })
      setIsPlaying(true)

      // Verificar quando todas as faixas terminarem
      const checkPlaybackEnd = setInterval(() => {
        const allEnded = tracks.every(
          (track) => !track.audioElement || track.audioElement.ended || track.audioElement.paused,
        )

        if (allEnded) {
          setIsPlaying(false)
          clearInterval(checkPlaybackEnd)
        }
      }, 500)
    }
  }

  const toggleMute = (trackId: string) => {
    setTracks(
      tracks.map((track) => {
        if (track.id === trackId) {
          const updatedTrack = { ...track, mute: !track.mute }

          // Atualizar volume do elemento de áudio
          if (updatedTrack.audioElement) {
            updatedTrack.audioElement.volume = updatedTrack.mute ? 0 : updatedTrack.volume[0] / 100
          }

          return updatedTrack
        }
        return track
      }),
    )
  }

  const toggleSolo = (trackId: string) => {
    const updatedTracks = tracks.map((track) => {
      if (track.id === trackId) {
        return { ...track, solo: !track.solo }
      }
      return track
    })

    setTracks(updatedTracks)

    // Atualizar reprodução se estiver tocando
    if (isPlaying) {
      const soloTracks = updatedTracks.filter((track) => track.solo)

      updatedTracks.forEach((track) => {
        if (track.audioElement) {
          if (soloTracks.length === 0 && !track.mute) {
            track.audioElement.play().catch(console.error)
          } else if (track.solo) {
            track.audioElement.play().catch(console.error)
          } else {
            track.audioElement.pause()
          }
        }
      })
    }
  }

  const updateTrackVolume = (trackId: string, value: number[]) => {
    setTracks(
      tracks.map((track) => {
        if (track.id === trackId) {
          const updatedTrack = { ...track, volume: value }

          // Atualizar volume do elemento de áudio
          if (updatedTrack.audioElement && !updatedTrack.mute) {
            updatedTrack.audioElement.volume = (value[0] / 100) * (masterVolume[0] / 100)
          }

          return updatedTrack
        }
        return track
      }),
    )
  }

  const updateTrackPan = (trackId: string, value: number[]) => {
    setTracks(
      tracks.map((track) => {
        if (track.id === trackId) {
          const updatedTrack = { ...track, pan: value }

          // Atualizar pan do elemento de áudio (se possível)
          if (updatedTrack.audioElement) {
            try {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
              const source = audioContext.createMediaElementSource(updatedTrack.audioElement)
              const panNode = audioContext.createStereoPanner()

              // Converter valor de 0-100 para -1 a 1
              const panValue = (value[0] - 50) / 50
              panNode.pan.value = panValue

              source.connect(panNode)
              panNode.connect(audioContext.destination)
            } catch (error) {
              console.error("Erro ao atualizar pan:", error)
            }
          }

          return updatedTrack
        }
        return track
      }),
    )
  }

  const updateMasterVolume = (value: number[]) => {
    setMasterVolume(value)

    // Atualizar volume de todas as faixas
    tracks.forEach((track) => {
      if (track.audioElement && !track.mute) {
        track.audioElement.volume = (track.volume[0] / 100) * (value[0] / 100)
      }
    })
  }

  const deleteTrack = async (trackId: string) => {
    if (!token) return

    setIsDeletingTrack(trackId)

    try {
      await TrackService.deleteTrack(trackId, token)

      // Remover a faixa da lista
      setTracks(tracks.filter((track) => track.id !== trackId))

      toast({
        title: "Faixa removida",
        description: "A faixa foi removida com sucesso do projeto.",
      })

      if (onTrackUpdated) {
        onTrackUpdated()
      }
    } catch (error) {
      console.error("Erro ao excluir faixa:", error)
      toast({
        title: "Erro ao remover faixa",
        description: "Não foi possível remover a faixa. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingTrack(null)
    }
  }

  const getTrackIcon = (type: string) => {
    switch (type) {
      case "vocal":
        return <Mic className="h-4 w-4" />
      case "instrument":
        return <Music className="h-4 w-4" />
      default:
        return <Headphones className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Mixer</h3>
            <div className="flex space-x-2">
              <Button
                variant={isPlaying ? "secondary" : "default"}
                size="sm"
                onClick={togglePlay}
                className="flex items-center gap-2"
                disabled={tracks.length === 0}
              >
                <Play className="h-4 w-4" />
                {isPlaying ? "Pausar" : "Reproduzir"}
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2" disabled>
                <Save className="h-4 w-4" />
                Salvar
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2" disabled>
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Volume Master</span>
              </div>
              <span className="text-sm text-muted-foreground">{masterVolume[0]}%</span>
            </div>
            <Slider value={masterVolume} onValueChange={updateMasterVolume} max={100} step={1} className="w-full" />
          </div>

          {tracks.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <p className="text-muted-foreground">Nenhuma faixa disponível. Grave ou adicione faixas ao projeto.</p>
            </div>
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="vocals">Vocais</TabsTrigger>
                <TabsTrigger value="instruments">Instrumentos</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="space-y-4">
                  {tracks.map((track) => (
                    <div key={track.id} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getTrackIcon(track.type)}
                          <span className="font-medium">{track.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`mute-${track.id}`}
                              checked={track.mute}
                              onCheckedChange={() => toggleMute(track.id)}
                            />
                            <Label htmlFor={`mute-${track.id}`}>Mudo</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`solo-${track.id}`}
                              checked={track.solo}
                              onCheckedChange={() => toggleSolo(track.id)}
                            />
                            <Label htmlFor={`solo-${track.id}`}>Solo</Label>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover faixa</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover esta faixa? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTrack(track.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {isDeletingTrack === track.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Remover"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Volume</span>
                            <span className="text-sm text-muted-foreground">{track.volume[0]}%</span>
                          </div>
                          <Slider
                            value={track.volume}
                            onValueChange={(value) => updateTrackVolume(track.id, value)}
                            max={100}
                            step={1}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Pan</span>
                            <span className="text-sm text-muted-foreground">
                              {track.pan[0] < 50
                                ? `${Math.abs(track.pan[0] - 50) * 2}% L`
                                : track.pan[0] > 50
                                  ? `${(track.pan[0] - 50) * 2}% R`
                                  : "C"}
                            </span>
                          </div>
                          <Slider
                            value={track.pan}
                            onValueChange={(value) => updateTrackPan(track.id, value)}
                            max={100}
                            step={1}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="vocals" className="mt-4">
                <div className="space-y-4">
                  {tracks
                    .filter((track) => track.type === "vocal")
                    .map((track) => (
                      <div key={track.id} className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Mic className="h-4 w-4" />
                            <span className="font-medium">{track.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`mute-vocal-${track.id}`}
                                checked={track.mute}
                                onCheckedChange={() => toggleMute(track.id)}
                              />
                              <Label htmlFor={`mute-vocal-${track.id}`}>Mudo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`solo-vocal-${track.id}`}
                                checked={track.solo}
                                onCheckedChange={() => toggleSolo(track.id)}
                              />
                              <Label htmlFor={`solo-vocal-${track.id}`}>Solo</Label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Volume</span>
                              <span className="text-sm text-muted-foreground">{track.volume[0]}%</span>
                            </div>
                            <Slider
                              value={track.volume}
                              onValueChange={(value) => updateTrackVolume(track.id, value)}
                              max={100}
                              step={1}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Pan</span>
                              <span className="text-sm text-muted-foreground">
                                {track.pan[0] < 50
                                  ? `${Math.abs(track.pan[0] - 50) * 2}% L`
                                  : track.pan[0] > 50
                                    ? `${(track.pan[0] - 50) * 2}% R`
                                    : "C"}
                              </span>
                            </div>
                            <Slider
                              value={track.pan}
                              onValueChange={(value) => updateTrackPan(track.id, value)}
                              max={100}
                              step={1}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                  {tracks.filter((track) => track.type === "vocal").length === 0 && (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-muted-foreground">Nenhuma faixa vocal disponível.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="instruments" className="mt-4">
                <div className="space-y-4">
                  {tracks
                    .filter((track) => track.type === "instrument")
                    .map((track) => (
                      <div key={track.id} className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Music className="h-4 w-4" />
                            <span className="font-medium">{track.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`mute-inst-${track.id}`}
                                checked={track.mute}
                                onCheckedChange={() => toggleMute(track.id)}
                              />
                              <Label htmlFor={`mute-inst-${track.id}`}>Mudo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`solo-inst-${track.id}`}
                                checked={track.solo}
                                onCheckedChange={() => toggleSolo(track.id)}
                              />
                              <Label htmlFor={`solo-inst-${track.id}`}>Solo</Label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Volume</span>
                              <span className="text-sm text-muted-foreground">{track.volume[0]}%</span>
                            </div>
                            <Slider
                              value={track.volume}
                              onValueChange={(value) => updateTrackVolume(track.id, value)}
                              max={100}
                              step={1}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Pan</span>
                              <span className="text-sm text-muted-foreground">
                                {track.pan[0] < 50
                                  ? `${Math.abs(track.pan[0] - 50) * 2}% L`
                                  : track.pan[0] > 50
                                    ? `${(track.pan[0] - 50) * 2}% R`
                                    : "C"}
                              </span>
                            </div>
                            <Slider
                              value={track.pan}
                              onValueChange={(value) => updateTrackPan(track.id, value)}
                              max={100}
                              step={1}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                  {tracks.filter((track) => track.type === "instrument").length === 0 && (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-muted-foreground">Nenhuma faixa de instrumento disponível.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

