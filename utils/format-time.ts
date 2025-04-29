/**
 * Formata um tempo em segundos para o formato MM:SS
 * @param seconds Tempo em segundos
 * @returns Tempo formatado como string (MM:SS)
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return '00:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Formata um tempo em segundos para o formato HH:MM:SS 
 * (usada para durações mais longas)
 * @param seconds Tempo em segundos
 * @returns Tempo formatado como string (HH:MM:SS)
 */
export function formatLongTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return '00:00:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}