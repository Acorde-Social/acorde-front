import { Mic, Music2, Users, Wand2 } from "lucide-react"
import Link from "next/link"

export function HowItWorks() {
  const steps = [
    {
      icon: <Mic className="h-10 w-10 text-primary" />,
      title: "Grave sua demo",
      description:
        "Compartilhe sua composição com informações de tonalidade e andamento",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Conecte-se com músicos",
      description:
        "Encontre instrumentistas e arranjadores para colaborar em seu projeto",
    },
    {
      icon: <Music2 className="h-10 w-10 text-primary" />,
      title: "Colabore em tempo real",
      description:
        "Receba contribuições e grave novas faixas diretamente na plataforma",
    },
    {
      icon: <Wand2 className="h-10 w-10 text-primary" />,
      title: "Mixe e finalize",
      description:
        "Use nossas ferramentas de mixagem para finalizar sua produção",
    },
  ]

  return (
    <section className="container py-10 md:py-16">
      <div className="mx-auto max-w-[58rem] space-y-2 text-center">
        <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
          Como funciona
        </h2>
        <p className="text-muted-foreground md:text-xl">
          Transforme suas ideias musicais em realidade com nossa plataforma de
          colaboração
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <Link key={index} href="/login" className="block h-full">
            <div
              className="group relative flex flex-col items-center justify-center h-full border-2 border-black/20 rounded-xl p-6 text-center transition-all duration-300 hover:border-black hover:-translate-y-1 hover:shadow-lg cursor-pointer bg-white"
              >
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
              <span className="absolute inset-[2px] rounded-xl border-2 border-transparent transition-all duration-300 group-hover:border-black"></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
