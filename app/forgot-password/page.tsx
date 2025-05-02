"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
	email: z.string().email({
		message: "Por favor, informe um email válido.",
	}),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (values: FormValues) => {
		setIsLoading(true);
		try {
			const response = await fetch(`${API_URL}/auth/forgot-password`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: values.email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Ocorreu um erro ao processar sua solicitação");
			}

			toast.success("Email de recuperação enviado com sucesso. Verifique sua caixa de entrada.");
			router.push("/login?recovery=sent");
		} catch (error) {
			console.error("Erro ao solicitar recuperação de senha:", error);
			toast.error(error instanceof Error ? error.message : "Falha ao enviar o email de recuperação");
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
					<CardTitle className="text-2xl font-bold">Recuperação de Senha</CardTitle>
					<CardDescription>
						Digite seu email para receber um link de recuperação de senha.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input placeholder="seu.email@exemplo.com" disabled={isLoading} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Enviando..." : "Enviar link de recuperação"}
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