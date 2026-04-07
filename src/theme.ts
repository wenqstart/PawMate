// Premium Pet-Friendly Design System
// Warm orange and white theme with sophisticated, inviting aesthetics

export const COLORS = {
  // Primary - Warm orange spectrum
  primary: '#E07B5A',        // Coral orange - main brand color
  primaryLight: '#F0A080',  // Light coral
  primaryDark: '#C45A3A',   // Deep coral

  // Accent - Complementary warm tones
  accent: '#F5B041',         // Golden amber
  accentLight: '#F8C471',    // Light gold
  accentDark: '#D4922A',      // Deep gold

  // Background - Warm cream white
  background: '#FFF9F5',     // Warm cream
  surface: '#FFFFFF',         // Pure white cards
  surfaceElevated: '#FFFBF8', // Slightly warm white

  // Text - Soft charcoal with warmth
  text: '#3D3D3D',           // Warm dark gray
  textSecondary: '#7A7A7A',   // Medium warm gray
  textTertiary: '#ADADAD',   // Light warm gray
  textInverse: '#FFFFFF',     // White text

  // Semantic - Warm versions
  success: '#6B9B6B',         // Warm green
  warning: '#E5A835',         // Warm amber
  error: '#D4736B',           // Warm rose
  info: '#7AABAB',            // Warm teal

  // Gradient colors
  gradientStart: '#E07B5A',  // Coral start
  gradientEnd: '#F5B041',     // Gold end

  // Secondary gradient (for cards)
  gradientSecondaryStart: '#FF8A65',
  gradientSecondaryEnd: '#FFB74D',

  // Neutral - Warm grays
  border: '#F0E8E3',          // Warm border
  divider: '#FAF5F0',         // Warm divider
  disabled: '#E8E3DE',        // Warm disabled

  // Shadows with warm tint
  shadow: 'rgba(224, 123, 90, 0.08)',
  shadowMedium: 'rgba(224, 123, 90, 0.15)',
  shadowStrong: 'rgba(224, 123, 90, 0.25)',

  // Pet-friendly accent colors (for categories/tags)
  petCoral: '#FF8A65',
  petPeach: '#FFAB91',
  petAmber: '#FFD54F',
  petMint: '#A8D8B9',
  petSky: '#81D4FA',
  petLavender: '#CE93D8',

  // Legacy (for migration)
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E0E0E0',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  round: 999,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadowMedium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Typography
export const TYPOGRAPHY = {
  h1: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  h4: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
  },
  body: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.regular,
    color: COLORS.text,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.regular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  caption: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.regular,
    color: COLORS.textTertiary,
    lineHeight: 14,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
};
