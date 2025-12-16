'use client'

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { HowItWorks } from "@/app/(public)/components/how-it-works"
import { redirect } from "next/navigation"
import { SuccessStories } from "@/app/(public)/components/success-stories"
import { Features } from "./components/features"
import { Pricing } from "./components/pricing"
import { FAQ } from "./components/faq"
import { FinalCTA } from "./components/final-cta"
import { Hero } from "./components/hero" 

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
      <Hero /> 

      <HowItWorks />
      
      <div className="pb-32 lg:pb-48"></div>

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
        <SuccessStories />
      </div>

      <div className="bg-gradient-to-b from-background via-background to-muted/30">
        <Features />
      </div>

      <div className="bg-gradient-to-b from-background via-background to-muted/30">
        <Pricing />
      </div>

      <div className="bg-gradient-to-b from-background via-background to-muted/30">
        <FAQ />
      </div>

      <div className="bg-gradient-to-b from-background via-background to-muted/30">
        <FinalCTA/>
      </div>
    </>
  )
}