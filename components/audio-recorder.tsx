"use client"

// Este arquivo agora apenas redireciona para o componente na pasta /audio
// Mantido por compatibilidade com código existente que importa daqui

import { AudioRecorder as AudioRecorderComponent } from "./audio/audio-recorder"
export { AudioRecorder as default } from "./audio/audio-recorder"

// Exportação com o mesmo nome para suportar imports nomeados existentes
export function AudioRecorder(props: any) {
  return <AudioRecorderComponent {...props} />
}

