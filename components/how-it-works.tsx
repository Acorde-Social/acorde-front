import { Mic, Music2, Users, Wand2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import cardBg1Desktop from '@/public/images/cards/card-singer-desktop.webp'
import cardBg2Desktop from '@/public/images/cards/card-conectar-desktop.webp'
import cardBg3Desktop from '@/public/images/cards/card-colabore-desktop.webp'
import cardBg4Desktop from '@/public/images/cards/card-mix-desktop.webp'

export function HowItWorks() {
  const steps = [
    {
      icon: <Mic className="h-10 w-10 text-white" />,
      title: "Grave sua demo",
      description:
        "Compartilhe sua composição com informações de tonalidade e andamento",
      image: cardBg1Desktop,
      alt: "Mulher gravando sua voz",
    },
    {
      icon: <Users className="h-10 w-10 text-white" />,
      title: "Conecte-se com músicos",
      description:
        "Encontre instrumentistas e arranjadores para colaborar em seu projeto",
      image: cardBg2Desktop,
      alt: "Amigos se conectando através da música",
    },
    {
      icon: <Music2 className="h-10 w-10 text-white" />,
      title: "Colabore em tempo real",
      description:
        "Receba contribuições e grave novas faixas diretamente na plataforma",
      image: cardBg3Desktop,
      alt: "Colaborando em tempo real",
    },
    {
      icon: <Wand2 className="h-10 w-10 text-white relative mx-auto" />,
      title: "Mixe e finalize",
      description:
        "Use nossas ferramentas de mixagem para finalizar sua produção",
      image: cardBg4Desktop,
      alt: "Mixando",
    },
  ]

  return (
    <section className="container py-10 md:py-16">
      <div className="mx-auto max-w-[58rem] space-y-2 text-center">
        <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
          Como funciona
        </h2>
        <p className="text-black md:text-xl text-center">
          Transforme suas ideias musicais em realidade com nossa plataforma de
          colaboração
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <Link key={index} href="/login" className="block h-full">
            <div className="group relative flex flex-col items-center justify-center h-full border-2 border-black/20 rounded-xl p-6 text-center transition-all duration-300 hover:border-black hover:-translate-y-1 hover:shadow-lg cursor-pointer overflow-hidden">

              {/* Background Image */}
              <Image
                src={step.image}
                alt={step.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[100%] brightness-10 group-hover:grayscale-0 group-hover:brightness-100 object-cover rounded-xl object-cover blur-sm transition-all duration-1000 group-hover:blur-none"
                priority={index < 2}
                quality={85}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/90 rounded-xl -z-10" />

              {/* Conteúdo */}
              <div className="relative z-10">
                <div className="mb-4 flex justify-center -mt-1">{step.icon}</div>
                <h3 className="text-lg font-bold text-yellow-300 drop-shadow-lg">{step.title}</h3>
                <p className="mt-2 text-base text-white drop-shadow-md leading-relaxed">
                  {step.description}
                </p>
              </div>

              <span className="absolute inset-[2px] rounded-xl border-2 border-transparent transition-all duration-300 group-hover:border-white/50"></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
