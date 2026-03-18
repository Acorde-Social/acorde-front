"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, MicOff } from 'lucide-react'
import { YIN } from 'pitchfinder'

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
  const [tuningAccuracy, setTuningAccuracy] = useState<number>(0)
  const [error, setError] = useState<string>('')
  const [isInitialized, setIsInitialized] = useState(false)

  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<ReturnType<typeof YIN> | null>(null)

  useEffect(() => {
    if (!detectorRef.current) {
      try {
        const sampleRate = 44100
        detectorRef.current = YIN({ sampleRate })
      } catch {
        setError('Erro ao inicializar detector de frequência')
      }
    }
  }, [])

  const getNote = (frequency: number): { note: string; octave: number; cents: number } => {
    if (frequency < 20) {
      return { note: '--', octave: 0, cents: 0 }
    }

    const distanceFromC0 = 12 * Math.log2(frequency / C0_FREQ)

    const noteIndex = Math.round(distanceFromC0) % 12
    const octave = Math.floor(Math.round(distanceFromC0) / 12)

    const exactSemitones = Math.log2(frequency / C0_FREQ) * 12
    const cents = Math.round((exactSemitones - Math.round(exactSemitones)) * 100)

    return {
      note: NOTES[noteIndex] || '--',
      octave,
      cents,
    }
  }

  const updatePitch = () => {
    if (!analyserRef.current || !detectorRef.current) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Float32Array(bufferLength)
    analyser.getFloatTimeDomainData(dataArray)

    const frequency = detectorRef.current(dataArray)

    if (frequency && frequency > 20) {
      setCurrentFreq(Math.round(frequency * 10) / 10)
      const { note, octave, cents } = getNote(frequency)
      setCurrentNote(note !== '--' ? `${note}${octave}` : '--')
      setTuningAccuracy(cents / 50)
    } else {
      setCurrentFreq(null)
      setCurrentNote('--')
      setTuningAccuracy(0)
    }

    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(updatePitch)
    }
  }

  const startListening = async () => {
    try {
      setError('')

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso ao microfone')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      streamRef.current = stream

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const sampleRate = audioContextRef.current.sampleRate
      detectorRef.current = YIN({ sampleRate })

      const microphone = audioContextRef.current.createMediaStreamSource(stream)
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.3
      microphone.connect(analyser)

      microphoneRef.current = microphone
      analyserRef.current = analyser

      setIsListening(true)
      setIsInitialized(true)
      updatePitch()
    } catch (err: any) {
      setError(err.message || 'Erro ao acessar o microfone')
    }
  }

  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect()
      microphoneRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    setIsListening(false)
    setCurrentNote('--')
    setCurrentFreq(null)
    setTuningAccuracy(0)
  }

  useEffect(() => {
    if (autoStart && !isInitialized) {
      startListening()
    }

    return () => {
      stopListening()

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close()
        } catch {}
      }
    }
  }, [autoStart, isInitialized])

  return (
    <Card className={className}>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="text-5xl font-bold mb-2">{currentNote}</div>

          <div className="text-sm text-muted-foreground mb-6">
            {currentFreq ? `${currentFreq} Hz` : 'Aguardando áudio...'}
          </div>

          <div className="w-full max-w-xs h-4 bg-secondary rounded-full overflow-hidden mb-2 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-1 bg-foreground opacity-30"></div>
            </div>
            <div
              className="absolute top-0 bottom-0 w-4 rounded-full transition-all duration-150 transform -translate-x-1/2"
              style={{
                left: `${((tuningAccuracy + 1) / 2) * 100}%`,
                backgroundColor:
                  Math.abs(tuningAccuracy) < 0.1
                    ? 'green'
                    : Math.abs(tuningAccuracy) < 0.3
                      ? 'yellow'
                      : 'red',
              }}
            ></div>
          </div>

          <div className="w-full max-w-xs flex justify-between text-xs text-muted-foreground">
            <span>♭ Bemol</span>
            <span>Afinado</span>
            <span>Sustenido ♯</span>
          </div>

          {error && <div className="text-sm text-warning mt-4">{error}</div>}

          <Button
            variant={isListening ? 'secondary' : 'default'}
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
