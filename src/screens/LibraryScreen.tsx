import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { TrackListItem } from '../components/TrackListItem';
import { Colors } from '../theme/colors';
import { Track } from '../types/audio';

export const LibraryScreen: React.FC = () => {
  const {
    tracks,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    isFavorite,
    toggleFavorite,
    importLocalAudio,
  } = useAudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  // Extract unique genres
  const genres = useMemo(() => {
    const list = new Set<string>();
    list.add('All');
    tracks.forEach((t) => {
      if (t.genre) list.add(t.genre);
    });
    return Array.from(list);
  }, [tracks]);

  // Filter tracks by query and genre
  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      const matchesSearch =
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGenre =
        selectedGenre === 'All' || track.genre === selectedGenre;

      return matchesSearch && matchesGenre;
    });
  }, [tracks, searchQuery, selectedGenre]);

  const handleTrackPress = async (track: Track) => {
    if (currentTrack?.id === track.id) {
      await togglePlayPause();
    } else {
      await playTrack(track, filteredTracks);
    }
  };

  const handlePlayAll = async () => {
    if (filteredTracks.length > 0) {
      await playTrack(filteredTracks[0], filteredTracks);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs, artists, albums..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Genre Filter Chips */}
      <View style={styles.genreRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreScroll}>
          {genres.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <TouchableOpacity
                key={genre}
                style={[styles.genreChip, isSelected && styles.genreChipSelected]}
                onPress={() => setSelectedGenre(genre)}
              >
                <Text style={[styles.genreChipText, isSelected && styles.genreChipTextSelected]}>
                  {genre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Action Banner (Import Local Audio & Quick Play) */}
      <View style={styles.actionsBar}>
        <TouchableOpacity style={styles.importBtn} onPress={importLocalAudio}>
          <Ionicons name="cloud-upload-outline" size={18} color={Colors.accent} />
          <Text style={styles.importBtnText}>Import Audio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playAllBtn} onPress={handlePlayAll}>
          <Ionicons name="play" size={16} color="#FFFFFF" />
          <Text style={styles.playAllBtnText}>Play All ({filteredTracks.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Track List */}
      <FlatList
        data={filteredTracks}
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
            <Ionicons name="musical-notes-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No tracks found</Text>
            <Text style={styles.emptySubtitle}>
              Try a different search term or import an audio file from your device.
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    padding: 0,
  },
  genreRow: {
    marginTop: 14,
    marginBottom: 8,
  },
  genreScroll: {
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  genreChipSelected: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryLight,
  },
  genreChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  genreChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
    gap: 12,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  importBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  playAllBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 110,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 240,
  },
});
