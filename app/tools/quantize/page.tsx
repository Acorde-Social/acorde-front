"use client"

import { useState } from "react"
import { AudioQuantizer } from "@/components/audio/audio-quantizer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { MusicIcon, Waves, ClockIcon, ArrowRightIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function QuantizeToolPage() {
  const { user } = useAuth()

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quantizador de Tempo</h1>
            <p className="text-muted-foreground mt-1">
              Corrija o ritmo de áudios com batidas descompassadas
            </p>
          </div>
        </div>

        <Separator className="my-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <AudioQuantizer />
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-semibold text-lg mb-4">Como funciona?</h2>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="bg-primary/10 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                      <MusicIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">1. Faça upload de um áudio</h3>
                      <p className="text-sm text-muted-foreground">
                        Envie suas palmas ou instrumentos descompassados
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="bg-primary/10 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                      <ClockIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">2. Defina o BPM desejado</h3>
                      <p className="text-sm text-muted-foreground">
                        Escolha o tempo correto e a intensidade da correção
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="bg-primary/10 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                      <Waves className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">3. Obtenha o áudio corrigido</h3>
                      <p className="text-sm text-muted-foreground">
                        O algoritmo alinha as batidas ao grid de tempo escolhido
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-semibold text-lg mb-2">Casos de uso</h2>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Corrigir palmas e percussão descompassadas</li>
                  <li>Alinhar instrumentos em uma gravação ao vivo</li>
                  <li>Sincronizar elementos sonoros com um metrônomo</li>
                  <li>Preparar áudios para remixagem ou produção</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-semibold text-lg mb-2">Dicas</h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2 items-start">
                    <ArrowRightIcon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Para correções sutis, use intensidade baixa (20-40%)</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRightIcon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Para batidas muito descompassadas, use intensidade alta (70-100%)</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRightIcon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Desative "Preservar Expressão" para quantização mais mecânica</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}