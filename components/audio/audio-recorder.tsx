"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mic, Square, Save, Play, Pause, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { TrackService } from "@/services/track-service"
import { useAuth } from "@/contexts/auth-context"

interface AudioRecorderProps {
  projectId?: string
  onTrackSaved?: () => void
}

export function AudioRecorder({ projectId, onTrackSaved }: AudioRecorderProps) {
  const [trackName, setTrackName] = useState("Nova Faixa")
  const [volume, setVolume] = useState([75])
  const [isSaving, setIsSaving] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const { isRecording, audioURL, startRecording, stopRecording, resetRecording } = useAudioRecorder()
  const { isPlaying, play, pause } = useAudioPlayer(audioURL)

  const { toast } = useToast()
  const { token } = useAuth()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)

  // Configurar visualização de áudio
  useEffect(() => {
    if (isRecording && !analyserRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256

        const bufferLength = analyserRef.current.frequencyBinCount
        dataArrayRef.current = new Uint8Array(bufferLength)

        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            const source = audioContextRef.current!.createMediaStreamSource(stream)
            source.connect(analyserRef.current!)

            // Iniciar animação
            animateWaveform()
          })
          .catch((err) => {
            console.error("Erro ao acessar microfone para visualização:", err)
          })
      } catch (err) {
        console.error("Erro ao configurar visualização de áudio:", err)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error)
      }
    }
  }, [isRecording])

  // Quando o áudio é gravado, converter URL para Blob
  useEffect(() => {
    if (audioURL) {
      fetch(audioURL)
        .then((response) => response.blob())
        .then((blob) => {
          setAudioBlob(blob)
        })
        .catch((error) => {
          console.error("Erro ao converter URL para Blob:", error)
        })
    } else {
      setAudioBlob(null)
    }
  }, [audioURL])

  const animateWaveform = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)

      analyserRef.current!.getByteTimeDomainData(dataArrayRef.current!)

      ctx.fillStyle = "rgb(20, 20, 20)"
      ctx.fillRect(0, 0, width, height)

      ctx.lineWidth = 2
      ctx.strokeStyle = "rgb(0, 200, 100)"
      ctx.beginPath()

      const sliceWidth = width / dataArrayRef.current!.length
      let x = 0

      for (let i = 0; i < dataArrayRef.current!.length; i++) {
        const v = dataArrayRef.current![i] / 128.0
        const y = (v * height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.lineTo(width, height / 2)
      ctx.stroke()
    }

    draw()
  }

  const saveAudio = async () => {
    if (!audioBlob || !projectId || !token) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a gravação. Verifique se você está logado e se gravou um áudio.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Criar um arquivo a partir do blob
      const audioFile = new File([audioBlob], `${trackName}.wav`, { type: "audio/wav" })

      // Calcular duração aproximada (em segundos)
      const audio = new Audio(audioURL!)
      const duration = audio.duration || 0

      await TrackService.createTrack(
        {
          name: trackName,
          projectId,
          duration,
        },
        audioFile,
        token,
      )

      toast({
        title: "Faixa salva com sucesso",
        description: "Sua gravação foi adicionada ao projeto.",
      })

      // Resetar o gravador
      resetRecording()
      setTrackName("Nova Faixa")

      // Notificar o componente pai
      if (onTrackSaved) {
        onTrackSaved()
      }
    } catch (error) {
      console.error("Erro ao salvar faixa:", error)
      toast({
        title: "Erro ao salvar faixa",
        description: "Não foi possível salvar sua gravação. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-center">
            <div className="relative h-32 w-32 rounded-full bg-muted flex items-center justify-center">
              <Mic className={`h-16 w-16 ${isRecording ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
            </div>
          </div>

          <div className="space-y-4">
            {audioURL && (
              <div className="space-y-2">
                <Label htmlFor="track-name">Nome da Faixa</Label>
                <Input
                  id="track-name"
                  value={trackName}
                  onChange={(e) => setTrackName(e.target.value)}
                  placeholder="Ex: Violão Base"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Volume</span>
                <span className="text-sm text-muted-foreground">{volume[0]}%</span>
              </div>
              <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {isRecording ? (
              <Button variant="destructive" size="lg" onClick={stopRecording} className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Parar Gravação
              </Button>
            ) : (
              <Button variant="default" size="lg" onClick={startRecording} className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Iniciar Gravação
              </Button>
            )}

            {audioURL && !isRecording && (
              <>
                {isPlaying ? (
                  <Button variant="outline" size="lg" onClick={pause} className="flex items-center gap-2">
                    <Pause className="h-4 w-4" />
                    Pausar
                  </Button>
                ) : (
                  <Button variant="outline" size="lg" onClick={play} className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Reproduzir
                  </Button>
                )}

                {projectId && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={saveAudio}
                    className="flex items-center gap-2"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Salvar no Projeto
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="pt-4">
            <p className="text-sm font-medium mb-2">Visualização da forma de onda:</p>
            <div className="h-24 bg-muted rounded-md flex items-center justify-center overflow-hidden">
              {isRecording || audioURL ? (
                <canvas ref={canvasRef} width={600} height={100} className="w-full h-full" />
              ) : (
                <p className="text-sm text-muted-foreground">Inicie a gravação para visualizar a forma de onda</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}