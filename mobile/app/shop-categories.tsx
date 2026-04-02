import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, ScrollView,
  StyleSheet, ActivityIndicator, Image, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { categoryService } from '../services/CategoryService';
import { collectionService, Collection } from '../services/CollectionService';
import { Header } from '../components/Header';
import { Category } from '../types/product';

const { width: SCREEN_W } = Dimensions.get('window');
const SIDEBAR_W = 100;
const CONTENT_W = SCREEN_W - SIDEBAR_W;
const ITEM_W = (CONTENT_W - 24) / 3; // 3 columns with 8px gaps

export default function CategoriesScreen() {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'category' | 'collection'>('category');

  // Left sidebar items: Categories + Collections section
  const sidebarSections = [
    { id: '__collections_header__', label: 'Collections', icon: 'albums-outline' as const, isHeader: true },
    ...collections.slice(0, 6).map(c => ({ 
      id: c.id, 
      label: c.name, 
      icon: 'albums-outline' as const,
      type: 'collection' as const
    })),
    { id: '__categories_header__', label: 'Categories', icon: 'grid-outline' as const, isHeader: true },
    ...categories.map(c => ({ 
      id: (c as any)._id || c.id, 
      label: c.name, 
      icon: (c.icon as any) || 'grid-outline',
      type: 'category' as const
    })),
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, collRes] = await Promise.all([
        categoryService.getCategories(),
        collectionService.getActiveCollections()
      ]);
      
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
        // Default select first category
        const first = catRes.data[0];
        if (first) {
          setSelectedId((first as any)._id || first.id);
          setSelectedType('category');
        }
      }
      
      if (collRes.success && collRes.data) {
        setCollections(collRes.data);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const selectedCategory = categories.find(c => ((c as any)._id || c.id) === selectedId);
  const selectedCollection = collections.find(c => c.id === selectedId);

  // Right panel content
  const getRightItems = (): { key: string; label: string; image?: string; icon?: string; description?: string }[] => {
    if (selectedType === 'collection' && selectedCollection) {
      // Show this collection as a single item to browse
      return [{
        key: selectedCollection.id,
        label: selectedCollection.name,
        description: selectedCollection.description,
        icon: 'albums'
      }];
    }
    
    if (selectedType === 'category' && selectedCategory) {
      const subs = selectedCategory.subcategories || [];
      if (subs.length > 0) {
        // Show subcategories
        return subs.map(s => ({ 
          key: s, 
          label: s,
          icon: 'folder-outline'
        }));
      }
      // No subcategories — show the category itself
      return [{ 
        key: selectedCategory.name, 
        label: selectedCategory.name, 
        icon: selectedCategory.icon || 'grid-outline',
        description: selectedCategory.description
      }];
    }
    return [];
  };

  const handleRightItemPress = (item: { key: string; label: string }) => {
    if (selectedType === 'collection' && selectedCollection) {
      // Navigate to collection products
      router.push({ 
        pathname: '/product-listing', 
        params: { 
          collection: selectedCollection.id, 
          title: selectedCollection.name 
        } 
      });
    } else if (selectedType === 'category' && selectedCategory) {
      // Navigate to category/subcategory products
      const subs = selectedCategory.subcategories || [];
      if (subs.length > 0) {
        // Has subcategories - navigate with subcategory
        router.push({ 
          pathname: '/product-listing', 
          params: { 
            category: selectedCategory.name, 
            subcategory: item.key, 
            title: item.label 
          } 
        });
      } else {
        // No subcategories - navigate with just category
        router.push({ 
          pathname: '/product-listing', 
          params: { 
            category: selectedCategory.name, 
            title: selectedCategory.name 
          } 
        });
      }
    }
  };

  const handleSidebarPress = (item: any) => {
    if (item.isHeader) return; // Headers are not clickable
    
    setSelectedId(item.id);
    setSelectedType(item.type || 'category');
  };

  const rightItems = getRightItems();

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Header title="Browse" showBack />

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* ── Left sidebar ─────────────────────────────────────────────── */}
          <ScrollView
            style={{ width: SIDEBAR_W, backgroundColor: colors.background }}
            showsVerticalScrollIndicator={false}
          >
            {sidebarSections.map(item => {
              const active = selectedId === item.id && !item.isHeader;
              const isHeader = item.isHeader;
              
              if (isHeader) {
                return (
                  <View
                    key={item.id}
                    style={{
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.sm,
                      backgroundColor: colors.background,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderLight,
                      marginTop: spacing.sm,
                    }}
                  >
                    <Text style={{
                      fontSize: 11,
                      color: colors.textSecondary,
                      fontWeight: fontWeights.bold as any,
                      textAlign: 'left',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      {item.label}
                    </Text>
                  </View>
                );
              }
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.sm,
                    alignItems: 'center',
                    borderLeftWidth: active ? 3 : 0,
                    borderLeftColor: colors.primary,
                    backgroundColor: active ? colors.primary + '10' : 'transparent',
                  }}
                  onPress={() => handleSidebarPress(item)}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={active ? colors.primary : colors.textSecondary}
                  />
                  <Text style={{
                    fontSize: 10,
                    color: active ? colors.primary : colors.textSecondary,
                    fontWeight: active ? (fontWeights.bold as any) : (fontWeights.regular as any),
                    textAlign: 'center',
                    marginTop: 4,
                    lineHeight: 13,
                  }} numberOfLines={3}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Right content grid ────────────────────────────────────────── */}
          <ScrollView
            style={{ flex: 1, backgroundColor: colors.surface }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: spacing.md }}
          >
            {(selectedCategory || selectedCollection) && (
              <View style={{ marginBottom: spacing.md }}>
                <Text style={{ 
                  fontSize: fontSizes.lg, 
                  fontWeight: fontWeights.bold as any, 
                  color: colors.text,
                  marginBottom: spacing.xs
                }}>
                  {selectedType === 'collection' ? selectedCollection?.name : selectedCategory?.name}
                </Text>
                {(selectedCollection?.description || selectedCategory?.description) && (
                  <Text style={{ 
                    fontSize: fontSizes.sm, 
                    color: colors.textSecondary,
                    lineHeight: 20
                  }}>
                    {selectedType === 'collection' ? selectedCollection?.description : selectedCategory?.description}
                  </Text>
                )}
              </View>
            )}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {rightItems.map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={{ width: ITEM_W, alignItems: 'center', marginBottom: spacing.md }}
                  onPress={() => handleRightItemPress(item)}
                  activeOpacity={0.75}
                >
                  {/* Circle image/icon */}
                  <View style={{
                    width: ITEM_W - 8,
                    height: ITEM_W - 8,
                    borderRadius: (ITEM_W - 8) / 2,
                    backgroundColor: colors.background,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                    overflow: 'hidden',
                    marginBottom: 6,
                  }}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <Ionicons name={(item.icon as any) || 'grid-outline'} size={32} color={colors.primary} />
                    )}
                  </View>
                  <Text style={{ 
                    fontSize: 11, 
                    color: colors.text, 
                    textAlign: 'center', 
                    lineHeight: 14,
                    fontWeight: fontWeights.medium as any
                  }} numberOfLines={2}>
                    {item.label}
                  </Text>
                  {item.description && (
                    <Text style={{ 
                      fontSize: 9, 
                      color: colors.textSecondary, 
                      textAlign: 'center', 
                      lineHeight: 12,
                      marginTop: 2
                    }} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {rightItems.length === 0 && (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl }}>
                <Ionicons name="file-tray-outline" size={48} color={colors.textSecondary} />
                <Text style={{ 
                  fontSize: fontSizes.md, 
                  color: colors.textSecondary,
                  marginTop: spacing.md,
                  textAlign: 'center'
                }}>
                  No items available
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
