import { PaginatedResponse, IFeedItem } from '@/types/feed'

export interface Stats {
    projects: number
    collaborations: number
    followers: number
    tracks: number
}

export function getMockFeedItems(): IFeedItem[] {
    return [
        {
            id: '1',
            type: 'track',
            title: 'Nova Melodia em Sol',
            description: 'Acabei de finalizar essa nova composição. O que acham?',
            author: {
                name: 'Ana Beatriz',
                avatarUrl: '',
                role: 'PRODUCER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 30),
            likes: 24,
            comments: 8,
            genre: 'Pop',
            bpm: 120,
            key: 'G',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            duration: '3:42',
            currentTime: '0:00',
            progress: 0.33
        },
        {
            id: '2',
            type: 'project',
            title: 'Colaboração Jazz Fusion',
            description: 'Procurando saxofonista e baterista para projeto de jazz fusion',
            author: {
                name: 'Carlos Santos',
                avatarUrl: '',
                role: 'COMPOSER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 120),
            likes: 15,
            comments: 12,
            genre: 'Jazz Fusion',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            duration: '3:30',
            currentTime: '0:00',
            progress: 0.35
        },
        {
            id: '3',
            type: 'collaboration',
            title: 'Participação em Trilha Sonora',
            description: 'Fui convidado para compor a trilha de um documentário!',
            author: {
                name: 'Marina Oliveira',
                avatarUrl: '',
                role: 'COMPOSER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 360),
            likes: 42,
            comments: 5,
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            duration: '3:18',
            currentTime: '0:00',
            progress: 0.5
        },
        {
            id: '4',
            type: 'track',
            title: 'Beat Eletrônico Experimental',
            description: 'Produção de beat eletrônico com sons sintetizados. Feedback?',
            author: {
                name: 'Lucas Teixeira',
                avatarUrl: '',
                role: 'PRODUCER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 600),
            likes: 37,
            comments: 14,
            genre: 'Eletrônico',
            bpm: 140,
            key: 'D',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
            duration: '4:15',
            currentTime: '0:00',
            progress: 0.45
        },
        {
            id: '5',
            type: 'project',
            title: 'Gravação de Álbum Indie Rock',
            description: 'Estou montando uma banda de indie rock. Guitarristas e baixistas interessados, me chama!',
            author: {
                name: 'Felipe Rocha',
                avatarUrl: '',
                role: 'MUSICIAN'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 900),
            likes: 28,
            comments: 9,
            genre: 'Indie Rock',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
            duration: '3:52',
            currentTime: '0:00',
            progress: 0.28
        },
        {
            id: '6',
            type: 'collaboration',
            title: 'Remix de Clássico do MPB',
            description: 'Colaborei remixando um clássico do MPB com técnicas modernas. Ouça e deixe seu comentário!',
            author: {
                name: 'Isabella Santos',
                avatarUrl: '',
                role: 'PRODUCER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 1200),
            likes: 55,
            comments: 18,
            genre: 'MPB',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
            duration: '5:10',
            currentTime: '0:00',
            progress: 0.52
        },
        {
            id: '7',
            type: 'track',
            title: 'Composição Erudita Minimalista',
            description: 'Peça minimalista inspirada em Erik Satie. Sugestões para melhorias?',
            author: {
                name: 'Pedro Mendes',
                avatarUrl: '',
                role: 'COMPOSER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 1500),
            likes: 19,
            comments: 6,
            genre: 'Clássico',
            bpm: 60,
            key: 'C',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
            duration: '6:30',
            currentTime: '0:00',
            progress: 0.38
        },
        {
            id: '8',
            type: 'project',
            title: 'Trilha Sonora para Jogo Indie',
            description: 'Procuro compositores para criar trilha sonora de jogo indie. Projeto remunerado!',
            author: {
                name: 'Amanda Costa',
                avatarUrl: '',
                role: 'DEVELOPER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 1800),
            likes: 61,
            comments: 25,
            genre: 'Eletrônico',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
            duration: '2:45',
            currentTime: '0:00',
            progress: 0.42
        },
        {
            id: '9',
            type: 'collaboration',
            title: 'Sessão de Improvisação Jazz',
            description: 'Participei de uma sessão incrível de improvisação jazz. Que experiência enriquecedora!',
            author: {
                name: 'Rodrigo Fonseca',
                avatarUrl: '',
                role: 'MUSICIAN'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 2100),
            likes: 44,
            comments: 11,
            genre: 'Jazz',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
            duration: '7:20',
            currentTime: '0:00',
            progress: 0.55
        },
        {
            id: '10',
            type: 'track',
            title: 'Homenagem ao Samba Clássico',
            description: 'Fiz uma versão moderna de um samba clássico. Homenageando os grandes mestres!',
            author: {
                name: 'Beatriz Lima',
                avatarUrl: '',
                role: 'MUSICIAN'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 2400),
            likes: 72,
            comments: 20,
            genre: 'Samba',
            bpm: 130,
            key: 'G',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
            duration: '4:45',
            currentTime: '0:00',
            progress: 0.48
        },
        {
            id: '11',
            type: 'project',
            title: 'EP Lo-fi Colaborativo',
            description: 'Buscando vocalistas para fechar um EP lo-fi com 5 faixas autorais.',
            author: {
                name: 'Nina Albuquerque',
                avatarUrl: '',
                role: 'PRODUCER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 2700),
            likes: 33,
            comments: 7,
            genre: 'Lo-fi',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
            duration: '3:58',
            currentTime: '0:00',
            progress: 0.31
        },
        {
            id: '12',
            type: 'track',
            title: 'Demo Synthwave Noturna',
            description: 'Primeira versão da faixa synthwave. Quero opinião sobre mix e timbres.',
            author: {
                name: 'Diego Barreto',
                avatarUrl: '',
                role: 'COMPOSER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 3000),
            likes: 41,
            comments: 16,
            genre: 'Synthwave',
            bpm: 118,
            key: 'A',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
            duration: '4:08',
            currentTime: '0:00',
            progress: 0.36
        },
        {
            id: '13',
            type: 'collaboration',
            title: 'Sessão Acústica ao Vivo',
            description: 'Gravei uma sessão acústica com dois amigos músicos. Foi mágico!',
            author: {
                name: 'Larissa Menezes',
                avatarUrl: '',
                role: 'MUSICIAN'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 3300),
            likes: 66,
            comments: 22,
            genre: 'Acústico',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
            duration: '5:02',
            currentTime: '0:00',
            progress: 0.49
        },
        {
            id: '14',
            type: 'project',
            title: 'Trilha para Curta-Metragem',
            description: 'Projeto aberto para compositor(a) de cordas e designer de som.',
            author: {
                name: 'Rafael Monteiro',
                avatarUrl: '',
                role: 'DEVELOPER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 3600),
            likes: 24,
            comments: 4,
            genre: 'Cinemático',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
            duration: '2:59',
            currentTime: '0:00',
            progress: 0.21
        },
        {
            id: '15',
            type: 'track',
            title: 'Groove Funk 106 BPM',
            description: 'Linha de baixo nova, bateria humana e guitarra limpa. Feedback no groove?',
            author: {
                name: 'João Varella',
                avatarUrl: '',
                role: 'MUSICIAN'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 3900),
            likes: 58,
            comments: 13,
            genre: 'Funk',
            bpm: 106,
            key: 'E',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
            duration: '4:21',
            currentTime: '0:00',
            progress: 0.43
        },
        {
            id: '16',
            type: 'collaboration',
            title: 'Parceria Trap + MPB',
            description: 'Misturei elementos de trap com harmonia brasileira. Curtiu a ideia?',
            author: {
                name: 'Camila Prado',
                avatarUrl: '',
                role: 'PRODUCER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 4200),
            likes: 70,
            comments: 30,
            genre: 'Trap',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
            duration: '3:40',
            currentTime: '0:00',
            progress: 0.57
        },
        {
            id: '17',
            type: 'project',
            title: 'Banda de Post-Rock',
            description: 'Precisamos de baterista e tecladista para projeto autoral de post-rock.',
            author: {
                name: 'Thiago Ramos',
                avatarUrl: '',
                role: 'MUSICIAN'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 4500),
            likes: 29,
            comments: 8,
            genre: 'Post-rock',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3',
            duration: '6:12',
            currentTime: '0:00',
            progress: 0.26
        },
        {
            id: '18',
            type: 'track',
            title: 'Piano Solo em Ré Menor',
            description: 'Composição intimista para piano solo, gravada em take único.',
            author: {
                name: 'Helena Duarte',
                avatarUrl: '',
                role: 'COMPOSER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 4800),
            likes: 47,
            comments: 10,
            genre: 'Instrumental',
            bpm: 72,
            key: 'Dm',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3',
            duration: '5:33',
            currentTime: '0:00',
            progress: 0.40
        },
        {
            id: '19',
            type: 'collaboration',
            title: 'Jam Session de Blues',
            description: 'Rolou jam de blues com músicos de três cidades diferentes.',
            author: {
                name: 'Murilo Cezar',
                avatarUrl: '',
                role: 'MUSICIAN'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 5100),
            likes: 53,
            comments: 19,
            genre: 'Blues',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-19.mp3',
            duration: '4:50',
            currentTime: '0:00',
            progress: 0.46
        },
        {
            id: '20',
            type: 'track',
            title: 'Drum & Bass de Estúdio',
            description: 'Finalizei a master de uma faixa de DnB para pista.',
            author: {
                name: 'Edu Siqueira',
                avatarUrl: '',
                role: 'PRODUCER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 5400),
            likes: 80,
            comments: 26,
            genre: 'Drum and Bass',
            bpm: 174,
            key: 'F#',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-20.mp3',
            duration: '3:36',
            currentTime: '0:00',
            progress: 0.61
        },
        {
            id: '21',
            type: 'project',
            title: 'Sessão de Gravação Soul',
            description: 'Procurando backing vocals para sessão de soul com banda completa.',
            author: {
                name: 'Gabriela Nunes',
                avatarUrl: '',
                role: 'MUSICIAN'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 5700),
            likes: 35,
            comments: 9,
            genre: 'Soul',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            duration: '4:12',
            currentTime: '0:00',
            progress: 0.27
        },
        {
            id: '22',
            type: 'track',
            title: 'House Melódico Sunrise',
            description: 'Nova demo de house melódico inspirada em set de festival.',
            author: {
                name: 'Victor Azevedo',
                avatarUrl: '',
                role: 'PRODUCER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 6000),
            likes: 62,
            comments: 17,
            genre: 'House',
            bpm: 124,
            key: 'B',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            duration: '5:00',
            currentTime: '0:00',
            progress: 0.51
        },
        {
            id: '23',
            type: 'collaboration',
            title: 'Live Loop com Violino',
            description: 'Colab com violinista usando live looping e camadas ambientais.',
            author: {
                name: 'Renan Coelho',
                avatarUrl: '',
                role: 'COMPOSER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 6300),
            likes: 49,
            comments: 12,
            genre: 'Ambient',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            duration: '6:01',
            currentTime: '0:00',
            progress: 0.33
        },
        {
            id: '24',
            type: 'project',
            title: 'Quarteto de Choro Moderno',
            description: 'Montando quarteto de choro com arranjos contemporâneos.',
            author: {
                name: 'Paula Rios',
                avatarUrl: '',
                role: 'MUSICIAN'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 6600),
            likes: 27,
            comments: 5,
            genre: 'Choro',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
            duration: '3:48',
            currentTime: '0:00',
            progress: 0.22
        },
        {
            id: '25',
            type: 'track',
            title: 'Afrobeat Session Groove',
            description: 'Teste de mix da nova faixa afrobeat com metais e percussão.',
            author: {
                name: 'Samuel Torres',
                avatarUrl: '',
                role: 'PRODUCER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 6900),
            likes: 74,
            comments: 21,
            genre: 'Afrobeat',
            bpm: 102,
            key: 'Am',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
            duration: '4:27',
            currentTime: '0:00',
            progress: 0.58
        },
        {
            id: '26',
            type: 'collaboration',
            title: 'Remix de Forró Eletrônico',
            description: 'Remix colaborativo misturando zabumba com synth bass.',
            author: {
                name: 'Tânia Lacerda',
                avatarUrl: '',
                role: 'PRODUCER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 7200),
            likes: 83,
            comments: 28,
            genre: 'Forró',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
            duration: '3:31',
            currentTime: '0:00',
            progress: 0.63
        },
        {
            id: '27',
            type: 'project',
            title: 'Trilha de Podcast Narrativo',
            description: 'Aberta seleção de sound designer para trilha de podcast.',
            author: {
                name: 'Igor Mattos',
                avatarUrl: '',
                role: 'DEVELOPER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 7500),
            likes: 31,
            comments: 6,
            genre: 'Soundtrack',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
            duration: '2:58',
            currentTime: '0:00',
            progress: 0.19
        },
        {
            id: '28',
            type: 'track',
            title: 'Bossa Nova Chill Mix',
            description: 'Versão chill de bossa nova para playlist noturna.',
            author: {
                name: 'Marcos Pires',
                avatarUrl: '',
                role: 'MUSICIAN'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 7800),
            likes: 45,
            comments: 11,
            genre: 'Bossa Nova',
            bpm: 94,
            key: 'F',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
            duration: '4:41',
            currentTime: '0:00',
            progress: 0.37
        },
        {
            id: '29',
            type: 'collaboration',
            title: 'Dueto de Voz e Piano',
            description: 'Gravação de dueto em home studio com arranjo minimalista.',
            author: {
                name: 'Clara Veloso',
                avatarUrl: '',
                role: 'COMPOSER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 8100),
            likes: 52,
            comments: 14,
            genre: 'Ballad',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
            duration: '5:14',
            currentTime: '0:00',
            progress: 0.44
        },
        {
            id: '30',
            type: 'track',
            title: 'Techno Peak Hour',
            description: 'Faixa techno para pista, foco em kick e low-end limpos.',
            author: {
                name: 'Bruno Salgado',
                avatarUrl: '',
                role: 'PRODUCER'
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 8400),
            likes: 91,
            comments: 34,
            genre: 'Techno',
            bpm: 132,
            key: 'Gm',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
            duration: '4:03',
            currentTime: '0:00',
            progress: 0.69
        }
    ]
}

export function getMockStats(): Stats {
    return {
        projects: 12,
        collaborations: 8,
        followers: 156,
        tracks: 24
    }
}

export async function fetchPaginatedFeed(
    page: number,
    options: { pageSize?: number } = {}
): Promise<PaginatedResponse<IFeedItem>> {
    const { pageSize = 10 } = options;

    return {
        items: getMockFeedItems().slice((page - 1) * pageSize, page * pageSize),
        nextPage: page * pageSize < getMockFeedItems().length ? page + 1 : null,
        total: getMockFeedItems().length,
        hasNextPage: page * pageSize < getMockFeedItems().length
    }
}
