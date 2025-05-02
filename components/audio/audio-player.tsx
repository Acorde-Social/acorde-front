"use client";

import React, { useState, useRef, useEffect } from 'react';
import { PlayCircle, PauseCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatTime } from '@/utils/format-time';

interface AudioPlayerProps {
	src: string;
	autoPlay?: boolean;
	showWaveform?: boolean;
	className?: string;
	duration?: number; // Duração em segundos (opcional)
}

export default function AudioPlayer({
	src,
	autoPlay = false,
	showWaveform = false,
	className,
	duration: initialDuration,
}: AudioPlayerProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(initialDuration || 0);
	const [progress, setProgress] = useState(0);
	const [isLoaded, setIsLoaded] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const requestRef = useRef<number>();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const contextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

	// Inicializar áudio e web audio API
	useEffect(() => {
		if (!audioRef.current) return;

		const audio = audioRef.current;

		// Adicionar log para diagnóstico
		console.log('Inicializando áudio com src:', src);

		// Verificar se a URL é válida
		if (!src) {
			console.error('URL de áudio inválida ou não definida');
			return;
		}

		audio.src = src;
		audio.preload = "auto"; // Força pré-carregamento
		setIsLoaded(false);

		// Adicionar event listeners para diagnóstico
		const handleError = (e: ErrorEvent) => {
			console.error('Erro no elemento de áudio:', e);
		};

		const handleLoadedData = () => {
			console.log('Áudio carregado com sucesso, duração:', audio.duration);
			setDuration(audio.duration);
			setIsLoaded(true);

			if (autoPlay) {
				handlePlay();
			}
		};

		audio.addEventListener('error', handleError);
		audio.addEventListener('loadeddata', handleLoadedData);

		return () => {
			audio.removeEventListener('error', handleError);
			audio.removeEventListener('loadeddata', handleLoadedData);
			audio.pause();

			// Limpar recursos do Web Audio API
			if (contextRef.current && contextRef.current.state !== 'closed') {
				if (sourceRef.current) {
					try {
						sourceRef.current.disconnect();
					} catch (err) {
						console.warn('Erro ao desconectar fonte de áudio:', err);
					}
				}
				if (analyserRef.current) {
					try {
						analyserRef.current.disconnect();
					} catch (err) {
						console.warn('Erro ao desconectar analisador:', err);
					}
				}
				contextRef.current.close().catch(err => console.warn('Erro ao fechar contexto:', err));
			}

			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, [src, autoPlay]);

	// Configurar visualização de forma de onda quando o áudio estiver carregado
	useEffect(() => {
		if (!isLoaded || !showWaveform || !canvasRef.current || !audioRef.current) return;

		try {
			// Criar contexto de áudio se não existir
			if (!contextRef.current) {
				contextRef.current = new AudioContext();
			}

			// Criar analisador se não existir
			if (!analyserRef.current) {
				analyserRef.current = contextRef.current.createAnalyser();
				analyserRef.current.fftSize = 256;
			}

			// Criar fonte a partir do elemento de áudio
			if (!sourceRef.current) {
				try {
					sourceRef.current = contextRef.current.createMediaElementSource(audioRef.current);
					sourceRef.current.connect(analyserRef.current);
					analyserRef.current.connect(contextRef.current.destination);
				} catch (err) {
					// Se houver erro na conexão do AudioContext, ainda permitir reprodução normal
					console.warn('Erro ao configurar Web Audio API, usando reprodução padrão:', err);
					// Limpamos as referências para evitar tentativas futuras de usar Web Audio API
					if (contextRef.current) {
						contextRef.current.close().catch(console.error);
						contextRef.current = null;
					}
					analyserRef.current = null;
					sourceRef.current = null;
					return; // Encerramos aqui para evitar tentar usar a visualização
				}
			}

			// Iniciar animação somente se tudo estiver configurado corretamente
			animateWaveform();
		} catch (error) {
			console.error('Erro ao configurar visualização de áudio:', error);
			// Em caso de erro, garantir que o áudio ainda funcione sem a visualização
			showWaveform = false;
		}

		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, [isLoaded, showWaveform]);

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
		};

		audio.addEventListener('timeupdate', updateTime);
		audio.addEventListener('ended', handleEnded);

		return () => {
			audio.removeEventListener('timeupdate', updateTime);
			audio.removeEventListener('ended', handleEnded);
		};
	}, [duration]);

	// Função para iniciar/pausar a reprodução
	const handlePlay = () => {
		if (!audioRef.current) return;

		if (isPlaying) {
			audioRef.current.pause();
		} else {
			// Iniciar o contexto de áudio se estiver suspenso
			if (contextRef.current && contextRef.current.state === 'suspended') {
				contextRef.current.resume();
			}

			audioRef.current.play()
				.catch(error => console.error('Erro ao reproduzir áudio:', error));
		}

		setIsPlaying(!isPlaying);
	};

	// Função para reiniciar a reprodução
	const handleRestart = () => {
		if (!audioRef.current) return;

		audioRef.current.currentTime = 0;
		setCurrentTime(0);
		setProgress(0);

		if (!isPlaying) {
			handlePlay();
		}
	};

	// Função para animação da forma de onda
	const animateWaveform = () => {
		if (!canvasRef.current || !analyserRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		const analyser = analyserRef.current;
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);

		const draw = () => {
			requestRef.current = requestAnimationFrame(draw);

			analyser.getByteFrequencyData(dataArray);

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const barWidth = (canvas.width / bufferLength) * 2.5;
			let x = 0;

			for (let i = 0; i < bufferLength; i++) {
				const barHeight = dataArray[i] / 2;

				ctx.fillStyle = isPlaying
					? `rgb(79, 70, 229, ${barHeight / 100})` // Azul (indigo)
					: `rgb(107, 114, 128, ${barHeight / 100})`; // Cinza

				ctx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth, barHeight);

				x += barWidth + 1;
			}
		};

		draw();
	};

	// Clique na barra de progresso para navegar no áudio
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
	};

	return (
		<div className={cn("flex flex-col space-y-2", className)}>
			<audio ref={audioRef} className="hidden" />

			<div className="flex items-center space-x-3">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 rounded-full"
					onClick={handlePlay}
					disabled={!isLoaded}
				>
					{isPlaying ? (
						<PauseCircle className="h-7 w-7" />
					) : (
						<PlayCircle className="h-7 w-7" />
					)}
				</Button>

				<div className="flex-1 flex flex-col">
					<div
						className="h-2 bg-secondary rounded-full overflow-hidden cursor-pointer"
						onClick={handleProgressBarClick}
					>
						<div
							className="h-full bg-primary"
							style={{ width: `${progress}%` }}
						/>
					</div>

					<div className="flex justify-between text-xs text-muted-foreground mt-1">
						<span>{formatTime(currentTime)}</span>
						<span>{formatTime(duration)}</span>
					</div>
				</div>

				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 rounded-full"
					onClick={handleRestart}
					disabled={!isLoaded || currentTime === 0}
				>
					<RotateCcw className="h-4 w-4" />
				</Button>
			</div>

			{showWaveform && (
				<canvas
					ref={canvasRef}
					className="w-full h-12 bg-accent/30 rounded"
					height={100}
					width={300}
				/>
			)}
		</div>
	);
}