"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AudioRecorder } from "@/components/audio-recorder"
import { AudioPostCreator } from "@/components/audio/audio-post-creator"
import { ArrowLeft, Mic, Music2, Upload } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function CreatePostPage() {
	const router = useRouter()
	const { toast } = useToast()
	const [activeTab, setActiveTab] = useState("audio")

	const handleTrackSaved = () => {
		toast({
			title: "Áudio publicado!",
			description: "Seu áudio foi publicado com sucesso no feed.",
		})
		router.push("/")
	}

	return (
		<div className="container max-w-4xl mx-auto px-4 py-6">
			{/* Header com botão voltar */}
			<div className="mb-6">
				<Button variant="ghost" asChild className="mb-4">
					<Link href="/">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Voltar para o Feed
					</Link>
				</Button>

				<div>
					<h1 className="text-3xl font-bold tracking-tight mb-2">Criar Nova Postagem</h1>
					<p className="text-muted-foreground">
						Compartilhe sua música com a comunidade Acorde
					</p>
				</div>
			</div>

			{/* Tabs para escolher tipo de postagem */}
			<Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-3 mb-6">
					<TabsTrigger value="upload" className="gap-2">
						<Upload className="h-4 w-4" />
						Upload
					</TabsTrigger>
					<TabsTrigger value="audio" className="gap-2">
						<Mic className="h-4 w-4" />
						Gravar
					</TabsTrigger>
					<TabsTrigger value="project" className="gap-2">
						<Music2 className="h-4 w-4" />
						Projeto
					</TabsTrigger>
				</TabsList>

				{/* Tab de Upload */}
				<TabsContent value="upload">
					<Card className="card-hover border-2">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Upload className="h-5 w-5 text-primary" />
								Upload de Arquivo de Áudio
							</CardTitle>
							<CardDescription>
								Faça upload de um arquivo de áudio e adicione letra, cifra e créditos completos.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<AudioPostCreator
								onPostCreated={handleTrackSaved}
								onCancel={() => router.push("/")}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Tab de Áudio */}
				<TabsContent value="audio">
					<Card className="card-hover border-2">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Mic className="h-5 w-5 text-primary" />
								Gravar e Compartilhar Áudio
							</CardTitle>
							<CardDescription>
								Grave um áudio rápido e compartilhe com seus seguidores. Perfeito para demos, ideias ou snippets musicais.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<AudioRecorder
								onTrackSaved={handleTrackSaved}
								simplified={true}
								onCancel={() => router.push("/")}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Tab de Projeto */}
				<TabsContent value="project">
					<Card className="card-hover border-2">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Music2 className="h-5 w-5 text-primary" />
								Criar Projeto Musical
							</CardTitle>
							<CardDescription>
								Crie um projeto completo com múltiplas faixas, colaboradores e informações detalhadas.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<div className="rounded-full bg-primary/10 p-6 mb-4">
									<Music2 className="h-12 w-12 text-primary" />
								</div>
								<h3 className="text-lg font-semibold mb-2">Projetos Musicais Completos</h3>
								<p className="text-muted-foreground mb-6 max-w-md">
									Crie projetos com múltiplas faixas, adicione informações detalhadas, convide colaboradores e muito mais.
								</p>
								<Button asChild size="lg">
									<Link href="/projects/new">
										Ir para Criação de Projetos
										<Music2 className="ml-2 h-4 w-4" />
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Dicas */}
			<Card className="mt-6 bg-primary/5 border-primary/20">
				<CardHeader>
					<CardTitle className="text-lg">💡 Dicas para uma boa postagem</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					<p>• <strong>Upload:</strong> Envie arquivos de áudio (MP3, WAV, OGG) e adicione letra, cifra e créditos detalhados</p>
					<p>• <strong>Áudio claro:</strong> Grave em um ambiente silencioso para melhor qualidade</p>
					<p>• <strong>Título descritivo:</strong> Ajude outros músicos a entender sua postagem</p>
					<p>• <strong>Créditos:</strong> Dê reconhecimento aos colaboradores - melodia, harmonia, arranjo, etc.</p>
					<p>• <strong>Seja autêntico:</strong> Compartilhe seu processo criativo e aprenda com a comunidade</p>
				</CardContent>
			</Card>
		</div>
	)
}
