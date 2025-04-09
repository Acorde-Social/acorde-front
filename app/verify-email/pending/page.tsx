"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MailOpen } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function PendingVerificationPage() {
  const { verificationEmail, resendVerification } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)

  const handleResend = async () => {
    if (!verificationEmail) {
      toast({
        title: "Erro ao reenviar verificação",
        description: "Email não disponível. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)
    
    try {
      await resendVerification(verificationEmail)
      
      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada para concluir a verificação.",
      })
    } catch (error) {
      toast({
        title: "Erro ao reenviar verificação",
        description: "Não foi possível reenviar o email. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Verifique seu Email</CardTitle>
          <CardDescription className="text-center">
            Enviamos um link de verificação para o seu email
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <MailOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="font-medium text-lg">Quase lá!</h3>
              <p className="text-muted-foreground">
                Enviamos um link de verificação para:
                <br />
                <span className="font-medium">{verificationEmail || "seu email"}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Por favor, clique no link no email para verificar sua conta e começar a usar o MusicCollab.
                Se não encontrar o email, verifique sua pasta de spam.
              </p>
            </div>
            
            <div className="w-full space-y-4 mt-6">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  "Reenviar email de verificação"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Já verificou seu email?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </div>
          
          <div className="text-xs text-center text-muted-foreground">
            <Link href="/" className="hover:underline">
              Voltar para a página inicial
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}