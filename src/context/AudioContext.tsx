import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Track, RepeatMode, AudioContextType, LibraryStatus } from '../types/audio';
import { fetchJamendoTracks, JAMENDO_PAGE_SIZE } from '../services/jamendoService';

const FAVORITES_STORAGE_KEY = '@audioplayer_favorite_tracks_v2';
const LOCAL_TRACKS_STORAGE_KEY = '@audioplayer_local_tracks_v1';

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [catalogTracks, setCatalogTracks] = useState<Track[]>([]);
  const [libraryStatus, setLibraryStatus] = useState<LibraryStatus>('idle');
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [hasMoreTracks, setHasMoreTracks] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [positionMillis, setPositionMillis] = useState<number>(0);
  const [durationMillis, setDurationMillis] = useState<number>(0);
  const [favoriteTracks, setFavoriteTracks] = useState<Track[]>([]);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [isPlayerModalVisible, setIsPlayerModalVisible] = useState<boolean>(false);

  const tracks = useMemo(() => [...localTracks, ...catalogTracks], [localTracks, catalogTracks]);
  const favorites = useMemo(() => favoriteTracks.map((t) => t.id), [favoriteTracks]);

  const soundRef = useRef<Audio.Sound | null>(null);
  const librarySearchRef = useRef<string>('');
  const libraryRequestRef = useRef<number>(0);
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef({
    repeatMode,
    isShuffle,
    queue,
    currentTrack,
    isPlaying,
    playbackRate,
  });

  // Keep stateRef synchronized for callbacks
  useEffect(() => {
    stateRef.current = {
      repeatMode,
      isShuffle,
      queue,
      currentTrack,
      isPlaying,
      playbackRate,
    };
  }, [repeatMode, isShuffle, queue, currentTrack, isPlaying, playbackRate]);

  // Setup initial audio mode and load storage
  useEffect(() => {
    async function init() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Load persisted favorites
        const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (storedFavorites) {
          const parsed = JSON.parse(storedFavorites);
          if (Array.isArray(parsed)) {
            setFavoriteTracks(parsed);
          }
        }

        // Load persisted local tracks
        const storedLocalTracks = await AsyncStorage.getItem(LOCAL_TRACKS_STORAGE_KEY);
        if (storedLocalTracks) {
          const parsed = JSON.parse(storedLocalTracks);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLocalTracks(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to initialize audio mode or storage:', err);
      }
    }
    init();
    loadLibrary();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
    };
  }, []);

  // Sleep timer interval runner
  useEffect(() => {
    if (sleepTimerRemaining === null) {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
      return;
    }

    if (sleepTimerRemaining <= 0) {
      pauseTrack();
      setSleepTimerRemaining(null);
      return;
    }

    sleepTimerRef.current = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          pauseTrack();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
    };
  }, [sleepTimerRemaining]);

  const loadLibrary = async (search: string = '') => {
    const requestId = ++libraryRequestRef.current;
    librarySearchRef.current = search;
    setLibraryStatus('loading');
    setLibraryError(null);

    try {
      const results = await fetchJamendoTracks({ search });
      // Ignore responses from searches that have since been superseded
      if (requestId !== libraryRequestRef.current) return;
      setCatalogTracks(results);
      setHasMoreTracks(results.length === JAMENDO_PAGE_SIZE);
      setLibraryStatus('ready');
    } catch (err) {
      if (requestId !== libraryRequestRef.current) return;
      console.warn('Failed to load music library:', err);
      setCatalogTracks([]);
      setHasMoreTracks(false);
      setLibraryError(err instanceof Error ? err.message : 'Could not load the music library.');
      setLibraryStatus('error');
    }
  };

  const loadMoreTracks = async () => {
    if (libraryStatus !== 'ready' || !hasMoreTracks) return;

    const requestId = ++libraryRequestRef.current;
    setLibraryStatus('loading');

    try {
      const results = await fetchJamendoTracks({
        search: librarySearchRef.current,
        offset: catalogTracks.length,
      });
      if (requestId !== libraryRequestRef.current) return;
      setCatalogTracks((prev) => {
        const seen = new Set(prev.map((t) => t.id));
        return [...prev, ...results.filter((t) => !seen.has(t.id))];
      });
      setHasMoreTracks(results.length === JAMENDO_PAGE_SIZE);
    } catch (err) {
      if (requestId !== libraryRequestRef.current) return;
      console.warn('Failed to load more tracks:', err);
      setHasMoreTracks(false);
    } finally {
      if (requestId === libraryRequestRef.current) {
        setLibraryStatus('ready');
      }
    }
  };

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.warn(`Playback error: ${status.error}`);
      }
      return;
    }

    setPositionMillis(status.positionMillis || 0);
    if (status.durationMillis) {
      setDurationMillis(status.durationMillis);
    }
    setIsPlaying(status.isPlaying);
    setIsBuffering(status.isBuffering);

    if (status.didJustFinish && !status.isLooping) {
      handleTrackFinished();
    }
  }, []);

  const handleTrackFinished = () => {
    const { repeatMode, currentTrack, queue } = stateRef.current;
    if (!currentTrack || queue.length === 0) return;

    if (repeatMode === 'one') {
      soundRef.current?.replayAsync();
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const isLastTrack = currentIndex === queue.length - 1;

    if (isLastTrack && repeatMode === 'off') {
      setIsPlaying(false);
      soundRef.current?.setPositionAsync(0);
      return;
    }

    // Advance to next
    skipNext();
  };

  const playTrack = async (track: Track, customQueue?: Track[]) => {
    try {
      const targetQueue = customQueue || queue;
      if (customQueue) {
        setQueue(customQueue);
      }

      setCurrentTrack(track);
      setPositionMillis(0);
      setDurationMillis(track.duration * 1000);

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        {
          shouldPlay: true,
          rate: playbackRate,
          shouldCorrectPitch: true,
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setIsPlaying(true);
    } catch (err) {
      console.warn('Error playing track:', err);
      setIsPlaying(false);
    }
  };

  const pauseTrack = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      }
    } catch (err) {
      console.warn('Error pausing track:', err);
    }
  };

  const resumeTrack = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      } else if (currentTrack) {
        await playTrack(currentTrack);
      }
    } catch (err) {
      console.warn('Error resuming track:', err);
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await pauseTrack();
    } else {
      await resumeTrack();
    }
  };

  const skipNext = async () => {
    const { currentTrack, queue, isShuffle } = stateRef.current;
    if (!currentTrack || queue.length === 0) return;

    let nextTrack: Track;
    if (isShuffle && queue.length > 1) {
      const remaining = queue.filter((t) => t.id !== currentTrack.id);
      const randomIndex = Math.floor(Math.random() * remaining.length);
      nextTrack = remaining[randomIndex];
    } else {
      const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % queue.length;
      nextTrack = queue[nextIndex];
    }

    await playTrack(nextTrack);
  };

  const skipPrevious = async () => {
    const { currentTrack, queue } = stateRef.current;
    if (!currentTrack || queue.length === 0) return;

    // If more than 3 seconds in, restart track
    if (positionMillis > 3000) {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
        return;
      }
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    await playTrack(queue[prevIndex]);
  };

  const seekTo = async (millis: number) => {
    try {
      setPositionMillis(millis);
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(millis);
      }
    } catch (err) {
      console.warn('Error seeking:', err);
    }
  };

  const toggleFavorite = async (trackId: string) => {
    const track =
      tracks.find((t) => t.id === trackId) ||
      queue.find((t) => t.id === trackId) ||
      (currentTrack?.id === trackId ? currentTrack : undefined);

    setFavoriteTracks((prev) => {
      const exists = prev.some((t) => t.id === trackId);
      let updated: Track[];
      if (exists) {
        updated = prev.filter((t) => t.id !== trackId);
      } else if (track) {
        updated = [...prev, track];
      } else {
        return prev;
      }
      AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const isFavorite = (trackId: string) => favorites.includes(trackId);

  const toggleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const setPlaybackSpeed = async (speed: number) => {
    setPlaybackRate(speed);
    if (soundRef.current) {
      try {
        await soundRef.current.setRateAsync(speed, true);
      } catch (err) {
        console.warn('Error setting playback rate:', err);
      }
    }
  };

  const setSleepTimer = (minutes: number | null) => {
    if (minutes === null) {
      setSleepTimerRemaining(null);
    } else {
      setSleepTimerRemaining(minutes * 60);
    }
  };

  const importLocalAudio = async (): Promise<Track | null> => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        const filename = file.name || 'Imported Audio';
        const cleanName = filename.replace(/\.[^/.]+$/, '');

        const newTrack: Track = {
          id: `local-${Date.now()}`,
          title: cleanName,
          artist: 'Local Device File',
          album: 'Device Storage',
          duration: 180, // estimated initial duration
          genre: 'Local Audio',
          artwork: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&auto=format&fit=crop&q=80',
          uri: file.uri,
          isLocal: true,
        };

        const localList = [newTrack, ...localTracks];
        setLocalTracks(localList);
        setQueue([newTrack, ...queue]);

        // Persist local tracks
        await AsyncStorage.setItem(LOCAL_TRACKS_STORAGE_KEY, JSON.stringify(localList));

        // Start playing the newly imported track
        await playTrack(newTrack);
        return newTrack;
      }
    } catch (err) {
      console.warn('Failed to pick document:', err);
    }
    return null;
  };

  const removeFromQueue = (trackId: string) => {
    setQueue((prev) => prev.filter((t) => t.id !== trackId));
  };

  const clearQueue = () => {
    if (currentTrack) {
      setQueue([currentTrack]);
    } else {
      setQueue([]);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isBuffering,
        positionMillis,
        durationMillis,
        queue,
        tracks,
        libraryStatus,
        libraryError,
        hasMoreTracks,
        favorites,
        favoriteTracks,
        repeatMode,
        isShuffle,
        playbackRate,
        sleepTimerRemaining,
        isPlayerModalVisible,
        loadLibrary,
        loadMoreTracks,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlayPause,
        skipNext,
        skipPrevious,
        seekTo,
        toggleFavorite,
        isFavorite,
        toggleRepeatMode,
        toggleShuffle,
        setPlaybackSpeed,
        setSleepTimer,
        importLocalAudio,
        setPlayerModalVisible: setIsPlayerModalVisible,
        removeFromQueue,
        clearQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
