"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL } from "@/lib/api-config";

const formSchema = z.object({
	password: z
		.string()
		.min(6, {
			message: "A senha deve ter pelo menos 6 caracteres.",
		})
		.regex(/^(?=.*[a-zA-Z])(?=.*\d)/, {
			message: "A senha deve conter pelo menos uma letra e um número.",
		}),
	confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
	message: "As senhas não conferem.",
	path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		const tokenParam = searchParams.get("token");
		if (!tokenParam) {
			toast.error("Token de recuperação de senha inválido ou ausente");
			router.push("/login");
			return;
		}
		setToken(tokenParam);
	}, [searchParams, router]);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (values: FormValues) => {
		if (!token) {
			toast.error("Token de recuperação de senha inválido ou ausente");
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch(`${API_URL}/auth/reset-password`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token,
					password: values.password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Ocorreu um erro ao redefinir sua senha");
			}

			toast.success("Senha redefinida com sucesso!");
			router.push("/login?reset=success");
		} catch (error) {
			console.error("Erro ao redefinir senha:", error);
			toast.error(error instanceof Error ? error.message : "Falha ao redefinir a senha");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container flex items-center justify-center min-h-screen py-10">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-2 text-center">
					<div className="flex justify-center mb-4">
						<Image
							src="/placeholder-logo.svg"
							alt="Logo Music Collab"
							width={150}
							height={50}
							className="h-12 w-auto"
						/>
					</div>
					<CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
					<CardDescription>
						Digite sua nova senha abaixo.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nova Senha</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Sua nova senha"
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirme a Nova Senha</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Confirme sua nova senha"
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-full" disabled={isLoading || !token}>
								{isLoading ? "Redefinindo..." : "Redefinir Senha"}
							</Button>
						</form>
					</Form>
				</CardContent>
				<CardFooter className="flex justify-center">
					<Link href="/login" className="text-sm text-muted-foreground hover:underline">
						Voltar para o login
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}