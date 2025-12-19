"use client"

import { useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!user) {
    redirect('/') 
  }
  
  return <>{children}</>
}