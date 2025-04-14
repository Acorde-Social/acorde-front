"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, MicOff, Music } from 'lucide-react'
import { YIN } from 'pitchfinder'

// Notas musicais e suas frequências de referência
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const A4_FREQ = 440
const C0_FREQ = 16.35

interface AudioTunerProps {
  className?: string
  autoStart?: boolean
}

export function AudioTuner({ className = '', autoStart = false }: AudioTunerProps) {
  const [isListening, setIsListening] = useState(false)
  const [currentNote, setCurrentNote] = useState<string>('--')
  const [currentFreq, setCurrentFreq] = useState<number | null>(null)
  const [tuningAccuracy, setTuningAccuracy] = useState<number>(0) // -1 (flat) to 1 (sharp)
  const [error, setError] = useState<string>('')
  const [isInitialized, setIsInitialized] = useState(false)
  
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<any>(null)

  // Inicializar o detector de frequência
  useEffect(() => {
    if (!detectorRef.current) {
      try {
        // Usar uma taxa de amostragem padrão
        const sampleRate = 44100;
        detectorRef.current = YIN({ sampleRate });
      } catch (error) {
        console.error("Erro ao inicializar detector de frequência:", error);
        setError("Erro ao inicializar detector de frequência");
      }
    }
  }, []);

  // Converter uma frequência em Hz para uma nota musical
  const getNote = (frequency: number): { note: string; octave: number; cents: number } => {
    // Evitar cálculos com frequências muito baixas
    if (frequency < 20) {
      return { note: '--', octave: 0, cents: 0 }
    }

    // Distância em semitons de C0
    const distanceFromC0 = 12 * Math.log2(frequency / C0_FREQ)
    
    // Calcular o índice da nota e a oitava
    const noteIndex = Math.round(distanceFromC0) % 12
    const octave = Math.floor(Math.round(distanceFromC0) / 12)
    
    // Calcular a diferença em cents (100 cents = 1 semitom)
    const exactSemitones = Math.log2(frequency / C0_FREQ) * 12
    const cents = Math.round((exactSemitones - Math.round(exactSemitones)) * 100)
    
    return {
      note: NOTES[noteIndex] || '--',
      octave,
      cents: cents
    }
  }

  // Iniciar a detecção de frequência
  const startListening = async () => {
    try {
      setError('')
      
      // Verificar se o navegador suporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso ao microfone')
      }
      
      // Solicitar permissão para o microfone com configurações específicas
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      })
      streamRef.current = stream
      
      // Criar novo contexto de áudio
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Atualizar o detector com a taxa de amostragem real
      const sampleRate = audioContextRef.current.sampleRate;
      console.log("Taxa de amostragem:", sampleRate);
      detectorRef.current = YIN({ sampleRate });
      
      // Criar nós de análise
      const microphone = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 2048; // Tamanho maior para melhor precisão
      analyser.smoothingTimeConstant = 0.3; // Menos suave para resposta mais rápida
      microphone.connect(analyser);
      
      // Armazenar referências
      microphoneRef.current = microphone;
      analyserRef.current = analyser;
      
      console.log("Microfone conectado e analisador configurado");
      
      // Começar a analisar
      setIsListening(true);
      setIsInitialized(true);
      updatePitch();
    } catch (err: any) {
      console.error('Erro ao acessar o microfone:', err);
      setError(err.message || 'Erro ao acessar o microfone');
    }
  }

  // Parar a detecção de frequência
  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Desconectar e limpar recursos
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    
    // Parar todas as faixas do stream de áudio
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsListening(false);
    setCurrentNote('--');
    setCurrentFreq(null);
    setTuningAccuracy(0);
  }

  // Atualizar a detecção de frequência
  const updatePitch = () => {
    if (!analyserRef.current || !isListening || !detectorRef.current) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    
    // Obter dados de áudio
    analyser.getFloatTimeDomainData(dataArray);
    
    // Detectar frequência usando pitchfinder
    const frequency = detectorRef.current(dataArray);
    
    if (frequency && frequency > 20) {
      setCurrentFreq(Math.round(frequency * 10) / 10);
      
      // Determinar nota
      const { note, octave, cents } = getNote(frequency);
      setCurrentNote(note !== '--' ? `${note}${octave}` : '--');
      
      // Calcular acurácia de afinação (-1 a 1, onde 0 é afinado)
      setTuningAccuracy(cents / 50); // normaliza para o intervalo aproximado de -1 a 1
      
      // Log para debug (remover em produção)
      console.log(`Frequência detectada: ${frequency} Hz, Nota: ${note}${octave}, Cents: ${cents}`);
    } else {
      // Sem frequência detectada neste quadro
    }
    
    // Continuar o loop de detecção
    animationFrameRef.current = requestAnimationFrame(updatePitch);
  };

  // Auto iniciar se solicitado via props
  useEffect(() => {
    if (autoStart && !isInitialized) {
      console.log("Iniciando afinador automaticamente");
      startListening();
    }
    
    return () => {
      console.log("Limpando recursos do afinador");
      stopListening();
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        // Apenas fecha o contexto se não estiver sendo usado em outro lugar
        try {
          audioContextRef.current.close();
        } catch (error) {
          console.error("Erro ao fechar contexto de áudio:", error);
        }
      }
    };
  }, [autoStart]);
  
  // Validar periodicamente se o microfone ainda está ativo
  useEffect(() => {
    if (isListening) {
      const checkMicInterval = setInterval(() => {
        if (streamRef.current && streamRef.current.getAudioTracks()[0] && !streamRef.current.getAudioTracks()[0].enabled) {
          console.log("Microfone foi desativado, tentando reiniciar");
          stopListening();
          startListening();
        }
      }, 5000);
      
      return () => clearInterval(checkMicInterval);
    }
  }, [isListening]);

  return (
    <Card className={className}>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="text-5xl font-bold mb-2">
            {currentNote}
          </div>
          
          <div className="text-sm text-muted-foreground mb-6">
            {currentFreq ? `${currentFreq} Hz` : 'Aguardando áudio...'}
          </div>
          
          <div className="w-full max-w-xs h-4 bg-secondary rounded-full overflow-hidden mb-2 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-1 bg-foreground opacity-30"></div>
            </div>
            <div 
              className={`absolute top-0 bottom-0 w-4 rounded-full transition-all duration-150 transform -translate-x-1/2`}
              style={{
                left: `${((tuningAccuracy + 1) / 2) * 100}%`,
                backgroundColor: Math.abs(tuningAccuracy) < 0.1 
                  ? 'green' 
                  : Math.abs(tuningAccuracy) < 0.3 
                    ? 'yellow'
                    : 'red'
              }}
            ></div>
          </div>
          
          <div className="w-full max-w-xs flex justify-between text-xs text-muted-foreground">
            <span>♭ Bemol</span>
            <span>Afinado</span>
            <span>Sustenido ♯</span>
          </div>
          
          {error && (
            <div className="text-sm text-red-500 mt-4">
              {error}
            </div>
          )}

          <Button 
            variant={isListening ? "secondary" : "default"}
            className="w-full mt-4"
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                Parar Afinador
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Iniciar Afinador
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}