import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/admin/Card';
import { CustomModal } from '../../../components/ui/CustomModal';
import { collectionService } from '../../../services/CollectionService';
import { useTheme } from '../../../contexts/ThemeContext';
import { Collection } from '../../../types/product';

export default function CollectionsManagement() {
  const router = useRouter();
  const { colors, spacing, fontSizes, borderRadius, fontWeights } = useTheme();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadCollections();
    }, [])
  );

  const loadCollections = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await collectionService.getActiveCollections();
      if (response.success && response.data) {
        // Product counts are now included in the response
        setCollections(response.data);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      Alert.alert('Error', 'Failed to load collections');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadCollections(true);
  };

  const handleCreateCollection = () => {
    router.push('/(admin)/collections/create');
  };

  const handleEditCollection = (collection: Collection) => {
    const collectionId = (collection as any)._id || collection.id;
    console.log('🔍 Attempting to edit collection:', collectionId, collection.name);
    router.push({
      pathname: '/(admin)/collections/[id]',
      params: { id: collectionId }
    });
  };

  const handleToggleStatus = async (collection: Collection) => {
    try {
      const collectionId = (collection as any)._id || collection.id;
      const response = await collectionService.toggleCollectionStatus(collectionId);
      if (response.success) {
        loadCollections();
        Alert.alert(
          'Success',
          `Collection ${collection.isActive ? 'deactivated' : 'activated'} successfully`
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to update collection status');
      }
    } catch (error) {
      console.error('Error toggling collection status:', error);
      Alert.alert('Error', 'Failed to update collection status');
    }
  };

  const handleDeleteCollection = (collection: Collection) => {
    setSelectedCollection(collection);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedCollection) return;
    
    try {
      const collectionId = (selectedCollection as any)._id || selectedCollection.id;
      const response = await collectionService.deleteCollection(collectionId);
      if (response.success) {
        loadCollections();
        setDeleteModalVisible(false);
        setSelectedCollection(null);
        Alert.alert('Success', 'Collection deleted successfully');
      } else {
        Alert.alert('Error', response.error || 'Failed to delete collection');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      Alert.alert('Error', 'Failed to delete collection');
    }
  };

  const renderCollectionCard = ({ item: collection }: { item: Collection }) => (
    <Card style={styles.collectionCard} elevation="md">
      {/* Top row: icon + name + status | action buttons */}
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <View style={[styles.iconContainer, { backgroundColor: collection.isActive ? colors.primary + '18' : colors.surface }]}>
            <Ionicons name="albums" size={20} color={collection.isActive ? colors.primary : colors.textSecondary} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.collectionName} numberOfLines={1}>{collection.name}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: collection.isActive ? colors.success : colors.textLight }]} />
              <Text style={[styles.statusLabel, { color: collection.isActive ? colors.success : colors.textLight }]}>
                {collection.isActive ? 'Active' : 'Inactive'}
              </Text>
              <Text style={styles.dotSep}>·</Text>
              <Text style={styles.statInline}>{collection.productCount || 0} products</Text>
              <Text style={styles.dotSep}>·</Text>
              <Text style={styles.statInline}>#{collection.displayOrder}</Text>
            </View>
          </View>
        </View>

        {/* Action buttons — top right */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.primary }]}
            onPress={() => handleEditCollection(collection)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={14} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: collection.isActive ? colors.warning : colors.success }]}
            onPress={() => handleToggleStatus(collection)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={collection.isActive ? 'pause' : 'play'}
              size={14}
              color={collection.isActive ? colors.warning : colors.success}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.error }]}
            onPress={() => handleDeleteCollection(collection)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={14} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Description */}
      {collection.description ? (
        <Text style={styles.description} numberOfLines={2}>{collection.description}</Text>
      ) : null}

      {/* Filter chips */}
      {collection.filters.length > 0 && (
        <View style={styles.filtersContainer}>
          {collection.filters.slice(0, 3).map((filter, index) => (
            <View key={index} style={styles.filterChip}>
              <Text style={styles.filterText}>
                {filter.type}
                {': '}
                {typeof filter.value === 'object'
                  ? `${(filter.value as any).min ?? 0}–${(filter.value as any).max ?? '∞'}`
                  : String(filter.value).length > 12
                    ? `${String(filter.value).slice(0, 12)}…`
                    : filter.value}
              </Text>
            </View>
          ))}
          {collection.filters.length > 3 && (
            <View style={[styles.filterChip, { backgroundColor: colors.border }]}>
              <Text style={[styles.filterText, { color: colors.textSecondary }]}>
                +{collection.filters.length - 3}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Footer: date */}
      <Text style={styles.timestamp}>
        Created {new Date(collection.createdAt).toLocaleDateString()}
      </Text>
    </Card>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
      padding: spacing.base,
    },
    createButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.xl,
      gap: spacing.sm,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    createButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
    },
    collectionCard: {
      marginBottom: spacing.sm,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    cardTopLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: spacing.sm,
      marginRight: spacing.sm,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    titleContainer: {
      flex: 1,
    },
    collectionName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: 3,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexWrap: 'wrap',
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusLabel: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
    },
    dotSep: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
    },
    statInline: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: spacing.xs,
      flexShrink: 0,
    },
    actionBtn: {
      width: 30,
      height: 30,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    description: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      lineHeight: fontSizes.xs * 1.5,
      marginBottom: spacing.sm,
    },
    filtersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    filterChip: {
      backgroundColor: colors.primary + '18',
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: borderRadius.full,
    },
    filterText: {
      fontSize: 10,
      color: colors.primary,
      fontWeight: fontWeights.medium,
    },
    timestamp: {
      fontSize: 10,
      color: colors.textLight,
      fontStyle: 'italic',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      marginTop: spacing['4xl'],
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    emptyText: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    emptySubtext: {
      fontSize: fontSizes.base,
      color: colors.textLight,
      textAlign: 'center',
      lineHeight: fontSizes.base * 1.4,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Collections" showBack />
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={handleCreateCollection}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={24} color={colors.textInverse} />
          <Text style={styles.createButtonText}>Create New Collection</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={collections}
            renderItem={renderCollectionCard}
            keyExtractor={(item) => (item as any)._id || item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="albums-outline" size={80} color={colors.primary} />
                </View>
                <Text style={styles.emptyText}>No collections found</Text>
                <Text style={styles.emptySubtext}>
                  Create your first collection to organize products into curated groups
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}