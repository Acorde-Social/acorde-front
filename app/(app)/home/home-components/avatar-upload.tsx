'use client'

import { useState } from 'react'
import { Camera } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'

interface AvatarUploadProps {
  onUploadComplete?: () => void
}

export function AvatarUpload({ onUploadComplete }: AvatarUploadProps) {
  const { token, updateUser, user } = useAuth()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Erro', description: 'Selecione uma imagem válida' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Erro', description: 'Imagem muito grande (máx. 5MB)' })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('http://localhost:3001/users/profile', {
        method: 'PATCH',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      updateUser(data)
      
      onUploadComplete?.()
      toast({ title: 'Sucesso', description: 'Avatar atualizado!' })

    } catch (error) {
      toast({ title: 'Erro', description: 'Falha no upload' })
    } finally {
      setIsUploading(false)
    }
  }

  if (!user) return null

  return (
    <div className="relative group cursor-pointer">
      <Avatar className={`h-16 w-16 border-4 border-background shadow-lg transition-opacity ${
        isUploading ? 'opacity-50' : 'group-hover:opacity-50'
      }`}>
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
          {user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
        isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <div className="bg-black/50 rounded-full p-2">
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleAvatarUpload}
        disabled={isUploading}
      />
    </div>
  )
}