"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatTime } from '@/utils/format-time';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatAudioPlayerProps {
	src: string;
	className?: string;
	duration?: number; // Duração em segundos (opcional)
	preload?: string; // Propriedade preload
	controlsList?: string; // Propriedade controlsList
	onError?: (e: React.SyntheticEvent<HTMLAudioElement, Event>) => void; // Manipulador de erro tipado
}

export default function ChatAudioPlayer({
	src,
	className,
	duration: initialDuration,
	onError,
}: ChatAudioPlayerProps) {
	// Estados
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(initialDuration || 0);
	const [progress, setProgress] = useState(0);
	const [isLoaded, setIsLoaded] = useState(false);
	const [playbackRate, setPlaybackRate] = useState(1);
	const [waveformData, setWaveformData] = useState<number[]>([]);

	// Refs
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
	const animationRef = useRef<number | null>(null);

	// Inicializar áudio e gerar waveform
	useEffect(() => {
		if (!audioRef.current) return;

		const audio = audioRef.current;

		// Resetar estado
		setIsLoaded(false);
		setIsPlaying(false);
		setCurrentTime(0);
		setProgress(0);

		// Carregamento direto sem usar fetch para evitar problemas de CORS
		audio.src = src;
		audio.preload = "auto";
		audio.crossOrigin = "anonymous"; // Importante para segurança CORS

		// Mostrar o URL que estamos tentando carregar para debug
		console.log(`Tentando carregar áudio de: ${src}`);

		// Carregar áudio e configurar audio context para visualização
		const handleLoadedData = () => {
			console.log('Áudio carregado com sucesso');
			console.log('Duração do áudio:', audio.duration);
			setDuration(audio.duration || initialDuration || 0);
			setIsLoaded(true);
			generateWaveformData();
		};

		const handleLoadedMetadata = () => {
			console.log('Metadados carregados. Duração:', audio.duration);
			setDuration(audio.duration || initialDuration || 0);
		};

		const handleError = (e: Event) => {
			console.error('Erro ao carregar áudio:', e);

			// Passar o evento para o callback de erro, se fornecido
			if (onError) {
				onError(e as any);
			}

			// Tentar carregamento alternativo como fallback
			if (src.startsWith('http')) {
				console.log('Tentando método alternativo de carregamento...');
				// Adicionar timestamp para evitar cache
				const cacheBuster = `${src}${src.includes('?') ? '&' : '?'}t=${Date.now()}`;
				audio.src = cacheBuster;
			}

			// Mostrar forma de onda estática mesmo quando há erro
			generateWaveformData();
			setIsLoaded(true); // Permitir play/pause mesmo com erro
		};

		audio.addEventListener('loadeddata', handleLoadedData);
		audio.addEventListener('loadedmetadata', handleLoadedMetadata);
		audio.addEventListener('error', handleError);

		return () => {
			audio.removeEventListener('loadeddata', handleLoadedData);
			audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
			audio.removeEventListener('error', handleError);
			audio.pause();

			// Limpar recursos de áudio
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}

			// Desconectar nós de áudio
			if (sourceRef.current) {
				try {
					sourceRef.current.disconnect();
				} catch (err) {
					// Ignorar erros de desconexão
				}
			}
		};
	}, [src, onError, initialDuration]);

	// Gerar dados de waveform para pré-visualização
	const generateWaveformData = async () => {
		try {
			// Gerar uma representação visual aproximada da forma de onda
			// Este é um padrão visual aproximado enquanto o áudio não é reproduzido
			const peaks = Array.from({ length: 40 }, () => {
				return Math.random() * 0.5 + 0.2; // Valores entre 0.2 e 0.7
			});
			setWaveformData(peaks);
		} catch (error) {
			console.error('Erro ao gerar dados de waveform:', error);
		}
	};

	// Atualizar progresso durante a reprodução
	useEffect(() => {
		if (!audioRef.current) return;

		const audio = audioRef.current;

		const updateTime = () => {
			setCurrentTime(audio.currentTime);
			setProgress((audio.currentTime / (duration || audio.duration || 1)) * 100);
		};

		const handleEnded = () => {
			setIsPlaying(false);
			setCurrentTime(0);
			setProgress(0);
			audio.currentTime = 0;
			stopWaveformAnimation();
		};

		audio.addEventListener('timeupdate', updateTime);
		audio.addEventListener('ended', handleEnded);

		return () => {
			audio.removeEventListener('timeupdate', updateTime);
			audio.removeEventListener('ended', handleEnded);
		};
	}, [duration]);

	// Atualizar velocidade de reprodução quando mudar
	useEffect(() => {
		if (!audioRef.current) return;
		audioRef.current.playbackRate = playbackRate;
	}, [playbackRate]);

	// Iniciar ou parar animação da forma de onda
	useEffect(() => {
		if (isPlaying) {
			startWaveformAnimation();
		} else {
			stopWaveformAnimation();
		}
	}, [isPlaying]);

	// Função para animação da forma de onda durante reprodução
	const startWaveformAnimation = () => {
		if (!canvasRef.current || !analyserRef.current) return;

		const analyser = analyserRef.current;
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		const draw = () => {
			animationRef.current = requestAnimationFrame(draw);

			analyser.getByteFrequencyData(dataArray);

			// Limpar canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Desenhar forma de onda
			const width = canvas.width;
			const height = canvas.height;
			const barWidth = (width / bufferLength) * 2.5;
			let x = 0;

			for (let i = 0; i < bufferLength; i++) {
				const barHeight = (dataArray[i] / 255) * height * 0.8;

				// Calcular cor com base na posição e altura
				const hue = 220; // Azul para tema padrão
				const saturation = 90;
				const lightness = 50 + (barHeight / height * 20);

				ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

				// Desenhar barra centrada verticalmente
				const y = (height - barHeight) / 2;
				ctx.fillRect(x, y, barWidth, barHeight);

				x += barWidth + 1;
			}
		};

		draw();
	};

	const stopWaveformAnimation = () => {
		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current);
		}

		// Renderizar forma de onda estática
		if (canvasRef.current) {
			drawStaticWaveform();
		}
	};

	// Desenhar forma de onda estática
	const drawStaticWaveform = () => {
		if (!canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		// Limpar canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const width = canvas.width;
		const height = canvas.height;
		const barWidth = width / waveformData.length - 1;

		// Desenhar forma de onda estática
		waveformData.forEach((value, index) => {
			const x = index * (barWidth + 1);
			const barHeight = value * height * 0.8;

			// Partes já reproduzidas são coloridas, partes não reproduzidas são cinza
			const percentPlayed = progress / 100;
			const isPlayed = index / waveformData.length < percentPlayed;

			if (isPlayed) {
				ctx.fillStyle = '#4F46E5'; // Indigo - cor primária
			} else {
				ctx.fillStyle = '#D1D5DB'; // Cinza claro
			}

			// Desenhar barra centrada verticalmente
			const y = (height - barHeight) / 2;
			ctx.fillRect(x, y, barWidth, barHeight);
		});
	};

	// Função para iniciar/pausar a reprodução
	const handlePlayPause = () => {
		if (!audioRef.current) return;

		if (isPlaying) {
			audioRef.current.pause();
			setIsPlaying(false);
			return;
		}

		// Se não foi carregado corretamente, tente carregar novamente
		if (!isLoaded) {
			// Recarregar áudio
			audioRef.current.load();
			// Tentar gerar forma de onda
			generateWaveformData();
		}

		// Inicializar contexto de áudio sob demanda (após interação do usuário)
		try {
			// Criar novo contexto de áudio se não existir
			if (!audioContextRef.current) {
				audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
				analyserRef.current = audioContextRef.current.createAnalyser();
				analyserRef.current.fftSize = 256;

				// Verificar e limpar conexões existentes se houver
				if (sourceRef.current) {
					try {
						sourceRef.current.disconnect();
					} catch (e) {
						// Ignorar erros de desconexão
					}
				}

				// Criar nova fonte de áudio
				sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
				// Conectar ao analisador e ao destino (alto-falante)
				sourceRef.current.connect(analyserRef.current);
				analyserRef.current.connect(audioContextRef.current.destination);
			}
			// Retomar contexto suspenso
			else if (audioContextRef.current.state === 'suspended') {
				audioContextRef.current.resume();
			}

			// Tentar reproduzir o áudio
			audioRef.current.play()
				.then(() => {
					setIsPlaying(true);
				})
				.catch(error => {
					console.error('Erro ao reproduzir áudio:', error);
					setIsPlaying(false);

					// Se houve erro de permissão, tente reproduzir sem visualização
					if (error.name === 'NotAllowedError') {
						// Desconectar qualquer conexão existente para evitar erro
						if (sourceRef.current) {
							try {
								sourceRef.current.disconnect();
							} catch (e) {
								// Ignorar
							}
							sourceRef.current = null;
						}

						// Tentar reproduzir diretamente
						audioRef.current?.play()
							.then(() => setIsPlaying(true))
							.catch(e => console.error('Falha ao reproduzir mesmo sem visualização:', e));
					}
				});
		} catch (err) {
			console.error('Erro ao configurar contexto de áudio:', err);
			// Tentar reproduzir sem visualização como fallback
			audioRef.current.play()
				.then(() => setIsPlaying(true))
				.catch(e => console.error('Falha ao reproduzir áudio como fallback:', e));
		}
	};

	// Função para definir a velocidade de reprodução
	const handleSetPlaybackRate = (rate: number) => {
		setPlaybackRate(rate);
	};

	// Função para clicar na barra de progresso
	const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!audioRef.current || !isLoaded) return;

		const progressBar = e.currentTarget;
		const rect = progressBar.getBoundingClientRect();
		const offsetX = e.clientX - rect.left;
		const newProgress = (offsetX / rect.width) * 100;
		const newTime = (newProgress / 100) * duration;

		audioRef.current.currentTime = newTime;
		setCurrentTime(newTime);
		setProgress(newProgress);

		// Atualizar visualização da forma de onda
		drawStaticWaveform();
	};

	// Renderizar o componente
	useEffect(() => {
		// Inicializar canvas para a forma de onda quando disponível
		if (canvasRef.current) {
			drawStaticWaveform();
		}
	}, [progress, canvasRef.current, waveformData]);

	return (
		<div className={cn("flex items-center space-x-2", className)}>
			<audio ref={audioRef} className="hidden" />

			{/* Layout estilo WhatsApp/Messenger com botão de play sobreposto às ondas */}
			<div className="relative flex-1 flex items-center">
				{/* Botão de play/pause sobreposto */}
				<div className="absolute left-0 z-10 flex items-center justify-center">
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"h-8 w-8 rounded-full flex-shrink-0",
							isPlaying ? "bg-primary/10 text-primary" : "hover:bg-primary/10"
						)}
						onClick={handlePlayPause}
						disabled={!isLoaded}
					>
						{isPlaying ? (
							<Pause className="h-4 w-4" />
						) : (
							<Play className="h-4 w-4" fill="currentColor" />
						)}
					</Button>
				</div>

				{/* Visualização da forma de onda com padding à esquerda para o botão */}
				<div
					className="w-full pl-8 cursor-pointer relative"
					onClick={handleProgressBarClick}
				>
					{/* Canvas para renderizar a forma de onda */}
					<canvas
						ref={canvasRef}
						className="w-full h-8 rounded-lg bg-transparent"
						width={400}
						height={32}
					/>

					{/* Sobreposição para indicar progresso, caso a visualização falhe */}
					<div
						className="absolute top-0 left-8 bottom-0 bg-primary/30 pointer-events-none rounded-l-lg"
						style={{ width: `${Math.max(0, progress - 8)}%` }}
					/>

					{/* Tempo de duração */}
					<div className="absolute left-0 bottom-[-20px] text-xs text-muted-foreground">
						{isPlaying ? formatTime(currentTime) : formatTime(duration)}
					</div>
				</div>
			</div>

			{/* Controle de velocidade de reprodução */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 rounded-full flex-shrink-0 text-xs font-medium"
					>
						{playbackRate}x
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => handleSetPlaybackRate(0.5)}>
						0.5x
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleSetPlaybackRate(1)}>
						1x
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleSetPlaybackRate(1.5)}>
						1.5x
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleSetPlaybackRate(2)}>
						2x
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}