'use client'

import { Play, Pause, Users, Music, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { FloatingFigures } from './FloatingFigures'

interface SuccessStory {
  id: string
  name: string
  role: string
  avatarUrl?: string
  location: string
  audioUrl: string
  audioTitle: string
  genre: string
  duration: string
  stats: {
    collaborations: number
    projectsCompleted: number
    timeline: string
  }
  quote: string
  tags: string[]
}

export function SuccessStories() {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [desktopCurrentSlide, setDesktopCurrentSlide] = useState(0)
  const totalDesktopSlides = 3 // 9 cards ÷ 3 por slide = 3 slides
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()
  const totalSlides = 3

  const successStories: SuccessStory[] = [
    {
      id: '1',
      name: 'Ana Beatriz',
      role: 'Produtora & Vocalista',
      location: 'São Paulo, SP',
      audioUrl: '/audio/demo-ana.mp3',
      audioTitle: 'Melodia em Sol - Demo Final',
      genre: 'Pop Alternativo',
      duration: '2:45',
      stats: {
        collaborations: 3,
        projectsCompleted: 1,
        timeline: '6 semanas'
      },
      quote: 'Encontrei o guitarrista perfeito em 48h. O que levaria meses em grupos de WhatsApp, resolvi em um final de semana.',
      tags: ['Produção', 'Vocal', 'Composição']
    },
    {
      id: '2',
      name: 'Carlos Mendes',
      role: 'Compositor para Mídia',
      location: 'Rio de Janeiro, RJ',
      audioUrl: '/audio/demo-carlos.mp3',
      audioTitle: 'Trilha para Documentário - Versão Orquestral',
      genre: 'Cinematic',
      duration: '3:20',
      stats: {
        collaborations: 5,
        projectsCompleted: 2,
        timeline: '8 semanas'
      },
      quote: 'A colaboração com o violinista francês transformou completamente a peça. Ferramentas de versionamento salvaram o projeto.',
      tags: ['Trilha Sonora', 'Orquestração', 'Mídia']
    },
    {
      id: '3',
      name: 'Fernanda & Silva',
      role: 'Banda Indie',
      location: 'Porto Alegre, RS',
      audioUrl: '/audio/demo-fernanda.mp3',
      audioTitle: 'Nuvens Passageiras - Single',
      genre: 'Indie Folk',
      duration: '4:15',
      stats: {
        collaborations: 4,
        projectsCompleted: 3,
        timeline: '10 semanas'
      },
      quote: 'Formamos a banda completa através da plataforma. Do baixista ao produtor, todos vieram de colaborações no Acorde.',
      tags: ['Banda', 'Indie', 'Produção Independente']
    },
    {
      id: '4',
      name: 'Rafael Costa',
      role: 'Baterista',
      location: 'Salvador, BA',
      audioUrl: '/audio/demo-rafael.mp3',
      audioTitle: 'Groove Sessions - Vol. 1',
      genre: 'Funk & Soul',
      duration: '3:45',
      stats: {
        collaborations: 7,
        projectsCompleted: 4,
        timeline: '5 semanas'
      },
      quote: 'Conectei com produtores de São Paulo sem sair de casa. As sessões remotas funcionaram perfeitamente.',
      tags: ['Bateria', 'Groove', 'Funk']
    },
    {
      id: '5',
      name: 'Julia Fernandes',
      role: 'Compositora',
      location: 'Belo Horizonte, MG',
      audioUrl: '/audio/demo-julia.mp3',
      audioTitle: 'Atmosferas Urbanas - EP',
      genre: 'Ambient',
      duration: '4:30',
      stats: {
        collaborations: 6,
        projectsCompleted: 3,
        timeline: '12 semanas'
      },
      quote: 'Desenvolvi uma trilha completa com um pianista do Rio. O fluxo de trabalho compartilhado acelerou o processo em 60%.',
      tags: ['Composição', 'Trilha', 'Ambient']
    },
    {
      id: '6',
      name: 'Leonardo Oliveira',
      role: 'Baixista',
      location: 'Recife, PE',
      audioUrl: '/audio/demo-leonardo.mp3',
      audioTitle: 'Fundamentos do Baixo - Série',
      genre: 'Jazz Fusion',
      duration: '3:15',
      stats: {
        collaborations: 8,
        projectsCompleted: 5,
        timeline: '7 semanas'
      },
      quote: 'Montei uma banda de jazz completa em 3 semanas. Cada músico veio com referências alinhadas ao projeto.',
      tags: ['Baixo', 'Jazz', 'Fundamentos']
    },
    {
      id: '7',
      name: 'Fernanda Lima',
      role: 'Violinista',
      location: 'Curitiba, PR',
      audioUrl: '/audio/demo-fernanda-lima.mp3',
      audioTitle: 'Conexões Eruditas - Single',
      genre: 'Folk Contemporâneo',
      duration: '3:50',
      stats: {
        collaborations: 5,
        projectsCompleted: 2,
        timeline: '9 semanas'
      },
      quote: 'A ponte entre música erudita e popular aconteceu naturalmente. Encontrei um violonista perfeito para o projeto.',
      tags: ['Violino', 'Erudito', 'Folk']
    },
    {
      id: '8',
      name: 'Bruno Rodrigues',
      role: 'Saxofonista',
      location: 'Rio de Janeiro, RJ',
      audioUrl: '/audio/demo-bruno.mp3',
      audioTitle: 'Improvisações no Asfalto',
      genre: 'Jazz Brasileiro',
      duration: '4:05',
      stats: {
        collaborations: 9,
        projectsCompleted: 6,
        timeline: '4 semanas'
      },
      quote: 'Gravei participações em 4 projetos diferentes no mesmo mês. A plataforma organizou todas as deadlines.',
      tags: ['Saxofone', 'Jazz', 'Improvisação']
    },
    {
      id: '9',
      name: 'Patricia Almeida',
      role: 'Beatmaker',
      location: 'São Paulo, SP',
      audioUrl: '/audio/demo-patricia.mp3',
      audioTitle: 'Hip-Hop Sessions 2025',
      genre: 'Hip-Hop Instrumental',
      duration: '2:55',
      stats: {
        collaborations: 4,
        projectsCompleted: 2,
        timeline: '8 semanas'
      },
      quote: 'Como produtora iniciante, encontrei mentores que me guiaram no processo. A comunidade fez toda diferença.',
      tags: ['Beatmaking', 'Hip-Hop', 'Produção']
    }
  ]

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      const desktopInterval = setInterval(() => {
        setDesktopCurrentSlide((prev) => (prev + 1) % totalDesktopSlides)
      }, 10000)
      return () => clearInterval(desktopInterval)
    }
  }, [isMobile])

  useEffect(() => {
    if (isMobile) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides)
      }, 9000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isMobile])

  const handlePlayPause = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null)
    } else {
      setPlayingAudioId(id)
    }
  }

  const desktopSlides = [
    [successStories[0], successStories[1], successStories[2]],
    [successStories[3], successStories[4], successStories[5]],
    [successStories[6], successStories[7], successStories[8]]
  ]

  const goToDesktopSlide = (index: number) => {
    setDesktopCurrentSlide(index)
  }

  const nextDesktopSlide = () => {
      if (desktopCurrentSlide === totalDesktopSlides - 1) {
    setDesktopCurrentSlide(0)
  } else {
    setDesktopCurrentSlide((prev) => prev + 1)
  }
}

  const prevDesktopSlide = () => {
    setDesktopCurrentSlide((prev) => (prev - 1 + totalDesktopSlides) % totalDesktopSlides)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (isMobile) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides)
      }, 5000)
    }
  }

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % totalSlides)
  }

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides)
  }

  const renderCard = (story: SuccessStory) => (
    <div className="relative group">
      <div className="absolute -inset-4 bg-gradient-to-br from-[#fcd34d]/0 via-[#2c1e4a]/0 to-[#fcd34d]/0 group-hover:from-[#fcd34d]/5 group-hover:via-[#2c1e4a]/2 group-hover:to-[#fcd34d]/5 rounded-3xl blur-xl transition-all duration-700 opacity-0 group-hover:opacity-100" />

      <Card className="relative bg-white/95 backdrop-blur-sm border border-[#374151]/10 group-hover:border-[#fcd34d]/40 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 overflow-hidden">

        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#fcd34d] via-[#2c1e4a] to-[#fcd34d]" />

        <CardContent className="p-7">

          <div className="flex items-start gap-5 mb-8">
            <div className="relative">

              <div className="absolute -inset-2 bg-gradient-to-br from-[#fcd34d]/20 to-[#2c1e4a]/10 rounded-full blur-md transition-all duration-500 group-hover:blur-lg" />

              <Avatar className="h-20 w-20 border-3 border-white relative z-10 shadow-lg shadow-[#2c1e4a]/5 group-hover:shadow-xl group-hover:shadow-[#fcd34d]/20 transition-all duration-300">
                <AvatarImage src={story.avatarUrl} alt={story.name} />
                <AvatarFallback className="bg-gradient-to-br from-[#f9fafb] to-white text-[#2c1e4a] font-bold text-lg border-2 border-white/80">
                  {story.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-gradient-to-br from-[#fcd34d] to-[#2c1e4a] rounded-full border-3 border-white flex items-center justify-center shadow-lg z-20 group-hover:scale-110 transition-transform duration-300">
                <Music className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-xl text-[#111827]">{story.name}</h3>
                  <p className="text-sm text-[#374151] font-medium">{story.role}</p>
                </div>
                <Badge className="bg-gradient-to-r from-[#f9fafb] to-white text-[#374151] border border-[#374151]/15 px-4 py-1.5 rounded-full font-medium w-fit hover:border-[#fcd34d]/40 transition-colors duration-300">
                  {story.location}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-[#f9fafb] to-white text-[#374151] border border-[#374151]/15 font-medium hover:border-[#fcd34d]/50 hover:text-[#2c1e4a] transition-all duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-8 bg-gradient-to-br from-white to-[#f9fafb] p-5 rounded-2xl border border-[#374151]/10 group-hover:border-[#fcd34d]/30 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-[#111827]">{story.audioTitle}</h4>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <div className="w-2 h-2 rounded-full bg-[#fcd34d] animate-pulse" />
                    <span className="text-[#374151]">{story.genre}</span>
                  </span>
                  <span className="text-[#374151]/40">•</span>
                  <span className="text-[#374151] font-medium">{story.duration}</span>
                </div>
              </div>
              <Button
                size="icon"
                className={`relative rounded-full shadow-lg border-2 transition-all duration-500 hover:scale-110 ${playingAudioId === story.id
                  ? 'bg-gradient-to-br from-[#fcd34d] to-[#2c1e4a] text-white border-[#fcd34d]/30 shadow-[#fcd34d]/30'
                  : 'bg-gradient-to-br from-white to-[#f9fafb] text-[#374151] border-[#374151]/15 hover:bg-gradient-to-br hover:from-[#fcd34d] hover:to-[#2c1e4a] hover:text-white hover:border-[#fcd34d]/30 hover:shadow-[#fcd34d]/30'
                  }`}
                onClick={() => handlePlayPause(story.id)}
              >
                {playingAudioId === story.id ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}

                {playingAudioId === story.id && (
                  <div className="absolute inset-0 rounded-full border-2 border-[#fcd34d] animate-ping opacity-70" />
                )}
              </Button>
            </div>

            <div className="relative">
              <div className="h-2.5 bg-gradient-to-r from-[#f9fafb] to-[#374151]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#fcd34d] via-[#2c1e4a] to-[#374151] rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: playingAudioId === story.id ? '85%' : '0%'
                  }}
                />
              </div>

              <div className="absolute inset-0 flex justify-between px-1 mt-1">
                {['0:00', '1:00', '2:00', '3:00'].map((time, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-0.5 h-2 bg-[#374151]/20 rounded-full" />
                    <span className="text-xs text-[#374151]/40 mt-1">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gradient-to-br from-[#f9fafb] to-white rounded-2xl border border-[#fcd34d]/20 overflow-hidden">
            {[
              {
                icon: <Users className="h-5 w-5" />,
                value: story.stats.collaborations,
                label: 'Colabs',
                color: 'bg-gradient-to-br from-[#fcd34d]/10 to-[#fcd34d]/5'
              },
              {
                icon: <Music className="h-5 w-5" />,
                value: story.stats.projectsCompleted,
                label: 'Projetos',
                color: 'bg-gradient-to-br from-[#2c1e4a]/10 to-[#2c1e4a]/5'
              },
              {
                value: story.stats.timeline,
                label: 'Timeline',
                color: 'bg-gradient-to-br from-[#374151]/10 to-[#374151]/5'
              }
            ].map((stat, idx) => (
              <div key={idx} className="text-center min-w-0 break-words">
                <div className={`inline-flex items-center justify-center p-2 rounded-xl ${stat.color} mb-2 group-hover:scale-105 transition-transform duration-300 ${!stat.icon ? 'flex-col' : ''}`}>
                  {stat.icon && <span className={idx === 0 ? 'text-[#fcd34d]' : 'text-[#2c1e4a]'}>{stat.icon}</span>}
                  <span className={`${!stat.icon ? 'text-xl mt-1' : 'text-2xl ml-2'} font-bold text-[#111827] break-words`}>{stat.value}</span>
                </div>
                <span className="text-sm font-medium text-[#374151] truncate block">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="relative pt-6 border-t border-[#374151]/10">
            <div className="absolute -left-0 top-6 right-50 text-5xl text-[#111827]/20 font-bold">"</div>
            <blockquote className="pl-8 pr-4 text-[#111827] text-lg leading-relaxed font-normal">
              <span className="relative">
                {story.quote}

                <span className="absolute -bottom-6 right-30 text-4xl text-[#111827]/20 font-bold">"</span>
              </span>
            </blockquote>

            <div className="mt-6 w-full h-0.5 bg-gradient-to-r from-transparent via-[#fcd34d]/30 to-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-[#f9fafb] via-white to-[#f9fafb]">

        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 800">
            <defs>
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#2c1e4a" strokeWidth="1" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <FloatingFigures />

        <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-white via-white/90 to-transparent" />
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(44,30,74,0.02)]" />
      </div>

      <div className="relative z-10">
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">

            <div className="mx-auto max-w-5xl text-center mb-20">
              <div className="inline-flex items-center justify-center gap-4 mb-8">
                <div className="relative group">
                  <div className="absolute -inset-3 bg-gradient-to-r from-[#fcd34d] to-[#fcd34d]/30 rounded-full opacity-20 blur-xl group-hover:opacity-30 transition-all duration-500" />
                  <div className="relative h-14 w-14 bg-gradient-to-br from-white to-[#f9fafb] rounded-full flex items-center justify-center shadow-2xl shadow-[#2c1e4a]/10 border border-white/80">
                    <TrendingUp className="h-7 w-7 text-[#2c1e4a]" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-[#2c1e4a] via-[#374151] to-[#2c1e4a] bg-clip-text text-transparent">
                  Histórias de Sucesso
                </h2>
              </div>
              <p className="text-xl text-[#374151] max-w-3xl mx-auto mb-6 font-normal">
                Veja como músicos estão transformando conexões em projetos concretos
              </p>
              <div className="w-48 h-1 mx-auto bg-gradient-to-r from-transparent via-[#fcd34d] to-transparent rounded-full" />
            </div>

            {/* DESKTOP: Carrossel*/}
            <div className="hidden lg:block relative max-w-7xl mx-auto">
              <div className="overflow-hidden rounded-2xl">
                <div
                  className="flex transition-transform duration-1000 ease-in-out"
                  style={{ transform: `translateX(-${desktopCurrentSlide * 100}%)` }}
                >
                  {desktopSlides.map((slideGroup, groupIndex) => (
                    <div key={groupIndex} className="w-full flex-shrink-0 px-4">
                      <div className="flex gap-8">
                        {slideGroup.map((story) => (
                          <div key={story.id} className="w-1/3">
                            {renderCard(story)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MOBILE: Carrossel */}
              <div className="lg:hidden relative max-w-md mx-auto">
                <div className="overflow-hidden rounded-2xl">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {successStories.map((story, index) => (
                      <div key={story.id} className="w-full flex-shrink-0 px-4">
                        {renderCard(story)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Indicadores (dots) */}
              <div className="flex justify-center gap-2 mt-8">
                {desktopSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                      ? 'bg-[#fcd34d] w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    aria-label={`Ir para história ${index + 1}`}
                  />
                ))}
              </div>

              {/* Botões de navegação */}
              <div className="flex justify-between items-center mt-6 absolute top-1/2 left-0 right-0 -translate-y-1/2 px-2">
                <button
                  onClick={prevDesktopSlide}
                  className="p-2 rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors duration-300"
                  aria-label="História anterior"
                >
                  <ChevronLeft className="h-5 w-5 text-[#2c1e4a]" />
                </button>
                <button
                  onClick={nextDesktopSlide}
                  className="p-2 rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors duration-300"
                  aria-label="Próxima história"
                >
                  <ChevronRight className="h-5 w-5 text-[#2c1e4a]" />
                </button>
              </div>
            </div>

            {/* CTA FINAL MODERNO */}
            <div className="text-center mt-20">
              <Button
                className="group relative gap-4 px-10 py-7 text-lg bg-gradient-to-r from-[#fcd34d] via-[#2c1e4a] to-[#374151] text-white hover:from-[#374151] hover:via-[#2c1e4a] hover:to-[#fcd34d] transition-all duration-500 shadow-2xl hover:shadow-3xl hover:scale-105 border-2 border-white/20 rounded-2xl overflow-hidden"
                asChild
              >
                <a href="#">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <TrendingUp className="h-6 w-6 relative z-10" />
                  <span className="relative z-10 font-semibold">Ver Todas as Histórias</span>
                </a>
              </Button>

              <p className="text-sm text-[#374151]/60 mt-8 font-light">
                Dados simulados para demonstração • Baseado em casos reais da plataforma
              </p>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes modernFloat {
          0%, 100% { 
            transform: translateY(0) rotate(0deg) scale(var(--scale, 1));
            opacity: var(--opacity, 0.1);
          }
          25% { 
            transform: translateY(-20px) rotate(5deg) scale(calc(var(--scale, 1) * 1.1));
            opacity: calc(var(--opacity, 0.1) * 1.3);
          }
          50% { 
            transform: translateY(10px) rotate(-5deg) scale(var(--scale, 1));
            opacity: var(--opacity, 0.1);
          }
          75% { 
            transform: translateY(-15px) rotate(3deg) scale(calc(var(--scale, 1) * 1.05));
            opacity: calc(var(--opacity, 0.1) * 1.2);
          }
        }

        @keyframes slideIndicator {
          0% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }

        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}