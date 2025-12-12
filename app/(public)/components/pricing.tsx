'use client'

import { Check, X, Zap, Music, Users, Star, Crown, TrendingUp, Headphones, Mic, Video, Globe, Lock, Cloud, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FloatingFigures } from './FloatingFigures'
import { useState, useEffect, useRef } from 'react'

interface PlanFeature {
    name: string
    free: boolean | string
    jammer: boolean | string
    producer: boolean | string
    category: 'collab' | 'tools' | 'visibility' | 'support'
}

export function Pricing() {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout>()
    const totalSlides = 3

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)

        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        if (isMobile) {
            intervalRef.current = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % totalSlides)
            }, 10000)
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isMobile])

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

    const plans = [
        {
            id: 'free',
            name: 'Gratuito',
            tagline: 'Para começar sua jornada',
            price: {
                monthly: 'R$ 0',
                yearly: 'R$ 0'
            },
            description: 'Perfeito para músicos que estão começando a explorar colaborações',
            icon: Music,
            color: 'from-[#374151] to-[#6B7280]',
            buttonColor: 'bg-[#374151] hover:bg-[#2c1e4a]',
            popular: false,
            features: [
                '3 projetos ativos simultaneamente',
                'Colab com até 2 músicos por projeto',
                '1GB de armazenamento de áudio',
                'Ferramentas básicas de edição',
                'Comunidade aberta'
            ]
        },
        {
            id: 'jammer',
            name: 'Jammer',
            tagline: 'Para colaborações frequentes',
            price: {
                monthly: 'R$ 29',
                yearly: 'R$ 290'
            },
            description: 'Ideal para músicos ativos em múltiplas colaborações',
            icon: Users,
            color: 'from-[#fcd34d] to-[#fbbf24]',
            buttonColor: 'bg-[#fcd34d] hover:bg-[#f59e0b] text-[#2c1e4a]',
            popular: true,
            features: [
                '10 projetos ativos simultaneamente',
                'Colab com até 5 músicos por projeto',
                '10GB de armazenamento de áudio',
                'Ferramentas avançadas de mixagem',
                'Sessões ao vivo ilimitadas',
                'Direitos autorais básicos',
                'Perfil destacado na comunidade'
            ]
        },
        {
            id: 'producer',
            name: 'Producer',
            tagline: 'Para profissionais da música',
            price: {
                monthly: 'R$ 79',
                yearly: 'R$ 790'
            },
            description: 'Para produtores e músicos profissionais que vivem de colaborações',
            icon: Crown,
            color: 'from-[#2c1e4a] to-[#4c1d95]',
            buttonColor: 'bg-[#2c1e4a] hover:bg-[#1e1340]',
            popular: false,
            features: [
                'Projetos ilimitados ativos',
                'Colab com até 15 músicos por projeto',
                '100GB de armazenamento de áudio',
                'Ferramentas profissionais de masterização',
                'Sessões em estúdio virtual',
                'Direitos autorais avançados',
                'Divulgação na plataforma',
                'Suporte prioritário 24/7',
                'Analytics detalhados'
            ]
        }
    ]

    const featureCategories = [
        {
            id: 'collab',
            name: 'Colaboração',
            icon: Users,
            color: 'text-[#fcd34d]'
        },
        {
            id: 'tools',
            name: 'Ferramentas',
            icon: Zap,
            color: 'text-[#2c1e4a]'
        },
        {
            id: 'visibility',
            name: 'Visibilidade',
            icon: TrendingUp,
            color: 'text-[#374151]'
        },
        {
            id: 'support',
            name: 'Suporte',
            icon: Headphones,
            color: 'text-[#6B7280]'
        }
    ]

    const detailedFeatures: PlanFeature[] = [
        { name: 'Projetos simultâneos', free: '3', jammer: '10', producer: 'Ilimitados', category: 'collab' },
        { name: 'Músicos por projeto', free: '2', jammer: '5', producer: '15', category: 'collab' },
        { name: 'Sessões ao vivo', free: '3/mês', jammer: 'Ilimitadas', producer: 'Ilimitadas + estúdio', category: 'collab' },
        { name: 'Versionamento de tracks', free: true, jammer: true, producer: true, category: 'collab' },

        { name: 'Armazenamento de áudio', free: '1GB', jammer: '10GB', producer: '100GB', category: 'tools' },
        { name: 'Ferramentas de edição', free: 'Básicas', jammer: 'Avançadas', producer: 'Profissionais', category: 'tools' },
        { name: 'Plugins VST inclusos', free: false, jammer: 'Pacote Básico', producer: 'Pacote Completo', category: 'tools' },
        { name: 'Masterização automática', free: false, jammer: true, producer: 'Avançada + AI', category: 'tools' },

        { name: 'Perfil na comunidade', free: true, jammer: 'Destacado', producer: 'Premium + badges', category: 'visibility' },
        { name: 'Divulgação de projetos', free: false, jammer: 'Comunidade', producer: 'Plataforma inteira', category: 'visibility' },
        { name: 'Analytics de audiência', free: false, jammer: 'Básico', producer: 'Detalhado', category: 'visibility' },
        { name: 'Network recomendado', free: false, jammer: true, producer: 'Prioritário', category: 'visibility' },

        { name: 'Suporte por email', free: true, jammer: true, producer: true, category: 'support' },
        { name: 'Suporte por chat', free: false, jammer: '12h/dia', producer: '24/7 prioritário', category: 'support' },
        { name: 'Tutoriais e workshops', free: 'Comunidade', jammer: 'Exclusivos', producer: 'Personalizados', category: 'support' },
        { name: 'Consultoria mensal', free: false, jammer: false, producer: '1h/mês', category: 'support' },
    ]

    const renderCard = (plan: typeof plans[0], isMobileCard = false) => {
        const Icon = plan.icon
        return (
            <div className="relative group mb-8">
                {plan.popular && (
                    <div className="absolute -inset-4 bg-gradient-to-br from-[#fcd34d]/0 via-[#fcd34d]/5 to-[#2c1e4a]/0 rounded-3xl blur-xl transition-all duration-700 opacity-0 group-hover:opacity-100" />
                )}

                <Card className={`relative bg-white/95 backdrop-blur-sm border ${plan.popular ? 'border-[#fcd34d]/40 mt-6' : 'border-[#374151]/10'} shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 overflow-hidden h-full`}>

                    {plan.popular && (
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                            <Badge className="bg-gradient-to-r from-[#fcd34d] to-[#2c1e4a] text-white px-4 py-1.5 rounded-full border-2 border-white shadow-lg whitespace-nowrap">
                                <Star className="h-3 w-3 mr-1" />
                                Mais Escolhido
                            </Badge>
                        </div>
                    )}

                    <CardHeader className={`${isMobileCard ? 'pt-6 pb-4' : 'pt-6 md:pt-8 pb-4 md:pb-6'}`}>
                        <div className={`flex items-center justify-between ${isMobileCard ? 'mb-3' : 'mb-3 md:mb-4'}`}>
                            <div className={`${isMobileCard ? 'p-2' : 'p-2 md:p-3'} rounded-xl bg-gradient-to-br ${plan.color}/10`}>
                                <Icon className={`${isMobileCard ? 'h-5 w-5' : 'h-5 md:h-6 w-5 md:w-6'} ${plan.id === 'free' ? 'text-[#374151]' : plan.id === 'jammer' ? 'text-[#fcd34d]' : 'text-[#2c1e4a]'}`} />
                            </div>
                            {plan.popular && (
                                <Badge className="bg-gradient-to-r from-[#f9fafb] to-white text-[#374151] border border-[#374151]/15 text-xs md:text-sm mt-3">
                                    Recomendado
                                </Badge>
                            )}
                        </div>

                        <CardTitle className={`${isMobileCard ? 'text-xl' : 'text-xl md:text-2xl'} font-bold text-[#111827] mb-2`}>
                            {plan.name}
                        </CardTitle>
                        <p className="text-sm text-[#374151] font-medium">{plan.tagline}</p>

                        <div className={isMobileCard ? 'mt-4' : 'mt-4 md:mt-6'}>
                            <div className="flex items-baseline">
                                <span className={`${isMobileCard ? 'text-3xl' : 'text-3xl md:text-4xl'} font-bold text-[#111827]`}>
                                    {plan.price[billingPeriod]}
                                </span>
                                {plan.id !== 'free' && (
                                    <span className="text-[#374151]/60 ml-2 text-sm md:text-base">
                                        /{billingPeriod === 'monthly' ? 'mês' : 'ano'}
                                    </span>
                                )}
                            </div>
                            {plan.id !== 'free' && billingPeriod === 'yearly' && (
                                <p className="text-xs md:text-sm text-green-600 mt-1 font-medium">
                                    Economize R$ {parseInt(plan.price.monthly) * 12 - parseInt(plan.price.yearly)} por ano
                                </p>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="pb-6">
                        <p className="text-[#374151] mb-6">{plan.description}</p>

                        <div className="space-y-3">
                            {plan.features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className={`p-1 rounded-full ${plan.id === 'free' ? 'bg-[#374151]/10' : plan.id === 'jammer' ? 'bg-[#fcd34d]/10' : 'bg-[#2c1e4a]/10'}`}>
                                        <Check className={`h-4 w-4 ${plan.id === 'free' ? 'text-[#374151]' : plan.id === 'jammer' ? 'text-[#fcd34d]' : 'text-[#2c1e4a]'}`} />
                                    </div>
                                    <span className="text-sm text-[#374151]">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>

                    <CardFooter className="pt-6 border-t border-[#374151]/10">
                        <Button
                            className={`w-full py-6 text-base font-semibold rounded-xl transition-all duration-300 ${plan.buttonColor} ${plan.popular ? 'shadow-lg shadow-[#fcd34d]/30 hover:shadow-xl hover:shadow-[#fcd34d]/40' : ''}`}
                            size="lg"
                        >
                            {plan.id === 'free' ? 'Começar Gratuitamente' : `Escolher ${plan.name}`}
                            {plan.popular && <Zap className="ml-2 h-4 w-4" />}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f9fafb] via-white to-[#f9fafb]">
                <div className="absolute inset-0 opacity-[0.02]">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 800">
                        <defs>
                            <pattern id="pricing-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#2c1e4a" strokeWidth="1" opacity="0.05" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#pricing-grid)" />
                    </svg>
                </div>

                <FloatingFigures />

                <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-white via-white/90 to-transparent" />
                <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(44,30,74,0.02)]" />
            </div>

            <div className="relative z-10">
                <section className="py-20 md:py-28">
                    <div className="container px-4 md:px-6">

                        <div className="mx-auto max-w-4xl text-center mb-16">
                            <div className="inline-flex items-center justify-center gap-4 mb-8">
                                <div className="relative group">
                                    <div className="absolute -inset-3 bg-gradient-to-r from-[#fcd34d] to-[#fcd34d]/30 rounded-full opacity-20 blur-xl group-hover:opacity-30 transition-all duration-500" />
                                </div>
                                <h2 className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-[#2c1e4a] via-[#374151] to-[#2c1e4a] bg-clip-text text-transparent">
                                    Escolha Sua Jornada Musical
                                </h2>
                            </div>
                            <p className="text-xl text-[#374151] max-w-3xl mx-auto mb-6 font-normal">
                                Da primeira colaboração à produção profissional. Escolha o plano que combina com seu ritmo.
                            </p>
                            <div className="w-48 h-1 mx-auto bg-gradient-to-r from-transparent via-[#fcd34d] to-transparent rounded-full mb-12" />

                            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full p-1.5 border border-[#374151]/10 shadow-lg">
                                <button
                                    onClick={() => setBillingPeriod('monthly')}
                                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${billingPeriod === 'monthly'
                                        ? 'bg-gradient-to-r from-[#fcd34d] to-[#2c1e4a] text-white shadow-md'
                                        : 'text-[#374151] hover:text-[#2c1e4a]'
                                        }`}
                                >
                                    Mensal
                                </button>
                                <button
                                    onClick={() => setBillingPeriod('yearly')}
                                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${billingPeriod === 'yearly'
                                        ? 'bg-gradient-to-r from-[#fcd34d] to-[#2c1e4a] text-white shadow-md'
                                        : 'text-[#374151] hover:text-[#2c1e4a]'
                                        }`}
                                >
                                    Anual <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">-17%</span>
                                </button>
                            </div>
                        </div>

                        <div className="hidden md:grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-20">
                            {plans.map((plan) => renderCard(plan, false))}
                        </div>

                        <div className="md:hidden relative max-w-md mx-auto mb-20">
                            <div className="overflow-hidden rounded-2xl">
                                <div
                                    className="flex transition-transform duration-500 ease-in-out"
                                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                                >
                                    {plans.map((plan) => (
                                        <div key={plan.id} className="w-full flex-shrink-0 px-4">
                                            {renderCard(plan, true)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-center gap-2 mt-8">
                                {plans.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                            ? 'bg-[#fcd34d] w-6'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                            }`}
                                        aria-label={`Ir para plano ${index + 1}`}
                                    />
                                ))}
                            </div>

                            <div className="flex justify-between items-center mt-6 absolute top-1/2 left-0 right-0 -translate-y-1/2 px-2">
                                <button
                                    onClick={prevSlide}
                                    className="p-2 rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors duration-300"
                                    aria-label="Plano anterior"
                                >
                                    <ChevronLeft className="h-5 w-5 text-[#2c1e4a]" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="p-2 rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors duration-300"
                                    aria-label="Próximo plano"
                                >
                                    <ChevronRight className="h-5 w-5 text-[#2c1e4a]" />
                                </button>
                            </div>
                        </div>

                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-8 md:mb-12">
                                <h3 className="text-xl md:text-2xl font-bold text-[#111827] mb-4">Comparação Detalhada</h3>
                                <p className="text-sm md:text-base text-[#374151]">Veja todas as funcionalidades lado a lado</p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8">
                                {featureCategories.map((category) => {
                                    const Icon = category.icon
                                    return (
                                        <div
                                            key={category.id}
                                            className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#374151]/10 ${category.color} text-sm md:text-base font-medium`}
                                        >
                                            <Icon className="h-3 md:h-4 w-3 md:w-4" />
                                            {category.name}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="hidden md:block">
                                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#374151]/10 shadow-xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#374151]/10">
                                                    <th className="text-left p-6 text-[#111827] font-semibold">Funcionalidade</th>
                                                    <th className="text-center p-6">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[#374151] font-semibold">Gratuito</span>
                                                            <span className="text-sm text-[#374151]/60">Para iniciantes</span>
                                                        </div>
                                                    </th>
                                                    <th className="text-center p-6 relative">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[#fcd34d] font-semibold">Jammer</span>
                                                            <span className="text-sm text-[#374151]/60">Para ativos</span>
                                                            <div className="absolute -top-0 right-4">
                                                                <Badge className="bg-gradient-to-r from-[#fcd34d] to-[#fbbf24] text-[#2c1e4a] text-xs">
                                                                    Popular
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <th className="text-center p-6">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[#2c1e4a] font-semibold">Producer</span>
                                                            <span className="text-sm text-[#374151]/60">Para profissionais</span>
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailedFeatures.map((feature, index) => {
                                                    const category = featureCategories.find(c => c.id === feature.category)
                                                    return (
                                                        <tr key={index} className={`border-b border-[#374151]/5 ${index % 2 === 0 ? 'bg-white/50' : ''}`}>
                                                            <td className="p-4 pl-6">
                                                                <div className="flex items-center gap-3">
                                                                    {category && (
                                                                        <div className={`p-1.5 rounded-lg ${category.color.replace('text', 'bg')}/10`}>
                                                                            <category.icon className={`h-4 w-4 ${category.color}`} />
                                                                        </div>
                                                                    )}
                                                                    <span className="text-[#374151] font-medium">{feature.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                {typeof feature.free === 'boolean' ? (
                                                                    feature.free ? (
                                                                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                                                                    ) : (
                                                                        <X className="h-5 w-5 text-red-400 mx-auto" />
                                                                    )
                                                                ) : (
                                                                    <span className="text-[#374151] font-medium">{feature.free}</span>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-center bg-gradient-to-b from-[#fcd34d]/5 to-transparent">
                                                                {typeof feature.jammer === 'boolean' ? (
                                                                    feature.jammer ? (
                                                                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                                                                    ) : (
                                                                        <X className="h-5 w-5 text-red-400 mx-auto" />
                                                                    )
                                                                ) : (
                                                                    <span className="text-[#fcd34d] font-semibold">{feature.jammer}</span>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                {typeof feature.producer === 'boolean' ? (
                                                                    feature.producer ? (
                                                                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                                                                    ) : (
                                                                        <X className="h-5 w-5 text-red-400 mx-auto" />
                                                                    )
                                                                ) : (
                                                                    <span className="text-[#2c1e4a] font-semibold">{feature.producer}</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="md:hidden space-y-3">
                                {detailedFeatures.map((feature, index) => {
                                    const category = featureCategories.find(c => c.id === feature.category)
                                    return (
                                        <div key={index} className="bg-white/90 backdrop-blur-sm rounded-xl border border-[#374151]/10 shadow-sm p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                {category && (
                                                    <div className={`p-1 rounded ${category.color.replace('text', 'bg')}/10`}>
                                                        <category.icon className={`h-3 w-3 ${category.color}`} />
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium text-[#374151]">{feature.name}</span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-1 text-center">
                                                <div className="text-center">
                                                    <div className="text-[10px] text-[#374151]/60 mb-1">Gratuito</div>
                                                    {typeof feature.free === 'boolean' ? (
                                                        feature.free ? (
                                                            <Check className="h-3 w-3 text-green-500 mx-auto" />
                                                        ) : (
                                                            <X className="h-3 w-3 text-red-400 mx-auto" />
                                                        )
                                                    ) : (
                                                        <span className="text-xs font-medium text-[#374151]">{feature.free}</span>
                                                    )}
                                                </div>

                                                <div className="text-center">
                                                    <div className="text-[10px] text-[#374151]/60 mb-1">Jammer</div>
                                                    {typeof feature.jammer === 'boolean' ? (
                                                        feature.jammer ? (
                                                            <Check className="h-3 w-3 text-green-500 mx-auto" />
                                                        ) : (
                                                            <X className="h-3 w-3 text-red-400 mx-auto" />
                                                        )
                                                    ) : (
                                                        <span className="text-xs font-semibold text-[#fcd34d]">{feature.jammer}</span>
                                                    )}
                                                </div>

                                                <div className="text-center">
                                                    <div className="text-[10px] text-[#374151]/60 mb-1">Producer</div>
                                                    {typeof feature.producer === 'boolean' ? (
                                                        feature.producer ? (
                                                            <Check className="h-3 w-3 text-green-500 mx-auto" />
                                                        ) : (
                                                            <X className="h-3 w-3 text-red-400 mx-auto" />
                                                        )
                                                    ) : (
                                                        <span className="text-xs font-semibold text-[#2c1e4a]">{feature.producer}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="text-center mt-12 md:mt-20">
                            <div className="max-w-2xl mx-auto mb-6 md:mb-10">
                                <h3 className="text-xl md:text-2xl font-bold text-[#111827] mb-3 md:mb-4">Ainda em dúvida?</h3>
                                <p className="text-sm md:text-base text-[#374151]">
                                    Todos os planos incluem nossa comunidade ativa de músicos. Comece gratuitamente e
                                    atualize quando sentir necessidade.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                                <Button
                                    className="group relative gap-3 md:gap-4 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg bg-gradient-to-r from-[#fcd34d] via-[#2c1e4a] to-[#374151] text-white hover:from-[#374151] hover:via-[#2c1e4a] hover:to-[#fcd34d] transition-all duration-500 shadow-xl md:shadow-2xl hover:shadow-2xl md:hover:shadow-3xl hover:scale-105 border-2 border-white/20 rounded-xl md:rounded-2xl overflow-hidden"
                                    size="lg"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <Music className="h-5 md:h-6 w-5 md:w-6 relative z-10" />
                                    <span className="relative z-10 font-semibold">Começar Gratuitamente</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="px-6 md:px-8 py-4 md:py-6 text-base md:text-lg border-2 border-[#374151]/20 text-[#374151] hover:border-[#fcd34d]/40 hover:text-[#2c1e4a] hover:bg-white/80 rounded-xl md:rounded-2xl transition-all duration-300"
                                    size="lg"
                                >
                                    <Headphones className="h-4 md:h-5 w-4 md:w-5 mr-2" />
                                    Falar com Especialista
                                </Button>
                            </div>

                            <p className="text-xs md:text-sm text-[#374151]/60 mt-6 md:mt-8 font-light">
                                Todos os valores em Reais (BRL) • Cancele quando quiser • 7 dias de teste no Producer
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}