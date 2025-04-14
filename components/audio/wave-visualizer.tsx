"use client"

import React, { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, Volume2, VolumeX } from 'lucide-react'
import { Card } from '../ui/card'

interface WaveVisualizerProps {
  audioUrl: string
  trackName?: string
  waveColor?: string
  progressColor?: string
  height?: number
  barWidth?: number
  barGap?: number
  autoCenter?: boolean
  className?: string
  onPositionChange?: (position: number) => void
}

export function WaveVisualizer({
  audioUrl,
  trackName = "",
  waveColor = "#4c1d95",
  progressColor = "#8b5cf6",
  height = 80,
  barWidth = 2,
  barGap = 1,
  autoCenter = true,
  className = "",
  onPositionChange
}: WaveVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Formatar tempo em minutos:segundos
  const formatTime = (seconds: number): string => {
    if (!seconds) return "0:00"
    
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (!containerRef.current) return
    
    // Limpar instância anterior
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy()
      wavesurferRef.current = null
    }
    
    // Criar nova instância
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      url: audioUrl.startsWith('http') ? audioUrl : `/uploads/${audioUrl}`,
      waveColor: waveColor,
      progressColor: progressColor,
      height: height,
      autoCenter: autoCenter, // Substituído 'responsive' por 'autoCenter'
      barWidth: barWidth,
      barGap: barGap,
      barRadius: 2,
      cursorWidth: 0,
      normalize: true,
    })
    
    wavesurferRef.current = wavesurfer
    
    // Configurar eventos
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration())
      wavesurfer.setVolume(volume / 100)
      setIsLoaded(true)
    })
    
    wavesurfer.on('play', () => setIsPlaying(true))
    wavesurfer.on('pause', () => setIsPlaying(false))
    wavesurfer.on('finish', () => setIsPlaying(false))
    
    wavesurfer.on('audioprocess', (currentTime) => {
      setCurrentTime(currentTime as number)
      if (onPositionChange && typeof currentTime === 'number') {
        onPositionChange(currentTime / wavesurfer.getDuration())
      }
    })
    
    // Substituir 'seek' por 'interaction' que é o evento correto
    wavesurfer.on('interaction', () => {
      if (onPositionChange) {
        onPositionChange(wavesurfer.getCurrentTime() / wavesurfer.getDuration())
      }
    })
    
    // Cleanup
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy()
      }
    }
  }, [audioUrl, waveColor, progressColor, height, autoCenter, barWidth, barGap, volume])

  // Atualizar volume
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(isMuted ? 0 : volume / 100)
    }
  }, [volume, isMuted])

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause()
    }
  }
  
  const handleRestart = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.seekTo(0)
      setCurrentTime(0)
    }
  }
  
  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0])
    if (isMuted && newVolume[0] > 0) {
      setIsMuted(false)
    }
  }
  
  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <Card className={`p-4 rounded-lg ${className}`}>
      {trackName && (
        <div className="mb-2 font-medium text-sm opacity-80">{trackName}</div>
      )}
      
      <div ref={containerRef} className="w-full" />
      
      <div className="flex items-center justify-between mt-3 gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRestart} 
            disabled={!isLoaded}
            className="h-8 w-8"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button 
            variant={isPlaying ? "secondary" : "default"}
            size="icon" 
            onClick={handlePlayPause}
            disabled={!isLoaded}
            className="h-8 w-8"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMute}
            disabled={!isLoaded}
            className="h-8 w-8"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <Slider
            defaultValue={[volume]}
            value={[volume]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </div>
    </Card>
  )
}