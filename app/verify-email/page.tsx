"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, AlertCircle, Loader2, MailCheck } from "lucide-react"
import { API_URL, handleApiError } from "@/lib/api-config"
import { useToast } from "@/hooks/use-toast"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()
  const { toast } = useToast()

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setStatus("error")
      setMessage("Token de verificação não fornecido")
    }
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-email?token=${token}`)

      if (response.ok) {
        const data = await response.json()
        setStatus("success")
        setMessage(data.message || "Email verificado com sucesso")
      } else {
        const error = await response.json()
        setStatus("error")
        setMessage(error.message || "Erro ao verificar email. O token pode estar expirado ou ser inválido.")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Erro ao verificar email. Por favor, tente novamente.")
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast({
        title: "Email necessário",
        description: "Por favor, informe seu email para reenviar a verificação",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)

    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await handleApiError(response)

      toast({
        title: "Email reenviado",
        description: data.message || "Email de verificação reenviado com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao reenviar o email de verificação",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Verificação de Email</CardTitle>
        <CardDescription className="text-center">
          {status === "verifying" ? "Verificando seu email..." : ""}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center p-6">
        {status === "verifying" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p>Verificando seu email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg">Email verificado!</h3>
              <p className="text-muted-foreground mt-1">{message}</p>
            </div>
            <Button asChild className="mt-4 w-full">
              <Link href="/login">Ir para o login</Link>
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-12 w-12 rounded-full bg-warning/15 dark:bg-warning/25 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-warning" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg">Erro na verificação</h3>
              <p className="text-muted-foreground mt-1">{message}</p>
            </div>

            <div className="w-full space-y-4 mt-4">
              <div className="space-y-2">
                <p className="text-sm text-center">Informe seu email para reenviar a verificação:</p>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <MailCheck className="mr-2 h-4 w-4" />
                    Reenviar email de verificação
                  </>
                )}
              </Button>

              <div className="text-center text-sm">
                <Link href="/login" className="text-primary hover:underline">
                  Voltar para o login
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p>Carregando...</p>
            </div>
          </CardContent>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
