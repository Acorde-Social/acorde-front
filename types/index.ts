export interface User {
  id: string
  email: string
  name: string
  role: "COMPOSER" | "MUSICIAN" | "PRODUCER" | "SONGWRITER" | "VOCALIST" | "BEATMAKER" | "ENGINEER" | "ARRANGER" | "MIXER" | "DJ" | "LISTENER"
  login?: string
  bio?: string
  avatarUrl?: string
  coverImageUrl?: string
  experience?: string
  instruments?: string[]
  socialLinks?: {
    website?: string
    instagram?: string
    twitter?: string
    soundcloud?: string
    youtube?: string
  }
  theme?: {
    primaryColor: string
    layout: "default" | "compact" | "spacious"
  }
  emailVerified?: boolean
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  authorId: string
  author: User
  genre: string
  bpm: number
  key: string
  image?: string
  imageUrl?: string
  tracks?: Track[]
  collaborators?: User[]
  neededInstruments: string[]
  createdAt: string
  updatedAt: string
  _count?: {
    collaborations: number
    tracks: number
  }
}

export interface Track {
  id: string
  name: string
  projectId: string
  authorId: string
  author: User
  audioUrl: string
  duration: number
  createdAt: string
}

export interface Comment {
  id: string
  text: string
  projectId: string
  authorId: string
  author: User
  likes: number
  createdAt: string
}

export interface Collaboration {
  id: string
  projectId: string
  userId: string
  user: User
  role: "composer" | "musician"
  instrument?: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
}

