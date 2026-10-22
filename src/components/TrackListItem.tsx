import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types/audio';
import { Colors } from '../theme/colors';
import { formatTime } from '../utils/formatters';
import { VisualizerBar } from './VisualizerBar';

interface TrackListItemProps {
  track: Track;
  isActive: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  onRemove?: () => void;
}

export const TrackListItem: React.FC<TrackListItemProps> = ({
  track,
  isActive,
  isPlaying,
  isFavorite,
  onPress,
  onToggleFavorite,
  onRemove,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
    >
      <View style={styles.artworkContainer}>
        <Image source={{ uri: track.artwork }} style={styles.artwork} />
        {isActive && (
          <View style={styles.playingOverlay}>
            {isPlaying ? (
              <VisualizerBar isPlaying={true} barCount={3} maxHeight={16} barColor="#FFFFFF" />
            ) : (
              <Ionicons name="pause" size={16} color="#FFFFFF" />
            )}
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text
          numberOfLines={1}
          style={[styles.title, isActive && { color: Colors.primaryLight }]}
        >
          {track.title}
        </Text>
        <View style={styles.subRow}>
          {track.isLocal && (
            <View style={styles.localBadge}>
              <Text style={styles.localBadgeText}>LOCAL</Text>
            </View>
          )}
          <Text numberOfLines={1} style={styles.artist}>
            {track.artist} {track.genre ? `• ${track.genre}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.duration}>
          {formatTime(track.duration * 1000)}
        </Text>

        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={onToggleFavorite}
          style={styles.actionButton}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? Colors.accentPink : Colors.textMuted}
          />
        </TouchableOpacity>

        {onRemove && (
          <TouchableOpacity
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={onRemove}
            style={styles.actionButton}
          >
            <Ionicons name="close-circle-outline" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginVertical: 4,
    backgroundColor: 'transparent',
  },
  activeContainer: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderColor: 'rgba(124, 58, 237, 0.25)',
    borderWidth: 1,
  },
  artworkContainer: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.cardBackground,
  },
  artwork: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 13, 23, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
    justifyContent: 'center',
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  localBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 6,
  },
  localBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000000',
  },
  artist: {
    color: Colors.textSecondary,
    fontSize: 13,
    flexShrink: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  duration: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  actionButton: {
    padding: 4,
  },
});
