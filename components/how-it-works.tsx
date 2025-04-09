import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Music2, Users, Wand2 } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: <Mic className="h-10 w-10 text-primary" />,
      title: "Grave sua demo",
      description: "Compartilhe sua composição com informações de tonalidade e andamento",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Conecte-se com músicos",
      description: "Encontre instrumentistas e arranjadores para colaborar em seu projeto",
    },
    {
      icon: <Music2 className="h-10 w-10 text-primary" />,
      title: "Colabore em tempo real",
      description: "Receba contribuições e grave novas faixas diretamente na plataforma",
    },
    {
      icon: <Wand2 className="h-10 w-10 text-primary" />,
      title: "Mixe e finalize",
      description: "Use nossas ferramentas de mixagem para finalizar sua produção",
    },
  ]

  return (
    <section className="container py-12 md:py-16">
      <div className="mx-auto max-w-[58rem] space-y-6 text-center">
        <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">Como funciona</h2>
        <p className="text-muted-foreground md:text-xl">
          Transforme suas ideias musicais em realidade com nossa plataforma de colaboração
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={index} className="flex flex-col items-center text-center">
            <CardHeader>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">{step.icon}</div>
              <CardTitle className="mt-4">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{step.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

