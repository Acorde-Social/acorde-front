"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Waves, Clock, Music, Save, Play, Pause, Loader2, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import * as Tone from 'tone'
import { API_URL } from "@/lib/api-config";

// Adicionando um cache global para armazenar áudios já carregados
const audioBufferCache = new Map<string, AudioBuffer>();
const blobCache = new Map<string, { url: string, blob: Blob }>();

// Função modificada para determinar se um áudio está no frontend ou no backend
const isLocalBlobUrl = (url: string): boolean => {
	return url.startsWith('blob:') ||
		(!url.startsWith('http') && !url.includes('/uploads/')) ||
		url.includes('localhost:3000');
};

// Função para formatar URLs de áudio corretamente - duplicada do AudioRecorder para garantir consistência
const getFullAudioUrl = (url: string) => {
	// Se a URL for undefined ou null, retorna uma string vazia
	if (!url) return '';

	// Se for identificada como blob local do frontend, não devemos buscar da API
	if (isLocalBlobUrl(url)) {
		return url; // Usar a URL como está, sem transformação
	}

	// Verifica se a URL já começa com http:// ou https://
	if (url.startsWith('http')) return url;

	// Garante que tenhamos a base URL
	const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

	// Trata diferentes formatos de caminhos
	if (url.startsWith('/uploads/')) {
		// Caminho começa com /uploads/
		return `${baseUrl}${url}`;
	} else if (url.startsWith('uploads/')) {
		// Caminho começa sem barra
		return `${baseUrl}/${url}`;
	} else if (url.startsWith('tracks/')) {
		// Caminho começa com tracks/ (caso comum do erro)
		return `${baseUrl}/uploads/${url}`;
	} else {
		// Verifica se é um UUID ou outro formato de arquivo
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (uuidRegex.test(url) || url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg')) {
			return `${baseUrl}/uploads/tracks/${url}`;
		}

		// Outros casos, adiciona /uploads/ se necessário
		return `${baseUrl}/uploads/${url}`;
	}
};

type Effect = 'reverb' | 'delay' | 'distortion' | 'eq' | 'compressor' | 'none'

interface AudioEditorProps {
	audioUrl: string
	onSave?: (processedAudio: Blob) => Promise<void>
	projectBpm?: number
	className?: string
}

export function AudioEditor({ audioUrl, onSave, projectBpm = 120, className = '' }: AudioEditorProps) {
	const [isProcessing, setIsProcessing] = useState(false)
	const [isPlaying, setIsPlaying] = useState(false)
	const [currentBpm, setCurrentBpm] = useState<number | null>(null)
	const [targetBpm, setTargetBpm] = useState(projectBpm)
	const [quantizeStrength, setQuantizeStrength] = useState(50) // 0-100%
	const [preserveExpression, setPreserveExpression] = useState(true)
	const [selectedEffect, setSelectedEffect] = useState<Effect>('none')
	const [effectSettings, setEffectSettings] = useState({
		reverb: { decay: 1.5, wet: 0.5 },
		delay: { time: 0.25, feedback: 0.5, wet: 0.3 },
		distortion: { amount: 0.3, wet: 0.5 },
		eq: { low: 0, mid: 0, high: 0 },
		compressor: { threshold: -24, ratio: 4 }
	})
	const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null)
	const [isAnalyzing, setIsAnalyzing] = useState(false)
	const [visualizationData, setVisualizationData] = useState<number[]>([])

	const audioRef = useRef<HTMLAudioElement | null>(null)
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const tonePlayerRef = useRef<Tone.Player | null>(null)
	const effectsChainRef = useRef<any[]>([])
	const { toast } = useToast()

	// Initialize Tone.js player and analyze the audio on mount
	useEffect(() => {
		if (!audioUrl) return

		const initTone = async () => {
			await Tone.start()

			// Create player with formatted URL
			const formattedUrl = audioUrl.startsWith('http') ? audioUrl : getFullAudioUrl(audioUrl);

			tonePlayerRef.current = new Tone.Player({
				url: formattedUrl,
				onload: () => {
					// Primeiro analisa o áudio para visualização
					analyzeAudio()
					// Depois tenta detectar o BPM diretamente
					detectBpm()
				},
				onerror: (err) => {
					console.error("Erro ao carregar áudio no Tone.js:", err);
					toast({
						title: 'Erro ao carregar áudio',
						description: 'Ocorreu um problema ao processar o arquivo de áudio.',
						variant: 'destructive'
					});
				}
			}).toDestination()
		}

		initTone().catch(err => {
			console.error("Erro ao inicializar Tone.js:", err);
		});

		return () => {
			if (tonePlayerRef.current) {
				tonePlayerRef.current.dispose()
			}
			if (effectsChainRef.current.length > 0) {
				effectsChainRef.current.forEach(effect => effect.dispose())
				effectsChainRef.current = []
			}
		}
	}, [audioUrl])

	// Analyze audio to detect BPM and generate visualization data
	const analyzeAudio = async () => {
		setIsAnalyzing(true);
		try {
			// Create visualization data from the audio file
			const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
			const response = await fetch(audioUrl)
			const arrayBuffer = await response.arrayBuffer()

			audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
				// Simple RMS-based visualization
				const channelData = audioBuffer.getChannelData(0)
				const blockSize = Math.floor(channelData.length / 100)
				const visualizationPoints: number[] = []

				for (let i = 0; i < 100; i++) {
					let sum = 0
					for (let j = 0; j < blockSize; j++) {
						const idx = i * blockSize + j
						if (idx < channelData.length) {
							sum += channelData[idx] * channelData[idx]
						}
					}
					const rms = Math.sqrt(sum / blockSize)
					visualizationPoints.push(rms)
				}

				setVisualizationData(visualizationPoints)

				// Detect BPM using local audio processing
				detectBpmFromAudioBuffer(audioBuffer);
			})
		} catch (error) {
			console.error('Error analyzing audio:', error)
			toast({
				title: 'Erro ao analisar áudio',
				description: 'Não foi possível analisar o arquivo de áudio.',
				variant: 'destructive'
			})
			setIsAnalyzing(false)
		}
	}

	// Função para detectar BPM do buffer de áudio local
	const detectBpmFromAudioBuffer = async (audioBuffer: AudioBuffer) => {
		try {
			// Implementação simplificada de detecção de BPM usando análise de energia
			const channelData = audioBuffer.getChannelData(0);
			const sampleRate = audioBuffer.sampleRate;

			// Configurações para detecção de batidas
			const bufferSize = 1024;
			const threshold = 0.25; // Threshold para detecção de energia

			// Array para armazenar os tempos das batidas
			const beatTimes: number[] = [];

			// Processar o áudio em pequenos blocos
			for (let i = 0; i < channelData.length - bufferSize; i += bufferSize / 2) {
				// Calcular a energia no bloco atual
				let energy = 0;
				for (let j = 0; j < bufferSize; j++) {
					energy += Math.abs(channelData[i + j]);
				}
				energy = energy / bufferSize;

				// Detectar picos de energia (possíveis batidas)
				if (energy > threshold) {
					const timeInSeconds = i / sampleRate;
					// Verificar se este pico não está muito próximo do anterior (evitar duplicatas)
					const lastBeatTime = beatTimes.length > 0 ? beatTimes[beatTimes.length - 1] : -1;
					if (lastBeatTime === -1 || timeInSeconds - lastBeatTime > 0.3) { // Mínimo de 0.3s entre batidas
						beatTimes.push(timeInSeconds);
					}

					// Pular um pouco para evitar múltiplas detecções na mesma batida
					i += bufferSize / 2;
				}
			}

			// Calcular BPM a partir dos intervalos entre batidas
			if (beatTimes.length > 1) {
				const intervals = [];
				for (let i = 1; i < beatTimes.length; i++) {
					intervals.push(beatTimes[i] - beatTimes[i - 1]);
				}

				// Calcular a média dos intervalos e converter para BPM
				const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
				const detectedBpm = Math.round(60 / averageInterval);

				// Limitar o BPM a um range razoável (40-200)
				if (detectedBpm > 40 && detectedBpm < 200) {
					setCurrentBpm(detectedBpm);
					setTargetBpm(detectedBpm);
				} else {
					// Se o valor detectado for fora do range razoável, consideramos como não detectado
					setCurrentBpm(null);
					// Mantém o target BPM como o do projeto
					setTargetBpm(projectBpm);
				}
			} else {
				// BPM não detectado
				setCurrentBpm(null);
				setTargetBpm(projectBpm);
			}

			setIsAnalyzing(false);
		} catch (error) {
			console.error('Error detecting BPM from audio buffer:', error);
			// Não detectado em caso de erro
			setCurrentBpm(null);
			setTargetBpm(projectBpm || 120);
			setIsAnalyzing(false);
		}
	};

	// Call the backend API to detect BPM
	const detectBpm = async () => {
		// Se já temos um AudioBuffer disponível, vamos detectar o BPM localmente
		// Esta é uma alternativa ao envio do arquivo para o servidor
		try {
			// Carregar o áudio como arraybuffer
			const response = await fetch(audioUrl);
			const arrayBuffer = await response.arrayBuffer();

			// Decodificar o áudio
			const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
				// Detectar BPM do buffer de áudio
				detectBpmFromAudioBuffer(audioBuffer);
			});
		} catch (error) {
			console.error('Error detecting BPM:', error);
			// Set a default value if detection fails
			setCurrentBpm(projectBpm || 120);
			setTargetBpm(projectBpm || 120);
			setIsAnalyzing(false);
		}
	}

	// Draw wave visualization
	useEffect(() => {
		if (canvasRef.current && visualizationData.length > 0) {
			const canvas = canvasRef.current
			const ctx = canvas.getContext('2d')
			if (!ctx) return

			const width = canvas.width
			const height = canvas.height

			ctx.clearRect(0, 0, width, height)
			ctx.fillStyle = 'rgb(20, 20, 20)'
			ctx.fillRect(0, 0, width, height)

			ctx.strokeStyle = 'rgb(0, 200, 100)'
			ctx.lineWidth = 2

			// Draw the wave
			const barWidth = width / visualizationData.length

			ctx.beginPath()
			visualizationData.forEach((point, i) => {
				const x = i * barWidth
				const magnitude = Math.min(0.8, point) * height

				const y = (height - magnitude) / 2
				const barHeight = magnitude

				ctx.fillStyle = `rgb(0, ${Math.floor(100 + point * 100)}, 100)`
				ctx.fillRect(x, y, barWidth - 1, barHeight)
			})
		}
	}, [visualizationData])

	const togglePlayback = async () => {
		try {
			// Inicializa o contexto de áudio do Tone.js
			await Tone.start()

			if (!tonePlayerRef.current) {
				console.error("Player não inicializado");
				toast({
					title: 'Erro de reprodução',
					description: 'O player de áudio não foi inicializado corretamente.',
					variant: 'destructive'
				});
				return;
			}

			// Verifica se o player atual está tocando
			if (Tone.Transport.state === 'started') {
				Tone.Transport.pause()
				tonePlayerRef.current.stop()
				setIsPlaying(false)
			} else {
				// Se temos um áudio processado, carrega-o primeiro
				if (processedAudioUrl) {
					try {
						const formattedUrl = getFullAudioUrl(processedAudioUrl);
						
						// Verificar se já está carregado
						if (tonePlayerRef.current.loaded) {
							tonePlayerRef.current.start();
							Tone.Transport.start();
							setIsPlaying(true);
						} else {
							// Se não estiver carregado, carrega e depois toca
							toast({
								title: 'Carregando áudio',
								description: 'Aguarde enquanto o áudio é preparado para reprodução.',
							});

							// Substituir o player atual com um novo que tenha callback
							tonePlayerRef.current.dispose();

							tonePlayerRef.current = new Tone.Player({
								url: formattedUrl,
								onload: () => {
									if (tonePlayerRef.current) {
										tonePlayerRef.current.start();
									}
									Tone.Transport.start();
									setIsPlaying(true);
								},
								onerror: (err) => {
									console.error("Erro ao carregar áudio para reprodução:", err);
									toast({
										title: 'Erro ao carregar áudio',
										description: 'Não foi possível reproduzir o áudio processado.',
										variant: 'destructive'
									});
									setIsPlaying(false);
								}
							}).toDestination();
						}
					} catch (error) {
						console.error('Erro ao iniciar reprodução:', error);
						toast({
							title: 'Erro de reprodução',
							description: 'Ocorreu um erro ao tentar reproduzir o áudio.',
							variant: 'destructive'
						});
					}
				} else {
					// Usamos o áudio original
					try {
						// Verifica se o buffer está carregado
						if (tonePlayerRef.current.loaded) {
							tonePlayerRef.current.start();
							Tone.Transport.start();
							setIsPlaying(true);
						} else {
							toast({
								title: 'Carregando áudio',
								description: 'Aguarde enquanto o áudio é preparado para reprodução.',
							});

							// Formatando a URL corretamente
							const formattedUrl = getFullAudioUrl(audioUrl);

							// Criar um novo player com callbacks
							tonePlayerRef.current.dispose();
							tonePlayerRef.current = new Tone.Player({
								url: formattedUrl,
								onload: () => {
									if (tonePlayerRef.current) {
										tonePlayerRef.current.start();
									}
									Tone.Transport.start();
									setIsPlaying(true);
								},
								onerror: (err) => {
									console.error("Erro ao carregar áudio original:", err);
									toast({
										title: 'Erro ao carregar áudio',
										description: 'Não foi possível reproduzir o áudio.',
										variant: 'destructive'
									});
								}
							}).toDestination();
						}
					} catch (error) {
						console.error('Erro ao iniciar reprodução do áudio original:', error);
						toast({
							title: 'Erro de reprodução',
							description: 'Ocorreu um erro ao tentar reproduzir o áudio original.',
							variant: 'destructive'
						});
					}
				}
			}
		} catch (error) {
			console.error('Erro geral na reprodução:', error);
			toast({
				title: 'Erro de reprodução',
				description: 'Ocorreu um erro inesperado durante a reprodução.',
				variant: 'destructive'
			});
			setIsPlaying(false);
		}
	}

	const applyEffect = () => {
		if (!tonePlayerRef.current) return

		// Clean up existing effects
		if (effectsChainRef.current.length > 0) {
			tonePlayerRef.current.disconnect()
			effectsChainRef.current.forEach(effect => effect.dispose())
			effectsChainRef.current = []
			tonePlayerRef.current.toDestination()
		}

		// If no effect is selected, return
		if (selectedEffect === 'none') return

		// Disconnect from main output
		tonePlayerRef.current.disconnect()

		// Create the selected effect
		let effect: any = null

		switch (selectedEffect) {
			case 'reverb':
				effect = new Tone.Reverb({
					decay: effectSettings.reverb.decay,
					wet: effectSettings.reverb.wet
				})
				break

			case 'delay':
				effect = new Tone.FeedbackDelay({
					delayTime: effectSettings.delay.time,
					feedback: effectSettings.delay.feedback,
					wet: effectSettings.delay.wet
				})
				break

			case 'distortion':
				effect = new Tone.Distortion({
					distortion: effectSettings.distortion.amount,
					wet: effectSettings.distortion.wet
				})
				break

			case 'eq':
				const eq = new Tone.EQ3({
					low: effectSettings.eq.low,
					mid: effectSettings.eq.mid,
					high: effectSettings.eq.high
				})
				effect = eq
				break

			case 'compressor':
				effect = new Tone.Compressor({
					threshold: effectSettings.compressor.threshold,
					ratio: effectSettings.compressor.ratio
				})
				break
		}

		if (effect) {
			// Connect in chain: player -> effect -> destination
			tonePlayerRef.current.connect(effect)
			effect.toDestination()
			effectsChainRef.current.push(effect)

			toast({
				title: 'Efeito aplicado',
				description: `Efeito ${selectedEffect} aplicado ao áudio com sucesso.`
			})
		}
	}

	const processAudio = async () => {
		// Removemos a validação que impedia o processamento sem BPM detectado
		if (isAnalyzing) {
			toast({
				title: 'Análise em andamento',
				description: 'Aguarde a conclusão da análise de áudio.',
				variant: 'destructive'
			})
			return;
		}

		setIsProcessing(true)

		try {
			// Primeiro, precisamos obter o arquivo de áudio a partir da URL
			const response = await fetch(audioUrl);
			const audioBlob = await response.blob();

			// Garantir que o arquivo tenha um tipo MIME de áudio válido
			let mimeType = audioBlob.type;
			if (!mimeType || !mimeType.startsWith('audio/')) {
				// Determinar o tipo MIME baseado na extensão do arquivo
				if (audioUrl.toLowerCase().endswith('.mp3')) {
					mimeType = 'audio/mpeg';
				} else if (audioUrl.toLowerCase().endswith('.wav')) {
					mimeType = 'audio/wav';
				} else if (audioUrl.toLowerCase().endswith('.ogg')) {
					mimeType = 'audio/ogg';
				} else {
					// Preferimos WAV para preservar a qualidade
					mimeType = 'audio/wav';
				}
			}

			// Criar um novo Blob com o tipo MIME explícito
			const typedAudioBlob = new Blob([audioBlob], { type: mimeType });

			// Criar um nome de arquivo adequado com extensão correta
			// Priorizar o formato WAV para preservar qualidade
			const fileExtension = mimeType.includes('wav') ? 'wav' :
				mimeType.split('/')[1] === 'mpeg' ? 'mp3' :
					mimeType.split('/')[1];
			const fileName = `audio-file.${fileExtension}`;

			// Criar File object (melhor que Blob para upload)
			const audioFile = new File([typedAudioBlob], fileName, { type: mimeType });

			// Criar FormData e anexar o arquivo de áudio com o tipo correto
			const formData = new FormData();
			formData.append('audioFile', audioFile);

			// Garantir que todos os valores são strings para evitar problemas de tipo
			// Usa o valor de BPM detectado se disponível, ou null para indicar que não foi detectado
			formData.append('originalBpm', currentBpm ? String(currentBpm) : 'null');
			formData.append('targetBpm', String(targetBpm));
			formData.append('quantizeStrength', String(quantizeStrength));
			formData.append('preserveExpression', String(preserveExpression));
			formData.append('maintainWavFormat', 'true'); // Novo parâmetro para manter formato WAV

			// Enviar o FormData para o endpoint
			const apiResponse = await fetch('http://localhost:3001/ai-audio/correct-timing-upload', {
				method: 'POST',
				credentials: 'include',
				body: formData,
			});

			if (!apiResponse.ok) {
				const errorText = await apiResponse.text();
				console.error('Resposta de erro do servidor:', errorText);
				throw new Error(`Falha ao processar áudio: ${apiResponse.status} ${apiResponse.statusText} - ${errorText}`);
			}

			const data = await apiResponse.json();

			if (data.success && data.processId) {
				// Poll for the processing status
				await pollProcessingStatus(data.processId);
			} else {
				throw new Error('Resposta inválida do servidor');
			}
		} catch (error) {
			console.error('Erro ao processar áudio:', error);
			toast({
				title: 'Erro ao processar áudio',
				description: 'Não foi possível ajustar o tempo do áudio. Tente novamente mais tarde.',
				variant: 'destructive'
			});
			setIsProcessing(false);
		}
	}

	const pollProcessingStatus = async (processId: string) => {
		const checkStatus = async () => {
			try {
				const response = await fetch(`http://localhost:3001/ai-audio/process-status/${processId}`, {
					method: 'GET',
					credentials: 'include'
				})

				if (!response.ok) {
					throw new Error('Failed to get processing status')
				}

				const data = await response.json()

				if (data.status === 'completed') {
					// Processing is completed, get the result
					setProcessedAudioUrl(data.result.correctedAudioUrl)

					toast({
						title: 'Áudio processado com sucesso',
						description: 'O ajuste de tempo foi concluído. Você pode ouvir o resultado agora.'
					})

					setIsProcessing(false)
					return true
				} else if (data.status === 'failed') {
					throw new Error(data.error || 'Processing failed')
				}

				// Processing is still ongoing
				return false
			} catch (error) {
				console.error('Error checking processing status:', error)
				toast({
					title: 'Erro ao processar áudio',
					description: 'Ocorreu um erro durante o processamento do áudio.',
					variant: 'destructive'
				})
				setIsProcessing(false)
				return true
			}
		}

		// Poll every 2 seconds until complete
		const poll = async () => {
			const isComplete = await checkStatus()
			if (!isComplete) {
				setTimeout(poll, 2000)
			}
		}

		await poll()
	}

	const handleSave = async () => {
		if (!processedAudioUrl && !onSave) {
			toast({
				title: 'Nenhum áudio processado',
				description: 'Processe o áudio antes de salvar.',
				variant: 'destructive'
			})
			return
		}

		setIsProcessing(true)

		try {
			// Fetch the processed audio as a blob
			const response = await fetch(processedAudioUrl || audioUrl)
			const audioBlob = await response.blob()

			if (onSave) {
				await onSave(audioBlob)
				toast({
					title: 'Áudio salvo com sucesso',
					description: 'As alterações foram salvas com sucesso.'
				})
			}
		} catch (error) {
			console.error('Error saving audio:', error)
			toast({
				title: 'Erro ao salvar áudio',
				description: 'Não foi possível salvar o áudio processado.',
				variant: 'destructive'
			})
		} finally {
			setIsProcessing(false)
		}
	}

	useEffect(() => {
		if (processedAudioUrl) {
			// Aplicar a função de formatação correta para a URL do áudio processado
			try {
				// Verificar se a URL é válida
				if (!processedAudioUrl || processedAudioUrl === "undefined" || processedAudioUrl === "null") {
					toast({
						title: 'URL de áudio inválida',
						description: 'Não foi possível carregar o áudio processado devido a uma URL inválida.',
						variant: 'destructive'
					});
					return;
				}

				// Aplicar a formatação correta à URL
				const formattedUrl = getFullAudioUrl(processedAudioUrl);

				// Verificar se o áudio está acessível antes de tentar carregar
				fetch(formattedUrl, { method: 'HEAD' })
					.then(response => {
						if (!response.ok) {
							throw new Error(`Erro ao acessar o áudio: ${response.status} ${response.statusText}`);
						}

						// Atualizar o player de áudio para usar a URL formatada
						if (tonePlayerRef.current) {
							// Criar um novo player com a URL formatada
							const oldPlayer = tonePlayerRef.current;

							// Criar um novo player com callback adequado
							tonePlayerRef.current = new Tone.Player({
								url: formattedUrl,
								onload: () => {
									toast({
										title: 'Áudio processado carregado',
										description: 'Você pode reproduzir para ouvir o resultado.'
									});
								},
								onerror: (err) => {
									toast({
										title: 'Erro ao preparar áudio',
										description: 'O áudio foi processado mas ocorreu um erro ao carregá-lo no player.',
										variant: 'destructive'
									});
								}
							}).toDestination();

							// Limpar o player antigo após garantir que o novo foi criado
							oldPlayer.dispose();
						}
					})
					.catch(error => {
						toast({
							title: 'Erro ao acessar áudio',
							description: 'O arquivo de áudio processado não está acessível.',
							variant: 'destructive'
						});
					});
			} catch (error) {
				toast({
					title: 'Erro ao processar áudio',
					description: 'Ocorreu um erro ao tentar preparar o áudio processado.',
					variant: 'destructive'
				});
			}
		}
	}, [processedAudioUrl, toast]);

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Waves className="h-5 w-5" />
					Editor de Áudio
				</CardTitle>
				<CardDescription>
					Ajuste o tempo e aplique efeitos ao seu áudio antes de publicar
				</CardDescription>
			</CardHeader>

			<CardContent>
				<Tabs defaultValue="timing">
					<TabsList className="grid grid-cols-2 mb-4">
						<TabsTrigger value="timing" className="flex items-center gap-1">
							<Clock className="h-4 w-4" /> Ajuste de Tempo
						</TabsTrigger>
						<TabsTrigger value="effects" className="flex items-center gap-1">
							<Music className="h-4 w-4" /> Efeitos
						</TabsTrigger>
					</TabsList>

					<TabsContent value="timing">
						<div className="space-y-4">
							<div className="flex flex-col space-y-2">
								<Label htmlFor="current-bpm">BPM Detectado</Label>
								<div className="flex items-center">
									<Input
										id="current-bpm"
										value={isAnalyzing ? "Analisando..." : currentBpm?.toString() || "Não detectado"}
										readOnly
										className="bg-muted"
									/>
									{!currentBpm && !isAnalyzing && (
										<Button
											variant="outline"
											size="sm"
											className="ml-2"
											onClick={analyzeAudio}
										>
											Detectar
										</Button>
									)}
								</div>
							</div>

							<div className="flex flex-col space-y-2">
								<Label htmlFor="target-bpm">BPM Desejado</Label>
								<div className="flex items-center">
									<Input
										id="target-bpm"
										type="number"
										min={30}
										max={240}
										value={targetBpm}
										onChange={(e) => setTargetBpm(parseInt(e.target.value) || projectBpm)}
										disabled={isProcessing}
									/>
									<Button
										variant="ghost"
										size="sm"
										className="ml-2"
										onClick={() => setTargetBpm(projectBpm)}
										disabled={isProcessing}
									>
										Usar BPM do Projeto ({projectBpm})
									</Button>
								</div>
							</div>

							<div className="flex flex-col space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="quantize-strength">Força da Quantização</Label>
									<span className="text-sm text-muted-foreground">{quantizeStrength}%</span>
								</div>
								<Slider
									id="quantize-strength"
									min={0}
									max={100}
									step={5}
									value={[quantizeStrength]}
									onValueChange={(value) => setQuantizeStrength(value[0])}
									disabled={isProcessing}
								/>
								<p className="text-xs text-muted-foreground">
									Valores mais altos resultam em um ajuste mais rígido ao ritmo.
								</p>
							</div>

							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="preserve-expression"
									checked={preserveExpression}
									onChange={(e) => setPreserveExpression(e.target.checked)}
									disabled={isProcessing}
								/>
								<Label htmlFor="preserve-expression">Preservar expressão musical</Label>
							</div>

							<Button
								className="w-full"
								onClick={processAudio}
								disabled={isProcessing || isAnalyzing}
							>
								{isProcessing ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Processando...
									</>
								) : (
									<>
										<ArrowRight className="mr-2 h-4 w-4" />
										Ajustar Tempo
									</>
								)}
							</Button>
						</div>
					</TabsContent>

					<TabsContent value="effects">
						<div className="space-y-4">
							<div className="flex flex-col space-y-2">
								<Label htmlFor="effect-select">Selecionar Efeito</Label>
								<Select
									value={selectedEffect}
									onValueChange={(value: Effect) => setSelectedEffect(value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Selecione um efeito" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">Nenhum efeito</SelectItem>
										<SelectItem value="reverb">Reverb</SelectItem>
										<SelectItem value="delay">Delay</SelectItem>
										<SelectItem value="distortion">Distorção</SelectItem>
										<SelectItem value="eq">Equalizador</SelectItem>
										<SelectItem value="compressor">Compressor</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{selectedEffect === 'reverb' && (
								<div className="space-y-4">
									<div className="flex flex-col space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="reverb-decay">Decay</Label>
											<span className="text-sm text-muted-foreground">{effectSettings.reverb.decay}s</span>
										</div>
										<Slider
											id="reverb-decay"
											min={0.1}
											max={10}
											step={0.1}
											value={[effectSettings.reverb.decay]}
											onValueChange={(value) => setEffectSettings(prev => ({
												...prev,
												reverb: { ...prev.reverb, decay: value[0] }
											}))}
										/>
									</div>

									<div className="flex flex-col space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="reverb-wet">Intensidade</Label>
											<span className="text-sm text-muted-foreground">{Math.round(effectSettings.reverb.wet * 100)}%</span>
										</div>
										<Slider
											id="reverb-wet"
											min={0}
											max={1}
											step={0.01}
											value={[effectSettings.reverb.wet]}
											onValueChange={(value) => setEffectSettings(prev => ({
												...prev,
												reverb: { ...prev.reverb, wet: value[0] }
											}))}
										/>
									</div>
								</div>
							)}

							{selectedEffect === 'delay' && (
								<div className="space-y-4">
									<div className="flex flex-col space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="delay-time">Tempo</Label>
											<span className="text-sm text-muted-foreground">{effectSettings.delay.time}s</span>
										</div>
										<Slider
											id="delay-time"
											min={0.01}
											max={1}
											step={0.01}
											value={[effectSettings.delay.time]}
											onValueChange={(value) => setEffectSettings(prev => ({
												...prev,
												delay: { ...prev.delay, time: value[0] }
											}))}
										/>
									</div>

									<div className="flex flex-col space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="delay-feedback">Feedback</Label>
											<span className="text-sm text-muted-foreground">{Math.round(effectSettings.delay.feedback * 100)}%</span>
										</div>
										<Slider
											id="delay-feedback"
											min={0}
											max={0.9}
											step={0.01}
											value={[effectSettings.delay.feedback]}
											onValueChange={(value) => setEffectSettings(prev => ({
												...prev,
												delay: { ...prev.delay, feedback: value[0] }
											}))}
										/>
									</div>

									<div className="flex flex-col space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="delay-wet">Intensidade</Label>
											<span className="text-sm text-muted-foreground">{Math.round(effectSettings.delay.wet * 100)}%</span>
										</div>
										<Slider
											id="delay-wet"
											min={0}
											max={1}
											step={0.01}
											value={[effectSettings.delay.wet]}
											onValueChange={(value) => setEffectSettings(prev => ({
												...prev,
												delay: { ...prev.delay, wet: value[0] }
											}))}
										/>
									</div>
								</div>
							)}

							{selectedEffect === 'distortion' && (
								<div className="space-y-4">
									<div className="flex flex-col space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="distortion-amount">Quantidade</Label>
											<span className="text-sm text-muted-foreground">{Math.round(effectSettings.distortion.amount * 100)}%</span>
										</div>
										<Slider
											id="distortion-amount"
											min={0}
											max={1}
											step={0.01}
											value={[effectSettings.distortion.amount]}
											onValueChange={(value) => setEffectSettings(prev => ({
												...prev,
												distortion: { ...prev.distortion, amount: value[0] }
											}))}
										/>
									</div>

									<div className="flex flex-col space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="distortion-wet">Intensidade</Label>
											<span className="text-sm text-muted-foreground">{Math.round(effectSettings.distortion.wet * 100)}%</span>
										</div>
										<Slider
											id="distortion-wet"
											min={0}
											max={1}
											step={0.01}
											value={[effectSettings.distortion.wet]}
											onValueChange={(value) => setEffectSettings(prev => ({
												...prev,
												distortion: { ...prev.distortion, wet: value[0] }
											}))}
										/>
									</div>
								</div>
							)}

							{selectedEffect === 'eq' && (
								<div className="space-y-4">
									<div className="flex flex-col space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="eq-low">Baixas</Label>
											<span className="text-sm text-muted-foreground">{effectSettings.eq.low}dB</span>
										</div>
										<Slider
											id="eq-low"
											min={-20}
											max={20}
											step={1}
											value={[effectSettings.eq.low]}
											onValueChange={(value) => setEffectSettings(prev => ({
												...prev,
												eq: { ...prev.eq, low: value[0] }
											}))}
										/>
									</div>

									<div className="flex flex-col space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="eq-mid">Médias</Label>
											<span className="text-sm text-muted-foreground">{effectSettings.eq.mid}dB</span>
										</div>
										<Slider
											id="eq-mid"
											min={-20}
											max={20}
											step={1}
											value={[effectSettings.eq.mid]}
											onValueChange={(value) => setEffectSettings(prev => ({
												...prev,
												eq: { ...prev.eq, mid: value[0] }
											}))}
										/>
									</div>

									<div className="flex flex-col space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="eq-high">Altas</Label>
											<span className="text-sm text-muted-foreground">{effectSettings.eq.high}dB</span>
										</div>
										<Slider
											id="eq-high"
											min={-20}
											max={20}
											step={1}
											value={[effectSettings.eq.high]}
											onValueChange={(value) => setEffectSettings(prev => ({
												...prev,
												eq: { ...prev.eq, high: value[0] }
											}))}
										/>
									</div>
								</div>
							)}

							{selectedEffect === 'compressor' && (
								<div className="space-y-4">
									<div className="flex flex-col space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="compressor-threshold">Threshold</Label>
											<span className="text-sm text-muted-foreground">{effectSettings.compressor.threshold}dB</span>
										</div>
										<Slider
											id="compressor-threshold"
											min={-60}
											max={0}
											step={1}
											value={[effectSettings.compressor.threshold]}
											onValueChange={(value) => setEffectSettings(prev => ({
												...prev,
												compressor: { ...prev.compressor, threshold: value[0] }
											}))}
										/>
									</div>

									<div className="flex flex-col space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="compressor-ratio">Ratio</Label>
											<span className="text-sm text-muted-foreground">{effectSettings.compressor.ratio}:1</span>
										</div>
										<Slider
											id="compressor-ratio"
											min={1}
											max={20}
											step={0.5}
											value={[effectSettings.compressor.ratio]}
											onValueChange={(value) => setEffectSettings(prev => ({
												...prev,
												compressor: { ...prev.compressor, ratio: value[0] }
											}))}
										/>
									</div>
								</div>
							)}

							<Button
								className="w-full"
								onClick={applyEffect}
								disabled={selectedEffect === 'none'}
							>
								Aplicar Efeito
							</Button>
						</div>
					</TabsContent>
				</Tabs>

				<div className="mt-6">
					<div className="flex items-center justify-between mb-2">
						<p className="text-sm font-medium">Visualização da forma de onda:</p>
					</div>
					<div className="h-24 bg-muted rounded-md flex items-center justify-center overflow-hidden">
						<canvas ref={canvasRef} width={600} height={100} className="w-full h-full" />
					</div>
				</div>
			</CardContent>

			<CardFooter className="flex justify-between">
				<Button
					variant={isPlaying ? "secondary" : "default"}
					onClick={togglePlayback}
				>
					{isPlaying ? (
						<>
							<Pause className="mr-2 h-4 w-4" />
							Pausar
						</>
					) : (
						<>
							<Play className="mr-2 h-4 w-4" />
							Reproduzir
						</>
					)}
				</Button>

				<Button
					variant="secondary"
					onClick={handleSave}
					disabled={isProcessing || (!processedAudioUrl && !onSave)}
				>
					{isProcessing ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Salvando...
						</>
					) : (
						<>
							<Save className="mr-2 h-4 w-4" />
							Salvar Alterações
						</>
					)}
				</Button>
			</CardFooter>

			<audio ref={audioRef} src={audioUrl} style={{ display: 'none' }} />
		</Card>
	)
}