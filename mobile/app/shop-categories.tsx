import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Image, Dimensions, Alert,
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
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const catRes = await categoryService.getCategories();
      
      // Handle both array response and wrapped response
      const categoryData = Array.isArray(catRes.data) 
        ? catRes.data 
        : Array.isArray((catRes as any).data?.data) 
          ? (catRes as any).data.data 
          : null;

      if (catRes.success && categoryData && categoryData.length > 0) {
        setCategories(categoryData);
        const first = categoryData[0];
        if (first) {
          const categoryId = (first as any)._id || first.id;
          setSelectedCategoryId(categoryId);
          setLoadingSubcategories(true);
          setSubcategoryError(null);
          try {
            const subRes = await subcategoryService.getSubcategoriesByCategory(first.name);
            console.log('Subcategory response for', first.name, ':', JSON.stringify(subRes));
            if (subRes.success && subRes.data && subRes.data.length > 0) {
              setSubcategories(subRes.data);
            } else {
              const fallback = await subcategoryService.getSubcategories(undefined, first.name);
              console.log('Fallback subcategory response:', JSON.stringify(fallback));
              setSubcategories(fallback.success && fallback.data ? fallback.data : []);
              if (!fallback.success) setSubcategoryError(fallback.error || 'Failed to load subcategories');
            }
          } catch (subErr) {
            console.error('Subcategory fetch error:', subErr);
            setSubcategoryError('Failed to load subcategories');
          } finally {
            setLoadingSubcategories(false);
          }
        }
      } else {
        console.error('Categories load failed:', JSON.stringify(catRes));
      }
    } catch (err) {
      console.error('Categories fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSubcategories = useCallback(async (categoryName: string, isRetry: boolean = false) => {
    setLoadingSubcategories(true);
    setSubcategoryError(null);
    
    try {
      const response = await subcategoryService.getSubcategoriesByCategory(categoryName);
      console.log('loadSubcategories response for', categoryName, ':', JSON.stringify(response));
      
      if (response.success && response.data && response.data.length > 0) {
        setSubcategories(response.data);
        setRetryCount(0);
      } else {
        // Fallback to query param approach
        const fallback = await subcategoryService.getSubcategories(undefined, categoryName);
        if (fallback.success && fallback.data && fallback.data.length > 0) {
          setSubcategories(fallback.data);
          setRetryCount(0);
        } else {
          setSubcategories([]);
          if (!isRetry && retryCount < 2) {
            setRetryCount(prev => prev + 1);
            setTimeout(() => loadSubcategories(categoryName, true), 2000);
            return;
          }
          setSubcategoryError('No subcategories found');
        }
      }
    } catch (error) {
      setSubcategories([]);
      setSubcategoryError(error instanceof Error ? error.message : 'Network error');
      if (!isRetry && retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadSubcategories(categoryName, true), 2000);
        return;
      }
    } finally {
      setLoadingSubcategories(false);
    }
  }, [retryCount]);

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
    setRetryCount(0);
    const category = categories.find(c => ((c as any)._id || c.id) === categoryId);
    if (category) {
      loadSubcategories(category.name);
    }
  };

  const handleDebugTest = async () => {
    if (!selectedCategory) return;
    
    Alert.alert(
      'Debug Test',
      'Testing subcategory endpoint...',
      [{ text: 'OK' }]
    );
    
    try {
      const result = await subcategoryService.testSubcategoryEndpoint(selectedCategory.name);
      Alert.alert(
        'Debug Result',
        `Success: ${result.success}\nError: ${result.error || 'None'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Debug Error',
        error instanceof Error ? error.message : 'Unknown error',
        [{ text: 'OK' }]
      );
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
      ) : categories.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="grid-outline" size={48} color={colors.textSecondary} />
          <Text style={{ fontSize: 16, color: colors.textSecondary, marginTop: 12, textAlign: 'center' }}>
            Failed to load categories
          </Text>
          <TouchableOpacity
            onPress={load}
            style={{
              marginTop: 16,
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: colors.textInverse, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
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
                  {retryCount > 0 && (
                    <Text style={{ 
                      fontSize: 12, 
                      color: colors.textSecondary,
                      marginTop: 4,
                    }}>
                      Retry attempt {retryCount}
                    </Text>
                  )}
                </View>
              ) : subcategoryError ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="warning-outline" size={48} color={colors.error} />
                  <Text style={{ 
                    fontSize: 14, 
                    color: colors.error,
                    marginTop: 12,
                    textAlign: 'center',
                    paddingHorizontal: 20,
                  }}>
                    Failed to load subcategories
                  </Text>
                  <Text style={{ 
                    fontSize: 12, 
                    color: colors.textSecondary,
                    marginTop: 4,
                    textAlign: 'center',
                    paddingHorizontal: 20,
                  }}>
                    {subcategoryError}
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 8,
                      marginTop: 16,
                    }}
                    onPress={() => {
                      if (selectedCategory) {
                        setRetryCount(0);
                        loadSubcategories(selectedCategory.name);
                      }
                    }}
                  >
                    <Text style={{ color: colors.surface, fontWeight: '600' }}>
                      Retry
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.background,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 8,
                      marginTop: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    onPress={() => {
                      if (selectedCategory) {
                        // Navigate directly to category without subcategory
                        router.push({ 
                          pathname: '/products', 
                          params: {
                            category: selectedCategory.name,
                            title: selectedCategory.name
                          }
                        });
                      }
                    }}
                  >
                    <Text style={{ color: colors.text, fontWeight: '600' }}>
                      Browse All {selectedCategory?.name}
                    </Text>
                  </TouchableOpacity>
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