"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { API_URL } from '@/lib/api-config'
import { getFullAudioUrl } from '@/services/track-service'

export default function AudioDebugPage() {
  const [audioPath, setAudioPath] = useState('')
  const [testResults, setTestResults] = useState<{path: string; fullPath: string; exists: boolean; error?: string; status?: number}[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const testAudioPath = async () => {
    if (!audioPath) return
    
    setIsLoading(true)
    setTestResults([])
    
    try {
      // Gerar todas as variações possíveis de caminho
      const pathVariations = [
        audioPath,
        audioPath.startsWith('/') ? audioPath.slice(1) : `/${audioPath}`,
        audioPath.startsWith('uploads/') ? audioPath : `uploads/${audioPath}`,
        audioPath.startsWith('/uploads/') ? audioPath : `/uploads/${audioPath}`
      ]

      // Adicionar variação com prefixo tracks se não estiver presente
      if (!audioPath.includes('tracks/')) {
        pathVariations.push(`tracks/${audioPath.split('/').pop() || audioPath}`)
      }
      
      // Adicionar URL completa para cada variação
      const fullPaths = pathVariations.map(path => {
        return { 
          original: path,
          full: getFullAudioUrl(path)
        }
      })
      
      // Testar cada caminho
      const results = await Promise.all(
        fullPaths.map(async ({ original, full }) => {
          try {
            const response = await fetch(full, { method: 'HEAD' })
            return {
              path: original,
              fullPath: full,
              exists: response.ok,
              status: response.status,
              error: response.ok ? undefined : `Status ${response.status}`
            }
          } catch (error) {
            return {
              path: original,
              fullPath: full,
              exists: false,
              error: `Erro ao acessar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            }
          }
        })
      )
      
      setTestResults(results)
      
      // Verificar resultado
      const anySuccess = results.some(r => r.exists)
      if (anySuccess) {
        toast({
          title: 'Teste concluído',
          description: 'Pelo menos um caminho de áudio está acessível!',
        })
      } else {
        toast({
          title: 'Teste concluído',
          description: 'Nenhum dos caminhos testados está acessível.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao testar caminhos',
        description: `${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Função para criar um player de áudio para testar a reprodução
  const testAudioPlayback = (url: string) => {
    // Criamos um elemento de áudio
    const audio = new Audio(url)
    
    // Adicionamos tratadores de eventos
    audio.addEventListener('canplaythrough', () => {
      toast({
        title: 'Áudio carregado com sucesso',
        description: `O áudio em ${url} foi carregado e pode ser reproduzido.`
      })
      audio.play().catch(err => {
        toast({
          title: 'Erro ao reproduzir',
          description: `Erro: ${err.message}`,
          variant: 'destructive'
        })
      })
    })
    
    audio.addEventListener('error', (e) => {
      const error = (e.target as HTMLMediaElement).error
      toast({
        title: 'Erro ao carregar áudio',
        description: `Código: ${error?.code}, Mensagem: ${error?.message || 'Desconhecida'}`,
        variant: 'destructive'
      })
    })
    
    // Iniciar carregamento
    audio.load()
  }

  return (
    <div className="container py-10">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Diagnóstico de URLs de Áudio</CardTitle>
          <CardDescription>
            Esta ferramenta ajuda a identificar problemas com caminhos de arquivos de áudio.
            Digite o caminho relativo ou URL completa de um arquivo de áudio para testar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="audioPath">Caminho do arquivo de áudio</Label>
              <Input 
                id="audioPath" 
                placeholder="Ex: tracks/corrected_1234567890.mp3" 
                value={audioPath} 
                onChange={(e) => setAudioPath(e.target.value)} 
              />
              <p className="text-sm text-muted-foreground">
                Digite apenas o caminho relativo ou URL completa
              </p>
            </div>
            
            <Button 
              onClick={testAudioPath} 
              disabled={isLoading || !audioPath}
              className="w-full"
            >
              {isLoading ? 'Testando...' : 'Testar Caminho'}
            </Button>
            
            {testResults.length > 0 && (
              <div className="mt-4 space-y-4 border rounded-md p-4">
                <h3 className="text-lg font-medium">Resultados</h3>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-md ${result.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}
                    >
                      <p className="font-medium">
                        {result.exists ? '✅' : '❌'} {result.path}
                      </p>
                      <p className="text-sm text-muted-foreground break-all">
                        URL completa: {result.fullPath}
                      </p>
                      {result.error && (
                        <p className="text-sm text-red-600 mt-1">
                          {result.error}
                        </p>
                      )}
                      {result.exists && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mt-2"
                          onClick={() => testAudioPlayback(result.fullPath)}
                        >
                          Testar reprodução
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Dica: Se o arquivo não for encontrado em nenhum caminho, verifique se ele realmente existe no servidor
            e se as permissões estão configuradas corretamente.
          </p>
        </CardFooter>
      </Card>
      
      <Card className="w-full max-w-3xl mx-auto mt-6">
        <CardHeader>
          <CardTitle>Informações de Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">API URL:</span>
              <span>{API_URL}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Base URL para áudio:</span>
              <span>{getFullAudioUrl("exemplo.mp3").replace("/exemplo.mp3", "")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}