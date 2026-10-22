import { VideoItem } from '../types/video';

export const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: 'vid-1',
    title: 'Big Buck Bunny (HD 720p)',
    author: 'Blender Foundation',
    duration: 596,
    resolution: '720p HD',
    fileSize: '59 MB',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    uri: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
  },
  {
    id: 'vid-2',
    title: 'Elephants Dream (Sci-Fi Animation)',
    author: 'Orange Open Movie Project',
    duration: 653,
    resolution: '720p HD',
    fileSize: '45 MB',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    uri: 'https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4',
  },
  {
    id: 'vid-3',
    title: 'Tears of Steel (Sci-Fi VFX)',
    author: 'Blender Institute',
    duration: 734,
    resolution: '720p HD',
    fileSize: '72 MB',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    uri: 'https://archive.org/download/Tears-of-Steel/tears_of_steel_720p.mp4',
  },
];
