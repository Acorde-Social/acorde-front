"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Clock, Loader2, SendHorizonal, UserRound } from "lucide-react"
import { CollaborationService } from "@/services/collaboration-service"
import Link from "next/link"
import { FloatingFigures } from "@/components/common/FloatingFigures"
import { WaveformBackground } from "@/components/common/WaveformBackground"

export default function CollaborationsPage() {
  const [sentCount, setSentCount] = useState(0)
  const [receivedCount, setReceivedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user, token, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user || !token) {
      router.push("/login")
      return
    }

    const fetchCollaborationCounts = async () => {
      try {
        const sent = await CollaborationService.getUserAudioCollaborations(token)
        const received = await CollaborationService.getReceivedAudioCollaborations(token)

        setSentCount(sent.length)
        setReceivedCount(received.length)
      } catch (error) {
        setSentCount(0)
        setReceivedCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollaborationCounts()
  }, [authLoading, user, token, router])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9fafb] via-[#fcd34d]/10 to-[#2c1e4a]/10 dark:from-[#0f0c18] dark:via-[#3b2010]/15 dark:to-[#2c1e4a]/25 pointer-events-none" />
      <WaveformBackground />
      <div className="absolute inset-0 pointer-events-none">
        <div className="scale-175 opacity-60 dark:opacity-65">
          <FloatingFigures />
        </div>
      </div>

      <div className="relative z-10 px-4 py-6 space-y-6">
        <Card>
        <CardHeader>
          <CardTitle>Colaborações</CardTitle>
          <CardDescription>
            Gerencie suas colaborações de áudio enviadas e recebidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <SendHorizonal className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Colaborações Enviadas</h3>
                  </div>
                  <div className="flex items-center justify-center bg-primary/10 text-primary px-3 py-1 rounded-full">
                    <span className="font-semibold">{sentCount}</span>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">
                  Colaborações de áudio que você enviou para faixas de outros usuários.
                </p>
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Acompanhe o status de suas colaborações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Veja feedback dos autores originais</span>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/collaborations/sent" className="flex items-center justify-center gap-1">
                    Ver Colaborações Enviadas
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Colaborações Recebidas</h3>
                  </div>
                  <div className="flex items-center justify-center bg-primary/10 text-primary px-3 py-1 rounded-full">
                    <span className="font-semibold">{receivedCount}</span>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">
                  Colaborações de áudio que outros usuários enviaram para suas faixas.
                </p>
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Avalie e modere colaborações recebidas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Utilize o mixer para testar combinações</span>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/collaborations/received" className="flex items-center justify-center gap-1">
                    Ver Colaborações Recebidas
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como funcionam as colaborações?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              As colaborações permitem que você contribua com faixas de áudio para projetos e
              faixas de outros usuários, criando assim músicas colaborativas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">1. Envie uma colaboração</h3>
                <p className="text-sm text-muted-foreground">
                  Grave uma faixa de áudio sobre uma já existente e envie ao autor original.
                </p>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">2. Aguarde aprovação</h3>
                <p className="text-sm text-muted-foreground">
                  O autor original irá revisar e decidir se aceita ou rejeita sua contribuição.
                </p>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">3. Colaboração concluída</h3>
                <p className="text-sm text-muted-foreground">
                  Se aceita, sua colaboração torna-se parte oficial do projeto ou faixa.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
