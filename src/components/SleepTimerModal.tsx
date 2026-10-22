import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface SleepTimerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTimer: (minutes: number | null) => void;
  activeRemaining: number | null;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  visible,
  onClose,
  onSelectTimer,
  activeRemaining,
}) => {
  const options = [
    { label: '15 Minutes', minutes: 15 },
    { label: '30 Minutes', minutes: 30 },
    { label: '45 Minutes', minutes: 45 },
    { label: '1 Hour', minutes: 60 },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="moon" size={20} color={Colors.accent} />
              <Text style={styles.title}>Sleep Timer</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Playback will automatically pause when the timer expires.
          </Text>

          {options.map((opt) => (
            <TouchableOpacity
              key={opt.minutes}
              style={styles.optionButton}
              onPress={() => {
                onSelectTimer(opt.minutes);
                onClose();
              }}
            >
              <Text style={styles.optionText}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}

          {activeRemaining !== null && (
            <TouchableOpacity
              style={[styles.optionButton, styles.turnOffButton]}
              onPress={() => {
                onSelectTimer(null);
                onClose();
              }}
            >
              <Text style={styles.turnOffText}>Turn Off Sleep Timer</Text>
              <Ionicons name="stop-circle-outline" size={20} color={Colors.danger} />
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.cardBackgroundElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  turnOffButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: 4,
  },
  turnOffText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.danger,
  },
});
