import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface HighlightedTextProps {
  text: string;
  searchQuery?: string;
  style?: TextStyle;
  numberOfLines?: number;
  highlightStyle?: TextStyle;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  searchQuery,
  style,
  numberOfLines,
  highlightStyle
}) => {
  const { colors } = useTheme();

  // If no search query, return normal text
  if (!searchQuery || !searchQuery.trim()) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  const query = searchQuery.trim();
  
  // Create regex for case-insensitive search
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  const defaultHighlightStyle: TextStyle = {
    backgroundColor: colors.primaryLight || '#E3F2FD',
    color: colors.primary || '#1976D2',
    fontWeight: '700',
    borderRadius: 2,
    paddingHorizontal: 1,
    ...highlightStyle
  };

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((part, index) => {
        // Check if this part matches the search query (case-insensitive)
        const isHighlight = part.toLowerCase() === query.toLowerCase();
        
        return (
          <Text
            key={index}
            style={isHighlight ? defaultHighlightStyle : undefined}
          >
            {part}
          </Text>
        );
      })}
    </Text>
  );
};