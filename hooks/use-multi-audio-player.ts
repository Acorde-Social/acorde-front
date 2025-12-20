"use client"

import { useState, useCallback, useEffect } from 'react'
import type { IFeedItem } from '@/lib/mock-feed-data'

export function useMultiAudioPlayer() {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({})
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({})
  const [audioCurrentTime, setAudioCurrentTime] = useState<Record<string, string>>({})

  const handlePlayPause = useCallback((item: IFeedItem) => {
    if (!item.audioUrl) return
    
    const audioId = item.id
    
    if (playingAudioId === audioId) {
      audioElements[audioId]?.pause()
      setPlayingAudioId(null)
    } else {
      if (playingAudioId && audioElements[playingAudioId]) {
        audioElements[playingAudioId].pause()
        audioElements[playingAudioId].currentTime = 0
      }
      
      const audio = new Audio(item.audioUrl)
      
      audio.addEventListener('timeupdate', () => {
        const progress = audio.currentTime / audio.duration
        setAudioProgress(prev => ({ ...prev, [audioId]: progress }))
        
        const minutes = Math.floor(audio.currentTime / 60)
        const seconds = Math.floor(audio.currentTime % 60)
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`
        setAudioCurrentTime(prev => ({ ...prev, [audioId]: timeString }))
      })
      
      audio.addEventListener('ended', () => {
        setPlayingAudioId(null)
        setAudioProgress(prev => ({ ...prev, [audioId]: 0 }))
        setAudioCurrentTime(prev => ({ ...prev, [audioId]: '0:00' }))
      })
      
      audio.play()
      setAudioElements(prev => ({ ...prev, [audioId]: audio }))
      setPlayingAudioId(audioId)
    }
  }, [playingAudioId, audioElements])

  const handleSeek = useCallback((item: IFeedItem, percentage: number) => {
    const audio = audioElements[item.id]
    if (audio && item.audioUrl) {
      audio.currentTime = audio.duration * percentage
      setAudioProgress(prev => ({ ...prev, [item.id]: percentage }))
    }
  }, [audioElements])

  useEffect(() => {
    return () => {
      Object.values(audioElements).forEach(audio => {
        audio.pause()
        audio.remove()
      })
    }
  }, [audioElements])

  return {
    playingAudioId,
    audioProgress,
    audioCurrentTime,
    handlePlayPause,
    handleSeek
  }
}