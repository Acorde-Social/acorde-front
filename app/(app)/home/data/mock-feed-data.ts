export interface FeedItem {
    id: string
    type: 'project' | 'track' | 'collaboration'
    title: string
    description: string
    author: {
        name: string
        avatarUrl?: string
        role: string
    }
    createdAt: Date
    likes: number
    comments: number
    genre?: string
    bpm?: number
    key?: string
    audioUrl?: string
    duration?: string
    currentTime?: string
    progress?: number
    isPlaying?: boolean
}

export interface Stats {
    projects: number
    collaborations: number
    followers: number
    tracks: number
}

export function getMockFeedItems(): FeedItem[] {
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