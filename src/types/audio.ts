export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  artwork: string;  // URL or require()
  uri: string;      // Stream URL or file:// URI
  isLocal?: boolean;
  genre?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  positionMillis: number;
  durationMillis: number;
  queue: Track[];
  tracks: Track[];
  favorites: string[];
  repeatMode: RepeatMode;
  isShuffle: boolean;
  playbackRate: number;
  sleepTimerRemaining: number | null; // seconds
  isPlayerModalVisible: boolean;
  
  // Actions
  playTrack: (track: Track, customQueue?: Track[]) => Promise<void>;
  pauseTrack: () => Promise<void>;
  resumeTrack: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  seekTo: (positionMillis: number) => Promise<void>;
  toggleFavorite: (trackId: string) => Promise<void>;
  isFavorite: (trackId: string) => boolean;
  toggleRepeatMode: () => void;
  toggleShuffle: () => void;
  setPlaybackSpeed: (speed: number) => Promise<void>;
  setSleepTimer: (minutes: number | null) => void;
  importLocalAudio: () => Promise<Track | null>;
  setPlayerModalVisible: (visible: boolean) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
}
