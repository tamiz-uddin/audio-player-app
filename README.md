# 🎵 Aura Player - React Native Audio Player Mobile App

A modern, high-performance audio player mobile application built with **React Native**, **Expo SDK 58**, and TypeScript. Featuring a dark glassmorphic UI, rich audio playback controls, favorites, dynamic queue, sleep timer, playback speed control, and device audio import.

---

## ✨ Features

- 🎧 **Rich Playback Engine**: Powered by `expo-av` with support for play, pause, seek, next/previous track, buffering status, repeat modes (All / One / Off), and shuffle.
- 📱 **Persistent Mini-Player**: Bottom-docked mini-player with quick controls and progress indicator that smoothly transitions to the full-screen player.
- 🎚️ **Full-Screen Now Playing**:
  - Glowing vinyl & artwork presentation
  - Real-time animated audio visualizer bars
  - Interactive scrubbing seek bar with millisecond accuracy
  - Quick-toggle favorite button
  - Speed modifier modal (0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x)
  - Sleep timer with live countdown badge
- 🌐 **Open Music Library**: Streams Creative Commons licensed music from the [Jamendo API](https://developer.jamendo.com/v3.0), with server-side search and infinite scroll.
- 📂 **Local Device File Import**: Pick and play any audio file (`.mp3`, `.wav`, `.m4a`, etc.) directly from phone storage using `expo-document-picker`.
- ❤️ **Favorites & Persistence**: Liked songs and imported tracks are automatically persisted across app restarts using `@react-native-async-storage/async-storage`.
- 🔍 **Real-Time Search & Genre Filtering**: Instantly search by song title, artist, or album, and filter by the genres Jamendo reports for each track.
- 📋 **Active Queue Management**: View upcoming tracks, jump to any track, and remove items from the playback queue.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your iOS/Android device (or Android Studio / Xcode emulator)

### Installation & Run

1. Open a terminal and navigate to the project directory:
```bash
cd audio-player-app
```

2. Configure the music library. Register an app at [devportal.jamendo.com](https://devportal.jamendo.com) to get a free client ID, then:
```bash
cp .env.example .env.local
# edit .env.local and set EXPO_PUBLIC_JAMENDO_CLIENT_ID
```
The client ID is embedded in the app bundle, as with any `EXPO_PUBLIC_` variable. Without it the Library tab shows an error, but imported local files still play.

3. Start the Expo development server:
```bash
npm start
```

4. Choose your platform:
- **Android**: Press `a` in the terminal (or run `npm run android`)
- **iOS**: Press `i` in the terminal (or run `npm run ios`)
- **Web**: Press `w` in the terminal (or run `npm run web`)
- **Physical Device**: Scan the QR code displayed in the terminal using the **Expo Go** app on your Android or iOS phone.

---

## 📁 Project Architecture

```
audio-player-app/
├── App.tsx                     # Root application container & tab navigation
├── app.json                    # Expo config & background audio permissions
├── src/
│   ├── components/             # Reusable UI Components
│   │   ├── MiniPlayer.tsx      # Docked bottom mini player
│   │   ├── PlayerModal.tsx     # Full-screen player view
│   │   ├── TrackListItem.tsx   # Track row with active visualizer
│   │   ├── VisualizerBar.tsx   # Animated equalizer bars
│   │   ├── SleepTimerModal.tsx # Sleep timer countdown selector
│   │   └── SpeedSelectorModal.tsx # Playback rate controller
│   ├── context/
│   │   └── AudioContext.tsx    # Global audio state & player controller
│   ├── services/
│   │   ├── jamendoService.ts   # Jamendo (Creative Commons) catalogue client
│   │   └── downloaderService.ts # Direct media URL downloader
│   ├── theme/
│   │   └── colors.ts           # Dark mode styling palette & constants
│   ├── types/
│   │   └── audio.ts            # TypeScript interfaces
│   └── utils/
│       └── formatters.ts       # Time formatters (MM:SS)
```
