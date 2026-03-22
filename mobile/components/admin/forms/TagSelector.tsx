import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

interface Tag {
  id: string;
  label: string;
  value: boolean;
}

interface TagSelectorProps {
  label: string;
  tags: Tag[];
  onTagToggle: (tagId: string) => void;
  description?: string;
  testID?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  label,
  tags,
  onTagToggle,
  description,
  testID
}) => {
  const { colors, fonts, fontSizes, spacing, borderRadius } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: fontSizes.base,
      fontFamily: fonts.medium,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    description: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    tag: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    tagSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tagText: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
      color: colors.text,
    },
    tagTextSelected: {
      color: colors.textInverse,
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      <View style={styles.tagsContainer}>
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tag,
              tag.value && styles.tagSelected
            ]}
            onPress={() => onTagToggle(tag.id)}
            testID={`${testID}-${tag.id}`}
          >
            <Text style={[
              styles.tagText,
              tag.value && styles.tagTextSelected
            ]}>
              {tag.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};