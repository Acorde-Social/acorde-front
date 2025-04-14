"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Music, 
  Upload, 
  Wand2, 
  Loader, 
  CheckCircle, 
  XCircle, 
  Timer, 
  Download,
  RefreshCw,
  BarChart2
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { TrackService } from "@/services/track-service"
import { API_URL } from "@/lib/api-config"

interface AudioQuantizerProps {
  onProcessComplete?: (originalUrl: string, correctedUrl: string) => void
  initialTrackId?: string
  initialAudioUrl?: string
}

export function AudioQuantizer({ 
  onProcessComplete, 
  initialTrackId, 
  initialAudioUrl 
}: AudioQuantizerProps) {
  // Estado da UI
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processProgress, setProcessProgress] = useState(0)
  const [processId, setProcessId] = useState<string | null>(null)
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)
  const [processResult, setProcessResult] = useState<any>(null)
  const [processFailed, setProcessFailed] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("upload") // upload ou result
  const [originalBpm, setOriginalBpm] = useState<number | null>(null)

  // Configurações de processamento
  const [targetBpm, setTargetBpm] = useState(120)
  const [quantizeStrength, setQuantizeStrength] = useState(50)
  const [preserveExpression, setPreserveExpression] = useState(true)

  // Referencias para audio players
  const originalAudioRef = useRef<HTMLAudioElement>(null)
  const processedAudioRef = useRef<HTMLAudioElement>(null)

  // Referência para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()
  const { token } = useAuth()

  // Determinar URLs de áudio com caminhos corretos
  const originalAudioUrl = processResult?.originalAudioUrl 
    ? processResult.originalAudioUrl.startsWith('http') 
      ? processResult.originalAudioUrl
      : `${API_URL}/uploads/${processResult.originalAudioUrl}`
    : initialAudioUrl
      ? initialAudioUrl.startsWith('http') 
        ? initialAudioUrl 
        : `${API_URL}/uploads/${initialAudioUrl}`
      : null

  const processedAudioUrl = processResult?.correctedAudioUrl 
    ? processResult.correctedAudioUrl.startsWith('http')
      ? processResult.correctedAudioUrl
      : `${API_URL}/uploads/${processResult.correctedAudioUrl}`
    : null

  // Limpar intervalo de verificação de status quando o componente desmontar
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    }
  }, [statusCheckInterval])

  // Detectar mudanças na presença de um arquivo ou track inicial
  useEffect(() => {
    if (initialTrackId || initialAudioUrl) {
      setActiveTab("process") // Muda para a aba de processamento se já temos um áudio
    }
  }, [initialTrackId, initialAudioUrl])

  // Função para formatar o tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Função para manipular o upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Verifica se é um arquivo de áudio
      if (!e.target.files[0].type.startsWith('audio/')) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione um arquivo de áudio (.mp3, .wav, etc)",
          variant: "destructive"
        })
        return
      }

      // Verifica o tamanho do arquivo (limite de 50MB)
      if (e.target.files[0].size > 50 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 50MB",
          variant: "destructive"
        })
        return
      }

      setSelectedFile(e.target.files[0])
      setActiveTab("process") // Muda para a aba de processamento após upload
    }
  }

  // Função para fazer upload e processar o arquivo
  const processAudio = async () => {
    if (!token) {
      toast({
        title: "Atenção",
        description: "Você precisa estar logado para processar áudios",
        variant: "default"
      })
      return
    }

    setIsProcessing(true)
    setProcessProgress(0)
    setProcessFailed(false)
    setProcessResult(null)

    try {
      let processResponse;

      // Caso 1: Temos um arquivo para upload
      if (selectedFile) {
        setIsUploading(true)

        // Tenta detectar o BPM antes de enviar
        if (!originalBpm) {
          toast({
            title: "Processando áudio",
            description: "Analisando BPM original do arquivo...",
          })
        }

        processResponse = await TrackService.uploadForTimingCorrection(
          selectedFile,
          {
            targetBpm,
            quantizeStrength, 
            preserveExpression
          },
          token
        )

        setIsUploading(false)
      } 
      // Caso 2: Temos um trackId ou audioUrl existente
      else if (initialTrackId || initialAudioUrl) {
        processResponse = await TrackService.correctTrackTiming(
          {
            trackId: initialTrackId,
            audioUrl: initialAudioUrl,
            targetBpm,
            quantizeStrength,
            preserveExpression
          },
          token
        )
      } 
      // Caso 3: Não temos nenhum arquivo nem track para processar
      else {
        throw new Error("Selecione um arquivo de áudio ou forneça um ID de faixa")
      }

      if (processResponse.success && processResponse.processId) {
        setProcessId(processResponse.processId)
        
        toast({
          title: "Processamento iniciado",
          description: `Aplicando correção de tempo para ${targetBpm} BPM com força de ${quantizeStrength}%`,
        })
        
        // Inicia o polling de status
        const interval = setInterval(async () => {
          try {
            const statusResponse = await TrackService.getProcessStatus(
              processResponse.processId, 
              token
            )
            
            if (statusResponse.status === 'completed') {
              clearInterval(interval)
              setStatusCheckInterval(null)
              setProcessProgress(100)
              setIsProcessing(false)
              setProcessResult(statusResponse.result)
              setActiveTab("result") // Muda para a aba de resultado

              // Chama o callback se fornecido
              if (onProcessComplete && statusResponse.result) {
                onProcessComplete(
                  statusResponse.result.originalAudioUrl,
                  statusResponse.result.correctedAudioUrl
                )
              }

              toast({
                title: "Processamento concluído",
                description: `Áudio quantizado para ${targetBpm} BPM com sucesso!`,
                variant: "default"
              })
              
              // Se tiver informações de BPM original no resultado, armazena
              if (statusResponse.result?.originalBpm) {
                setOriginalBpm(statusResponse.result.originalBpm);
              }
            } 
            else if (statusResponse.status === 'failed') {
              clearInterval(interval)
              setStatusCheckInterval(null)
              setProcessFailed(true)
              setIsProcessing(false)
              
              toast({
                title: "Falha no processamento",
                description: statusResponse.error || "Ocorreu um erro ao processar o áudio",
                variant: "destructive"
              })
            } 
            else {
              // Atualiza o progresso
              setProcessProgress(statusResponse.progress || 0)
            }
          } catch (error) {
            console.error("Erro ao verificar status:", error)
          }
        }, 2000) // Verifica a cada 2 segundos

        setStatusCheckInterval(interval)
      } else {
        throw new Error("Falha ao iniciar o processamento")
      }
    } catch (error) {
      console.error("Erro ao processar áudio:", error)
      setIsProcessing(false)
      setProcessFailed(true)
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar o áudio",
        variant: "destructive"
      })
    }
  }

  const resetProcess = () => {
    setSelectedFile(null)
    setProcessResult(null)
    setProcessFailed(false)
    setActiveTab("upload")
    
    // Limpa o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    // Para os players de áudio se estiverem tocando
    if (originalAudioRef.current) {
      originalAudioRef.current.pause()
      originalAudioRef.current.currentTime = 0
    }
    
    if (processedAudioRef.current) {
      processedAudioRef.current.pause()
      processedAudioRef.current.currentTime = 0
    }
  }

  // Função para comparar áudios (original e processado)
  const compareAudio = (play: boolean = true) => {
    if (originalAudioRef.current && processedAudioRef.current) {
      originalAudioRef.current.currentTime = 0
      processedAudioRef.current.currentTime = 0
      
      if (play) {
        originalAudioRef.current.play()
        setTimeout(() => {
          if (processedAudioRef.current) {
            originalAudioRef.current?.pause()
            processedAudioRef.current.play()
          }
        }, 3000) // Toca o original por 3 segundos, depois o processado
      } else {
        originalAudioRef.current.pause()
        processedAudioRef.current.pause()
      }
    }
  }
  
  // Função para baixar o áudio processado
  const downloadProcessedAudio = () => {
    if (processedAudioUrl) {
      const a = document.createElement('a')
      a.href = processedAudioUrl
      a.download = `audio_quantizado_${targetBpm}bpm.mp3` 
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" /> 
          Quantizador de Tempo
        </CardTitle>
        <CardDescription>
          Corrija o tempo de áudios descompassados como batidas de palmas ou instrumentos
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="upload" disabled={isProcessing}>
              1. Upload
            </TabsTrigger>
            <TabsTrigger value="process" disabled={isProcessing || (!selectedFile && !initialTrackId && !initialAudioUrl)}>
              2. Configuração
            </TabsTrigger>
            <TabsTrigger value="result" disabled={!processResult && !processFailed}>
              3. Resultado
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
              <div className="flex justify-center">
                <Music className="h-12 w-12 text-muted-foreground" />
              </div>
              
              <div>
                <h3 className="font-medium text-lg">Selecione um arquivo de áudio</h3>
                <p className="text-muted-foreground text-sm">
                  Formatos suportados: MP3, WAV, OGG (max. 50MB)
                </p>
              </div>
              
              <div className="flex justify-center">
                <Input 
                  ref={fileInputRef}
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileChange}
                  className="max-w-sm" 
                />
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                O arquivo de áudio não será publicado, apenas processado e disponibilizado para download.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="process" className="space-y-4">
            {(selectedFile || initialTrackId || initialAudioUrl) && (
              <>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>BPM Alvo</Label>
                      <div className="text-sm">
                        {originalBpm ? (
                          <span className="text-muted-foreground">
                            Original: <strong className="text-primary">{originalBpm}</strong> → Alvo: <strong className="text-primary">{targetBpm}</strong>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{targetBpm} BPM</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setTargetBpm(Math.max(60, targetBpm - 1))}
                        disabled={isProcessing}
                      >
                        -
                      </Button>
                      <Slider 
                        value={[targetBpm]} 
                        min={60} 
                        max={200} 
                        step={1} 
                        onValueChange={(value) => setTargetBpm(value[0])} 
                        className="flex-1"
                        disabled={isProcessing}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setTargetBpm(Math.min(200, targetBpm + 1))}
                        disabled={isProcessing}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Intensidade da Quantização</Label>
                      <span className="text-sm text-muted-foreground">{quantizeStrength}%</span>
                    </div>
                    <Slider 
                      value={[quantizeStrength]} 
                      min={0} 
                      max={100} 
                      step={5} 
                      onValueChange={(value) => setQuantizeStrength(value[0])} 
                      disabled={isProcessing}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Sutil</span>
                      <span>Moderada</span>
                      <span>Forte</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Um valor maior aplica uma correção de tempo mais intensa, aproximando mais do BPM alvo.
                    </p>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label>Preservar Expressão Original</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Se desativado, a quantização será mais mecânica e precisa
                      </p>
                    </div>
                    <Switch 
                      checked={preserveExpression}
                      onCheckedChange={setPreserveExpression}
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  {isProcessing ? (
                    <div className="space-y-2">
                      <Progress value={processProgress} className="h-2" />
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader className="h-4 w-4 animate-spin" />
                        {isUploading ? 
                          "Enviando arquivo..." : 
                          `Processando... ${processProgress}%`
                        }
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={processAudio} 
                      className="w-full flex items-center gap-2"
                      disabled={!(selectedFile || initialTrackId || initialAudioUrl)}
                    >
                      <Wand2 className="h-4 w-4" />
                      Processar Áudio
                    </Button>
                  )}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="result" className="space-y-4">
            {processFailed ? (
              <div className="border rounded-lg p-8 text-center space-y-4">
                <div className="flex justify-center">
                  <XCircle className="h-12 w-12 text-destructive" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Falha no processamento</h3>
                  <p className="text-muted-foreground">
                    Ocorreu um erro ao processar o áudio. Por favor, tente novamente.
                  </p>
                </div>
                <Button onClick={resetProcess}>Tentar Novamente</Button>
              </div>
            ) : processResult ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg text-center">
                  <p className="text-sm">
                    {originalBpm ? (
                      <>
                        <span className="font-medium">Correção aplicada:</span> De <strong>{originalBpm} BPM</strong> para <strong>{targetBpm} BPM</strong> com intensidade de <strong>{quantizeStrength}%</strong>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">BPM alvo:</span> <strong>{targetBpm}</strong> com intensidade de <strong>{quantizeStrength}%</strong>
                      </>
                    )}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="mb-2">
                      <h4 className="font-medium">Áudio Original</h4>
                    </div>
                    <audio 
                      ref={originalAudioRef} 
                      controls 
                      className="w-full" 
                      src={originalAudioUrl || undefined} 
                    />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="mb-2">
                      <h4 className="font-medium">Áudio Quantizado ({targetBpm} BPM)</h4>
                    </div>
                    <audio 
                      ref={processedAudioRef} 
                      controls 
                      className="w-full" 
                      src={processedAudioUrl || undefined} 
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => compareAudio(true)}
                    className="flex-1"
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Comparar (3s cada)
                  </Button>
                  
                  <Button
                    variant="default"
                    onClick={downloadProcessedAudio}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Processado
                  </Button>
                </div>
                
                <div>
                  <Button
                    variant="outline"
                    onClick={resetProcess}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Processar Outro Áudio
                  </Button>
                </div>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}