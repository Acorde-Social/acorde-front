'use client';

import { ArrowRight, Sparkles, Users, TrendingUp, Music, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FloatingFigures } from '../common/FloatingFigures';
import type { LucideIcon } from 'lucide-react';

interface IStat {
  value: string;
  label: string;
  icon: LucideIcon;
}

const stats: IStat[] = [
  { value: '50K+', label: 'Músicos Conectados', icon: Users },
  { value: '99%', label: 'Satisfação', icon: TrendingUp },
  { value: '24h', label: 'Primeira Colab', icon: CheckCircle },
];

export function FinalCTA() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [glowingButton, setGlowingButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    const glowInterval = setInterval(() => {
      setGlowingButton((prev) => !prev);
    }, 3000);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(glowInterval);
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9fafb] via-white to-[#f9fafb]">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 400">
            <defs>
              <pattern id="cta-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="1" fill="#2c1e4a" opacity="0.2" />
                <circle cx="60" cy="30" r="1" fill="#fcd34d" opacity="0.2" />
                <circle cx="30" cy="60" r="1" fill="#374151" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-pattern)" />
          </svg>
        </div>

        <div className="absolute inset-0">
          <div className="scale-175 opacity-50">
            <FloatingFigures />
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fcd34d] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2c1e4a] to-transparent" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#fcd34d] via-[#2c1e4a] to-[#fcd34d] opacity-20">
        <div
          className="h-full bg-gradient-to-r from-[#fcd34d] to-[#2c1e4a] transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="relative z-10">
        <section className="py-16 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 mb-8">
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-r from-[#fcd34d] to-[#fcd34d]/30 rounded-full opacity-20 blur-xl" />
                  <Sparkles className="relative h-5 w-5 text-[#fcd34d]" />
                </div>
                <span className="text-sm font-semibold text-[#2c1e4a] bg-gradient-to-r from-[#fcd34d]/10 to-[#2c1e4a]/10 px-4 py-1.5 rounded-full border border-[#fcd34d]/20">
                  Última Etapa
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-[#2c1e4a] via-[#374151] to-[#2c1e4a] bg-clip-text text-transparent">
                  Sua Jornada Musical{' '}
                </span>
                <span className="text-[#fcd34d] relative">
                  Começa Aqui
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#fcd34d] to-transparent" />
                </span>
              </h2>

              <p className="text-lg md:text-xl text-[#374151] max-w-2xl mx-auto mb-10">
                Junte-se à comunidade que está redefinindo como a música é criada. O próximo grande
                projeto pode começar com um simples clique.
              </p>

              <div className="flex justify-center gap-6 md:gap-10 mb-12">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-white to-[#f9fafb] border border-[#374151]/10">
                          <Icon className="h-4 w-4 text-[#2c1e4a]" />
                        </div>
                        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#2c1e4a] to-[#374151] bg-clip-text text-transparent">
                          {stat.value}
                        </div>
                      </div>
                      <div className="text-xs md:text-sm text-[#374151] font-medium">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mb-12">
                <Button
                  asChild
                  size="lg"
                  className={`group relative px-10 py-7 text-lg font-semibold rounded-2xl overflow-hidden transition-all duration-500 
                    ${glowingButton ? 'shadow-[0_0_40px_rgba(252,211,77,0.4)]' : 'shadow-2xl'}
                    bg-gradient-to-r from-[#fcd34d] via-[#2c1e4a] to-[#374151] 
                    hover:from-[#374151] hover:via-[#2c1e4a] hover:to-[#fcd34d]
                    hover:shadow-[0_0_50px_rgba(252,211,77,0.6)]`}
                >
                  <Link href="/login">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    <span className="relative z-10 flex items-center gap-3">
                      Criar Minha Conta Gratuita
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>

                    {glowingButton && (
                      <div className="absolute -inset-2 rounded-2xl border-2 border-[#fcd34d]/30 animate-ping" />
                    )}
                  </Link>
                </Button>
              </div>

              <div className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-[#374151]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium">Sem compromisso</span>
                  </div>
                  <div className="hidden sm:block w-4 h-px bg-[#374151]/20" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#fcd34d] animate-pulse" />
                    <span className="font-medium">Cancelamento fácil</span>
                  </div>
                  <div className="hidden sm:block w-4 h-px bg-[#374151]/20" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#2c1e4a] animate-pulse" />
                    <span className="font-medium">Comunidade ativa</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#374151]/10">
                  <p className="text-sm text-[#374151]/60 italic">
                    "A música que você sempre quis fazer está a uma conexão de distância."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
