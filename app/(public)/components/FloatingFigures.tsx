'use client'

import { useEffect, useState } from 'react'

interface Note {
  id: number
  symbol: string
  size: number
  speed: number
  delay: number
  x: number
  y: number
  rotation: number
  opacity: number
}

export function FloatingFigures() {
  const [notes, setNotes] = useState<Note[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const symbols = ['♩', '♪', '♫', '♬', '𝄞', '𝄢', '♭', '♮', '♯', '🎵', '🎶']
    const notesCount = Math.min(30, Math.floor(window.innerWidth * window.innerHeight / 10000))
    
    const newNotes = Array.from({ length: notesCount }, (_, i) => ({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      size: Math.random() * 16 + 20,
      speed: Math.random() * 20 + 25,
      delay: Math.random() * 10,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 15 - 7.5,
      opacity: 0.3 + Math.random() * 0.5
    }))
    
    setNotes(newNotes)

    const handleResize = () => {
      const newNotesCount = Math.min(30, Math.floor(window.innerWidth * window.innerHeight / 10000))
      if (newNotesCount !== notesCount) {
        const resizedNotes = Array.from({ length: newNotesCount }, (_, i) => ({
          id: i,
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          size: Math.random() * 16 + 20,
          speed: Math.random() * 20 + 25,
          delay: Math.random() * 10,
          x: Math.random() * 100,
          y: Math.random() * 100,
          rotation: Math.random() * 15 - 7.5,
          opacity: 0.3 + Math.random() * 0.5
        }))
        setNotes(resizedNotes)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!mounted) return null

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ 
        filter: 'grayscale(100%)',
        mixBlendMode: 'multiply'
      }}
    >
      {notes.map((note) => (
        <div
          key={note.id}
          className="absolute select-none will-change-transform"
          style={{
            left: `${note.x}%`,
            top: `${note.y}%`,
            fontSize: `${note.size}px`,
            animation: `float ${note.speed}s infinite ease-in-out`,
            animationDelay: `${note.delay}s`,
            color: 'rgba(75, 85, 99, 0.7)',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            transform: `rotate(${note.rotation}deg)`,
            opacity: note.opacity,
            zIndex: 0,
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 'normal',
            textShadow: 'none',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}
        >
          {note.symbol}
        </div>
      ))}
    </div>
  )
}