'use client'

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { HowItWorks } from "@/app/(public)/components/how-it-works"
import { redirect } from "next/navigation"
import backgroundImage from '@/public/images/bg-test-3.jpg'
import { SuccessStories } from "@/app/(public)/components/success-stories"
import { Features } from "./components/features"

export default function Home() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (user && !isLoading) {
      redirect('/home')
    }
  }, [user, isLoading])

  if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Carregando...</p>
    </div>
  )
}

  return (
    <>
      <div className="relative bg-background">

        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url(${backgroundImage.src})` }} 
        />
        
        <div className="relative z-10">

          <section className="space-y-2 pb-1 pt-4 md:pb-2 md:pt-6 lg:py-8">
            <div className="container flex max-w-[64rem] flex-col items-center gap-1 text-center">
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                Conectando <span className="text-yellow-600">seu som</span>{" "}
                com <span className="text-primary">artistas</span> do mundo inteiro!
              </h1>
              <p className="max-w-[42rem] leading-normal sm:text-xl sm:leading-8 text-black-500">
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

          <HowItWorks/>
          <div className="pb-32 lg:pb-48"></div>
        </div>
      </div>

      <div className="relative h-24 overflow-hidden bg-background">
        <div className="absolute -top-12 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-background"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-full h-12 text-primary/10" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path 
              d="M0,60 C200,20 400,100 600,40 C800,-20 1000,80 1200,40" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeDasharray="10,5"
            />
          </svg>
        </div>
      </div>

      <div className="bg-gradient-to-b from-background via-background to-muted/30">
        <SuccessStories/>
      </div>

      <div className="bg-gradient-to-b from-background via-background to-muted/30">
        <Features/>
      </div>
    </>
  )
}