import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { TrackListItem } from '../components/TrackListItem';
import { Colors } from '../theme/colors';
import { Track } from '../types/audio';

export const QueueScreen: React.FC = () => {
  const {
    queue,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    isFavorite,
    toggleFavorite,
    removeFromQueue,
    clearQueue,
  } = useAudio();

  const handleTrackPress = async (track: Track) => {
    if (currentTrack?.id === track.id) {
      await togglePlayPause();
    } else {
      await playTrack(track);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Now Playing Queue</Text>
          <Text style={styles.subtitle}>{queue.length} tracks in queue</Text>
        </View>

        {queue.length > 1 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearQueue}>
            <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={queue}
        keyExtractor={(item) => `queue-${item.id}`}
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
            onRemove={
              queue.length > 1 && currentTrack?.id !== item.id
                ? () => removeFromQueue(item.id)
                : undefined
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Queue is empty</Text>
            <Text style={styles.emptySubtitle}>
              Select any song from your library to start playing.
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
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  listContent: {
    paddingBottom: 110,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
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
  },
});
