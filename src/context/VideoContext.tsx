import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { VideoItem, VideoContextType } from '../types/video';
import { DEFAULT_VIDEOS } from '../data/defaultVideos';

const VIDEO_STORAGE_KEY = '@auraplayer_downloaded_videos_v1';

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{
  children: React.ReactNode;
  onBeforePlayVideo?: () => void;
}> = ({ children, onBeforePlayVideo }) => {
  const [videos, setVideos] = useState<VideoItem[]>(DEFAULT_VIDEOS);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState<boolean>(false);

  useEffect(() => {
    async function loadPersistedVideos() {
      try {
        const stored = await AsyncStorage.getItem(VIDEO_STORAGE_KEY);
        if (stored) {
          const parsed: VideoItem[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setVideos([...parsed, ...DEFAULT_VIDEOS]);
          }
        }
      } catch (err) {
        console.warn('Failed to load persisted videos:', err);
      }
    }
    loadPersistedVideos();
  }, []);

  const playVideo = (video: VideoItem) => {
    if (onBeforePlayVideo) {
      onBeforePlayVideo();
    }
    setActiveVideo(video);
    setIsVideoModalVisible(true);
  };

  const closeVideo = () => {
    setIsVideoModalVisible(false);
    setActiveVideo(null);
  };

  const importLocalVideo = async (): Promise<VideoItem | null> => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['video/*'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        const filename = file.name || 'Imported Video';
        const cleanName = filename.replace(/\.[^/.]+$/, '');

        const newVideo: VideoItem = {
          id: `local-vid-${Date.now()}`,
          title: cleanName,
          author: 'Local Device File',
          duration: 180,
          thumbnail:
            'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
          uri: file.uri,
          isLocal: true,
          resolution: 'Local File',
          fileSize: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : undefined,
        };

        const updated = [newVideo, ...videos];
        setVideos(updated);
        playVideo(newVideo);
        return newVideo;
      }
    } catch (err) {
      console.warn('Error importing local video:', err);
    }
    return null;
  };

  const addDownloadedVideo = async (video: VideoItem) => {
    const updated = [video, ...videos.filter((v) => v.id !== video.id)];
    setVideos(updated);

    const downloadedOnly = updated.filter((v) => v.isDownloaded);
    await AsyncStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(downloadedOnly));
  };

  const deleteVideo = async (videoId: string) => {
    const target = videos.find((v) => v.id === videoId);
    if (target && target.uri.startsWith('file://')) {
      try {
        await FileSystem.deleteAsync(target.uri, { idempotent: true });
      } catch {
        // ignore
      }
    }

    const updated = videos.filter((v) => v.id !== videoId);
    setVideos(updated);

    const downloadedOnly = updated.filter((v) => v.isDownloaded);
    await AsyncStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(downloadedOnly));

    if (activeVideo?.id === videoId) {
      closeVideo();
    }
  };

  const shareVideo = async (video: VideoItem) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable && video.uri.startsWith('file://')) {
        await Sharing.shareAsync(video.uri);
      } else {
        alert(`Video link: ${video.uri}`);
      }
    } catch (err) {
      console.warn('Error sharing video:', err);
    }
  };

  return (
    <VideoContext.Provider
      value={{
        videos,
        activeVideo,
        isVideoModalVisible,
        playVideo,
        closeVideo,
        importLocalVideo,
        addDownloadedVideo,
        deleteVideo,
        shareVideo,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = (): VideoContextType => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};
