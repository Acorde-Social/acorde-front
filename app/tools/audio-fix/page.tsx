"use client"

import { useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { FileIcon, SearchIcon, CheckCircleIcon, XCircleIcon, ArrowRightIcon, Waves, AlertTriangleIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { API_URL } from "@/lib/api-config"

export default function AudioFixPage() {
  const [audioUrl, setAudioUrl] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<{
    exists: boolean;
    message: string;
    fixedUrl?: string;
  } | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()
  const { token } = useAuth()

  const handleCheckAudio = async () => {
    if (!audioUrl.trim()) {
      toast({
        title: "URL de áudio vazio",
        description: "Por favor, insira uma URL de áudio para verificar",
        variant: "destructive"
      })
      return
    }

    setIsChecking(true)
    setCheckResult(null)

    try {
      // Primeiro, vamos tentar limpar a URL do áudio
      let cleanUrl = audioUrl.trim()
      
      // Remover o domínio da API se estiver presente
      if (cleanUrl.startsWith(API_URL)) {
        cleanUrl = cleanUrl.replace(API_URL, "")
      }
      
      // Garantir que não comece com "/uploads" duplamente
      if (cleanUrl.startsWith("/uploads")) {
        cleanUrl = cleanUrl.replace("/uploads", "")
      }
      
      // Verificar se começa com "/"
      if (!cleanUrl.startsWith("/")) {
        cleanUrl = "/" + cleanUrl
      }

      // Se a URL parece ser um path relativo, adiciona /uploads no início
      if (!cleanUrl.includes("http") && !cleanUrl.startsWith("/uploads")) {
        cleanUrl = `/uploads${cleanUrl}`
      }

      // URL completa para teste
      const testUrl = cleanUrl.startsWith("http") ? cleanUrl : `${API_URL}${cleanUrl}`
      
      // Verifica se o arquivo existe
      const response = await fetch(testUrl, {
        method: "HEAD",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      
      if (response.ok) {
        setCheckResult({
          exists: true,
          message: "O arquivo de áudio existe e é acessível",
          fixedUrl: testUrl
        })
        
        // Exibe um toast de sucesso
        toast({
          title: "Arquivo encontrado",
          description: "O arquivo de áudio existe e está acessível",
        })
      } else {
        // Se não existe, tenta alternativas comuns
        const alternatives = [
          testUrl,
          `${API_URL}/uploads${cleanUrl}`,
          `${API_URL}/uploads/tracks${cleanUrl.startsWith('/tracks') ? '' : '/' + cleanUrl.split('/').pop()}`,
          `${API_URL}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`,
        ]
        
        let found = false
        let workingUrl = ""
        
        for (const altUrl of alternatives) {
          try {
            const altResponse = await fetch(altUrl, { method: "HEAD" })
            if (altResponse.ok) {
              found = true
              workingUrl = altUrl
              break
            }
          } catch (e) {
            // Continua tentando outras alternativas
          }
        }
        
        if (found) {
          setCheckResult({
            exists: true,
            message: "Encontrado em um caminho alternativo",
            fixedUrl: workingUrl
          })
          
          toast({
            title: "Arquivo encontrado",
            description: "O arquivo existe em um caminho alternativo",
          })
        } else {
          setCheckResult({
            exists: false,
            message: `O arquivo não foi encontrado. HTTP status: ${response.status}`,
          })
          
          toast({
            title: "Arquivo não encontrado",
            description: `O arquivo não existe ou não é acessível (Status: ${response.status})`,
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      setCheckResult({
        exists: false,
        message: `Erro ao verificar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      })
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao verificar o arquivo de áudio",
        variant: "destructive"
      })
    } finally {
      setIsChecking(false)
    }
  }
  
  const playAudio = () => {
    if (checkResult?.fixedUrl && audioRef.current) {
      audioRef.current.src = checkResult.fixedUrl
      audioRef.current.play().catch(err => {
        toast({
          title: "Erro ao reproduzir",
          description: `Falha ao reproduzir áudio: ${err.message}`,
          variant: "destructive"
        })
      })
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Waves className="h-7 w-7" />
            Diagnóstico de Áudio
          </h1>
          <p className="mt-1 text-muted-foreground">
            Verifique e corrija problemas com arquivos de áudio
          </p>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verificação de URL de áudio</CardTitle>
            <CardDescription>
              Insira o URL ou caminho do arquivo de áudio que não está funcionando
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="audioUrl">URL do áudio</Label>
                <div className="flex space-x-2">
                  <Input
                    id="audioUrl"
                    placeholder="Ex: tracks/corrected_1744329677552.mp3"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={handleCheckAudio}
                    disabled={isChecking || !audioUrl.trim()}
                  >
                    {isChecking ? (
                      <div className="flex items-center gap-1">
                        <span className="animate-spin">⏳</span> Verificando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <SearchIcon className="h-4 w-4" /> Verificar
                      </div>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sugestão: Copie o URL do erro do console e cole aqui
                </p>
              </div>
              
              {checkResult && (
                <div className="mt-4">
                  <Alert variant={checkResult.exists ? "default" : "destructive"}>
                    <div className="flex items-start">
                      {checkResult.exists ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 mr-2 mt-0.5" />
                      )}
                      <div>
                        <AlertTitle>{checkResult.exists ? "Arquivo encontrado" : "Arquivo não encontrado"}</AlertTitle>
                        <AlertDescription className="mt-2">{checkResult.message}</AlertDescription>
                        
                        {checkResult.exists && checkResult.fixedUrl && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium">URL corrigida:</p>
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                              {checkResult.fixedUrl}
                            </code>
                            
                            <div className="mt-4">
                              <audio ref={audioRef} className="w-full mt-2" controls />
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="mt-2" 
                                onClick={playAudio}
                              >
                                Testar reprodução
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Alert>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Separator className="my-6" />
        
        <Card>
          <CardHeader>
            <CardTitle>Problemas comuns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/20">
                <h3 className="flex items-center gap-2 font-medium mb-2">
                  <AlertTriangleIcon className="h-4 w-4 text-orange-500" />
                  Erro: "could not load url: tracks/corrected_*.mp3"
                </h3>
                <div className="space-y-2 text-sm">
                  <p>Este erro ocorre quando o caminho do arquivo processado está incorreto.</p>
                  <p><strong>Solução:</strong> Use o caminho completo da API: <code className="bg-muted px-1 py-0.5 rounded">{API_URL}/uploads/tracks/corrected_*.mp3</code></p>
                  <p>No código, certifique-se de que está usando a URL completa para arquivos processados.</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-muted/20">
                <h3 className="flex items-center gap-2 font-medium mb-2">
                  <AlertTriangleIcon className="h-4 w-4 text-orange-500" />
                  Arquivos processados não sendo encontrados
                </h3>
                <div className="space-y-2 text-sm">
                  <p>Se os arquivos processados não são encontrados após a gravação:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Verifique a pasta de uploads do servidor</li>
                    <li>Certifique-se de que os arquivos têm permissões corretas</li>
                    <li>Confirme que o caminho inclui <code className="bg-muted px-1 py-0.5 rounded">/uploads</code> antes de <code className="bg-muted px-1 py-0.5 rounded">/tracks</code></li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}