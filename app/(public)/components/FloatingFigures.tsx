'use client'

import { useRef, useEffect } from 'react'

export function FloatingFigures() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const symbols = ['♩', '♪', '♫', '♬', '𝄞', '𝄢', '♭', '♮', '♯', '🎵', '🎶'];
    
    // Cria notas uma vez apenas
    for (let i = 0; i < 50; i++) {
      const note = document.createElement('div')
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      const size = Math.random() * 16 + 20
      const speed = Math.random() * 20 + 25
      
      note.className = 'absolute select-none'
      note.innerHTML = symbol
      note.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        font-size: ${size}px;
        animation: modernFloat ${speed}s infinite ease-in-out;
        animation-delay: ${Math.random() * 10}s;
        color: ${i % 4 === 0 ? '#fcd34d' : i % 4 === 1 ? '#2c1e4a' : i % 4 === 2 ? '#374151' : '#111827'};
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
        transform: rotate(${Math.random() * 15 - 7.5}deg) scale(${Math.random() * 0.5 + 0.75});
        z-index: 0;
        pointer-events: none;
      `
      
      containerRef.current.appendChild(note)
    }
  }, [])

  return <div ref={containerRef} className="absolute inset-0" />
}