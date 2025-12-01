"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

function AuthCallbackContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { loginWithToken } = useAuth()
	const { toast } = useToast()

	useEffect(() => {
		const handleCallback = async () => {
			const token = searchParams.get("token")
			const error = searchParams.get("error")
			const profileComplete = searchParams.get("profileComplete")

			if (error) {
				toast({
					title: "Erro na autenticação",
					description: decodeURIComponent(error),
					variant: "destructive",
				})
				router.push("/login")
				return
			}

			if (token) {
				// Salvar token e fazer login
				await loginWithToken(token)

				// Verificar se perfil está completo
				console.log('profileComplete from URL:', profileComplete)

				if (profileComplete === "false") {
					toast({
						title: "Complete seu perfil",
						description: "Por favor, complete suas informações de perfil para continuar",
					})
					router.push("/complete-profile?token=" + token)
				} else {
					toast({
						title: "Login realizado com sucesso!",
						description: "Bem-vindo de volta!",
					})
					router.push("/")
				}
			} else {
				toast({
					title: "Erro na autenticação",
					description: "Token não encontrado",
					variant: "destructive",
				})
				router.push("/login")
			}
		}

		handleCallback()
	}, [searchParams, router, loginWithToken, toast])

	return (
		<div className="container flex h-screen w-screen flex-col items-center justify-center">
			<div className="flex flex-col items-center space-y-4">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="text-muted-foreground">Autenticando...</p>
			</div>
		</div>
	)
}

export default function AuthCallbackPage() {
	return (
		<Suspense fallback={
			<div className="container flex h-screen w-screen flex-col items-center justify-center">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Carregando...</p>
				</div>
			</div>
		}>
			<AuthCallbackContent />
		</Suspense>
	)
}
