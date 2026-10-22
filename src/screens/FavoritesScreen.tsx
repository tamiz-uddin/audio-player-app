import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { TrackListItem } from '../components/TrackListItem';
import { Colors } from '../theme/colors';
import { Track } from '../types/audio';

export const FavoritesScreen: React.FC = () => {
  const {
    tracks,
    favorites,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    isFavorite,
    toggleFavorite,
  } = useAudio();

  const favoriteTracks = useMemo(() => {
    return tracks.filter((t) => favorites.includes(t.id));
  }, [tracks, favorites]);

  const handleTrackPress = async (track: Track) => {
    if (currentTrack?.id === track.id) {
      await togglePlayPause();
    } else {
      await playTrack(track, favoriteTracks);
    }
  };

  const handlePlayFavorites = async () => {
    if (favoriteTracks.length > 0) {
      await playTrack(favoriteTracks[0], favoriteTracks);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Favorite Tracks</Text>
          <Text style={styles.subtitle}>
            {favoriteTracks.length} {favoriteTracks.length === 1 ? 'song' : 'songs'} saved
          </Text>
        </View>

        {favoriteTracks.length > 0 && (
          <TouchableOpacity style={styles.playButton} onPress={handlePlayFavorites}>
            <Ionicons name="play" size={18} color="#FFFFFF" />
            <Text style={styles.playButtonText}>Play All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={favoriteTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TrackListItem
            track={item}
            isActive={currentTrack?.id === item.id}
            isPlaying={isPlaying && currentTrack?.id === item.id}
            isFavorite={isFavorite(item.id)}
            onPress={() => handleTrackPress(item)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart" size={40} color={Colors.accentPink} />
            </View>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on any track in your library to add it here for quick listening.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentPink,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  playButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 110,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 260,
    lineHeight: 18,
  },
});
