import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AudioProvider } from './src/context/AudioContext';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { QueueScreen } from './src/screens/QueueScreen';
import { MiniPlayer } from './src/components/MiniPlayer';
import { PlayerModal } from './src/components/PlayerModal';
import { Colors } from './src/theme/colors';

type Tab = 'library' | 'favorites' | 'queue';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('library');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="musical-notes" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>
            AURA<Text style={styles.brandHighlight}>PLAYER</Text>
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>HQ Audio</Text>
          </View>
        </View>
      </View>

      {/* Main Content Screen */}
      <View style={styles.screenContainer}>
        {activeTab === 'library' && <LibraryScreen />}
        {activeTab === 'favorites' && <FavoritesScreen />}
        {activeTab === 'queue' && <QueueScreen />}
      </View>

      {/* Persistent Mini Player & Bottom Navigation */}
      <View style={styles.bottomDock}>
        <MiniPlayer />

        <SafeAreaView edges={['bottom']} style={styles.tabBarSafeArea}>
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('library')}
            >
              <Ionicons
                name={activeTab === 'library' ? 'musical-notes' : 'musical-notes-outline'}
                size={22}
                color={activeTab === 'library' ? Colors.primaryLight : Colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'library' && styles.tabLabelActive,
                ]}
              >
                Library
              </Text>
            </TouchableOpacity>

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
                  activeTab === 'favorites' && styles.tabLabelActive,
                ]}
              >
                Favorites
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('queue')}
            >
              <Ionicons
                name={activeTab === 'queue' ? 'list' : 'list-outline'}
                size={22}
                color={activeTab === 'queue' ? Colors.accent : Colors.textMuted}
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

      {/* Full-Screen Player Modal */}
      <PlayerModal />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AudioProvider>
        <MainApp />
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
    color: Colors.primaryLight,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.success,
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
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 3,
  },
  tabLabelActive: {
    color: Colors.text,
    fontWeight: '700',
  },
});
