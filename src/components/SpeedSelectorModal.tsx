import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface SpeedSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  currentSpeed: number;
  onSelectSpeed: (speed: number) => void;
}

export const SpeedSelectorModal: React.FC<SpeedSelectorModalProps> = ({
  visible,
  onClose,
  currentSpeed,
  onSelectSpeed,
}) => {
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="speedometer-outline" size={20} color={Colors.primaryLight} />
              <Text style={styles.title}>Playback Speed</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {speeds.map((speed) => {
              const isSelected = Math.abs(currentSpeed - speed) < 0.05;
              return (
                <TouchableOpacity
                  key={speed}
                  style={[styles.speedCard, isSelected && styles.selectedCard]}
                  onPress={() => {
                    onSelectSpeed(speed);
                    onClose();
                  }}
                >
                  <Text style={[styles.speedText, isSelected && styles.selectedText]}>
                    {speed}x
                  </Text>
                  {speed === 1.0 && (
                    <Text style={[styles.normalBadge, isSelected && styles.selectedNormalBadge]}>
                      Normal
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
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
    marginBottom: 20,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  speedCard: {
    width: '30%',
    backgroundColor: Colors.cardBackground,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCard: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryLight,
  },
  speedText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  normalBadge: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  selectedNormalBadge: {
    color: Colors.primaryLight,
  },
});
