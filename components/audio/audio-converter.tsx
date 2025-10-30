'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileAudio, Download, Loader2, Info, Upload } from 'lucide-react';

// Load the UMD build of lamejs at runtime to avoid bundler issues where
// internal globals (like MPEGMode) are not defined when the package is
// imported as an ES module. This loader will attach a script tag and
// resolve once Mp3Encoder is available on window.
const LAME_UMD_CDN = 'https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js';

async function ensureLame() {
	if (typeof window === 'undefined') throw new Error('lamejs must be loaded in the browser');
	const anyWin = window as any;
	if (anyWin.lamejs && anyWin.lamejs.Mp3Encoder) return anyWin.lamejs;
	if (anyWin.Mp3Encoder) return { Mp3Encoder: anyWin.Mp3Encoder };

	const existing = document.querySelector('script[data-lamejs]');
	if (existing) {
		await new Promise<void>((resolve, reject) => {
			existing.addEventListener('load', () => resolve());
			existing.addEventListener('error', () => reject(new Error('Failed to load lamejs')));
		});
		if (anyWin.lamejs && anyWin.lamejs.Mp3Encoder) return anyWin.lamejs;
		if (anyWin.Mp3Encoder) return { Mp3Encoder: anyWin.Mp3Encoder };
		throw new Error('lamejs loaded but Mp3Encoder not found');
	}

	await new Promise<void>((resolve, reject) => {
		const s = document.createElement('script');
		s.src = LAME_UMD_CDN;
		s.async = true;
		s.setAttribute('data-lamejs', 'true');
		s.onload = () => resolve();
		s.onerror = () => reject(new Error('Failed to load lamejs from CDN'));
		document.head.appendChild(s);
	});

	if (anyWin.lamejs && anyWin.lamejs.Mp3Encoder) return anyWin.lamejs;
	if (anyWin.Mp3Encoder) return { Mp3Encoder: anyWin.Mp3Encoder };
	throw new Error('lamejs did not expose Mp3Encoder after load');
}

interface AudioConverterProps {
	onConversionComplete?: (mp3File: File) => void;
	showDownloadButton?: boolean;
	maxFileSizeMB?: number;
}

export function AudioConverter({
	onConversionComplete,
	showDownloadButton = true,
	maxFileSizeMB = 100
}: AudioConverterProps) {
	const [file, setFile] = useState<File | null>(null);
	const [converting, setConverting] = useState(false);
	const [progress, setProgress] = useState(0);
	const [mp3Blob, setMp3Blob] = useState<Blob | null>(null);
	const [mp3FileName, setMp3FileName] = useState<string>('');
	const [error, setError] = useState<string>('');
	const [bitrate, setBitrate] = useState<number>(128); // Qualidade padrão: média
	const [fileInfo, setFileInfo] = useState<{
		originalSize: string;
		convertedSize: string;
		compressionRatio: string;
	} | null>(null);

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (!selectedFile) return;

		setError('');
		setFileInfo(null);
		setMp3Blob(null);

		// Bloquear arquivos .mp3 (não faz sentido converter MP3 para MP3)
		if (selectedFile.type === 'audio/mpeg' || selectedFile.type === 'audio/mp3' || selectedFile.name.toLowerCase().endsWith('.mp3')) {
			setError('Arquivos MP3 não podem ser convertidos. O arquivo já está em formato MP3.');
			return;
		}

		// Verificar tamanho do arquivo
		const fileSizeMB = selectedFile.size / (1024 * 1024);
		if (fileSizeMB > maxFileSizeMB) {
			setError(`Arquivo muito grande. Tamanho máximo: ${maxFileSizeMB}MB`);
			return;
		}

		// Verificar tipo de arquivo (aceitar WAV ou outros formatos de áudio, exceto MP3)
		const validTypes = ['audio/wav', 'audio/wave', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/flac', 'audio/m4a', 'audio/aac'];
		if (!validTypes.some(type => selectedFile.type.includes(type.split('/')[1]) || selectedFile.name.toLowerCase().endsWith(`.${type.split('/')[1]}`))) {
			// Permitir todos os arquivos de áudio exceto MP3
		}

		setFile(selectedFile);
	};

	const convertToMp3 = async () => {
		if (!file) return;

		setConverting(true);
		setProgress(0);
		setError('');

		try {
			// Ler o arquivo como ArrayBuffer
			const arrayBuffer = await file.arrayBuffer();

			// Criar AudioContext
			const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

			// Decodificar o áudio
			setProgress(10);
			const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

			setProgress(20);

			// Obter informações do áudio
			const channels = audioBuffer.numberOfChannels;
			const sampleRate = audioBuffer.sampleRate;
			const samples = audioBuffer.length;

			// Carregar lamejs dinamicamente
			const lame = await ensureLame();

			// Configurar encoder MP3
			const Mp3Encoder = lame.Mp3Encoder || (lame as any).Mp3Encoder;
			const mp3encoder = new Mp3Encoder(channels, sampleRate, bitrate);

			const mp3Data: Uint8Array[] = [];
			const sampleBlockSize = 1152; // Tamanho padrão do bloco MP3

			// Converter samples para Int16Array
			const getChannelData = (channelIndex: number): Int16Array => {
				const floatSamples = audioBuffer.getChannelData(channelIndex);
				const int16Samples = new Int16Array(floatSamples.length);

				for (let i = 0; i < floatSamples.length; i++) {
					// Converter float32 (-1.0 a 1.0) para int16 (-32768 a 32767)
					const s = Math.max(-1, Math.min(1, floatSamples[i]));
					int16Samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
				}

				return int16Samples;
			};

			const leftChannel = getChannelData(0);
			const rightChannel = channels > 1 ? getChannelData(1) : leftChannel;

			setProgress(30);

			// Processar em blocos
			for (let i = 0; i < samples; i += sampleBlockSize) {
				const leftChunk = leftChannel.subarray(i, i + sampleBlockSize);
				const rightChunk = channels > 1 ? rightChannel.subarray(i, i + sampleBlockSize) : leftChunk;

				const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);

				if (mp3buf.length > 0) {
					mp3Data.push(new Uint8Array(mp3buf));
				}

				// Atualizar progresso
				const blockProgress = Math.floor((i / samples) * 60) + 30; // 30-90%
				setProgress(blockProgress);
			}

			setProgress(90);

			// Finalizar encoding
			const mp3buf = mp3encoder.flush();
			if (mp3buf.length > 0) {
				mp3Data.push(new Uint8Array(mp3buf));
			}

			// Criar Blob MP3
			const mp3Blob = new Blob(mp3Data.map(arr => arr.buffer as ArrayBuffer), { type: 'audio/mp3' });

			setProgress(100);
			setMp3Blob(mp3Blob);

			// Gerar nome do arquivo
			const baseName = file.name.replace(/\.[^/.]+$/, '');
			const mp3Name = `${baseName}.mp3`;
			setMp3FileName(mp3Name);

			// Calcular estatísticas
			const originalSize = file.size;
			const convertedSize = mp3Blob.size;
			const compressionRatio = ((1 - convertedSize / originalSize) * 100).toFixed(1);

			setFileInfo({
				originalSize: formatFileSize(originalSize),
				convertedSize: formatFileSize(convertedSize),
				compressionRatio: `${compressionRatio}%`
			});

			// Chamar callback com o arquivo MP3
			if (onConversionComplete) {
				const mp3File = new File([mp3Blob], mp3Name, { type: 'audio/mp3' });
				onConversionComplete(mp3File);
			}

		} catch (err) {
			console.error('Erro na conversão de áudio:', err);
			setError(`Erro ao converter arquivo: ${err instanceof Error ? err.message : 'Erro desconhecido'}.`);
		} finally {
			setConverting(false);
		}
	};

	const downloadMp3 = () => {
		if (!mp3Blob) return;

		const url = window.URL.createObjectURL(mp3Blob);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = mp3FileName;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	};

	return (
		<div className="space-y-4">
			{/* Informação sobre o conversor */}
			<Alert>
				<Info className="h-4 w-4" />
				<AlertDescription className="text-xs sm:text-sm">
					Converta arquivos de áudio para MP3 (máx. {maxFileSizeMB}MB).
					A conversão é feita no seu navegador, sem enviar dados para servidor.
				</AlertDescription>
			</Alert>

			{/* Seletor de arquivo */}
			<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
				<div className="flex-1">
					<input
						type="file"
						accept="audio/*"
						onChange={handleFileSelect}
						disabled={converting}
						id="audio-file-input"
						className="hidden"
					/>
					<label
						htmlFor="audio-file-input"
						className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors cursor-pointer border-2 ${converting
								? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
								: 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary'
							}`}
					>
						<Upload className="h-4 w-4" />
						<span>Escolher Arquivo de Áudio</span>
					</label>
				</div>

				{file && !converting && !mp3Blob && (
					<Button
						onClick={convertToMp3}
						disabled={!file}
						className="w-full sm:w-auto"
					>
						<FileAudio className="mr-2 h-4 w-4" />
						<span className="text-sm">Converter para MP3</span>
					</Button>
				)}
			</div>

			{/* Seletor de Qualidade */}
			{file && !converting && !mp3Blob && (
				<div className="space-y-2">
					<label className="text-xs sm:text-sm font-medium">
						Qualidade do MP3:
					</label>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
						<button
							onClick={() => setBitrate(64)}
							className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${bitrate === 64
								? 'bg-primary text-primary-foreground'
								: 'bg-muted hover:bg-muted/80'
								}`}
						>
							Econômica
							<span className="block text-[10px] opacity-70">64 kbps</span>
						</button>
						<button
							onClick={() => setBitrate(128)}
							className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${bitrate === 128
								? 'bg-primary text-primary-foreground'
								: 'bg-muted hover:bg-muted/80'
								}`}
						>
							Boa
							<span className="block text-[10px] opacity-70">128 kbps</span>
						</button>
						<button
							onClick={() => setBitrate(192)}
							className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${bitrate === 192
								? 'bg-primary text-primary-foreground'
								: 'bg-muted hover:bg-muted/80'
								}`}
						>
							Alta
							<span className="block text-[10px] opacity-70">192 kbps</span>
						</button>
						<button
							onClick={() => setBitrate(320)}
							className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${bitrate === 320
								? 'bg-primary text-primary-foreground'
								: 'bg-muted hover:bg-muted/80'
								}`}
						>
							Máxima
							<span className="block text-[10px] opacity-70">320 kbps</span>
						</button>
					</div>
					<p className="text-[10px] sm:text-xs text-muted-foreground">
						💡 Maior qualidade = arquivo maior. Recomendado: Boa (128 kbps) para web.
					</p>
				</div>
			)}

			{/* Arquivo selecionado */}
			{file && !converting && !mp3Blob && (
				<div className="text-xs sm:text-sm text-muted-foreground space-y-1">
					<p className="break-all">Arquivo: <span className="font-medium">{file.name}</span></p>
					<p>Tamanho: <span className="font-medium">{formatFileSize(file.size)}</span></p>
				</div>
			)}

			{/* Progresso da conversão */}
			{converting && (
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Loader2 className="h-4 w-4 animate-spin text-primary" />
						<span className="text-xs sm:text-sm font-medium">Convertendo... {progress}%</span>
					</div>
					<Progress value={progress} className="w-full" />
				</div>
			)}

			{/* Erro */}
			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Resultado da conversão */}
			{mp3Blob && fileInfo && (
				<div className="space-y-3 p-3 sm:p-4 border rounded-lg bg-muted/50">
					<div className="flex items-center gap-2 text-green-600 dark:text-green-400">
						<FileAudio className="h-5 w-5" />
						<span className="font-medium text-sm sm:text-base">Conversão concluída!</span>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2 text-xs sm:text-sm">
						<div>
							<p className="text-muted-foreground">Tamanho original:</p>
							<p className="font-medium">{fileInfo.originalSize}</p>
						</div>
						<div>
							<p className="text-muted-foreground">Tamanho MP3:</p>
							<p className="font-medium">{fileInfo.convertedSize}</p>
						</div>
						<div className="sm:col-span-2">
							<p className="text-muted-foreground">Redução de tamanho:</p>
							<p className="font-medium text-green-600 dark:text-green-400">{fileInfo.compressionRatio}</p>
						</div>
					</div>

					{showDownloadButton && (
						<Button
							onClick={downloadMp3}
							className="w-full"
						>
							<Download className="mr-2 h-4 w-4" />
							<span className="text-sm">Baixar MP3</span>
						</Button>
					)}

					<Button
						onClick={() => {
							setFile(null);
							setMp3Blob(null);
							setFileInfo(null);
							setProgress(0);
						}}
						variant="outline"
						className="w-full"
					>
						<span className="text-sm">Converter Outro Arquivo</span>
					</Button>
				</div>
			)}
		</div>
	);
}
