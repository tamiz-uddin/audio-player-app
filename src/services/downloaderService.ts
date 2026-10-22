import * as FileSystem from 'expo-file-system/legacy';
import { VideoItem } from '../types/video';

export interface VideoMetadata {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: number; // seconds
  isYouTube: boolean;
  rawUrl: string;
  streamUrl: string;
}

export type DownloadFormat = 'video_hd' | 'video_sd' | 'audio_mp3';

export const extractYouTubeVideoId = (url: string): string | null => {
  const clean = url.trim();
  const match = clean.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  if (match && match[1]) {
    return match[1];
  }
  if (/^[\w-]{11}$/.test(clean)) {
    return clean;
  }
  return null;
};

export class UnsupportedSourceError extends Error {}

export const fetchVideoDetails = async (inputUrl: string): Promise<VideoMetadata> => {
  // YouTube does not expose direct media streams, so its links cannot be downloaded here
  if (extractYouTubeVideoId(inputUrl)) {
    throw new UnsupportedSourceError(
      'YouTube links cannot be downloaded. Paste a direct link to an MP4 or MP3 file instead.'
    );
  }

  // Direct video/audio URL
  const filename = inputUrl.split('/').pop()?.split('?')[0] || 'Web Video';
  return {
    id: `direct-${Date.now()}`,
    title: decodeURIComponent(filename).replace(/\.[^/.]+$/, ''),
    author: 'Direct Web Media',
    thumbnail:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    duration: 0, // unknown until played
    isYouTube: false,
    rawUrl: inputUrl,
    streamUrl: inputUrl,
  };
};

export const downloadVideoFile = async (
  metadata: VideoMetadata,
  format: DownloadFormat,
  onProgress: (progress: { writtenMB: number; totalMB: number; percent: number }) => void
): Promise<VideoItem> => {
  const downloadsDir = `${FileSystem.documentDirectory}downloads/`;
  const dirInfo = await FileSystem.getInfoAsync(downloadsDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
  }

  const ext = format === 'audio_mp3' ? 'mp3' : 'mp4';
  const cleanTitle = metadata.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  const fileUri = `${downloadsDir}${cleanTitle}_${Date.now()}.${ext}`;

  const downloadResumable = FileSystem.createDownloadResumable(
    metadata.streamUrl,
    fileUri,
    {},
    (downloadProgress) => {
      const writtenMB = Number(
        (downloadProgress.totalBytesWritten / (1024 * 1024)).toFixed(2)
      );
      const totalMB = Number(
        (downloadProgress.totalBytesExpectedToWrite / (1024 * 1024)).toFixed(2)
      );
      const percent =
        downloadProgress.totalBytesExpectedToWrite > 0
          ? Math.round(
              (downloadProgress.totalBytesWritten /
                downloadProgress.totalBytesExpectedToWrite) *
                100
            )
          : 50;

      onProgress({ writtenMB, totalMB: totalMB > 0 ? totalMB : writtenMB + 5, percent });
    }
  );

  const result = await downloadResumable.downloadAsync();
  if (!result || !result.uri) {
    throw new Error('Download failed');
  }

  const fileInfo = await FileSystem.getInfoAsync(result.uri);
  const sizeMB = fileInfo.exists && 'size' in fileInfo && fileInfo.size
    ? `${(fileInfo.size / (1024 * 1024)).toFixed(1)} MB`
    : 'Downloaded';

  return {
    id: `downloaded-${Date.now()}`,
    title: metadata.title,
    author: metadata.author,
    duration: metadata.duration,
    thumbnail: metadata.thumbnail,
    uri: result.uri,
    resolution: format === 'video_hd' ? '720p HD' : format === 'video_sd' ? '360p' : 'Audio MP3',
    isDownloaded: true,
    fileSize: sizeMB,
    downloadDate: new Date().toLocaleDateString(),
  };
};
