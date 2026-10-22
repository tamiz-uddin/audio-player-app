import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import {
  fetchVideoDetails,
  downloadVideoFile,
  VideoMetadata,
  DownloadFormat,
  UnsupportedSourceError,
} from '../services/downloaderService';
import { useVideo } from '../context/VideoContext';
import { useAudio } from '../context/AudioContext';
import { formatTime } from '../utils/formatters';
import { Track } from '../types/audio';

export const DownloaderScreen: React.FC = () => {
  const { playVideo, addDownloadedVideo, videos, deleteVideo, shareVideo } = useVideo();
  const { playTrack } = useAudio();

  const [urlInput, setUrlInput] = useState<string>('');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>('video_hd');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    writtenMB: number;
    totalMB: number;
    percent: number;
  }>({ writtenMB: 0, totalMB: 0, percent: 0 });

  const handleFetch = async () => {
    const url = urlInput.trim();
    if (!url) {
      Alert.alert('Empty URL', 'Please paste a direct video or audio URL.');
      return;
    }

    try {
      setIsFetching(true);
      const data = await fetchVideoDetails(url);
      setVideoMetadata(data);
    } catch (err) {
      if (err instanceof UnsupportedSourceError) {
        Alert.alert('Unsupported Link', err.message);
      } else {
        Alert.alert('Error', 'Could not fetch video info. Please verify the URL.');
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleStartDownload = async () => {
    if (!videoMetadata) return;

    try {
      setIsDownloading(true);
      setDownloadProgress({ writtenMB: 0, totalMB: 0, percent: 0 });

      const downloadedItem = await downloadVideoFile(
        videoMetadata,
        selectedFormat,
        (prog) => setDownloadProgress(prog)
      );

      await addDownloadedVideo(downloadedItem);

      Alert.alert(
        'Download Complete! 🎉',
        `"${downloadedItem.title}" has been saved to your device.`,
        [
          {
            text: 'Watch Video',
            onPress: () => playVideo(downloadedItem),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (err) {
      console.warn('Download error:', err);
      Alert.alert('Download Failed', 'An error occurred while downloading the media.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadedVideos = videos.filter((v) => v.isDownloaded);

  const handlePlayAsAudio = (item: (typeof downloadedVideos)[0]) => {
    const trackItem: Track = {
      id: `audio-${item.id}`,
      title: item.title,
      artist: item.author || 'Downloaded Media',
      album: 'Downloads',
      duration: item.duration,
      artwork: item.thumbnail,
      uri: item.uri,
      isLocal: true,
      genre: 'Downloaded',
    };
    playTrack(trackItem);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Media Downloader</Text>
        <Text style={styles.subtitle}>
          Save direct MP4 or MP3 links to your device for offline play.
        </Text>
      </View>

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <Ionicons name="link-outline" size={20} color={Colors.textMuted} style={styles.linkIcon} />
        <TextInput
          style={styles.textInput}
          placeholder="Paste an MP4 or MP3 link..."
          placeholderTextColor={Colors.textMuted}
          value={urlInput}
          onChangeText={setUrlInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {urlInput.length > 0 && (
          <TouchableOpacity onPress={() => setUrlInput('')} style={{ marginRight: 6 }}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.fetchButton}
          onPress={() => handleFetch()}
          disabled={isFetching}
        >
          {isFetching ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.fetchButtonText}>Fetch</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Video Preview & Format Selection */}
      {videoMetadata && (
        <View style={styles.previewCard}>
          <Image source={{ uri: videoMetadata.thumbnail }} style={styles.previewThumbnail} />

          <View style={styles.previewDetails}>
            <View style={styles.ytBadgeRow}>
              {videoMetadata.isYouTube && (
                <View style={styles.ytBadge}>
                  <Ionicons name="logo-youtube" size={12} color="#FFFFFF" />
                  <Text style={styles.ytBadgeText}>YouTube</Text>
                </View>
              )}
              <Text style={styles.durationTag}>{formatTime(videoMetadata.duration * 1000)}</Text>
            </View>

            <Text numberOfLines={2} style={styles.previewTitle}>
              {videoMetadata.title}
            </Text>
            <Text numberOfLines={1} style={styles.previewAuthor}>
              Channel: {videoMetadata.author}
            </Text>

            {/* Format Selector */}
            <Text style={styles.formatLabel}>Choose Format & Quality:</Text>
            <View style={styles.formatRow}>
              <TouchableOpacity
                style={[
                  styles.formatChip,
                  selectedFormat === 'video_hd' && styles.formatChipActive,
                ]}
                onPress={() => setSelectedFormat('video_hd')}
              >
                <Ionicons
                  name="film"
                  size={14}
                  color={selectedFormat === 'video_hd' ? '#FFFFFF' : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.formatChipText,
                    selectedFormat === 'video_hd' && styles.formatChipTextActive,
                  ]}
                >
                  HD 720p (MP4)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.formatChip,
                  selectedFormat === 'video_sd' && styles.formatChipActive,
                ]}
                onPress={() => setSelectedFormat('video_sd')}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={14}
                  color={selectedFormat === 'video_sd' ? '#FFFFFF' : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.formatChipText,
                    selectedFormat === 'video_sd' && styles.formatChipTextActive,
                  ]}
                >
                  SD 360p (MP4)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.formatChip,
                  selectedFormat === 'audio_mp3' && styles.formatChipActive,
                ]}
                onPress={() => setSelectedFormat('audio_mp3')}
              >
                <Ionicons
                  name="musical-notes"
                  size={14}
                  color={selectedFormat === 'audio_mp3' ? '#FFFFFF' : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.formatChipText,
                    selectedFormat === 'audio_mp3' && styles.formatChipTextActive,
                  ]}
                >
                  Audio (MP3)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Download Progress Bar if downloading */}
            {isDownloading ? (
              <View style={styles.downloadProgressContainer}>
                <View style={styles.progressTextRow}>
                  <Text style={styles.progressStatusText}>Downloading...</Text>
                  <Text style={styles.progressPercentText}>
                    {downloadProgress.percent}% ({downloadProgress.writtenMB} /{' '}
                    {downloadProgress.totalMB} MB)
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(downloadProgress.percent, 100)}%` },
                    ]}
                  />
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.downloadActionButton}
                onPress={handleStartDownload}
              >
                <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                <Text style={styles.downloadActionButtonText}>Download to Device</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Downloaded Items Section */}
      <View style={styles.downloadsSection}>
        <View style={styles.downloadsSectionHeader}>
          <Text style={styles.sectionTitle}>
            Downloaded Library ({downloadedVideos.length})
          </Text>
        </View>

        {downloadedVideos.length === 0 ? (
          <View style={styles.noDownloadsCard}>
            <MaterialCommunityIcons
              name="download-circle-outline"
              size={44}
              color={Colors.textMuted}
            />
            <Text style={styles.noDownloadsTitle}>No downloads yet</Text>
            <Text style={styles.noDownloadsSubtitle}>
              Paste a direct media link above to save your first video.
            </Text>
          </View>
        ) : (
          downloadedVideos.map((item) => (
            <View key={item.id} style={styles.downloadItemCard}>
              <Image source={{ uri: item.thumbnail }} style={styles.downloadItemThumb} />

              <View style={styles.downloadItemInfo}>
                <Text numberOfLines={1} style={styles.downloadItemTitle}>
                  {item.title}
                </Text>
                <Text numberOfLines={1} style={styles.downloadItemMeta}>
                  {item.resolution || 'Media'} • {item.fileSize || 'Local'} • {item.downloadDate || 'Saved'}
                </Text>

                <View style={styles.downloadItemActions}>
                  <TouchableOpacity
                    style={styles.playVideoBtn}
                    onPress={() => playVideo(item)}
                  >
                    <Ionicons name="videocam" size={14} color="#FFFFFF" />
                    <Text style={styles.playVideoBtnText}>Watch</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.playAudioBtn}
                    onPress={() => handlePlayAsAudio(item)}
                  >
                    <Ionicons name="musical-notes" size={14} color={Colors.primaryLight} />
                    <Text style={styles.playAudioBtnText}>Audio</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconCircleBtn}
                    onPress={() => shareVideo(item)}
                  >
                    <Ionicons name="share-social-outline" size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconCircleBtn}
                    onPress={() => deleteVideo(item.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 3,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  linkIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    paddingVertical: 6,
  },
  fetchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  fetchButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: Colors.cardBackgroundElevated,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderHighlight,
    marginBottom: 20,
  },
  previewThumbnail: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  previewDetails: {
    padding: 16,
  },
  ytBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ytBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  ytBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  durationTag: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  previewAuthor: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  formatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  formatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formatChipActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryLight,
  },
  formatChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  formatChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  downloadActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  downloadActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  downloadProgressContainer: {
    backgroundColor: Colors.cardBackground,
    padding: 12,
    borderRadius: 12,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  downloadsSection: {
    marginTop: 8,
  },
  downloadsSectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  noDownloadsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noDownloadsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 10,
  },
  noDownloadsSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  downloadItemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  downloadItemThumb: {
    width: 74,
    height: 74,
    borderRadius: 10,
    backgroundColor: Colors.cardBackgroundElevated,
  },
  downloadItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  downloadItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  downloadItemMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  downloadItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  playVideoBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  playAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  playAudioBtnText: {
    color: Colors.primaryLight,
    fontSize: 11,
    fontWeight: '600',
  },
  iconCircleBtn: {
    padding: 4,
  },
});
