"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"

const roles = [
	{ value: "MUSICIAN", label: "Músico" },
	{ value: "COMPOSER", label: "Compositor" },
	{ value: "PRODUCER", label: "Produtor" },
	{ value: "VOCALIST", label: "Vocalista" },
	{ value: "BEATMAKER", label: "Beatmaker" },
	{ value: "ENGINEER", label: "Engenheiro de Som" },
	{ value: "SONGWRITER", label: "Letrista" },
	{ value: "ARRANGER", label: "Arranjador" },
	{ value: "MIXER", label: "Mixador" },
	{ value: "DJ", label: "DJ" },
	{ value: "LISTENER", label: "Ouvinte" },
]

function CompleteProfileContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { toast } = useToast()
	const { loginWithToken } = useAuth()

	const [isLoading, setIsLoading] = useState(false)
	const [token, setToken] = useState<string | null>(null)
	const [formData, setFormData] = useState({
		login: "",
		role: "",
		instruments: [] as string[],
		termsAccepted: false,
		privacyAccepted: false,
		// Campos de endereço opcionais
		zipCode: "",
		street: "",
		neighborhood: "",
		city: "",
		state: "",
		country: "",
	})

	useEffect(() => {
		const tokenParam = searchParams.get("token")
		if (tokenParam) {
			setToken(tokenParam)
			// Salvar token temporariamente
			localStorage.setItem("token", tokenParam)
		} else {
			toast({
				title: "Token não encontrado",
				description: "Por favor, faça login novamente",
				variant: "destructive",
			})
			router.push("/login")
		}
	}, [searchParams, router, toast])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.termsAccepted || !formData.privacyAccepted) {
			toast({
				title: "Termos não aceitos",
				description: "Você precisa aceitar os termos de uso e política de privacidade",
				variant: "destructive",
			})
			return
		}

		if (!formData.login || !formData.role) {
			toast({
				title: "Campos obrigatórios",
				description: "Por favor, preencha todos os campos obrigatórios",
				variant: "destructive",
			})
			return
		}

		setIsLoading(true)

		try {
			const response = await fetch(`${API_URL}/users/profile`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					login: formData.login,
					role: formData.role,
					instruments: formData.instruments.length > 0 ? formData.instruments : undefined,
					termsAccepted: formData.termsAccepted,
					privacyAccepted: formData.privacyAccepted,
					profileComplete: true,
					// Enviar campos de localização se preenchidos
					zipCode: formData.zipCode || undefined,
					street: formData.street || undefined,
					neighborhood: formData.neighborhood || undefined,
					city: formData.city || undefined,
					state: formData.state || undefined,
					country: formData.country || undefined,
				}),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || "Erro ao completar perfil")
			}

			// Login com o token para atualizar o contexto
			if (token) {
				await loginWithToken(token)
			}

			toast({
				title: "Perfil completado!",
				description: "Bem-vindo ao Acorde!",
			})

			router.push("/")
		} catch (error) {
			toast({
				title: "Erro ao completar perfil",
				description: error instanceof Error ? error.message : "Tente novamente",
				variant: "destructive",
			})
		} finally {
			setIsLoading(false)
		}
	}

	const handleInstrumentChange = (instrument: string) => {
		setFormData((prev) => ({
			...prev,
			instruments: prev.instruments.includes(instrument)
				? prev.instruments.filter((i) => i !== instrument)
				: [...prev.instruments, instrument],
		}))
	}

	if (!token) {
		return (
			<div className="container flex h-screen w-screen flex-col items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	return (
		<div className="container flex min-h-screen w-screen flex-col items-center justify-center py-8">
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<CardTitle className="text-2xl text-center">Complete seu Perfil</CardTitle>
					<CardDescription className="text-center">
						Preencha as informações abaixo para começar a usar o Acorde
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-6">
						{/* Login (Username) */}
						<div className="space-y-2">
							<Label htmlFor="login">
								Nome de usuário <span className="text-destructive">*</span>
							</Label>
							<Input
								id="login"
								placeholder="seu-usuario"
								value={formData.login}
								onChange={(e) => setFormData({ ...formData, login: e.target.value })}
								required
							/>
							<p className="text-xs text-muted-foreground">
								Seu nome de usuário único no Acorde (ex: @seu-usuario)
							</p>
						</div>

						{/* Role */}
						<div className="space-y-2">
							<Label htmlFor="role">
								Função Principal <span className="text-destructive">*</span>
							</Label>
							<Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
								<SelectTrigger>
									<SelectValue placeholder="Selecione sua função" />
								</SelectTrigger>
								<SelectContent>
									{roles.map((role) => (
										<SelectItem key={role.value} value={role.value}>
											{role.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Instruments (Optional) */}
						<div className="space-y-2">
							<Label>Instrumentos (opcional)</Label>
							<div className="grid grid-cols-2 gap-3">
								{["Guitarra", "Baixo", "Bateria", "Teclado", "Piano", "Violão", "Voz", "Saxofone"].map(
									(instrument) => (
										<div key={instrument} className="flex items-center space-x-2">
											<Checkbox
												id={instrument}
												checked={formData.instruments.includes(instrument)}
												onCheckedChange={() => handleInstrumentChange(instrument)}
											/>
											<label
												htmlFor={instrument}
												className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											>
												{instrument}
											</label>
										</div>
									)
								)}
							</div>
						</div>

						{/* Location (Optional) */}
						<div className="space-y-4">
							<div className="space-y-2">
								<Label className="text-base font-semibold">Localização (opcional)</Label>
								<p className="text-xs text-muted-foreground">
									Adicione sua localização para encontrar músicos perto de você
								</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="city">Cidade</Label>
									<Input
										id="city"
										placeholder="Ex: São Paulo"
										value={formData.city}
										onChange={(e) => setFormData({ ...formData, city: e.target.value })}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="state">Estado</Label>
									<Input
										id="state"
										placeholder="Ex: SP"
										value={formData.state}
										onChange={(e) => setFormData({ ...formData, state: e.target.value })}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="country">País</Label>
									<Input
										id="country"
										placeholder="Ex: Brasil"
										value={formData.country}
										onChange={(e) => setFormData({ ...formData, country: e.target.value })}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="zipCode">CEP</Label>
									<Input
										id="zipCode"
										placeholder="00000-000"
										value={formData.zipCode}
										onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="street">Rua</Label>
								<Input
									id="street"
									placeholder="Ex: Rua das Flores"
									value={formData.street}
									onChange={(e) => setFormData({ ...formData, street: e.target.value })}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="neighborhood">Bairro</Label>
								<Input
									id="neighborhood"
									placeholder="Ex: Centro"
									value={formData.neighborhood}
									onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
								/>
							</div>
						</div>

						{/* Terms and Privacy */}
						<div className="space-y-3">
							<div className="flex items-start space-x-2">
								<Checkbox
									id="terms"
									checked={formData.termsAccepted}
									onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
								/>
								<label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
									Aceito os{" "}
									<a href="/terms" target="_blank" className="text-primary hover:underline">
										Termos de Uso
									</a>{" "}
									<span className="text-destructive">*</span>
								</label>
							</div>

							<div className="flex items-start space-x-2">
								<Checkbox
									id="privacy"
									checked={formData.privacyAccepted}
									onCheckedChange={(checked) => setFormData({ ...formData, privacyAccepted: checked as boolean })}
								/>
								<label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
									Aceito a{" "}
									<a href="/privacy" target="_blank" className="text-primary hover:underline">
										Política de Privacidade
									</a>{" "}
									<span className="text-destructive">*</span>
								</label>
							</div>
						</div>
					</CardContent>

					<CardFooter>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Salvando...
								</>
							) : (
								"Completar Cadastro"
							)}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}

export default function CompleteProfilePage() {
	return (
		<Suspense fallback={
			<div className="container flex h-screen w-screen flex-col items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		}>
			<CompleteProfileContent />
		</Suspense>
	)
}
