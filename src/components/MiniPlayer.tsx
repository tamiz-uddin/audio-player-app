import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { Colors } from '../theme/colors';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    positionMillis,
    durationMillis,
    togglePlayPause,
    skipNext,
    setPlayerModalVisible,
    isFavorite,
    toggleFavorite,
  } = useAudio();

  if (!currentTrack) return null;

  const progressPercent = durationMillis > 0 ? (positionMillis / durationMillis) * 100 : 0;
  const isFav = isFavorite(currentTrack.id);

  return (
    <View style={styles.wrapper}>
      {/* Top progress bar */}
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]} />
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.container}
        onPress={() => setPlayerModalVisible(true)}
      >
        <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />

        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.title}>
            {currentTrack.title}
          </Text>
          <Text numberOfLines={1} style={styles.artist}>
            {currentTrack.artist}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
            onPress={() => toggleFavorite(currentTrack.id)}
            style={styles.iconBtn}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={22}
              color={isFav ? Colors.accentPink : Colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
            onPress={togglePlayPause}
            style={styles.playBtn}
          >
            {isBuffering ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={22}
                color="#FFFFFF"
                style={!isPlaying ? { marginLeft: 2 } : undefined}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
            onPress={skipNext}
            style={styles.iconBtn}
          >
            <Ionicons name="play-skip-forward" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.cardBackgroundElevated,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 12,
    overflow: 'hidden',
  },
  progressBackground: {
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primaryLight,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  artwork: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: Colors.cardBackground,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  artist: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 6,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
