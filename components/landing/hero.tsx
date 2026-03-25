import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HowItWorks } from "./how-it-works"

const backgroundImage = 'https://pub-9e416a3ef36044a5aab78f234be56e68.r2.dev/dev/landing-page/images/backgrounds/landingpage-bg-hero-img1.jpg'

export function Hero() {
  return (
    <div className="relative bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="relative z-10">
        <section className="space-y-3 pb-2 pt-4 md:pb-3 md:pt-6 lg:py-8">
          <div className="container flex max-w-[64rem] flex-col items-center gap-2 text-center px-4">
            <h1 className="text-2xl font-bold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
              Conectando <span className="text-yellow-600">seu som</span>{" "}
              com <span className="text-yellow-600">artistas</span> do mundo inteiro!
            </h1>
            <p className="max-w-[42rem] text-sm leading-relaxed text-foreground sm:text-lg sm:leading-7 md:text-xl md:leading-8">
              Compartilhe suas composições, colabore com músicos talentosos e expanda seu network musical.
            </p>
          </div>
        </section>

        <div className="flex justify-center mt-4 mb-8 sm:mt-5 sm:mb-10 md:mt-6 md:mb-12 px-4">
          <Button
            asChild
            size="lg"
            className="px-6 py-2.5 text-sm sm:px-8 sm:py-3 sm:text-base relative z-20 bg-black hover:bg-black border-none ring-0"
          >
            <Link href="/login">Começar</Link>
          </Button>
        </div>

        <HowItWorks />
        <div className="pb-4 md:pb-6"></div>
      </div>
    </div>
  )
}
