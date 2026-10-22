import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AudioProvider, useAudio } from './src/context/AudioContext';
import { VideoProvider } from './src/context/VideoContext';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { VideosScreen } from './src/screens/VideosScreen';
import { DownloaderScreen } from './src/screens/DownloaderScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { QueueScreen } from './src/screens/QueueScreen';
import { MiniPlayer } from './src/components/MiniPlayer';
import { PlayerModal } from './src/components/PlayerModal';
import { VideoPlayerModal } from './src/components/VideoPlayerModal';
import { Colors } from './src/theme/colors';

type Tab = 'music' | 'videos' | 'downloader' | 'favorites' | 'queue';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('music');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="play-circle" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>
            AURA<Text style={styles.brandHighlight}>MEDIA</Text>
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>HD Media</Text>
          </View>
        </View>
      </View>

      {/* Main Content Screen */}
      <View style={styles.screenContainer}>
        {activeTab === 'music' && <LibraryScreen />}
        {activeTab === 'videos' && <VideosScreen />}
        {activeTab === 'downloader' && <DownloaderScreen />}
        {activeTab === 'favorites' && <FavoritesScreen />}
        {activeTab === 'queue' && <QueueScreen />}
      </View>

      {/* Persistent Mini Player & Bottom Navigation */}
      <View style={styles.bottomDock}>
        <MiniPlayer />

        <SafeAreaView edges={['bottom']} style={styles.tabBarSafeArea}>
          <View style={styles.tabBar}>
            {/* Music Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('music')}
            >
              <Ionicons
                name={activeTab === 'music' ? 'musical-notes' : 'musical-notes-outline'}
                size={22}
                color={activeTab === 'music' ? Colors.primaryLight : Colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'music' && styles.tabLabelActive,
                ]}
              >
                Music
              </Text>
            </TouchableOpacity>

            {/* Videos Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('videos')}
            >
              <Ionicons
                name={activeTab === 'videos' ? 'videocam' : 'videocam-outline'}
                size={22}
                color={activeTab === 'videos' ? Colors.accent : Colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'videos' && { color: Colors.accent, fontWeight: '700' },
                ]}
              >
                Videos
              </Text>
            </TouchableOpacity>

            {/* Downloader Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('downloader')}
            >
              <Ionicons
                name={activeTab === 'downloader' ? 'cloud-download' : 'cloud-download-outline'}
                size={22}
                color={activeTab === 'downloader' ? Colors.primaryLight : Colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'downloader' && styles.tabLabelActive,
                ]}
              >
                Download
              </Text>
            </TouchableOpacity>

            {/* Favorites Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('favorites')}
            >
              <Ionicons
                name={activeTab === 'favorites' ? 'heart' : 'heart-outline'}
                size={22}
                color={activeTab === 'favorites' ? Colors.accentPink : Colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'favorites' && { color: Colors.accentPink, fontWeight: '700' },
                ]}
              >
                Favorites
              </Text>
            </TouchableOpacity>

            {/* Queue Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('queue')}
            >
              <Ionicons
                name={activeTab === 'queue' ? 'list' : 'list-outline'}
                size={22}
                color={activeTab === 'queue' ? Colors.primaryLight : Colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'queue' && styles.tabLabelActive,
                ]}
              >
                Queue
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Full-Screen Audio Player Modal */}
      <PlayerModal />

      {/* Full-Screen Video Player Modal */}
      <VideoPlayerModal />
    </SafeAreaView>
  );
};

const AppWithProviders: React.FC = () => {
  const { pauseTrack } = useAudio();

  return (
    <VideoProvider onBeforePlayVideo={pauseTrack}>
      <MainApp />
    </VideoProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AudioProvider>
        <AppWithProviders />
      </AudioProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 1.5,
  },
  brandHighlight: {
    color: Colors.accent,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent,
  },
  screenContainer: {
    flex: 1,
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarSafeArea: {
    backgroundColor: Colors.cardBackground,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 3,
  },
  tabLabelActive: {
    color: Colors.text,
    fontWeight: '700',
  },
});
