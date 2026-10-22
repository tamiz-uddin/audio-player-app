export interface VideoItem {
  id: string;
  title: string;
  author?: string;
  duration: number; // in seconds
  thumbnail: string;
  uri: string;
  resolution?: string;
  isLocal?: boolean;
  isDownloaded?: boolean;
  fileSize?: string;
  downloadDate?: string;
}

export type VideoAspectRatio = 'contain' | 'cover' | 'stretch';

export interface VideoContextType {
  videos: VideoItem[];
  activeVideo: VideoItem | null;
  isVideoModalVisible: boolean;
  playVideo: (video: VideoItem) => void;
  closeVideo: () => void;
  importLocalVideo: () => Promise<VideoItem | null>;
  addDownloadedVideo: (video: VideoItem) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
  shareVideo: (video: VideoItem) => Promise<void>;
}
