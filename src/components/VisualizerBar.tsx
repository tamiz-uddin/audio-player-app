import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../theme/colors';

interface VisualizerBarProps {
  isPlaying: boolean;
  barCount?: number;
  barColor?: string;
  maxHeight?: number;
}

export const VisualizerBar: React.FC<VisualizerBarProps> = ({
  isPlaying,
  barCount = 4,
  barColor = Colors.primaryLight,
  maxHeight = 24,
}) => {
  const animations = useRef<Animated.Value[]>(
    Array.from({ length: barCount }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    let loopAnimations: Animated.CompositeAnimation[] = [];

    if (isPlaying) {
      loopAnimations = animations.map((anim, index) => {
        const duration = 300 + (index % 3) * 120 + Math.random() * 80;
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.9 + Math.random() * 0.1,
              duration,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.2 + (index % 2) * 0.15,
              duration,
              useNativeDriver: false,
            }),
          ])
        );
      });

      loopAnimations.forEach((loop) => loop.start());
    } else {
      animations.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 0.25,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    }

    return () => {
      loopAnimations.forEach((loop) => loop.stop());
    };
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: barColor,
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [4, maxHeight],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 28,
    gap: 3,
  },
  bar: {
    width: 3.5,
    borderRadius: 2,
  },
});
