import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideo } from '../context/VideoContext';
import { Colors } from '../theme/colors';
import { formatTime } from '../utils/formatters';
import { VideoItem } from '../types/video';

export const VideosScreen: React.FC = () => {
  const { videos, playVideo, importLocalVideo, deleteVideo, shareVideo } = useVideo();
  const [filterTab, setFilterTab] = useState<'all' | 'downloaded' | 'local'>('all');

  const filteredVideos = useMemo(() => {
    if (filterTab === 'downloaded') {
      return videos.filter((v) => v.isDownloaded);
    }
    if (filterTab === 'local') {
      return videos.filter((v) => v.isLocal);
    }
    return videos;
  }, [videos, filterTab]);

  return (
    <View style={styles.container}>
      {/* Top Header & Actions */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Video Player</Text>
          <Text style={styles.subtitle}>
            {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'} available
          </Text>
        </View>

        <TouchableOpacity style={styles.importBtn} onPress={importLocalVideo}>
          <Ionicons name="folder-open-outline" size={18} color={Colors.accent} />
          <Text style={styles.importBtnText}>Import Video</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.filterTab, filterTab === 'all' && styles.filterTabActive]}
          onPress={() => setFilterTab('all')}
        >
          <Text
            style={[styles.filterTabText, filterTab === 'all' && styles.filterTabTextActive]}
          >
            All Videos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterTab === 'downloaded' && styles.filterTabActive]}
          onPress={() => setFilterTab('downloaded')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterTab === 'downloaded' && styles.filterTabTextActive,
            ]}
          >
            Downloaded ({videos.filter((v) => v.isDownloaded).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterTab === 'local' && styles.filterTabActive]}
          onPress={() => setFilterTab('local')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterTab === 'local' && styles.filterTabTextActive,
            ]}
          >
            Local Files
          </Text>
        </TouchableOpacity>
      </View>

      {/* Videos List */}
      <FlatList
        data={filteredVideos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.videoCard}
            onPress={() => playVideo(item)}
          >
            <View style={styles.thumbnailContainer}>
              <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
              <View style={styles.playBadge}>
                <Ionicons name="play" size={24} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </View>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{formatTime(item.duration * 1000)}</Text>
              </View>
              {item.resolution && (
                <View style={styles.resBadge}>
                  <Text style={styles.resText}>{item.resolution}</Text>
                </View>
              )}
            </View>

            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text numberOfLines={2} style={styles.videoCardTitle}>
                  {item.title}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text numberOfLines={1} style={styles.authorText}>
                  {item.author || 'Video Clip'} {item.fileSize ? `• ${item.fileSize}` : ''}
                </Text>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => shareVideo(item)}
                    style={styles.cardActionBtn}
                  >
                    <Ionicons name="share-outline" size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>

                  {(item.isDownloaded || item.isLocal) && (
                    <TouchableOpacity
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => deleteVideo(item.id)}
                      style={styles.cardActionBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-outline" size={50} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No videos found</Text>
            <Text style={styles.emptySubtitle}>
              {filterTab === 'downloaded'
                ? 'Download YouTube videos in the Downloader tab to watch them here.'
                : 'Import a video from your device or download one from the web.'}
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
    marginVertical: 14,
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
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  importBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryLight,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 110,
    gap: 14,
  },
  videoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbnailContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: Colors.cardBackgroundElevated,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(124, 58, 237, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  resBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },
  cardInfo: {
    padding: 12,
  },
  cardHeader: {
    marginBottom: 6,
  },
  videoCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardActionBtn: {
    padding: 4,
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
    maxWidth: 260,
  },
});
