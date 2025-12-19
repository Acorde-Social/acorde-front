export interface IFAQItem {
    id: string
    question: string
    answer: string
}

export const FAQ_ITEMS: IFAQItem[] = [
        {
            id: '1',
            question: 'Como começar a colaborar com outros músicos?',
            answer: 'Crie seu perfil, adicione habilidades e instrumentos. Use a busca para encontrar músicos por gênero ou instrumento. Envie solicitações de colaboração ou responda às existentes.'
        },
        /*
        {
            id: '2',
            question: 'Quais são os planos de assinatura disponíveis?',
            answer: 'Gratuito (3 projetos, 1GB), Jammer (R$29/mês, 10 projetos, 10GB) e Producer (R$79/mês, ilimitado, 100GB). Todos incluem acesso à comunidade.'
        },
        */
        {
            id: '3',
            question: 'Como funciona a proteção de direitos autorais?',
            answer: 'Todas as colaborações geram registro automático com timestamp. Oferecemos splits automáticos de direitos configuráveis por participação.'
        },
        {
            id: '4',
            question: 'Posso colaborar com músicos de outros países?',
            answer: 'Sim! A plataforma suporta colaboração global com ferramentas de sync de BPM e compensação de latência em sessões ao vivo.'
        },
        {
            id: '5',
            question: 'Como funciona o armazenamento de projetos?',
            answer: 'Armazenamos todas as versões das suas tracks com histórico completo e rollback. Backups automáticos em múltiplas regiões.'
        },
        {
            id: '6',
            question: 'Há limite de colaborações simultâneas?',
            answer: 'Até 10 projetos.'
        },
        {
            id: '7',
            question: 'Qual a política de cancelamento?',
            answer: 'Cancele a qualquer momento sem taxas. Mantém acesso até o fim do ciclo pago. Dados preservados por 6 meses após cancelamento.'
        },
        {
            id: '8',
            question: 'Como funciona a comunidade de feedback?',
            answer: 'Compartilhe trechos para feedback anônimo ou direcionado. Sistema de votação e comentários timestampados. Grupos por gênero musical.'
        }
    ]
