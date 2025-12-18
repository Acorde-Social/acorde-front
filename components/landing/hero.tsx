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
        <section className="space-y-2 pb-1 pt-4 md:pb-2 md:pt-6 lg:py-8">
          <div className="container flex max-w-[64rem] flex-col items-center gap-1 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
              Conectando <span className="text-yellow-600">seu som</span>{" "}
              com <span className="text-primary">artistas</span> do mundo inteiro!
            </h1>
            <p className="max-w-[42rem] leading-normal sm:text-xl sm:leading-8 text-foreground">
              Compartilhe suas composições, colabore com músicos talentosos e expanda seu network musical.
            </p>
          </div>
        </section>

        <div className="flex justify-center mt-6 mb-12">
          <Button
            asChild
            size="lg"
            className="px-8 py-3 text-base relative z-20 bg-black hover:bg-black border-none ring-0"
          >
            <Link href="/login">Começar</Link>
          </Button>
        </div>

        <HowItWorks />
        <div className="pb-32 lg:pb-48"></div>
      </div>
    </div>
  )
}