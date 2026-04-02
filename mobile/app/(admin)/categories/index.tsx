import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Alert,
  RefreshControl, Modal, TextInput, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';
import { useTheme } from '../../../contexts/ThemeContext';
import { categoryService, CreateCategoryData } from '../../../services/CategoryService';
import { Category } from '../../../types/product';

// ─── Category form modal ───────────────────────────────────────────────────
interface FormModalProps {
  visible: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: () => void;
}

const CategoryFormModal: React.FC<FormModalProps> = ({ visible, category, onClose, onSave }) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [subcategories, setSubcategories] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
      setIcon(category.icon || '');
      setSubcategories((category.subcategories || []).join(', '));
    } else {
      setName(''); setDescription(''); setIcon(''); setSubcategories('');
    }
  }, [category, visible]);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Validation', 'Category name is required'); return; }
    setSaving(true);
    try {
      const payload: CreateCategoryData = {
        name: name.trim(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        subcategories: subcategories.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = category
        ? await categoryService.updateCategory((category as any)._id || category.id, payload)
        : await categoryService.createCategory(payload);
      if (res.success) { onSave(); onClose(); }
      else Alert.alert('Error', res.error?.message || 'Failed to save category');
    } catch { Alert.alert('Error', 'Failed to save category'); }
    finally { setSaving(false); }
  };

  const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, gap: spacing.md },
    title: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold as any, color: colors.text },
    label: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium as any, color: colors.text, marginBottom: 4 },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.sm, fontSize: fontSizes.base, color: colors.text, backgroundColor: colors.surface },
    hint: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
    row: { flexDirection: 'row', gap: spacing.sm },
    btn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
    btnText: { fontSize: fontSizes.base, fontWeight: fontWeights.semibold as any },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <ScrollView style={s.sheet} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>{category ? 'Edit Category' : 'New Category'}</Text>
          <View>
            <Text style={s.label}>Name *</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="e.g. Electronics" placeholderTextColor={colors.textLight} />
          </View>
          <View>
            <Text style={s.label}>Description</Text>
            <TextInput style={[s.input, { minHeight: 70, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} placeholder="Brief description" placeholderTextColor={colors.textLight} multiline />
          </View>
          <View>
            <Text style={s.label}>Icon (Ionicons name)</Text>
            <TextInput style={s.input} value={icon} onChangeText={setIcon} placeholder="e.g. phone-portrait" placeholderTextColor={colors.textLight} autoCapitalize="none" />
          </View>
          <View>
            <Text style={s.label}>Subcategories</Text>
            <TextInput style={s.input} value={subcategories} onChangeText={setSubcategories} placeholder="Phones, Tablets, Laptops" placeholderTextColor={colors.textLight} />
            <Text style={s.hint}>Comma-separated list</Text>
          </View>
          <View style={s.row}>
            <TouchableOpacity style={[s.btn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} onPress={onClose}>
              <Text style={[s.btnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={saving}>
              <Text style={[s.btnText, { color: colors.textInverse }]}>{saving ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

// ─── Main screen ───────────────────────────────────────────────────────────
export default function CategoriesManagement() {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const res = await categoryService.getCategories();
      if (res.success && res.data) setCategories(res.data);
    } catch { Alert.alert('Error', 'Failed to load categories'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const handleDelete = (cat: Category) => {
    Alert.alert('Delete Category', `Delete "${cat.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const res = await categoryService.deleteCategory((cat as any)._id || cat.id);
          if (res.success) load();
          else Alert.alert('Error', res.error?.message || 'Failed to delete');
        },
      },
    ]);
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={{
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
    }}>
      {/* Top accent */}
      <View style={{ height: 3, backgroundColor: colors.primary }} />
      <View style={{ padding: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 }}>
              {item.icon && <Ionicons name={item.icon as any} size={16} color={colors.primary} />}
              <Text style={{ fontSize: fontSizes.base, fontWeight: fontWeights.bold as any, color: colors.text }}>{item.name}</Text>
              {(item as any).productCount !== undefined && (
                <View style={{ backgroundColor: colors.primary + '18', borderRadius: borderRadius.full, paddingHorizontal: 6, paddingVertical: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.primary }}>{(item as any).productCount} products</Text>
                </View>
              )}
            </View>
            {item.description && (
              <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: spacing.xs }} numberOfLines={2}>{item.description}</Text>
            )}
            {item.subcategories?.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {item.subcategories.slice(0, 4).map(sub => (
                  <View key={sub} style={{ backgroundColor: colors.surface, borderRadius: borderRadius.full, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: colors.border }}>
                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>{sub}</Text>
                  </View>
                ))}
                {item.subcategories.length > 4 && (
                  <Text style={{ fontSize: 10, color: colors.textLight, alignSelf: 'center' }}>+{item.subcategories.length - 4}</Text>
                )}
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.xs, marginLeft: spacing.sm }}>
            <TouchableOpacity
              style={{ width: 30, height: 30, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => { setEditTarget(item); setFormVisible(true); }}
            >
              <Ionicons name="pencil" size={14} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ width: 30, height: 30, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.error, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => handleDelete(item)}
            >
              <Ionicons name="trash" size={14} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Header title="Categories" showBack />
      <View style={{ flex: 1, padding: spacing.base }}>
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.lg, gap: spacing.sm }}
          onPress={() => { setEditTarget(null); setFormVisible(true); }}
        >
          <Ionicons name="add-circle" size={22} color={colors.textInverse} />
          <Text style={{ color: colors.textInverse, fontSize: fontSizes.base, fontWeight: fontWeights.bold as any }}>Add New Category</Text>
        </TouchableOpacity>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={item => (item as any)._id || item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <Ionicons name="grid-outline" size={56} color={colors.textLight} />
                <Text style={{ color: colors.textSecondary, marginTop: spacing.md }}>No categories yet</Text>
              </View>
            }
          />
        )}
      </View>
      <CategoryFormModal
        visible={formVisible}
        category={editTarget}
        onClose={() => setFormVisible(false)}
        onSave={() => load()}
      />
    </View>
  );
}
