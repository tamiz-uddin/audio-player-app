import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudio } from '../context/AudioContext';
import { Colors } from '../theme/colors';
import { formatTime, formatTimerSeconds } from '../utils/formatters';
import { VisualizerBar } from './VisualizerBar';
import { SleepTimerModal } from './SleepTimerModal';
import { SpeedSelectorModal } from './SpeedSelectorModal';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = Math.min(width - 64, 340);

export const PlayerModal: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    positionMillis,
    durationMillis,
    isShuffle,
    repeatMode,
    playbackRate,
    sleepTimerRemaining,
    isPlayerModalVisible,
    setPlayerModalVisible,
    togglePlayPause,
    skipNext,
    skipPrevious,
    seekTo,
    toggleShuffle,
    toggleRepeatMode,
    toggleFavorite,
    isFavorite,
    setPlaybackSpeed,
    setSleepTimer,
  } = useAudio();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false);

  if (!currentTrack) return null;

  const isFav = isFavorite(currentTrack.id);
  const currentPosition = isSeeking ? seekValue : positionMillis;

  const handleSlidingStart = (value: number) => {
    setIsSeeking(true);
    setSeekValue(value);
  };

  const handleValueChange = (value: number) => {
    setSeekValue(value);
  };

  const handleSlidingComplete = async (value: number) => {
    await seekTo(value);
    setIsSeeking(false);
  };

  return (
    <Modal
      visible={isPlayerModalVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setPlayerModalVisible(false)}
    >
      <LinearGradient
        colors={['#1E163B', '#111322', '#0A0B13']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => setPlayerModalVisible(false)}
              style={styles.circleButton}
            >
              <Ionicons name="chevron-down" size={26} color={Colors.text} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerSubtitle}>PLAYING NOW</Text>
              <Text numberOfLines={1} style={styles.headerAlbum}>
                {currentTrack.album || currentTrack.genre || 'Single'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setIsSleepModalOpen(true)}
              style={[
                styles.circleButton,
                sleepTimerRemaining !== null && styles.activeTimerButton,
              ]}
            >
              <Ionicons
                name="moon"
                size={20}
                color={sleepTimerRemaining !== null ? Colors.accent : Colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Sleep Timer Indicator Pill if active */}
          {sleepTimerRemaining !== null && (
            <TouchableOpacity
              onPress={() => setIsSleepModalOpen(true)}
              style={styles.sleepBadge}
            >
              <Ionicons name="timer-outline" size={14} color={Colors.accent} />
              <Text style={styles.sleepBadgeText}>
                Sleeps in {formatTimerSeconds(sleepTimerRemaining)}
              </Text>
            </TouchableOpacity>
          )}

          {/* Center: Artwork & Visualizer */}
          <View style={styles.artworkSection}>
            <View style={styles.artworkWrapper}>
              <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
              <View style={styles.artworkGlow} />
            </View>
            <View style={styles.visualizerRow}>
              <VisualizerBar isPlaying={isPlaying} barCount={6} maxHeight={22} />
            </View>
          </View>

          {/* Track Details */}
          <View style={styles.detailsSection}>
            <View style={styles.titleArtistBox}>
              <Text numberOfLines={1} style={styles.title}>
                {currentTrack.title}
              </Text>
              <Text numberOfLines={1} style={styles.artist}>
                {currentTrack.artist}
              </Text>
            </View>

            <TouchableOpacity
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={() => toggleFavorite(currentTrack.id)}
              style={styles.favoriteButton}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={28}
                color={isFav ? Colors.accentPink : Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Scrubber / Slider */}
          <View style={styles.sliderSection}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={Math.max(durationMillis, 1)}
              value={currentPosition}
              onSlidingStart={handleSlidingStart}
              onValueChange={handleValueChange}
              onSlidingComplete={handleSlidingComplete}
              minimumTrackTintColor={Colors.sliderMinimumTrack}
              maximumTrackTintColor={Colors.sliderMaximumTrack}
              thumbTintColor={Colors.sliderThumb}
            />

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
              <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
            </View>
          </View>

          {/* Main Controls (Shuffle, Prev, Play/Pause, Next, Repeat) */}
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={toggleShuffle} style={styles.controlSubBtn}>
              <Ionicons
                name="shuffle"
                size={22}
                color={isShuffle ? Colors.accent : Colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={skipPrevious} style={styles.skipBtn}>
              <Ionicons name="play-skip-back" size={28} color={Colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={togglePlayPause}
              activeOpacity={0.8}
              style={styles.mainPlayBtn}
            >
              {isBuffering ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={36}
                  color="#FFFFFF"
                  style={!isPlaying ? { marginLeft: 4 } : undefined}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={skipNext} style={styles.skipBtn}>
              <Ionicons name="play-skip-forward" size={28} color={Colors.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleRepeatMode} style={styles.controlSubBtn}>
              <Ionicons
                name={repeatMode === 'one' ? 'repeat-outline' : 'repeat'}
                size={22}
                color={repeatMode !== 'off' ? Colors.accent : Colors.textMuted}
              />
              {repeatMode === 'one' && <Text style={styles.repeatBadge}>1</Text>}
            </TouchableOpacity>
          </View>

          {/* Bottom Utility Bar (Speed & Mode) */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={() => setIsSpeedModalOpen(true)}
              style={styles.utilityButton}
            >
              <MaterialCommunityIcons name="speedometer" size={18} color={Colors.textSecondary} />
              <Text style={styles.utilityText}>{playbackRate}x</Text>
            </TouchableOpacity>

            <View style={styles.genrePill}>
              <Text style={styles.genreText}>{currentTrack.genre || 'Audio'}</Text>
            </View>
          </View>
        </SafeAreaView>

        {/* Sub Modals */}
        <SleepTimerModal
          visible={isSleepModalOpen}
          onClose={() => setIsSleepModalOpen(false)}
          onSelectTimer={setSleepTimer}
          activeRemaining={sleepTimerRemaining}
        />

        <SpeedSelectorModal
          visible={isSpeedModalOpen}
          onClose={() => setIsSpeedModalOpen(false)}
          currentSpeed={playbackRate}
          onSelectSpeed={setPlaybackSpeed}
        />
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTimerButton: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 12,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1.5,
  },
  headerAlbum: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sleepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  sleepBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent,
  },
  artworkSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  artworkWrapper: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 20,
    position: 'relative',
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    resizeMode: 'cover',
  },
  artworkGlow: {
    position: 'absolute',
    inset: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  visualizerRow: {
    marginTop: 16,
    alignItems: 'center',
  },
  detailsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  titleArtistBox: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  artist: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  favoriteButton: {
    padding: 8,
  },
  sliderSection: {
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  controlSubBtn: {
    padding: 10,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 9,
    fontWeight: '800',
    color: Colors.accent,
  },
  skipBtn: {
    padding: 10,
  },
  mainPlayBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  utilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  utilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  genrePill: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  genreText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
});
