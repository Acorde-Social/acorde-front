import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Collaboration } from "@/services/project-service"

interface ProjectCollaboratorsProps {
  projectId: string
  collaborations: Collaboration[]
}

export function ProjectCollaborators({ projectId, collaborations }: ProjectCollaboratorsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Colaboradores do projeto</CardTitle>
        <CardDescription>Pessoas que estão contribuindo para este projeto</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {collaborations.length > 0 ? (
            collaborations.map((collaboration) => (
              <div key={collaboration.id} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={collaboration.user.avatarUrl || ""} alt={collaboration.user.name} />
                    <AvatarFallback>{collaboration.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{collaboration.user.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{collaboration.role}</Badge>
                      {collaboration.instrument && (
                        <span className="text-sm text-muted-foreground">{collaboration.instrument}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/profile/${collaboration.user.id}`}>Ver perfil</Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhum colaborador ainda.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}