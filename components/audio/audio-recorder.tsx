"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mic, Square, Save, Play, Pause, Loader2, Clock, Layers, Music, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { TrackService } from "@/services/track-service"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { AudioTuner } from "@/components/audio/audio-tuner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AudioEditor } from "@/components/audio/audio-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { API_URL } from "@/lib/api-config"

interface AudioRecorderProps {
  projectId?: string
  onTrackSaved?: () => void
  simplified?: boolean
  onCancel?: () => void
  existingTrackUrl?: string
  collaborationMode?: boolean  // Indica se estamos gravando uma colaboração
  originalTrackId?: string     // ID do áudio original que estamos colaborando
}

export function AudioRecorder({
  projectId,
  onTrackSaved,
  simplified = false,
  onCancel,
  existingTrackUrl,
  collaborationMode = false,
  originalTrackId
}: AudioRecorderProps) {
  const [trackName, setTrackName] = useState(
    simplified ? "Post de áudio" :
      collaborationMode ? "Colaboração" :
        "Nova Faixa"
  )
  const [volume, setVolume] = useState([75])
  const [isSaving, setIsSaving] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [description, setDescription] = useState("")
  const [isMetronomeActive, setIsMetronomeActive] = useState(false)
  const [isTunerActive, setIsTunerActive] = useState(false)
  const [bpm, setBpm] = useState(100)
  const [isOverdubMode, setIsOverdubMode] = useState(collaborationMode) // Ativar overdub por padrão no modo colaboração
  const [recordingStatus, setRecordingStatus] = useState<"idle" | "recording" | "paused" | "finished">("idle")
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showEditor, setShowEditor] = useState(false)

  const {
    isRecording,
    audioURL,
    startRecording,
    stopRecording,
    resetRecording,
    availableDevices,
    selectedDeviceId,
    setSelectedDeviceId
  } = useAudioRecorder()
  const { isPlaying, play, pause } = useAudioPlayer(audioURL)

  const { toast } = useToast()
  const { token, user } = useAuth()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const metronomeRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const existingTrackRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

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

  useEffect(() => {
    if (isMetronomeActive) {
      startMetronome();
    } else {
      stopMetronome();
    }

    return () => {
      stopMetronome();
    }
  }, [isMetronomeActive, bpm]);

  useEffect(() => {
    if (existingTrackUrl && isOverdubMode && existingTrackRef.current) {
      existingTrackRef.current.src = existingTrackUrl;
      existingTrackRef.current.load();
    }
  }, [existingTrackUrl, isOverdubMode]);

  // Configurar visualização de áudio de forma simples
  useEffect(() => {
    if (isRecording) {
      try {
        // Método simples para criar o visualizador de forma de onda
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            // Armazenar a stream para referência
            streamRef.current = stream;

            // Criar contexto de áudio se não existir
            if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;

            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            // Iniciar animação
            animateWaveform();
          })
          .catch(err => {
            console.log("Erro ao acessar microfone para visualização:", err);
            // Continuar com a gravação mesmo sem visualização
          });
      } catch (err) {
        console.error("Erro ao configurar visualizador:", err);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

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

  const startMetronome = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (metronomeRef.current) {
      clearInterval(metronomeRef.current);
    }

    const beatsPerSecond = bpm / 60;
    const intervalMs = 1000 / beatsPerSecond;

    metronomeRef.current = setInterval(() => {
      const oscillator = audioContextRef.current!.createOscillator();
      const gainNode = audioContextRef.current!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current!.destination);

      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1 * (volume[0] / 100);

      oscillator.start();
      oscillator.stop(audioContextRef.current!.currentTime + 0.05);
    }, intervalMs);
  };

  const stopMetronome = () => {
    if (metronomeRef.current) {
      clearInterval(metronomeRef.current);
      metronomeRef.current = null;
    }
  };

  const handleStartRecording = useCallback(async () => {
    try {
      setRecordingStatus("recording");

      if (isOverdubMode && existingTrackUrl && existingTrackRef.current) {
        existingTrackRef.current.currentTime = 0;
        existingTrackRef.current.play();
      }

      await startRecording();

      setElapsedTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Erro ao iniciar gravação:", err);
      setRecordingStatus("idle");
      toast({
        title: "Erro ao acessar microfone",
        description: "Verifique se o microfone está conectado e permitido nas configurações do navegador.",
        variant: "destructive",
      });
    }
  }, [isOverdubMode, existingTrackUrl, startRecording, toast]);

  const handleStopRecording = useCallback(() => {
    console.log("Gravação finalizada, atualizando status para finished");
    setRecordingStatus("finished");
    stopRecording();

    if (existingTrackRef.current) {
      existingTrackRef.current.pause();
      existingTrackRef.current.currentTime = 0;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Mostra um toast para indicar que o botão de edição está disponível
    toast({
      title: "Gravação finalizada",
      description: "Você pode usar o botão 'Editar Áudio' para ajustar seu áudio antes de salvar.",
    });

    // Garantir que o recordingStatus está realmente setado como "finished"
    setTimeout(() => {
      console.log("Estado atual:", recordingStatus);
      if (recordingStatus !== "finished") {
        console.log("Estado não foi atualizado, forçando atualização");
        setRecordingStatus("finished");
      }
    }, 300);
  }, [stopRecording, toast, recordingStatus]);

  const saveAudio = async () => {
    if (!audioBlob || !token) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a gravação. Verifique se você está logado e se gravou um áudio.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const audioFile = new File([audioBlob], `${trackName}.wav`, { type: "audio/wav" })

      // Método alternativo para obter duração mais confiável
      const getDuration = async (blob: Blob): Promise<number> => {
        return new Promise((resolve) => {
          // Cria um elemento de áudio temporário
          const audio = new Audio();
          audio.preload = 'metadata';

          // Manipula eventos
          const onLoadedMetadata = () => {
            // Se a duração for Infinity ou NaN, use o tempo gravado como fallback
            const duration = isFinite(audio.duration) ? audio.duration : elapsedTime;
            URL.revokeObjectURL(audio.src);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.remove();
            resolve(duration);
          };

          // Se não conseguir carregar os metadados em 2 segundos, usa o tempo de gravação
          const timeoutId = setTimeout(() => {
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.remove();
            URL.revokeObjectURL(audio.src);
            console.warn("Falha ao obter duração dos metadados, usando tempo de gravação");
            resolve(elapsedTime || 0);
          }, 2000);

          audio.addEventListener('loadedmetadata', onLoadedMetadata);
          audio.addEventListener('error', () => {
            clearTimeout(timeoutId);
            console.warn("Erro ao carregar áudio para duração, usando tempo de gravação");
            URL.revokeObjectURL(audio.src);
            resolve(elapsedTime || 0);
          });

          // Cria URL temporária do blob
          audio.src = URL.createObjectURL(blob);
          audio.load();
        });
      };

      // Obtém a duração usando o método confiável
      const duration = await getDuration(audioBlob);
      console.log("Duração detectada:", duration);

      // Modo de colaboração (adicionar áudio a um track existente)
      if (collaborationMode && originalTrackId) {
        try {
          // Chamar serviço para enviar colaboração
          await TrackService.createCollaboration(
            {
              trackId: originalTrackId,
              name: trackName || "Colaboração",
              description: description || "Colaboração de áudio",
              duration: Math.max(1, duration),
            },
            audioFile,
            token,
          )

          toast({
            title: "Colaboração enviada",
            description: "Sua colaboração foi enviada para aprovação do autor original.",
          })

          resetRecording()
          setTrackName(collaborationMode ? "Colaboração" : "Nova Faixa")
          setDescription("")
          setRecordingStatus("idle")
          setElapsedTime(0)

          if (onTrackSaved) {
            onTrackSaved()
          }
        } catch (error) {
          console.error("Erro ao enviar colaboração:", error);
          toast({
            title: "Erro ao enviar colaboração",
            description: "Não foi possível enviar sua colaboração. Tente novamente mais tarde.",
            variant: "destructive",
          });
        }
      }
      // Modo simplificado (post de áudio)
      else if (simplified) {
        try {
          // Chamar o serviço para salvar o áudio simplificado
          await TrackService.createTrack(
            {
              name: description || "Post de áudio",
              projectId: "simplified", // Usamos um valor especial para identificar posts simplificados
              duration: Math.max(1, duration), // Garante que é pelo menos 1 segundo
            },
            audioFile,
            token,
          )

          toast({
            title: "Áudio publicado",
            description: "Sua gravação foi publicada com sucesso.",
          })

          resetRecording()
          setTrackName(simplified ? "Post de áudio" : "Nova Faixa")
          setDescription("")
          setRecordingStatus("idle")
          setElapsedTime(0)

          if (onTrackSaved) {
            onTrackSaved()
          }
        } catch (error) {
          console.error("Erro ao publicar áudio:", error);
          toast({
            title: "Erro ao publicar áudio",
            description: "Não foi possível publicar sua gravação. Tente novamente mais tarde.",
            variant: "destructive",
          });
        }
      }
      // Modo de projeto (adicionar faixa a um projeto)
      else if (projectId) {
        try {
          await TrackService.createTrack(
            {
              name: trackName,
              projectId,
              duration: Math.max(1, duration), // Garante que é pelo menos 1 segundo
            },
            audioFile,
            token,
          )

          toast({
            title: "Faixa salva com sucesso",
            description: "Sua gravação foi adicionada ao projeto.",
          })

          resetRecording()
          setTrackName("Nova Faixa")
          setRecordingStatus("idle")
          setElapsedTime(0)

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
        }
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Função para formatar URLs de áudio corretamente
  const getFullAudioUrl = (url: string) => {
    // Se já for uma URL completa, retorna como está
    if (url.startsWith('http')) return url;

    // Garante que tenhamos a base URL
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

    // Trata diferentes formatos de caminhos
    if (url.startsWith('/uploads/')) {
      // Caminho começa com /uploads/
      return `${baseUrl}${url}`;
    } else if (url.startsWith('uploads/')) {
      // Caminho começa sem barra
      return `${baseUrl}/${url}`;
    } else if (url.startsWith('tracks/')) {
      // Caminho começa com tracks/ (caso comum do erro)
      return `${baseUrl}/uploads/${url}`;
    } else {
      // Outros casos, adiciona /uploads/ se necessário
      return `${baseUrl}/uploads/${url}`;
    }
  };

  // Renderiza o seletor de dispositivos de áudio
  const renderDeviceSelector = () => {
    if (availableDevices.length === 0) return null;

    return (
      <div className="flex flex-col space-y-2 mb-4">
        <Label htmlFor="audioDeviceSelect">Dispositivo de áudio</Label>
        <Select
          value={selectedDeviceId || undefined}
          onValueChange={(value) => setSelectedDeviceId(value)}
        >
          <SelectTrigger id="audioDeviceSelect" className="w-full">
            <SelectValue placeholder="Selecione um dispositivo" />
          </SelectTrigger>
          <SelectContent>
            {availableDevices.map(device => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Dispositivo de áudio ${device.deviceId.slice(0, 5)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const handleSaveProcessedAudio = async (processedBlob: Blob) => {
    setAudioBlob(processedBlob);
    // Create a new object URL from the processed blob
    const newAudioURL = URL.createObjectURL(processedBlob);

    // Update audio URL reference for playback
    if (audioURL) {
      // Revogar URL anterior para evitar vazamentos de memória
      URL.revokeObjectURL(audioURL);
    }

    // Update the audio player URL
    if (existingTrackRef.current) {
      // Garantir que a URL esteja formatada corretamente
      existingTrackRef.current.src = newAudioURL;
      existingTrackRef.current.load();
    }

    toast({
      title: 'Áudio processado',
      description: 'As alterações foram aplicadas e estão prontas para serem salvas.'
    });

    // Close the editor
    setShowEditor(false);
  };

  // When recording is finished, show the editor option
  useEffect(() => {
    if (recordingStatus === "finished" && audioURL) {
      setShowEditor(false);  // Don't show automatically, let user choose
    }
  }, [recordingStatus, audioURL]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          {!simplified && (
            <div className="flex justify-center">
              <div className="relative h-32 w-32 rounded-full bg-muted flex items-center justify-center">
                <Mic className={`h-16 w-16 ${isRecording ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
                {isRecording && (
                  <Badge variant="destructive" className="absolute -right-2 -top-2 animate-pulse">
                    REC
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Recording controls and state - Only show if not in editing mode */}
          {!showEditor && (
            <div className="space-y-4">
              {audioURL && (
                <div className="space-y-2">
                  <Label htmlFor="track-name">{simplified ? "Descrição do Post" : "Nome da Faixa"}</Label>
                  <Input
                    id="track-name"
                    value={simplified ? description : trackName}
                    onChange={(e) =>
                      simplified ? setDescription(e.target.value) : setTrackName(e.target.value)
                    }
                    placeholder={simplified ? "Ex: Meu primeiro post de áudio" : "Ex: Violão Base"}
                  />
                </div>
              )}

              {!simplified && renderDeviceSelector()}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Volume</span>
                  <span className="text-sm text-muted-foreground">{volume[0]}%</span>
                </div>
                <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
              </div>

              <Tabs defaultValue="metronome" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="metronome" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Metrônomo
                  </TabsTrigger>
                  <TabsTrigger value="tuner" className="flex items-center gap-1">
                    <Music className="h-4 w-4" /> Afinador
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="metronome" className="p-4 border rounded-lg mt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="metronome"
                        checked={isMetronomeActive}
                        onCheckedChange={setIsMetronomeActive}
                      />
                      <Label htmlFor="metronome" className="ml-2 text-sm">
                        Ativar Metrônomo
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setBpm(prev => Math.max(30, prev - 5))}
                        className="h-7 w-7 rounded-full"
                      >
                        -
                      </Button>
                      <span className="w-12 text-center">{bpm} BPM</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setBpm(prev => Math.min(240, prev + 5))}
                        className="h-7 w-7 rounded-full"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tuner" className="mt-2">
                  <AudioTuner className="border-none shadow-none" autoStart={true} />
                </TabsContent>
              </Tabs>

              {existingTrackUrl && !simplified && (
                <div className="flex items-center space-x-2">
                  <Layers className={`h-5 w-5 ${isOverdubMode ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex items-center">
                    <Switch
                      id="overdub"
                      checked={isOverdubMode}
                      onCheckedChange={setIsOverdubMode}
                    />
                    <Label htmlFor="overdub" className="ml-2 text-sm">
                      Overdub
                    </Label>
                  </div>
                </div>
              )}
            </div>
          )}

          {isRecording && !showEditor && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center space-x-2 bg-red-500/10 text-red-500 px-3 py-1 rounded-full animate-pulse">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <span className="text-sm font-medium">Gravando - {formatTime(elapsedTime)}</span>
              </div>
            </div>
          )}

          {/* Audio Editor - Will be shown when editing mode is active */}
          {showEditor && audioURL && (
            <div className="mt-4">
              <AudioEditor
                audioUrl={audioURL}
                projectBpm={bpm}
                onSave={handleSaveProcessedAudio}
              />
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setShowEditor(false)}>
                  Cancelar Edição
                </Button>
              </div>
            </div>
          )}

          {!showEditor && (
            <>
              <div className="flex flex-wrap gap-3 justify-center">
                {isRecording ? (
                  <Button variant="destructive" size="lg" onClick={handleStopRecording} className="flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    Parar Gravação (Espaço)
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handleStartRecording}
                    className="flex items-center gap-2"
                    disabled={showEditor}
                  >
                    <Mic className="h-4 w-4" />
                    {recordingStatus === "finished" ? "Gravar Novamente" : "Iniciar Gravação"}
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

                    {/* Button to edit audio - Destacado visualmente */}
                    {recordingStatus === "finished" && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setShowEditor(true)}
                        className="flex items-center gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar Áudio
                      </Button>
                    )}

                    {/* Botão para salvar colaboração */}
                    {collaborationMode && originalTrackId && (
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={saveAudio}
                        className="flex items-center gap-2"
                        disabled={isSaving || showEditor}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Enviar Colaboração
                          </>
                        )}
                      </Button>
                    )}

                    {/* Botão para salvar em projeto */}
                    {projectId && !simplified && !collaborationMode && (
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={saveAudio}
                        className="flex items-center gap-2"
                        disabled={isSaving || showEditor}
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

                    {/* Botão para publicar post simplificado */}
                    {simplified && (
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={saveAudio}
                        className="flex items-center gap-2"
                        disabled={isSaving || showEditor}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Publicando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Publicar
                          </>
                        )}
                      </Button>
                    )}

                    {/* Botão de cancelar */}
                    {(simplified || collaborationMode) && onCancel && (
                      <Button variant="outline" size="lg" onClick={onCancel} className="flex items-center gap-2">
                        Cancelar
                      </Button>
                    )}
                  </>
                )}
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Visualização da forma de onda:</p>
                  {isRecording && (
                    <Badge variant="outline" className="text-xs">
                      {formatTime(elapsedTime)}
                    </Badge>
                  )}
                </div>
                <div className={`h-24 bg-muted rounded-md flex items-center justify-center overflow-hidden ${isRecording ? 'border-2 border-red-500' : ''}`}>
                  {isRecording || audioURL ? (
                    <canvas ref={canvasRef} width={600} height={100} className="w-full h-full" />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {recordingStatus === "idle"
                        ? "Clique em Iniciar Gravação para começar"
                        : "Forma de onda aparecerá aqui"}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {existingTrackUrl && (
            <audio ref={existingTrackRef} style={{ display: 'none' }}>
              <source src={existingTrackUrl} type="audio/mpeg" />
            </audio>
          )}
        </div>
      </CardContent>
    </Card>
  )
}