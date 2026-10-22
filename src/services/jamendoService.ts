import { Track } from '../types/audio';

// Jamendo hosts Creative Commons licensed music: https://developer.jamendo.com/v3.0
const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = process.env.EXPO_PUBLIC_JAMENDO_CLIENT_ID;

export const JAMENDO_PAGE_SIZE = 30;

interface JamendoTrack {
  id: string;
  name: string;
  duration: number | string;
  artist_name: string;
  album_name?: string;
  image?: string;
  album_image?: string;
  audio: string;
  license_ccurl?: string;
  musicinfo?: {
    tags?: {
      genres?: string[];
    };
  };
}

interface JamendoResponse {
  headers: {
    status: string;
    code: number;
    error_message?: string;
  };
  results: JamendoTrack[];
}

export class JamendoConfigError extends Error {}

export const isJamendoConfigured = (): boolean => Boolean(JAMENDO_CLIENT_ID);

const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const parseDuration = (value: number | string): number => {
  if (typeof value === 'number') return value;
  if (value.includes(':')) {
    return value.split(':').reduce((total, part) => total * 60 + Number(part), 0);
  }
  return Number(value) || 0;
};

const toTrack = (item: JamendoTrack): Track => {
  const genre = item.musicinfo?.tags?.genres?.[0];
  return {
    id: `jamendo-${item.id}`,
    title: item.name,
    artist: item.artist_name,
    album: item.album_name || undefined,
    duration: parseDuration(item.duration),
    genre: genre ? capitalise(genre) : undefined,
    artwork: item.image || item.album_image || '',
    uri: item.audio,
    licenseUrl: item.license_ccurl || undefined,
  };
};

export const fetchJamendoTracks = async ({
  search,
  offset = 0,
  limit = JAMENDO_PAGE_SIZE,
}: {
  search?: string;
  offset?: number;
  limit?: number;
}): Promise<Track[]> => {
  if (!JAMENDO_CLIENT_ID) {
    throw new JamendoConfigError(
      'EXPO_PUBLIC_JAMENDO_CLIENT_ID is not set. Add it to .env.local and restart the dev server.'
    );
  }

  const params = new URLSearchParams({
    client_id: JAMENDO_CLIENT_ID,
    format: 'json',
    limit: String(limit),
    offset: String(offset),
    audioformat: 'mp32',
    imagesize: '600',
    include: 'musicinfo',
  });

  const query = search?.trim();
  if (query) {
    params.set('search', query);
    params.set('boost', 'popularity_total');
  } else {
    params.set('order', 'popularity_total');
  }

  const res = await fetch(`${JAMENDO_API_URL}/tracks/?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Jamendo request failed with HTTP ${res.status}`);
  }

  const data: JamendoResponse = await res.json();
  if (data.headers.status !== 'success') {
    throw new Error(data.headers.error_message || 'Jamendo request failed');
  }

  return data.results.filter((item) => Boolean(item.audio)).map(toTrack);
};
