"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface AudioRecorderHook {
  isRecording: boolean
  audioURL: string | null
  audioBlob: Blob | null // Adicionando o Blob para uso no chat
  startRecording: () => Promise<void>
  stopRecording: () => void
  resetRecording: () => void
  availableDevices: MediaDeviceInfo[]
  selectedDeviceId: string | null
  setSelectedDeviceId: (deviceId: string) => void
}

export function useAudioRecorder(): AudioRecorderHook {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null) // Estado para o Blob
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // Lista todos os dispositivos de áudio disponíveis
  useEffect(() => {
    async function getDevices() {
      try {
        // Solicita permissão primeiro
        await navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            // Libera a stream após obter permissão
            stream.getTracks().forEach(track => track.stop())
          })
          .catch(err => console.error("Erro ao obter permissão inicial:", err))

        // Agora enumera os dispositivos
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = devices.filter(device => device.kind === "audioinput")
        setAvailableDevices(audioInputs)

        // Seleciona o primeiro dispositivo por padrão se nenhum estiver selecionado
        if (audioInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioInputs[0].deviceId)
        }
      } catch (error) {
        console.error("Erro ao listar dispositivos de áudio:", error)
      }
    }

    getDevices()

    // Ouvinte para quando um dispositivo é conectado ou desconectado
    navigator.mediaDevices.addEventListener('devicechange', getDevices)
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices)
    }
  }, [selectedDeviceId])

  // Cleanup when unmounting
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
    }
  }, [audioURL])

  const startRecording = useCallback(async () => {
    try {
      // Reset everything first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
        setAudioURL(null)
      }
      setAudioBlob(null) // Resetar o blob também
      audioChunksRef.current = []
      
      // Configuração de áudio específica para o dispositivo selecionado
      const constraints: MediaStreamConstraints = { 
        audio: selectedDeviceId 
          ? { deviceId: { exact: selectedDeviceId } } 
          : true,
        video: false
      }
      
      // Tentando acessar dispositivo de áudio
      
      // Tenta conectar com diferentes combinações de configurações
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (initialError) {
        // Falha na primeira tentativa, tentando configuração padrão
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      }
      
      streamRef.current = stream
      
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/ogg'
      })
      mediaRecorderRef.current = recorder
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current)
        setAudioBlob(audioBlob) // Salvar o Blob no estado
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        setIsRecording(false)
      }
      
      recorder.start()
      setIsRecording(true)
    } catch (error) {
      // Erro na gravação
      throw error
    }
  }, [audioURL, selectedDeviceId])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const resetRecording = useCallback(() => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
      setAudioURL(null)
    }
    setAudioBlob(null) // Resetar o blob também
    audioChunksRef.current = []
  }, [audioURL])

  return {
    isRecording,
    audioURL,
    audioBlob, // Incluir o blob na interface retornada
    startRecording,
    stopRecording,
    resetRecording,
    availableDevices,
    selectedDeviceId,
    setSelectedDeviceId
  }
}

