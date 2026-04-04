import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Image, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { categoryService } from '../services/CategoryService';
import { subcategoryService } from '../services/SubcategoryService';
import { Header } from '../components/Header';
import { Category } from '../types/product';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 100;

export default function CategoriesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const catRes = await categoryService.getCategories();
      
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
        const first = catRes.data[0];
        if (first) {
          const categoryId = (first as any)._id || first.id;
          setSelectedCategoryId(categoryId);
          // Load subcategories for the first category
          loadSubcategories(first.name);
        }
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  const loadSubcategories = useCallback(async (categoryName: string) => {
    setLoadingSubcategories(true);
    try {
      const response = await subcategoryService.getSubcategoriesByCategory(categoryName);
      if (response.success && response.data) {
        setSubcategories(response.data);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error('Failed to load subcategories:', error);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const selectedCategory = categories.find(c => ((c as any)._id || c.id) === selectedCategoryId);

  const getRightItems = (): { key: string; label: string; image?: string; icon?: string; description?: string }[] => {
    if (!selectedCategory) return [];
    
    if (subcategories.length > 0) {
      return subcategories.map(sub => ({ 
        key: sub.name, 
        label: sub.name,
        icon: sub.icon || 'folder-outline',
        description: sub.description
      }));
    }
    
    // No subcategories - show the category itself
    return [{ 
      key: selectedCategory.name, 
      label: selectedCategory.name, 
      icon: selectedCategory.icon || 'grid-outline',
      description: selectedCategory.description
    }];
  };

  const handleRightItemPress = (item: { key: string; label: string }) => {
    if (!selectedCategory) return;
    
    const params: any = {};
    
    if (subcategories.length > 0) {
      // Has subcategories - navigate with subcategory
      params.category = selectedCategory.name;
      params.subcategory = item.key;
      params.title = item.label;
    } else {
      // No subcategories - navigate with just category
      params.category = selectedCategory.name;
      params.title = selectedCategory.name;
    }
    
    router.push({ 
      pathname: '/products', 
      params 
    });
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    const category = categories.find(c => ((c as any)._id || c.id) === categoryId);
    if (category) {
      loadSubcategories(category.name);
    }
  };

  const rightItems = getRightItems();
  const contentWidth = SCREEN_WIDTH - SIDEBAR_WIDTH;
  const itemWidth = (contentWidth - 40) / 2;
  const circleSize = itemWidth - 16;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Header title="Browse" showBack />

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Left Sidebar */}
          <View style={{ width: SIDEBAR_WIDTH, backgroundColor: colors.background }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {categories.map(cat => {
                const catId = (cat as any)._id || cat.id;
                const active = selectedCategoryId === catId;
                
                return (
                  <TouchableOpacity
                    key={catId}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      alignItems: 'center',
                      borderLeftWidth: active ? 3 : 0,
                      borderLeftColor: colors.primary,
                      backgroundColor: active ? colors.primary + '10' : 'transparent',
                    }}
                    onPress={() => handleCategoryPress(catId)}
                  >
                    <Ionicons
                      name={(cat.icon as any) || 'grid-outline'}
                      size={22}
                      color={active ? colors.primary : colors.textSecondary}
                    />
                    <Text style={{
                      fontSize: 10,
                      color: active ? colors.primary : colors.textSecondary,
                      fontWeight: active ? '600' : '400',
                      textAlign: 'center',
                      marginTop: 4,
                      lineHeight: 12,
                    }} numberOfLines={2}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Right Content */}
          <View style={{ flex: 1, backgroundColor: colors.surface }}>
            {/* Content Grid */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16 }}
            >
              {/* Title */}
              {selectedCategory && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: '700', 
                    color: colors.text,
                    marginBottom: 4
                  }}>
                    {selectedCategory.name}
                  </Text>
                </View>
              )}

              {/* Grid Items */}
              {loadingSubcategories ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ 
                    fontSize: 14, 
                    color: colors.textSecondary,
                    marginTop: 12,
                  }}>
                    Loading subcategories...
                  </Text>
                </View>
              ) : (
                <View style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap',
                  marginHorizontal: -8,
                }}>
                  {rightItems.map(item => (
                    <View
                      key={item.key}
                      style={{ 
                        width: '50%',
                        paddingHorizontal: 8,
                        marginBottom: 20,
                      }}
                    >
                      <TouchableOpacity
                        style={{ alignItems: 'center' }}
                        onPress={() => handleRightItemPress(item)}
                        activeOpacity={0.7}
                      >
                        <View style={{
                          width: circleSize,
                          height: circleSize,
                          borderRadius: circleSize / 2,
                          backgroundColor: colors.background,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: colors.borderLight,
                          marginBottom: 8,
                        }}>
                          {item.image ? (
                            <Image 
                              source={{ uri: item.image }} 
                              style={{ width: '100%', height: '100%', borderRadius: circleSize / 2 }} 
                              resizeMode="cover" 
                            />
                          ) : (
                            <Ionicons 
                              name={(item.icon as any) || 'grid-outline'} 
                              size={circleSize * 0.4} 
                              color={colors.primary} 
                            />
                          )}
                        </View>
                        <Text style={{ 
                          fontSize: 13, 
                          color: colors.text, 
                          textAlign: 'center',
                          fontWeight: '500',
                          lineHeight: 16,
                        }} numberOfLines={2}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {rightItems.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                  <Ionicons name="file-tray-outline" size={48} color={colors.textSecondary} />
                  <Text style={{ 
                    fontSize: 14, 
                    color: colors.textSecondary,
                    marginTop: 12,
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
