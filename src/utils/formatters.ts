export const formatTime = (millis: number): string => {
  if (!millis || isNaN(millis) || millis < 0) return '0:00';
  
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const formatTimerSeconds = (totalSeconds: number | null): string => {
  if (totalSeconds === null || totalSeconds <= 0) return '';
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
};
