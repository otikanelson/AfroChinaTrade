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
const CHIP_HEIGHT = 32;

export default function CategoriesScreen() {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

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
          setSelectedCategoryId((first as any)._id || first.id);
        }
      }
      
      if (collRes.success && collRes.data) {
        setCollections(collRes.data);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const selectedCategory = categories.find(c => ((c as any)._id || c.id) === selectedCategoryId);
  const selectedCollection = collections.find(c => c.id === selectedCollectionId);

  // Right panel content - show subcategories or category itself
  const getRightItems = (): { key: string; label: string; image?: string; icon?: string; description?: string }[] => {
    if (!selectedCategory) return [];
    
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
  };

  const handleRightItemPress = (item: { key: string; label: string }) => {
    if (!selectedCategory) return;
    
    const subs = selectedCategory.subcategories || [];
    const params: any = {};
    
    if (subs.length > 0) {
      // Has subcategories - navigate with subcategory
      params.category = selectedCategory.name;
      params.subcategory = item.key;
      params.title = item.label;
    } else {
      // No subcategories - navigate with just category
      params.category = selectedCategory.name;
      params.title = selectedCategory.name;
    }
    
    // Add collection filter if one is selected
    if (selectedCollectionId) {
      params.collectionId = selectedCollectionId;
    }
    
    router.push({ 
      pathname: '/product-listing', 
      params 
    });
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    // Keep collection filter active when switching categories
  };

  const handleCollectionChipPress = (collectionId: string) => {
    // Toggle collection filter
    setSelectedCollectionId(prev => prev === collectionId ? null : collectionId);
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
          {/* ── Left sidebar (Categories only) ─────────────────────────── */}
          <ScrollView
            style={{ width: SIDEBAR_W, backgroundColor: colors.background }}
            showsVerticalScrollIndicator={false}
          >
            {categories.map(cat => {
              const catId = (cat as any)._id || cat.id;
              const active = selectedCategoryId === catId;
              
              return (
                <TouchableOpacity
                  key={catId}
                  style={{
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.sm,
                    alignItems: 'center',
                    borderLeftWidth: active ? 3 : 0,
                    borderLeftColor: colors.primary,
                    backgroundColor: active ? colors.primary + '10' : 'transparent',
                  }}
                  onPress={() => handleCategoryPress(catId)}
                >
                  <Ionicons
                    name={(cat.icon as any) || 'grid-outline'}
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
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Right content area ────────────────────────────────────────── */}
          <View style={{ flex: 1, backgroundColor: colors.surface }}>
            {/* Collection filter chips at the top */}
            {collections.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ 
                  backgroundColor: colors.background,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                }}
                contentContainerStyle={{ 
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  gap: spacing.xs,
                }}
              >
                {collections.map(coll => {
                  const isActive = selectedCollectionId === coll.id;
                  return (
                    <TouchableOpacity
                      key={coll.id}
                      style={{
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.xs,
                        borderRadius: borderRadius.full,
                        backgroundColor: isActive ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: isActive ? colors.primary : colors.border,
                        height: CHIP_HEIGHT,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => handleCollectionChipPress(coll.id)}
                    >
                      <Text style={{
                        fontSize: fontSizes.sm,
                        color: isActive ? colors.background : colors.text,
                        fontWeight: isActive ? (fontWeights.bold as any) : (fontWeights.medium as any),
                      }}>
                        {coll.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Scrollable content grid */}
            <ScrollView
              style={{ flex: 1 }}
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
                    {selectedCategory?.name}
                    {selectedCollection && ` • ${selectedCollection.name}`}
                  </Text>
                  {selectedCategory?.description && (
                    <Text style={{ 
                      fontSize: fontSizes.sm, 
                      color: colors.textSecondary,
                      lineHeight: 20
                    }}>
                      {selectedCategory.description}
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
        </View>
      )}
    </View>
  );
}
