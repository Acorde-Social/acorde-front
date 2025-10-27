"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Music, UserPlus, LogIn, Sparkles, Lock } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  feature?: string // ex: "ver projetos completos", "fazer acorde", "enviar mensagem"
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  title = "Faça login para continuar",
  description,
  feature = "acessar todos os recursos"
}: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full animate-pulse" />
              <div className="relative bg-primary/10 p-4 rounded-full">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {description || `Entre na sua conta ou crie uma nova para ${feature}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Benefícios */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-center mb-3">
              Com uma conta no Acorde você pode:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Music className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Criar e colaborar em projetos musicais
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Fazer acorde com outros músicos e compositores
                </p>
              </div>
              <div className="flex items-start gap-3">
                <UserPlus className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Conectar-se com a comunidade musical
                </p>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full" size="lg">
              <Link href="/register">
                <UserPlus className="h-4 w-4 mr-2" />
                Criar Conta Grátis
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Já tenho uma conta
              </Link>
            </Button>
          </div>

          {/* Link para continuar navegando */}
          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Continuar navegando sem login
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
