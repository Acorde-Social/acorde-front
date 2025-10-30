'use client';

import { useState } from 'react';
import { AudioConverter } from '@/components/audio/audio-converter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Zap, Shield, FileAudio } from 'lucide-react';

export default function AudioConverterPage() {
	const [convertedFile, setConvertedFile] = useState<File | null>(null);

	const handleConversionComplete = (mp3File: File) => {
		setConvertedFile(mp3File);
		console.log('Arquivo convertido:', mp3File.name, mp3File.size);
	};

	return (
		<div className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl">
			{/* Cabeçalho */}
			<div className="text-center mb-6 sm:mb-8">
				<div className="flex justify-center mb-4">
					<div className="p-3 bg-primary/10 rounded-full">
						<FileAudio className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
					</div>
				</div>
				<h1 className="text-2xl sm:text-4xl font-bold mb-2">Conversor de Áudio</h1>
				<p className="text-muted-foreground text-sm sm:text-lg px-4">
					Converta seus arquivos de áudio para MP3 de forma rápida e segura
				</p>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="converter" className="w-full">
				<TabsList className="grid w-full grid-cols-2 h-auto">
					<TabsTrigger value="converter" className="text-sm sm:text-base">Conversor</TabsTrigger>
					<TabsTrigger value="sobre" className="text-sm sm:text-base">Sobre</TabsTrigger>
				</TabsList>

				{/* Tab: Conversor */}
				<TabsContent value="converter">
					<Card>
						<CardHeader>
							<CardTitle>Converter Áudio para MP3</CardTitle>
							<CardDescription>
								Selecione um arquivo de áudio (WAV, FLAC, OGG, etc.) e converta para MP3
							</CardDescription>
						</CardHeader>
						<CardContent>
							<AudioConverter
								onConversionComplete={handleConversionComplete}
								showDownloadButton={true}
								maxFileSizeMB={100}
							/>

							{convertedFile && (
								<div className="mt-6 p-3 sm:p-4 border rounded-lg bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
									<p className="text-sm font-medium mb-2 text-green-700 dark:text-green-400">
										✅ Arquivo pronto para uso:
									</p>
									<p className="text-xs sm:text-sm text-green-600 dark:text-green-300 font-medium">
										{convertedFile.name} ({(convertedFile.size / 1024 / 1024).toFixed(2)} MB)
									</p>
									<p className="text-xs text-muted-foreground mt-2">
										Você pode fazer o download ou usar este arquivo em seus projetos
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Tab: Sobre */}
				<TabsContent value="sobre">
					<div className="grid gap-6">
						{/* Características */}
						<Card>
							<CardHeader>
								<CardTitle>Por que usar nosso conversor?</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-4">
								<div className="flex gap-3">
									<Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
									<div>
										<h3 className="font-medium mb-1 text-sm sm:text-base">100% Privado e Seguro</h3>
										<p className="text-xs sm:text-sm text-muted-foreground">
											A conversão é feita inteiramente no seu navegador. Seus arquivos não são enviados
											para nenhum servidor, garantindo total privacidade.
										</p>
									</div>
								</div>

								<div className="flex gap-3">
									<Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
									<div>
										<h3 className="font-medium mb-1 text-sm sm:text-base">Rápido e Eficiente</h3>
										<p className="text-xs sm:text-sm text-muted-foreground">
											Converta arquivos de áudio em segundos usando tecnologia Web Audio API
											e codificação MP3 otimizada.
										</p>
									</div>
								</div>

								<div className="flex gap-3">
									<Music className="h-5 w-5 text-primary mt-0.5 shrink-0" />
									<div>
										<h3 className="font-medium mb-1 text-sm sm:text-base">Qualidade Personalizável</h3>
										<p className="text-xs sm:text-sm text-muted-foreground">
											Escolha entre 64, 128, 192 ou 320 kbps de bitrate para ajustar a qualidade
											conforme sua necessidade - de arquivos econômicos a máxima qualidade.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Formatos Suportados */}
						<Card>
							<CardHeader>
								<CardTitle>Formatos Suportados</CardTitle>
								<CardDescription>
									Converta diversos formatos de áudio para MP3
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
									{['WAV', 'FLAC', 'OGG', 'WEBM', 'M4A', 'AAC', 'AIFF'].map((format) => (
										<div
											key={format}
											className="flex items-center justify-center p-2 sm:p-3 border rounded-lg bg-primary/5 border-primary/20"
										>
											<span className="font-medium text-xs sm:text-sm text-primary">
												.{format.toLowerCase()}
											</span>
										</div>
									))}
								</div>
								<p className="text-xs text-muted-foreground mt-3">
									* Arquivos MP3 não precisam ser convertidos
								</p>
							</CardContent>
						</Card>

						{/* Como Funciona */}
						<Card>
							<CardHeader>
								<CardTitle>Como Funciona?</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex gap-3">
									<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
										1
									</div>
									<div>
										<p className="font-medium text-sm sm:text-base">Selecione seu arquivo de áudio</p>
										<p className="text-xs sm:text-sm text-muted-foreground">
											Escolha qualquer arquivo de áudio do seu computador (máximo 100MB)
										</p>
									</div>
								</div>

								<div className="flex gap-3">
									<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
										2
									</div>
									<div>
										<p className="font-medium text-sm sm:text-base">Clique em "Converter para MP3"</p>
										<p className="text-xs sm:text-sm text-muted-foreground">
											A conversão será processada localmente no seu navegador
										</p>
									</div>
								</div>

								<div className="flex gap-3">
									<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
										3
									</div>
									<div>
										<p className="font-medium text-sm sm:text-base">Baixe seu arquivo MP3</p>
										<p className="text-xs sm:text-sm text-muted-foreground">
											Arquivo convertido pronto para download ou uso no Acorde
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Dicas */}
						<Card>
							<CardHeader>
								<CardTitle>💡 Dicas</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-xs sm:text-sm">
								<p>
									<span className="font-medium">• Limite de tamanho:</span> O conversor aceita arquivos
									de até 100MB. Arquivos maiores podem causar lentidão no navegador.
								</p>
								<p>
									<span className="font-medium">• Qualidade vs Tamanho:</span> Escolha entre diferentes
									bitrates (64, 128, 192, 320 kbps) para balancear qualidade e tamanho do arquivo.
								</p>
								<p>
									<span className="font-medium">• Redução de tamanho:</span> Arquivos WAV podem ser
									reduzidos em até 90% do tamanho original após conversão para MP3.
								</p>
								<p>
									<span className="font-medium">• Privacidade:</span> Toda a conversão acontece no seu
									navegador - seus arquivos nunca saem do seu dispositivo.
								</p>
								<p>
									<span className="font-medium">• Formato MP3:</span> Arquivos já em formato MP3 não
									podem ser convertidos novamente.
								</p>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
