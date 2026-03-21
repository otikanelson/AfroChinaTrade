import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SpacerProps {
  size?: keyof ReturnType<typeof useTheme>['spacing'] | number;
  horizontal?: boolean;
  style?: ViewStyle;
}

export const Spacer: React.FC<SpacerProps> = ({ 
  size = 'base', 
  horizontal = false, 
  style 
}) => {
  const { spacing } = useTheme();
  
  const spacingValue = typeof size === 'number' ? size : spacing[size as keyof typeof spacing];
  
  const spacerStyle: ViewStyle = {
    [horizontal ? 'width' : 'height']: spacingValue,
  };

  return <View style={[spacerStyle, style]} />;
};

// Convenience components for common spacing
export const SmallSpacer: React.FC<Omit<SpacerProps, 'size'>> = (props) => (
  <Spacer size="sm" {...props} />
);

export const MediumSpacer: React.FC<Omit<SpacerProps, 'size'>> = (props) => (
  <Spacer size="base" {...props} />
);

export const LargeSpacer: React.FC<Omit<SpacerProps, 'size'>> = (props) => (
  <Spacer size="lg" {...props} />
);

export const SectionSpacer: React.FC<Omit<SpacerProps, 'size'>> = (props) => (
  <Spacer size="sectionSpacing" {...props} />
);