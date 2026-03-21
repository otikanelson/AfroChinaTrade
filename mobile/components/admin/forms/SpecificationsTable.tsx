import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';

interface Specification {
  id: string;
  key: string;
  value: string;
}

interface SpecificationsTableProps {
  label: string;
  specifications: Specification[];
  onSpecificationsChange: (specs: Specification[]) => void;
  placeholder?: string;
  helperText?: string;
  testID?: string;
}

export const SpecificationsTable: React.FC<SpecificationsTableProps> = ({
  label,
  specifications,
  onSpecificationsChange,
  placeholder = "e.g., Color, Size, Material",
  helperText,
  testID,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addSpecification = () => {
    const newSpec: Specification = {
      id: Date.now().toString(),
      key: '',
      value: '',
    };
    onSpecificationsChange([...specifications, newSpec]);
    setEditingId(newSpec.id);
  };

  const updateSpecification = (id: string, field: 'key' | 'value', newValue: string) => {
    const updated = specifications.map(spec =>
      spec.id === id ? { ...spec, [field]: newValue } : spec
    );
    onSpecificationsChange(updated);
  };

  const removeSpecification = (id: string) => {
    Alert.alert(
      'Remove Specification',
      'Are you sure you want to remove this specification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const filtered = specifications.filter(spec => spec.id !== id);
            onSpecificationsChange(filtered);
            if (editingId === id) {
              setEditingId(null);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (id: string) => {
    setEditingId(editingId === id ? null : id);
  };

  const handleSave = () => {
    // Validate that current editing spec has both key and value
    if (editingId) {
      const editingSpec = specifications.find(spec => spec.id === editingId);
      if (editingSpec && (!editingSpec.key.trim() || !editingSpec.value.trim())) {
        Alert.alert('Invalid Specification', 'Both specification name and value are required.');
        return;
      }
    }
    setEditingId(null);
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity onPress={addSpecification} style={styles.addButton}>
          <Ionicons name="add" size={20} color={theme.colors.primary} />
          <Text style={styles.addButtonText}>Add Spec</Text>
        </TouchableOpacity>
      </View>

      {helperText && <Text style={styles.helperText}>{helperText}</Text>}

      {specifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={32} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>No specifications added</Text>
          <Text style={styles.emptySubtext}>Tap "Add Spec" to add product specifications</Text>
        </View>
      ) : (
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.keyColumn]}>Specification</Text>
            <Text style={[styles.tableHeaderText, styles.valueColumn]}>Value</Text>
            <Text style={[styles.tableHeaderText, styles.actionColumn]}>Actions</Text>
          </View>

          {/* Table Rows */}
          {specifications.map((spec) => (
            <View key={spec.id} style={styles.tableRow}>
              <View style={styles.keyColumn}>
                {editingId === spec.id ? (
                  <TextInput
                    style={styles.editInput}
                    value={spec.key}
                    onChangeText={(text) => updateSpecification(spec.id, 'key', text)}
                    placeholder="Specification name"
                    autoFocus
                  />
                ) : (
                  <Text style={styles.cellText} numberOfLines={2}>
                    {spec.key || 'Untitled'}
                  </Text>
                )}
              </View>

              <View style={styles.valueColumn}>
                {editingId === spec.id ? (
                  <TextInput
                    style={styles.editInput}
                    value={spec.value}
                    onChangeText={(text) => updateSpecification(spec.id, 'value', text)}
                    placeholder="Specification value"
                  />
                ) : (
                  <Text style={styles.cellText} numberOfLines={2}>
                    {spec.value || 'No value'}
                  </Text>
                )}
              </View>

              <View style={styles.actionColumn}>
                <View style={styles.actionButtons}>
                  {editingId === spec.id ? (
                    <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
                      <Ionicons name="checkmark" size={16} color={theme.colors.success} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => handleEdit(spec.id)} style={styles.actionButton}>
                      <Ionicons name="pencil" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => removeSpecification(spec.id)} style={styles.actionButton}>
                    <Ionicons name="trash" size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: theme.spacing.xs,
  },
  addButtonText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.medium,
  },
  helperText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    fontWeight: theme.fontWeights.medium,
  },
  emptySubtext: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  table: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tableHeaderText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    alignItems: 'center',
  },
  keyColumn: {
    flex: 2,
    marginRight: theme.spacing.sm,
  },
  valueColumn: {
    flex: 2,
    marginRight: theme.spacing.sm,
  },
  actionColumn: {
    flex: 1,
    alignItems: 'center',
  },
  cellText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  editInput: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    fontSize: theme.fontSizes.sm,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.surface,
  },
});