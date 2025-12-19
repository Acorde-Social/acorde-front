'use client'

import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, X } from 'lucide-react'
import Link from 'next/link'

interface PostModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PostModal({ isOpen, onClose }: PostModalProps) {
  const [postContent, setPostContent] = useState('')

  const handlePublish = useCallback(() => {
    setPostContent('')
    onClose()
  }, [setPostContent, onClose]);

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <Card className="dark-card bg-background border-primary/10 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Criar publicação</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Compartilhe o que está pensando ou trabalhando..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <div className="flex justify-end text-sm text-muted-foreground">
                {postContent.length}/500
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handlePublish}
                disabled={!postContent.trim()}
                className="w-full"
              >
                Publicar
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    ou
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                asChild
                className="w-full"
              >
                <Link href="/create" onClick={onClose}>
                  <Mic className="h-4 w-4 mr-2" />
                  Iniciar gravação rápida
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}