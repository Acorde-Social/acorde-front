'use client';

import { Music, Users, Search, Cloud, Layers, Bell, Shield, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useRef } from 'react';

interface IFeature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  category: 'colaboração' | 'produtividade' | 'segurança' | 'integração';
  highlights: string[];
  color: string;
}

const featureStats = [
  { value: '10K+', label: 'Músicos Ativos' },
  { value: '50K+', label: 'Colaborações' },
  { value: '99%', label: 'Satisfação' },
  { value: '24/7', label: 'Suporte' },
] as const;

const features: IFeature[] = [
  {
    id: '1',
    icon: <Users className="h-6 w-6" />,
    title: 'Match Inteligente',
    description:
      'Encontre colaboradores perfeitos baseado em estilo, habilidades e disponibilidade.',
    category: 'colaboração',
    highlights: ['Algoritmo de compatibilidade', 'Filtros avançados', 'Perfis verificados'],
    color: 'from-[#fcd34d] to-[#fcd34d]/70',
  },
  {
    id: '2',
    icon: <Layers className="h-6 w-6" />,
    title: 'Versionamento de Áudio',
    description: 'Controle de versões em tempo real para suas gravações e mixagens.',
    category: 'produtividade',
    highlights: ['Histórico completo', 'Comparação side-by-side', 'Rollback seguro'],
    color: 'from-[#2c1e4a] to-[#2c1e4a]/70',
  },
  {
    id: '3',
    icon: <Search className="h-6 w-6" />,
    title: 'Busca Avançada',
    description: 'Encontre músicos por instrumento, gênero, experiência e muito mais.',
    category: 'colaboração',
    highlights: ['Filtros por localização', 'Avaliações e reviews', 'Portfólio integrado'],
    color: 'from-[#374151] to-[#374151]/70',
  },
  {
    id: '4',
    icon: <Cloud className="h-6 w-6" />,
    title: 'Armazenamento',
    description: 'Guarde todos seus projetos, takes e versões.',
    category: 'produtividade',
    highlights: ['Backup automático', 'Acesso multiplataforma', 'Compartilhamento seguro'],
    color: 'from-[#fcd34d] to-[#2c1e4a]',
  },
  {
    id: '5',
    icon: <Music className="h-6 w-6" />,
    title: 'Ferramenta Estúdio',
    description: 'Comece e termine seus projetos diretamente com o Estúdio Acorde.',
    category: 'integração',
    highlights: ['Exportação nativa', 'Templates prontos', 'Atualizações automáticas'],
    color: 'from-[#374151] to-[#111827]',
  },
  {
    id: '6',
    icon: <Shield className="h-6 w-6" />,
    title: 'Direitos Autorais',
    description: 'Gestão automatizada de direitos e divisão de royalties.',
    category: 'segurança',
    highlights: ['Contratos digitais', 'Split sheets automáticos', 'Proteção legal'],
    color: 'from-[#2c1e4a] to-[#374151]',
  },
  {
    id: '7',
    icon: <Bell className="h-6 w-6" />,
    title: 'Notificações Inteligentes',
    description: 'Mantenha-se atualizado sobre colaborações e prazos importantes.',
    category: 'produtividade',
    highlights: ['Alertas personalizados', 'Lembretes de prazo', 'Resumos semanais'],
    color: 'from-[#fcd34d] to-[#374151]',
  },
  {
    id: '8',
    icon: <Zap className="h-6 w-6" />,
    title: 'Workflow Acelerado',
    description: 'Ferramentas para agilizar todo o processo criativo e técnico.',
    category: 'produtividade',
    highlights: ['Templates de projeto', 'Automação de tarefas', 'Análise de progresso'],
    color: 'from-[#2c1e4a] to-[#fcd34d]',
  },
];

const categories = [
  { id: 'colaboração', label: 'Colaboração', count: 2 },
  { id: 'produtividade', label: 'Produtividade', count: 4 },
  { id: 'segurança', label: 'Segurança', count: 1 },
  { id: 'integração', label: 'Integração', count: 1 },
];

export function Features() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8;
    }
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
        >
          <source
            src="https://pub-9e416a3ef36044a5aab78f234be56e68.r2.dev/dev/landing-page/videos/landingpage-bg-features-video1.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(44,30,74,0.02)]" />
      </div>

      <div className="relative z-10">
        <section className="py-8 md:py-10">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-5xl text-center mb-10 md:mb-14">
              <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="relative group">
                  <div className="absolute -inset-3 bg-gradient-to-r from-[#fcd34d] to-[#fcd34d]/30 rounded-full opacity-20 blur-xl group-hover:opacity-30 transition-all duration-500" />
                </div>
                <div>
                  <Badge className="mb-3 bg-gradient-to-r from-[#fcd34d]/10 to-[#2c1e4a]/10 text-[#2c1e4a] border border-[#fcd34d]/20 px-4 py-1.5 rounded-full font-medium dark:bg-[#111827]/70 dark:text-[#fcd34d] dark:border-[#fcd34d]/35">
                    Funcionalidades
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#2c1e4a] via-[#374151] to-[#2c1e4a] bg-clip-text text-transparent dark:from-[#fcd34d] dark:via-[#f3f4f6] dark:to-[#fcd34d]">
                    Tudo que você precisa
                  </h2>
                </div>
              </div>
              <p className="text-sm sm:text-lg md:text-xl text-[#374151] max-w-3xl mx-auto mb-5 sm:mb-6 dark:text-[#e5e7eb]">
                Ferramentas profissionais criadas especificamente para músicos e produtores
              </p>
              <div className="w-48 h-1 mx-auto bg-gradient-to-r from-transparent via-[#fcd34d] to-transparent rounded-full" />
            </div>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 md:mb-12">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="px-3 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-full bg-gradient-to-r from-white to-[#f9fafb] text-[#374151] border border-[#374151]/15 hover:border-[#fcd34d]/40 hover:text-[#2c1e4a] transition-all duration-300 font-medium text-xs sm:text-sm md:text-base shadow-sm hover:shadow-md dark:from-[#111827] dark:to-[#0b1020] dark:text-[#e5e7eb] dark:border-[#fcd34d]/25 dark:hover:text-[#fcd34d]"
                >
                  {category.label}
                  <span className="ml-2 text-[10px] sm:text-xs md:text-sm bg-gradient-to-r from-[#fcd34d]/10 to-[#2c1e4a]/10 text-[#2c1e4a] px-2 py-0.5 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 max-w-7xl mx-auto">
              {features.map((feature) => (
                <div key={feature.id} className="relative group">
                  <div className="absolute -inset-3 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-[#fcd34d]/5 group-hover:via-[#2c1e4a]/3 group-hover:to-[#fcd34d]/5 rounded-2xl blur-xl transition-all duration-700 opacity-0 group-hover:opacity-100" />

                  <Card className="relative bg-white/95 backdrop-blur-sm border border-[#374151]/10 group-hover:border-[#fcd34d]/40 h-full shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#fcd34d] to-transparent" />

                    <CardContent className="p-4 sm:p-5 lg:p-6 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-md`}
                        >
                          <div className="text-white">{feature.icon}</div>
                        </div>
                        <Badge className="bg-gradient-to-r from-[#f9fafb] to-white text-[#374151] border border-[#374151]/15 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium">
                          {feature.category}
                        </Badge>
                      </div>

                      <div className="mb-5">
                        <h3 className="font-bold text-base sm:text-lg text-[#111827] mb-2 group-hover:text-[#2c1e4a] transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#374151] leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      <div className="mt-auto pt-5 border-t border-[#374151]/10">
                        <ul className="space-y-2">
                          {feature.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start text-xs sm:text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#fcd34d] to-[#2c1e4a] mt-1.5 mr-3 flex-shrink-0" />
                              <span className="text-[#374151]">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#374151]/5">
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#fcd34d]/20 to-transparent rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="mt-8 md:mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {featureStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#2c1e4a] to-[#374151] bg-clip-text text-transparent dark:from-[#fcd34d] dark:to-[#f3f4f6]">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-[#374151] font-medium dark:text-[#e5e7eb]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
