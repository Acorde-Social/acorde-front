export interface User {
  avatarUrl: string
  id: string
  name: string
  email: string
  image?: string
  role: "composer" | "musician"
  instruments?: string[]
  experience?: string
  bio?: string
  createdAt: Date
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
  tracks: Track[]
  collaborators: User[]
  neededInstruments: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Track {
  id: string
  name: string
  projectId: string
  authorId: string
  author: User
  audioUrl: string
  duration: number
  createdAt: Date
}

export interface Comment {
  id: string
  text: string
  projectId: string
  authorId: string
  author: User
  likes: number
  createdAt: Date
}

export interface Collaboration {
  id: string
  projectId: string
  userId: string
  role: "composer" | "musician"
  instrument?: string
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
}

