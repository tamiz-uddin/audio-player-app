import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideo } from '../context/VideoContext';
import { Colors } from '../theme/colors';
import { formatTime } from '../utils/formatters';

const { width, height } = Dimensions.get('window');

export const VideoPlayerModal: React.FC = () => {
  const { activeVideo, isVideoModalVisible, closeVideo, shareVideo } = useVideo();

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  const [positionMillis, setPositionMillis] = useState<number>(0);
  const [durationMillis, setDurationMillis] = useState<number>(0);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const [resizeMode, setResizeMode] = useState<ResizeMode>(ResizeMode.CONTAIN);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [seekValue, setSeekValue] = useState<number>(0);

  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHideTimer = () => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    setIsControlsVisible(true);
    hideControlsTimer.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 4000);
  };

  useEffect(() => {
    if (isVideoModalVisible) {
      resetHideTimer();
    }
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [isVideoModalVisible, isPlaying]);

  if (!activeVideo) return null;

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      setIsBuffering(true);
      return;
    }

    setIsBuffering(status.isBuffering);
    setIsPlaying(status.isPlaying);
    setPositionMillis(status.positionMillis || 0);

    if (status.durationMillis) {
      setDurationMillis(status.durationMillis);
    }
  };

  const handlePlayPause = async () => {
    resetHideTimer();
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const handleSkip = async (deltaSeconds: number) => {
    resetHideTimer();
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(positionMillis + deltaSeconds * 1000, durationMillis));
    await videoRef.current.setPositionAsync(target);
  };

  const handleSeekSlidingComplete = async (value: number) => {
    setIsSeeking(false);
    resetHideTimer();
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
    }
  };

  const cycleResizeMode = () => {
    resetHideTimer();
    if (resizeMode === ResizeMode.CONTAIN) {
      setResizeMode(ResizeMode.COVER);
    } else if (resizeMode === ResizeMode.COVER) {
      setResizeMode(ResizeMode.STRETCH);
    } else {
      setResizeMode(ResizeMode.CONTAIN);
    }
  };

  const cyclePlaybackRate = async () => {
    resetHideTimer();
    const rates = [1.0, 1.25, 1.5, 2.0, 0.5];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      await videoRef.current.setRateAsync(nextRate, true);
    }
  };

  const toggleMute = async () => {
    resetHideTimer();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(nextMuted);
    }
  };

  const currentDisplayPosition = isSeeking ? seekValue : positionMillis;

  return (
    <Modal
      visible={isVideoModalVisible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={closeVideo}
    >
      <StatusBar hidden={!isControlsVisible} barStyle="light-content" />
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={() => setIsControlsVisible((prev) => !prev)}>
          <View style={styles.videoWrapper}>
            <Video
              ref={videoRef}
              source={{ uri: activeVideo.uri }}
              rate={playbackRate}
              isMuted={isMuted}
              resizeMode={resizeMode}
              shouldPlay
              style={styles.video}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            />
          </View>
        </TouchableWithoutFeedback>

        {/* Buffering Indicator */}
        {isBuffering && (
          <View style={styles.bufferingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color={Colors.primaryLight} />
            <Text style={styles.bufferingText}>Loading video...</Text>
          </View>
        )}

        {/* Controls Overlay */}
        {isControlsVisible && (
          <SafeAreaView style={styles.controlsOverlay}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={closeVideo}
                style={styles.iconCircle}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.titleContainer}>
                <Text numberOfLines={1} style={styles.videoTitle}>
                  {activeVideo.title}
                </Text>
                <Text numberOfLines={1} style={styles.videoAuthor}>
                  {activeVideo.author || 'Video Stream'}
                </Text>
              </View>

              <View style={styles.topRightActions}>
                <TouchableOpacity onPress={cycleResizeMode} style={styles.aspectBtn}>
                  <MaterialCommunityIcons
                    name={
                      resizeMode === ResizeMode.CONTAIN
                        ? 'aspect-ratio'
                        : resizeMode === ResizeMode.COVER
                        ? 'fullscreen'
                        : 'arrow-expand-all'
                    }
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.aspectText}>
                    {resizeMode === ResizeMode.CONTAIN
                      ? 'FIT'
                      : resizeMode === ResizeMode.COVER
                      ? 'FILL'
                      : 'STRETCH'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => shareVideo(activeVideo)}
                  style={styles.iconCircle}
                >
                  <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Center Controls (Rewind 10s, Play/Pause, Forward 10s) */}
            <View style={styles.centerControls}>
              <TouchableOpacity
                onPress={() => handleSkip(-10)}
                style={styles.skipButton}
              >
                <Ionicons name="reload" size={24} color="#FFFFFF" />
                <Text style={styles.skipText}>-10s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.bigPlayButton}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={40}
                  color="#FFFFFF"
                  style={!isPlaying ? { marginLeft: 4 } : undefined}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSkip(10)}
                style={styles.skipButton}
              >
                <Ionicons
                  name="reload"
                  size={24}
                  color="#FFFFFF"
                  style={{ transform: [{ scaleX: -1 }] }}
                />
                <Text style={styles.skipText}>+10s</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Bar Controls */}
            <View style={styles.bottomBar}>
              <View style={styles.sliderRow}>
                <Text style={styles.timeLabel}>
                  {formatTime(currentDisplayPosition)}
                </Text>

                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={Math.max(durationMillis, 1)}
                  value={currentDisplayPosition}
                  onSlidingStart={(val) => {
                    setIsSeeking(true);
                    setSeekValue(val);
                  }}
                  onValueChange={(val) => setSeekValue(val)}
                  onSlidingComplete={handleSeekSlidingComplete}
                  minimumTrackTintColor={Colors.accent}
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor={Colors.accent}
                />

                <Text style={styles.timeLabel}>
                  {formatTime(durationMillis)}
                </Text>
              </View>

              <View style={styles.bottomActions}>
                <TouchableOpacity onPress={toggleMute} style={styles.bottomActionBtn}>
                  <Ionicons
                    name={isMuted ? 'volume-mute' : 'volume-high'}
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={cyclePlaybackRate}
                  style={styles.bottomActionBtn}
                >
                  <MaterialCommunityIcons name="speedometer" size={18} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>{playbackRate}x</Text>
                </TouchableOpacity>

                {activeVideo.resolution && (
                  <View style={styles.qualityPill}>
                    <Text style={styles.qualityText}>{activeVideo.resolution}</Text>
                  </View>
                )}
              </View>
            </View>
          </SafeAreaView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    gap: 12,
  },
  bufferingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 14,
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  videoAuthor: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  aspectText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  bigPlayButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  bottomBar: {
    width: '100%',
    paddingBottom: 8,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  slider: {
    flex: 1,
    height: 36,
    marginHorizontal: 10,
  },
  timeLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  bottomActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  qualityPill: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  qualityText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
});
