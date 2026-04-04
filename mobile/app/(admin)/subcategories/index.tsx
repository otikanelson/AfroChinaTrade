import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Alert,
  RefreshControl, Modal, TextInput, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';
import { useTheme } from '../../../contexts/ThemeContext';
import { subcategoryService, CreateSubcategoryData } from '../../../services/SubcategoryService';
import { categoryService } from '../../../services/CategoryService';
import { Subcategory } from '../../../services/SubcategoryService';
import { Category } from '../../../types/product';

// ─── Subcategory form modal ───────────────────────────────────────────────────
interface FormModalProps {
  visible: boolean;
  subcategory: Subcategory | null;
  onClose: () => void;
  onSave: () => void;
}

const SubcategoryFormModal: React.FC<FormModalProps> = ({ visible, subcategory, onClose, onSave }) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [icon, setIcon] = useState('');
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  useEffect(() => {
    if (subcategory) {
      setName(subcategory.name);
      setDescription(subcategory.description || '');
      setCategoryId(subcategory.categoryId);
      setIcon(subcategory.icon || '');
    } else {
      setName(''); setDescription(''); setCategoryId(''); setIcon('');
    }
  }, [subcategory, visible]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Validation', 'Subcategory name is required'); return; }
    if (!categoryId) { Alert.alert('Validation', 'Category is required'); return; }
    
    setSaving(true);
    try {
      const payload: CreateSubcategoryData = {
        name: name.trim(),
        description: description.trim() || undefined,
        categoryId,
        icon: icon.trim() || undefined,
      };
      
      const res = subcategory
        ? await subcategoryService.updateSubcategory(subcategory._id || subcategory.id, payload)
        : await subcategoryService.createSubcategory(payload);
        
      if (res.success) { 
        onSave(); 
        onClose(); 
      } else {
        Alert.alert('Error', res.error || 'Failed to save subcategory');
      }
    } catch (error) { 
      Alert.alert('Error', 'Failed to save subcategory'); 
    } finally { 
      setSaving(false); 
    }
  };

  const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, gap: spacing.md },
    title: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold as any, color: colors.text },
    label: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium as any, color: colors.text, marginBottom: 4 },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.sm, fontSize: fontSizes.base, color: colors.text, backgroundColor: colors.surface },
    picker: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.sm, fontSize: fontSizes.base, color: colors.text, backgroundColor: colors.surface },
    hint: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
    row: { flexDirection: 'row', gap: spacing.sm },
    btn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
    btnText: { fontSize: fontSizes.base, fontWeight: fontWeights.semibold as any },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <ScrollView style={s.sheet} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>{subcategory ? 'Edit Subcategory' : 'New Subcategory'}</Text>
          
          <View>
            <Text style={s.label}>Name *</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="e.g. Smartphones" placeholderTextColor={colors.textLight} />
          </View>
          
          <View>
            <Text style={s.label}>Description</Text>
            <TextInput style={[s.input, { minHeight: 70, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} placeholder="Brief description" placeholderTextColor={colors.textLight} multiline />
          </View>
          
          <View>
            <Text style={s.label}>Category *</Text>
            {loadingCategories ? (
              <View style={[s.picker, { justifyContent: 'center', alignItems: 'center', height: 50 }]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <ScrollView style={[s.picker, { maxHeight: 120 }]} nestedScrollEnabled>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={(cat as any)._id || cat.id}
                    style={{
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.xs,
                      backgroundColor: categoryId === ((cat as any)._id || cat.id) ? colors.primary + '20' : 'transparent',
                      borderRadius: borderRadius.sm,
                      marginBottom: 4,
                    }}
                    onPress={() => setCategoryId((cat as any)._id || cat.id)}
                  >
                    <Text style={{ 
                      color: categoryId === ((cat as any)._id || cat.id) ? colors.primary : colors.text,
                      fontWeight: categoryId === ((cat as any)._id || cat.id) ? '600' : '400'
                    }}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
          
          <View>
            <Text style={s.label}>Icon</Text>
            <TextInput style={s.input} value={icon} onChangeText={setIcon} placeholder="e.g. phone-portrait" placeholderTextColor={colors.textLight} autoCapitalize="none" />
            <Text style={s.hint}>Ionicon name (optional)</Text>
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
export default function SubcategoriesManagement() {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Subcategory | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const res = await subcategoryService.getSubcategories();
      if (res.success && res.data) setSubcategories(res.data);
    } catch { Alert.alert('Error', 'Failed to load subcategories'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const handleDelete = (sub: Subcategory) => {
    Alert.alert('Delete Subcategory', `Delete "${sub.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const res = await subcategoryService.deleteSubcategory(sub._id || sub.id);
          if (res.success) load();
          else Alert.alert('Error', res.error || 'Failed to delete');
        },
      },
    ]);
  };

  const renderSubcategory = ({ item }: { item: Subcategory }) => (
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
            </View>
            <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs }}>
              Category: {item.categoryName}
            </Text>
            {item.description && (
              <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: spacing.xs }} numberOfLines={2}>{item.description}</Text>
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
      <Header title="Subcategories" showBack />
      <View style={{ flex: 1, padding: spacing.base }}>
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.lg, gap: spacing.sm }}
          onPress={() => { setEditTarget(null); setFormVisible(true); }}
        >
          <Ionicons name="add-circle" size={22} color={colors.textInverse} />
          <Text style={{ color: colors.textInverse, fontSize: fontSizes.base, fontWeight: fontWeights.bold as any }}>Add New Subcategory</Text>
        </TouchableOpacity>
        
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={subcategories}
            renderItem={renderSubcategory}
            keyExtractor={item => item._id || item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <Ionicons name="folder-outline" size={56} color={colors.textLight} />
                <Text style={{ color: colors.textSecondary, marginTop: spacing.md }}>No subcategories yet</Text>
              </View>
            }
          />
        )}
      </View>
      
      <SubcategoryFormModal
        visible={formVisible}
        subcategory={editTarget}
        onClose={() => setFormVisible(false)}
        onSave={() => load()}
      />
    </View>
  );
}