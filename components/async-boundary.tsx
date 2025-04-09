"use client"

import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface AsyncBoundaryProps {
  children: ReactNode
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
  loadingFallback?: ReactNode
  errorFallback?: ReactNode
}

export function AsyncBoundary({
  children,
  loading = false,
  error = null,
  onRetry,
  loadingFallback,
  errorFallback,
}: AsyncBoundaryProps) {
  if (loading) {
    if (loadingFallback) {
      return <>{loadingFallback}</>
    }

    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    if (errorFallback) {
      return <>{errorFallback}</>
    }

    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Erro ao carregar dados</CardTitle>
          </div>
          <CardDescription>Não foi possível carregar os dados solicitados.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error.message || "Ocorreu um erro inesperado. Por favor, tente novamente."}
          </p>
        </CardContent>
        {onRetry && (
          <CardFooter>
            <Button onClick={onRetry} variant="outline" className="w-full">
              Tentar novamente
            </Button>
          </CardFooter>
        )}
      </Card>
    )
  }

  return <>{children}</>
}

