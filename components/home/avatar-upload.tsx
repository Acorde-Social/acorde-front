'use client';

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { userService } from '@/services/user-service';

interface IAvatarUpload {
  onUploadComplete?: () => void;
  showCamera?: boolean;
}

export function AvatarUpload({ onUploadComplete, showCamera = true }: IAvatarUpload) {
  const { updateUser, user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return; // <-- adicione esta linha

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const avatarUrl = await userService.updateAvatar(file);
      updateUser({ ...user, avatarUrl });
      toast({ title: 'Sucesso', description: 'Avatar atualizado!' });
      onUploadComplete?.();
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar avatar', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative group cursor-pointer">
      <Avatar
        className={`h-28 w-28 border-4 border-background shadow-lg transition-opacity ${
          isUploading ? 'opacity-50' : 'group-hover:opacity-50'
        }`}
      >
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <AvatarFallback className="bg-muted text-primary-secondary text-lg">
          {user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>

      {showCamera && (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity ${
            isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="bg-black/50 rounded-full p-2">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleAvatarUpload}
        disabled={isUploading}
      />
    </div>
  );
}
