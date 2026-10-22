export const Colors = {
  background: '#0B0D17',
  cardBackground: '#16192B',
  cardBackgroundElevated: '#20243C',
  cardGlass: 'rgba(32, 36, 60, 0.75)',
  
  primary: '#7C3AED', // Vibrant Violet
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',
  accent: '#06B6D4', // Vibrant Cyan
  accentPink: '#EC4899', // Hot Pink
  
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  border: '#2A2F4C',
  borderHighlight: '#3B426A',
  
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  
  sliderMinimumTrack: '#A78BFA',
  sliderMaximumTrack: '#334155',
  sliderThumb: '#FFFFFF',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Typography = {
  titleLarge: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  titleMedium: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
};
