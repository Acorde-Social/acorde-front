'use client'

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center max-w-md">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Algo deu errado</h2>
        <p className="text-muted-foreground mb-6">
          Não foi possível carregar a página. Tente novamente.
        </p>
        <Button onClick={reset} variant="default">
          Tentar novamente
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          Se o problema persistir, entre em contato com o suporte.
        </p>
      </div>
    </div>
  )
}