"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Waves, ClockIcon, WandIcon } from "lucide-react"
import Link from "next/link"
import { FloatingFigures } from "@/components/common/FloatingFigures"
import { WaveformBackground } from "@/components/common/WaveformBackground"

export default function ToolsPage() {
  const tools = [
    {
      id: "quantize",
      title: "Quantizador de Tempo",
      description: "Corrija o ritmo de áudios com batidas descompassadas",
      icon: <ClockIcon className="h-5 w-5 text-primary" />,
      href: "/tools/quantize",
    },
    {
      id: "audio-fix",
      title: "Diagnóstico de Áudio",
      description: "Verifique e corrija problemas em arquivos de áudio processados",
      icon: <Waves className="h-5 w-5 text-primary" />,
      href: "/tools/audio-fix",
    },
    {
      id: "equalizer",
      title: "Equalizador de Áudio",
      description: "Ajuste frequências e melhore o som de suas gravações",
      icon: <Waves className="h-5 w-5 text-primary" />,
      href: "/tools/equalizer",
      disabled: true,
    },
    {
      id: "effects",
      title: "Efeitos de Áudio",
      description: "Adicione reverb, delay e outros efeitos aos seus áudios",
      icon: <WandIcon className="h-5 w-5 text-primary" />,
      href: "/tools/effects",
      disabled: true,
    },
  ]

  return (
    <div className="bg-background relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9fafb] via-[#fcd34d]/10 to-[#2c1e4a]/10 dark:from-[#0f0c18] dark:via-[#3b2010]/15 dark:to-[#2c1e4a]/25 pointer-events-none" />
      <WaveformBackground />
      <div className="absolute inset-0 pointer-events-none">
        <div className="scale-175 opacity-60 dark:opacity-65">
          <FloatingFigures />
        </div>
      </div>

      <div className="relative z-10 container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-bold">Ferramentas de Áudio</h1>
            <p className="text-muted-foreground">
              Explore nossas ferramentas para processamento e aprimoramento de áudio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Card key={tool.id} className={tool.disabled ? "opacity-70" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {tool.icon}
                    {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                    disabled={tool.disabled}
                  >
                    {tool.disabled ? (
                      <span>Em breve</span>
                    ) : (
                      <Link href={tool.href}>Acessar</Link>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
