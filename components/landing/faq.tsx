'use client';

import { useCallback, useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle, Headphones, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FAQ_ITEMS } from './faq-data';
import { FloatingFigures } from '../common/FloatingFigures'

const statsData = [
  { label: 'Resposta em 24h', value: 'Suporte rápido' },
  { label: '99% satisfação', value: 'Avaliação' },
  { label: '+50 mil', value: 'Músicos' },
  { label: '24/7', value: 'Comunidade' },
] as const;

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = useCallback((id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }, []);

  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const itemsWithExpanded = filteredItems.map((item) => ({
    ...item,
    isExpanded: expandedItems.includes(item.id),
  }));

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9fafb] via-[#fffbeb] to-[#f9fafb] dark:from-[#050507] dark:via-[#120a1a] dark:to-[#050507]">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 800">
            <defs>
              <pattern id="faq-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path
                  d="M 80 0 L 0 0 0 80"
                  fill="none"
                  stroke="#2c1e4a"
                  strokeWidth="0.5"
                  opacity="0.05"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#faq-grid)" />
          </svg>
        </div>
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(44,30,74,0.02)]" />
      </div>

      <FloatingFigures />

      <div className="relative z-10">
        <section className="py-8 md:py-10">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-10 md:mb-12">
              <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 rounded-lg bg-[#2c1e4a]/5 dark:bg-[#fcd34d]/10">
                  <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-[#2c1e4a] dark:text-[#fcd34d]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl text-[#2c1e4a] dark:text-[#fcd34d]">
                  Perguntas Frequentes
                </h2>
              </div>
              <p className="text-sm sm:text-lg text-[#374151] max-w-2xl mx-auto mb-6 sm:mb-8 dark:text-[#e5e7eb]">
                Encontre respostas rápidas para dúvidas comuns sobre colaboração musical
              </p>
              <div className="w-32 h-0.5 mx-auto bg-gradient-to-r from-transparent via-[#fcd34d] to-transparent rounded-full mb-8" />
            </div>

            <div className="max-w-xl mx-auto mb-8 sm:mb-10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#374151]/40 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar perguntas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-[#374151]/20 bg-white/80 rounded-xl dark:bg-[#111827]/80 dark:border-[#fcd34d]/30 dark:text-[#f3f4f6] dark:placeholder:text-[#9ca3af]
                focus:border-[#fcd34d] focus:ring-2 focus:ring-[#fcd34d]/20
                outline-none transition-all duration-200
                [&:focus-visible]:outline-none [&:focus-visible]:ring-2 [&:focus-visible]:ring-[#fcd34d]/20"
                />
              </div>
              {searchQuery && (
                <p className="text-sm text-[#374151]/60 text-center mt-3 dark:text-[#9ca3af]">
                  {filteredItems.length} {filteredItems.length === 1 ? 'resultado' : 'resultados'}
                </p>
              )}
            </div>

            <div className="max-w-2xl mx-auto space-y-2">
              {itemsWithExpanded.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/80 backdrop-blur-sm border border-[#374151]/10 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 dark:bg-[#111827]/75 dark:border-[#fcd34d]/20"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full p-3 sm:p-4 text-left flex items-start justify-between gap-3 hover:bg-white/50 transition-colors duration-200 dark:hover:bg-[#0f172a]/60"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1"></div>
                      <h3 className="text-sm sm:text-base font-semibold text-[#111827] pr-4 sm:pr-6 dark:text-[#f3f4f6]">
                        {item.question}
                      </h3>
                    </div>
                    {item.isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-[#374151] dark:text-[#cbd5e1] flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#374151] dark:text-[#cbd5e1] flex-shrink-0 mt-1" />
                    )}
                  </button>

                  {item.isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="w-8 h-0.5 bg-gradient-to-r from-[#fcd34d] to-[#fcd34d]/50 rounded-full mb-3" />
                      <p className="text-sm text-[#374151] leading-relaxed pl-1 dark:text-[#d1d5db]">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-10 sm:mt-12 md:mt-14">
              <div className="max-w-xl mx-auto mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-[#111827] mb-3 dark:text-[#f3f4f6]">
                  Não encontrou sua resposta?
                </h3>
                <p className="text-[#374151] text-xs sm:text-sm dark:text-[#d1d5db]">
                  Nossa equipe está pronta para ajudar você pessoalmente
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="gap-2 px-6 py-3 bg-gradient-to-r from-[#fcd34d] to-[#2c1e4a] text-white hover:from-[#2c1e4a] hover:to-[#fcd34d] transition-all duration-300 shadow-md hover:shadow-lg rounded-xl"
                  size="default"
                >
                  <Headphones className="h-4 w-4" />
                  Falar com Suporte
                </Button>

                <Button
                  variant="outline"
                  className="px-6 py-3 border border-[#374151]/20 text-[#374151] hover:border-[#fcd34d] hover:text-[#2c1e4a] hover:bg-white/80 rounded-xl transition-all duration-300 dark:border-[#fcd34d]/35 dark:text-[#f3f4f6] dark:hover:text-[#fcd34d] dark:hover:bg-[#111827]/80"
                  size="default"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Acessar Comunidade
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-xl mx-auto">
                {statsData.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs sm:text-sm font-semibold text-[#2c1e4a] dark:text-[#fcd34d]">{stat.label}</div>
                    <div className="text-xs text-[#374151]/60 dark:text-[#9ca3af]">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
