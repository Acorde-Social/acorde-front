'use client';

import { WaveformBackground } from "@/components/common/WaveformBackground"

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Music,
  Users,
  Clock,
  Mic,
  Guitar,
  Headphones,
  Star,
  MessageCircle,
  Heart,
  Share2,
  Play,
  Pause,
  AudioWaveform,
  Plus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AvatarUpload } from '@/components/home/avatar-upload';
import { PostModal } from '@/components/home/post-modal';
import { Pencil } from 'lucide-react';
import { useMultiAudioPlayer } from '@/hooks/use-multi-audio-player';
import { useFeed } from '@/hooks/use-feed';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useUI } from '@/hooks/use-ui';
import { DarkCard } from '@/components/ui/dark-card';
import { FloatingFigures } from '@/components/common/FloatingFigures';
import { useRouter } from 'next/navigation';

interface IStats {
  projects: number;
  collaborations: number;
  followers: number;
  tracks: number;
}

export default function HomePage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const { playingAudioId, audioProgress, audioCurrentTime, handlePlayPause, handleSeek } =
    useMultiAudioPlayer();

  const shouldLoadFeed = !!user && !authLoading;
  const { feedItems, stats, isInitialLoading, isLoadingMore, hasMore, loadMore } = useFeed(shouldLoadFeed);
  const { lastElementRef: sentinelaRef } = useInfiniteScroll({
    loading: isLoadingMore,
    hasMore,
    onLoadMore: loadMore,
  });

  const { activeTab, setActiveTab, isPostModalOpen, setIsPostModalOpen } = useUI();

  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [authLoadingTimedOut, setAuthLoadingTimedOut] = useState(false);
  const hoverCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSidebarCard = (cardId: string) => {
    if (hoverCloseTimeoutRef.current) {
      clearTimeout(hoverCloseTimeoutRef.current);
      hoverCloseTimeoutRef.current = null;
    }
    setExpandedCard(cardId);
  };

  const closeSidebarCard = () => {
    if (hoverCloseTimeoutRef.current) {
      clearTimeout(hoverCloseTimeoutRef.current);
    }
    hoverCloseTimeoutRef.current = setTimeout(() => {
      setExpandedCard(null);
    }, 220);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading || user) {
      setAuthLoadingTimedOut(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setAuthLoadingTimedOut(true);
      router.replace('/login');
    }, 3500);

    return () => clearTimeout(timeoutId);
  }, [authLoading, user, router]);

  useEffect(() => {
    return () => {
      if (hoverCloseTimeoutRef.current) {
        clearTimeout(hoverCloseTimeoutRef.current);
      }
    };
  }, []);

  const handleQuickAction = (action: string) => {
    toast({
      title: 'Ação Rápida',
      description: `${action} iniciado com sucesso!`,
    });
  };

  const handlePostClick = () => {
    setIsPostModalOpen(true);
  };

  if ((authLoading && !user && !authLoadingTimedOut) || (user && isInitialLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Music className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-background relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9fafb] via-[#fcd34d]/10 to-[#2c1e4a]/10 dark:from-[#0f0c18] dark:via-[#3b2010]/15 dark:to-[#2c1e4a]/25" />
      <WaveformBackground />
      <div className="absolute inset-0">
        <div className="scale-175 opacity-60 dark:opacity-65">
          <FloatingFigures />
        </div>
      </div>

      <div className='relative z-10 min-h-screen'>
      <PostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
      <div className="py-8 px-4 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:gap-12">
          <div className="hidden lg:block fixed left-0 top-30 h-full z-40">
            <div className="w-16 h-[60%]">
              <div className="space-y-4">
                <div
                  className="relative"
                  onMouseEnter={() => openSidebarCard('profile')}
                  onMouseLeave={closeSidebarCard}
                >
                  <div className="w-full p-2 rounded-lg hover:bg-primary/10 transition-colors">
                    <AvatarUpload showCamera={false} />
                  </div>
                  {expandedCard === 'profile' && (
                    <div
                      className="absolute left-full top-0 ml-4 w-80"
                      onMouseEnter={() => openSidebarCard('profile')}
                      onMouseLeave={closeSidebarCard}
                    >
                      <DarkCard className="w-[90%] lg:w-[90%] xl:w-[80%] 2xl:w-[70%] text-foreground dark:text-white">
                        <div className="flex flex-col p-6 gap-4">
                          <div className="flex items-center gap-4 lg:flex-col">
                            <AvatarUpload showCamera={true} />
                            <div>
                              <h1 className="text-3xl lg:text-xl xl:text-xl 2xl:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black dark:text-white">
                                {user.name}!
                              </h1>
                              <div className="text-muted-foreground dark:text-white/85 flex flex-col items-center gap-1 mt-1 lg:items-center">
                                <Badge variant="outline" className="bg-primary/5 mt-2">
                                  {user.role}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="hidden md:flex justify-center w-full">
                            <Button
                              size="lg"
                              asChild
                              className="mt-4 lg:mt-4 xl:mt-6 2xl:mt-2 bg-secondary text-primary-light hover:bg-secondary/90"
                            >
                              <Link href="/studio">
                                <Mic className="h-4 w-4 mr-2" />
                                Estúdio
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </DarkCard>
                    </div>
                  )}
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => openSidebarCard('create-post')}
                  onMouseLeave={closeSidebarCard}
                >
                  <button className="w-full p-2 rounded-lg hover:bg-primary/10 transition-colors">
                    <Plus className="h-6 w-6 text-secondary dark:text-white mx-auto" />
                  </button>

                  {expandedCard === 'create-post' && (
                    <div
                      className="absolute left-full top-0 ml-4 w-80"
                      onMouseEnter={() => openSidebarCard('create-post')}
                      onMouseLeave={closeSidebarCard}
                    >
                      <DarkCard className="w-full lg:w-[90%] xl:w-[80%] 2xl:w-[70%] text-foreground dark:text-white">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Plus className="h-5 w-5 text-secondary dark:text-white" />
                            Criar Post
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <button
                            onClick={handlePostClick}
                            className="w-full text-left hover:text-primary transition-colors cursor-text relative group p-4 rounded-lg hover:bg-primary/5 border border-dashed border-secondary/30"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {user?.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="relative text-muted-foreground dark:text-white/85 group-hover:text-primary transition-colors">
                                    O que vai postar hoje?
                                    <span
                                      className="absolute -left-2 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-primary"
                                      style={{ animation: 'pulse 0.9s ease-in-out infinite' }}
                                    ></span>
                                  </span>
                                  <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                </div>
                                <p className="text-xs text-muted-foreground dark:text-white/75 mt-1">
                                  Compartilhe uma ideia, projeto ou colaboração
                                </p>
                              </div>
                            </div>
                          </button>
                        </CardContent>
                      </DarkCard>
                    </div>
                  )}
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => openSidebarCard('network')}
                  onMouseLeave={closeSidebarCard}
                >
                  <button className="w-full p-2 rounded-lg hover:bg-primary/10 transition-colors">
                    <AudioWaveform className="h-6 w-6 text-secondary dark:text-white mx-auto" />
                  </button>

                  {expandedCard === 'network' && (
                    <div
                      className="absolute left-full top-0 ml-4 w-80"
                      onMouseEnter={() => openSidebarCard('network')}
                      onMouseLeave={closeSidebarCard}
                    >
                      <DarkCard className="w-full lg:w-[90%] xl:w-[80%] 2xl:w-[70%] text-foreground dark:text-white">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <AudioWaveform className="h-5 w-5 text-secondary dark:text-white" />
                            Minha Rede
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 rounded-lg bg-muted/20 border border-secondary/10">
                              <div className="text-2xl font-bold text-primary">
                                {stats.projects}
                              </div>
                              <div className="text-xs text-muted-foreground dark:text-white/75">Projetos</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/20 border border-secondary/10">
                              <div className="text-2xl font-bold text-primary">
                                {stats.collaborations}
                              </div>
                              <div className="text-xs text-muted-foreground dark:text-white/75">Colabs</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/20 border border-secondary/10">
                              <div className="text-2xl font-bold text-primary">
                                {stats.followers}
                              </div>
                              <div className="text-xs text-muted-foreground dark:text-white/75">Seguidores</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/20 border border-secondary/10">
                              <div className="text-2xl font-bold text-primary">{stats.tracks}</div>
                              <div className="text-xs text-muted-foreground dark:text-white/75">Faixas</div>
                            </div>
                          </div>
                        </CardContent>
                      </DarkCard>
                    </div>
                  )}
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => openSidebarCard('actions')}
                  onMouseLeave={closeSidebarCard}
                >
                  <button className="w-full p-2 rounded-lg hover:bg-primary/10 transition-colors">
                    <Clock className="h-6 w-6 text-secondary dark:text-white mx-auto" />
                  </button>

                  {expandedCard === 'actions' && (
                    <div
                      className="absolute left-full top-0 ml-4 w-80"
                      onMouseEnter={() => openSidebarCard('actions')}
                      onMouseLeave={closeSidebarCard}
                    >
                      <DarkCard className="w-full lg:w-[90%] xl:w-[80%] 2xl:w-[80%] text-foreground dark:text-white">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-secondary dark:text-white" />
                            Ações Rápidas
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button
                            variant="outline"
                            className="w-full justify-start hover:bg-primary/5 transition-all font-bold bg-muted/20 text-secondary dark:text-white"
                            onClick={() => handleQuickAction('Gravação rápida')}
                          >
                            <Mic className="h-4 w-4 mr-3 text-secondary dark:text-white" />
                            Gravar Ideia
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start hover:bg-primary/5 transition-all font-bold bg-muted/20 text-secondary dark:text-white"
                            asChild
                          >
                            <Link href="/projects/new">
                              <Music className="h-4 w-4 mr-3 text-secondary dark:text-white" />
                              Novo Projeto
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start hover:bg-primary/5 transition-all font-bold bg-muted/20 text-secondary dark:text-white"
                            asChild
                          >
                            <Link href="/explore">
                              <Users className="h-4 w-4 mr-3 text-secondary dark:text-white" />
                              Encontrar Músicos
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start hover:bg-primary/5 font-bold bg-muted/20 text-secondary dark:text-white"
                            asChild
                          >
                            <Link href="/collaborations">
                              <Guitar className="h-4 w-4 mr-3 text-secondary dark:text-white" />
                              Minhas Colabs
                            </Link>
                          </Button>
                        </CardContent>
                      </DarkCard>
                    </div>
                  )}
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => openSidebarCard('recommended')}
                  onMouseLeave={closeSidebarCard}
                >
                  <button className="w-full p-2 rounded-lg hover:bg-primary/10 transition-colors">
                    <Star className="h-6 w-6 text-secondary dark:text-white mx-auto" />
                  </button>

                  {expandedCard === 'recommended' && (
                    <div
                      className="absolute left-full top-0 ml-4 w-80"
                      onMouseEnter={() => openSidebarCard('recommended')}
                      onMouseLeave={closeSidebarCard}
                    >
                      <DarkCard className="w-full lg:w-[90%] xl:w-[80%] 2xl:w-[80%] text-foreground dark:text-white">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Star className="h-5 w-5 text-secondary dark:text-white" />
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
                                <p className="text-sm font-medium truncate dark:text-white">Rafael Jazz</p>
                                <p className="text-xs text-muted-foreground dark:text-white/75">Saxofonista</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                  BP
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate dark:text-white">Banda Progressiva</p>
                                <p className="text-xs text-muted-foreground dark:text-white/75">Projeto</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </DarkCard>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-80 max-w-2xl mx-auto lg:ml-[25%] lg:mx-0 xl:ml-[30%] 2xl:ml-[35%]">
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
                      {isInitialLoading ? (
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
                                    <AvatarImage
                                      src={item.author.avatarUrl}
                                      alt={item.author.name}
                                    />
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
                                          locale: ptBR,
                                        })}
                                      </span>
                                      <span>•</span>
                                      <Badge variant="outline" className="text-xs">
                                        {item.type === 'project'
                                          ? 'Projeto'
                                          : item.type === 'track'
                                            ? 'Faixa'
                                            : 'Colaboração'}
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
                                          <Play className="h-4 w-4 text-primary" />
                                        )}
                                      </Button>
                                      <div className="flex-1">
                                        <div
                                          className="h-1 bg-muted rounded-full cursor-pointer"
                                          onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const clickX = e.clientX - rect.left;
                                            const percentage = clickX / rect.width;
                                            handleSeek(item, percentage);
                                          }}
                                        >
                                          <div
                                            className="h-1 bg-primary rounded-full transition-all"
                                            style={{
                                              width: `${(audioProgress[item.id] || item.progress || 0) * 100}%`,
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {audioCurrentTime[item.id] || item.currentTime || '0:00'} /{' '}
                                      {item.duration || '0:00'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                            <CardContent className="pt-0 border-t">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2 hover:text-primary"
                                  >
                                    <Heart className="h-4 w-4" />
                                    <span>{item.likes}</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2 hover:text-primary"
                                  >
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
                      {hasMore && <div ref={sentinelaRef} className="h-10" />}
                      {isLoadingMore && (
                        <p className="text-center text-sm text-muted-foreground">carregando mais posts</p>
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
    </div>
  );
}
