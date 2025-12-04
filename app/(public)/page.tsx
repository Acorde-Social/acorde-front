'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AudioRecorder } from "@/components/audio-recorder"
import { ProjectService, type Project } from "@/services/project-service"
import { Loader2, Music, Mic, RefreshCw, Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AudioFeed } from "@/components/audio/audio-feed"
import { HowItWorks } from "@/components/how-it-works"
import { fixImageUrl } from "@/lib/utils"
import { redirect } from "next/navigation"
import { ArrowRight } from 'lucide-react'
import backgroundImage from '@/public/images/bg-test-3.jpg'

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

  // APENAS landing page pública
  return (
    <div className="bg-background relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url(${backgroundImage.src})` }} />
      
      <div className="relative z-10 min-h-screen">
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
        <HowItWorks />
        <div className="flex justify-center mt-6">
          <Button asChild size="lg" className="px-8 py-3 text-base relative z-20 bg-black hover:bg-black border-none ring-0">
            <Link href="/login">Começar</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}