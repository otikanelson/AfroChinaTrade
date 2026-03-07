export const fontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
} as const;

export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const letterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
} as const;

export const lineHeights = {
  tight: 18,
  normal: 22,
  relaxed: 26,
  loose: 32,
} as const;

export const typography = {
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: lineHeights.tight,
  },
  h2: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: lineHeights.tight,
  },
  h3: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
    lineHeight: lineHeights.normal,
  },
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
    lineHeight: lineHeights.normal,
  },
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
    lineHeight: lineHeights.normal,
  },
  bodyLarge: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
    lineHeight: lineHeights.normal,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
    lineHeight: lineHeights.normal,
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.wide,
    lineHeight: lineHeights.normal,
  },
  button: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.wide,
    lineHeight: lineHeights.normal,
  },
} as const;
