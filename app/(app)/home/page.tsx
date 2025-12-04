'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import {
  Music,
  Users,
  TrendingUp,
  Clock,
  Mic,
  Guitar,
  Headphones,
  Star,
  Calendar,
  MessageCircle,
  Heart,
  Share2,
  Play,
  Pause,
  AudioWaveform,
  Camera
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AvatarUpload } from './home-components/avatar-upload'
import { PostModal } from './home-components/post-modal'
import { Pencil } from 'lucide-react'
import { FeedItem, getMockFeedItems, getMockStats } from './data/mock-feed-data'
import { useMultiAudioPlayer } from '@/hooks/use-multi-audio-player'
import { useFeed } from '@/hooks/use-feed'
import { useUI } from '@/hooks/use-ui'
import { DarkCard } from "@/components/ui/dark-card"

interface Stats {
  projects: number
  collaborations: number
  followers: number
  tracks: number
}

export default function HomePage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const {
    playingAudioId,
    audioProgress,
    audioCurrentTime,
    handlePlayPause,
    handleSeek
  } = useMultiAudioPlayer()

  const { feedItems, stats, isLoading, loadFeed } = useFeed()
  const { activeTab, setActiveTab, isPostModalOpen, setIsPostModalOpen } = useUI()

  useEffect(() => {
    if (user) {
      loadFeed()
    }
  }, [user, loadFeed])

  const handleQuickAction = (action: string) => {
    toast({
      title: 'Ação Rápida',
      description: `${action} iniciado com sucesso!`,
    })
  }

  const handlePostClick = () => {
    setIsPostModalOpen(true)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Music className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-4">Faça login para acessar sua dashboard</p>
          <Button asChild>
            <Link href="/login">Fazer Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />

      <div className="relative bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AvatarUpload />

              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black">
                  Bem-vindo, {user.name}!
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-primary/5">
                    {user.role}
                  </Badge>
                  <span>•</span>
                  <button
                    onClick={handlePostClick}
                    className="text-left hover:text-primary transition-colors cursor-text relative group px-2 py-1 rounded-lg hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="relative">
                        O que vai postar hoje?
                        <span
                          className="absolute -left-2 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-black"
                          style={{ animation: 'pulse 0.9s ease-in-out infinite' }}
                        ></span>
                      </span>
                      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </div>
                  </button>
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button
                size="lg"
                asChild
                className='mt-5 bg-[#c11d36] text-white hover:bg-[#c11d36]'
              >
                <Link href="/studio">
                  <Mic className="h-4 w-4 mr-2" />
                  Estúdio
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUNA ESQUERDA - SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Minha Rede */}
            <DarkCard>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AudioWaveform className="h-5 w-5 text-primary" />
                  Minha Rede
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="text-2xl font-bold text-primary">{stats.projects}</div>
                    <div className="text-xs text-muted-foreground">Projetos</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="text-2xl font-bold text-primary">{stats.collaborations}</div>
                    <div className="text-xs text-muted-foreground">Colabs</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="text-2xl font-bold text-primary">{stats.followers}</div>
                    <div className="text-xs text-muted-foreground">Seguidores</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="text-2xl font-bold text-primary">{stats.tracks}</div>
                    <div className="text-xs text-muted-foreground">Faixas</div>
                  </div>
                </div>
              </CardContent>
            </DarkCard>

            {/* Ações Rápidas */}
            <DarkCard>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-primary/5 transition-all"
                  onClick={() => handleQuickAction('Gravação rápida')}
                >
                  <Mic className="h-4 w-4 mr-3 text-primary" />
                  Gravar Ideia
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-primary/5 transition-all"
                  asChild
                >
                  <Link href="/projects/new">
                    <Music className="h-4 w-4 mr-3 text-primary" />
                    Novo Projeto
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-primary/5 transition-all"
                  asChild
                >
                  <Link href="/explore">
                    <Users className="h-4 w-4 mr-3 text-primary" />
                    Encontrar Músicos
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-primary/5 transition-all"
                  asChild
                >
                  <Link href="/collaborations">
                    <Guitar className="h-4 w-4 mr-3 text-primary" />
                    Minhas Colabs
                  </Link>
                </Button>
              </CardContent>
            </DarkCard>

            {/* Recomendações */}
            <DarkCard>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Recomendados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        RJ
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Rafael Jazz</p>
                      <p className="text-xs text-muted-foreground">Saxofonista</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        BP
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Banda Progressiva</p>
                      <p className="text-xs text-muted-foreground">Projeto</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </DarkCard>
            
          </div>

          {/* COLUNA DIREITA - CONTEÚDO PRINCIPAL */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs de Navegação */}
            <DarkCard>
              <CardContent className="p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="feed" className="flex items-center gap-2">
                      <Headphones className="h-4 w-4" />
                      <span className="hidden sm:inline">Feed</span>
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      <span className="hidden sm:inline">Projetos</span>
                    </TabsTrigger>
                    <TabsTrigger value="collaborations" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Colabs</span>
                    </TabsTrigger>
                    <TabsTrigger value="discover" className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span className="hidden sm:inline">Descobrir</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="feed" className="mt-6">
                    <div className="space-y-4">
                      {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                              <div className="flex gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted"></div>
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 bg-muted rounded w-1/4"></div>
                                  <div className="h-3 bg-muted rounded w-1/2"></div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : feedItems.length > 0 ? (
                        feedItems.map((item) => (
                          <DarkCard key={item.id}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={item.author.avatarUrl} alt={item.author.name} />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                      {item.author.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-semibold">{item.author.name}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                      <span>
                                        {formatDistanceToNow(item.createdAt, {
                                          addSuffix: true,
                                          locale: ptBR
                                        })}
                                      </span>
                                      <span>•</span>
                                      <Badge variant="outline" className="text-xs">
                                        {item.type === 'project' ? 'Projeto' :
                                          item.type === 'track' ? 'Faixa' : 'Colaboração'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>

                            <CardContent className="pb-3">
                              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                              <p className="text-muted-foreground mb-3">{item.description}</p>

                              {item.genre && (
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                                    {item.genre}
                                  </span>
                                  {item.bpm && <span>{item.bpm} BPM</span>}
                                  {item.key && <span>{item.key}</span>}
                                </div>
                              )}

                              {item.audioUrl && (
                                <div className="bg-muted/30 rounded-lg p-3 mb-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`rounded-full ${playingAudioId === item.id ? 'bg-green-500' : 'bg-primary'} hover:opacity-90`}
                                        onClick={() => handlePlayPause(item)}
                                      >
                                        {playingAudioId === item.id ? (
                                          <Pause className="h-4 w-4 text-white" />
                                        ) : (
                                          <Play className="h-4 w-4 text-red-600" />
                                        )}
                                      </Button>

                                      <div className="flex-1">
                                        <div
                                          className="h-1 bg-muted rounded-full cursor-pointer"
                                          onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect()
                                            const clickX = e.clientX - rect.left
                                            const percentage = clickX / rect.width
                                            handleSeek(item, percentage)
                                          }}
                                        >
                                          <div
                                            className="h-1 bg-primary rounded-full transition-all"
                                            style={{
                                              width: `${(audioProgress[item.id] || item.progress || 0) * 100}%`
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>

                                    <span className="text-xs text-muted-foreground">
                                      {audioCurrentTime[item.id] || item.currentTime || '0:00'} / {item.duration || '0:00'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </CardContent>

                            <CardContent className="pt-0 border-t">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <Button variant="ghost" size="sm" className="gap-2 hover:text-primary">
                                    <Heart className="h-4 w-4" />
                                    <span>{item.likes}</span>
                                  </Button>
                                  <Button variant="ghost" size="sm" className="gap-2 hover:text-primary">
                                    <MessageCircle className="h-4 w-4" />
                                    <span>{item.comments}</span>
                                  </Button>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </DarkCard>
                        ))
                      ) : (
                        <Card className="text-center p-8">
                          <Music className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">Nada por aqui ainda</h3>
                          <p className="text-muted-foreground mb-4">
                            Seu feed está vazio. Siga outros músicos e comece a interagir!
                          </p>
                          <Button asChild>
                            <Link href="/explore">Explorar Comunidade</Link>
                          </Button>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="projects">
                    <div className="text-center py-12">
                      <Music className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">Seus Projetos</h3>
                      <p className="text-muted-foreground mb-6">
                        Gerencie e crie novos projetos musicais
                      </p>
                      <Button asChild>
                        <Link href="/projects">Ver Meus Projetos</Link>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="collaborations">
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">Colaborações</h3>
                      <p className="text-muted-foreground mb-6">
                        Veja e gerencie suas colaborações em andamento
                      </p>
                      <Button asChild>
                        <Link href="/collaborations">Ver Colaborações</Link>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="discover">
                    <div className="text-center py-12">
                      <Star className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">Descobrir</h3>
                      <p className="text-muted-foreground mb-6">
                        Encontre novos músicos e projetos incríveis
                      </p>
                      <Button asChild>
                        <Link href="/explore">Explorar</Link>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </DarkCard>
            
          </div>
        </div>
      </div>
    </div>
  )
}