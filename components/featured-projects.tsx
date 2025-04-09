import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Headphones, Music, Users } from "lucide-react"

export function FeaturedProjects() {
  const projects = [
    {
      id: 1,
      title: "Melodia do Amanhecer",
      description: "Uma composição acústica que precisa de violino e violoncelo",
      author: {
        name: "João Silva",
        image: "/placeholder-user.jpg",
        initials: "JS",
      },
      genre: "Acústico",
      bpm: 95,
      key: "G Maior",
      collaborators: 3,
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 2,
      title: "Ritmos Urbanos",
      description: "Procurando baixista e baterista para finalizar esta faixa de R&B",
      author: {
        name: "Maria Costa",
        image: "/placeholder-user.jpg",
        initials: "MC",
      },
      genre: "R&B",
      bpm: 110,
      key: "D Menor",
      collaborators: 2,
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 3,
      title: "Sinfonia Eletrônica",
      description: "Projeto de música eletrônica precisando de sintetizadores e vocais",
      author: {
        name: "Pedro Alves",
        image: "/placeholder-user.jpg",
        initials: "PA",
      },
      genre: "Eletrônica",
      bpm: 128,
      key: "A Menor",
      collaborators: 4,
      image: "/placeholder.svg?height=200&width=400",
    },
  ]

  return (
    <section className="container py-12 md:py-16">
      <div className="mx-auto max-w-[58rem] space-y-6 text-center">
        <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">Projetos em destaque</h2>
        <p className="text-muted-foreground md:text-xl">Descubra projetos musicais em andamento e comece a colaborar</p>
      </div>
      <div className="mx-auto mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
            </div>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{project.genre}</Badge>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{project.collaborators}</span>
                </div>
              </div>
              <CardTitle className="line-clamp-1">{project.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={project.author.image} alt={project.author.name} />
                  <AvatarFallback>{project.author.initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{project.author.name}</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              <div className="mt-4 flex space-x-4 text-sm">
                <div className="flex items-center">
                  <Music className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{project.key}</span>
                </div>
                <div className="flex items-center">
                  <Headphones className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{project.bpm} BPM</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button asChild className="w-full">
                <Link href={`/projects/${project.id}`}>Ver projeto</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/explore">Ver mais projetos</Link>
        </Button>
      </div>
    </section>
  )
}

