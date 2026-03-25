"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Loader2, MessageSquare, ThumbsDown, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CollaborationService } from "@/services/collaboration-service"
import { API_URL } from "@/lib/api-config"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

export default function SentCollaborationsPage() {
  const [collaborations, setCollaborations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { user, token, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user || !token) {
      router.push("/login")
      return
    }

    const fetchCollaborations = async () => {
      try {
        const data = await CollaborationService.getUserAudioCollaborations(token)
        setCollaborations(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load your collaborations. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollaborations()
  }, [authLoading, user, token, router, toast])

  const getFullAudioUrl = (url: string) => {
    if (!url) return ""
    return url.startsWith("http") ? url : `${API_URL}/${url}`
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>
      case "ACCEPTED":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Accepted</Badge>
      case "REJECTED":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleDeleteCollaboration = async (id: string) => {
    if (!token) return

    setActionInProgress(id)
    try {
      await CollaborationService.removeAudioCollaboration(id, token)
      setCollaborations(collaborations.filter(collab => collab.id !== id))
      toast({
        title: "Collaboration deleted",
        description: "Your collaboration has been removed successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not delete the collaboration. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>My Collaborations</CardTitle>
          <CardDescription>
            Audio collaborations you have submitted to other users' tracks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {collaborations.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground mb-4">You haven't submitted any audio collaborations yet.</p>
              <Button asChild>
                <Link href="/explore">Explore Tracks</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {collaborations.map((collab) => (
                <Card key={collab.id} className="overflow-hidden">
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium">{collab.name}</h3>
                          {getStatusBadge(collab.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Collaboration for <span className="font-medium">{collab.track.name}</span> by{" "}
                          <Link href={`/profile/${collab.originalAuthor.id}`} className="text-primary hover:underline">
                            {collab.originalAuthor.name}
                          </Link>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Submitted{" "}
                          {formatDistanceToNow(new Date(collab.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-4 md:mt-0">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <X className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Collaboration</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this collaboration? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteCollaboration(collab.id)}
                              >
                                {actionInProgress === collab.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Original Track</h4>
                        <audio controls className="w-full" preload="none">
                          <source src={getFullAudioUrl(collab.track.audioUrl)} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Your Collaboration</h4>
                        <audio controls className="w-full" preload="none">
                          <source src={getFullAudioUrl(collab.audioUrl)} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
