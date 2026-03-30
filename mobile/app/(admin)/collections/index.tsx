import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/admin/Card';
import { StatusBadge } from '../../../components/admin/StatusBadge';
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

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await collectionService.getActiveCollections();
      if (response.success && response.data) {
        // Load product count for each collection
        const collectionsWithCounts = await Promise.all(
          response.data.map(async (collection) => {
            const collectionId = (collection as any)._id || collection.id;
            const productsResponse = await collectionService.getCollectionProducts(collectionId, 1, 1);
            return {
              ...collection,
              productCount: productsResponse.success && productsResponse.data 
                ? productsResponse.data.productCount || 0 
                : 0
            };
          })
        );
        setCollections(collectionsWithCounts);
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
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="albums" size={24} color={colors.text} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.collectionName}>{collection.name}</Text>
            <StatusBadge
              status={collection.isActive ? 'active' : 'pending'}
              label={collection.isActive ? 'Active' : 'Inactive'}
            />
          </View>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditCollection(collection)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={16} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, collection.isActive ? styles.pauseButton : styles.playButton]}
            onPress={() => handleToggleStatus(collection)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={collection.isActive ? "pause" : "play"} 
              size={16} 
              color={collection.isActive ? colors.warning : colors.success} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteCollection(collection)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {collection.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{collection.description}</Text>
        </View>
      )}

      <View style={styles.filtersSection}>
        <View style={styles.filtersHeader}>
          <Ionicons name="filter" size={16} color={colors.textSecondary} />
          <Text style={styles.filtersLabel}>Filters ({collection.filters.length})</Text>
        </View>
        <View style={styles.filtersContainer}>
          {collection.filters.slice(0, 3).map((filter, index) => (
            <View key={index} style={styles.filterChip}>
              <Text style={styles.filterText}>
                {filter.type}: {typeof filter.value === 'object' 
                  ? `${(filter.value as any).min || 0} - ${(filter.value as any).max || '∞'}`
                  : String(filter.value).length > 15 
                    ? `${String(filter.value).substring(0, 15)}...`
                    : filter.value
                }
              </Text>
            </View>
          ))}
          {collection.filters.length > 3 && (
            <View style={styles.moreFiltersChip}>
              <Text style={styles.moreFiltersText}>
                +{collection.filters.length - 3} more
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="cube-outline" size={16} color={colors.primary} />
            <Text style={styles.statText}>
              {collection.productCount || 0} products
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="reorder-three-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>
              Order: {collection.displayOrder}
            </Text>
          </View>
        </View>
        <View style={styles.timestampContainer}>
          <Text style={styles.timestamp}>
            Created {new Date(collection.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
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
      marginBottom: spacing.lg,
      padding: 0, // Remove padding since Card component handles it
    },
    cardHeader: {
      marginBottom: spacing.md,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    titleContainer: {
      flex: 1,
      gap: spacing.xs,
    },
    collectionName: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
      lineHeight: fontSizes.xl * 1.2,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    actionButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      minWidth: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editButton: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    playButton: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.success,
    },
    pauseButton: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.warning,
    },
    deleteButton: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.error,
    },
    descriptionContainer: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    description: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: fontSizes.sm * 1.4,
    },
    filtersSection: {
      marginBottom: spacing.md,
    },
    filtersHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    filtersLabel: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    filtersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    filterChip: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      maxWidth: 200,
    },
    filterText: {
      fontSize: fontSizes.xs,
      color: colors.textInverse,
      fontWeight: fontWeights.medium,
    },
    moreFiltersChip: {
      backgroundColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
    },
    moreFiltersText: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      fontWeight: fontWeights.medium,
    },
    cardFooter: {
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      paddingTop: spacing.md,
      gap: spacing.sm,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: spacing.lg,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    statText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      fontWeight: fontWeights.medium,
    },
    timestampContainer: {
      alignItems: 'flex-end',
    },
    timestamp: {
      fontSize: fontSizes.xs,
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
            !loading ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="albums-outline" size={80} color={colors.primary} />
                </View>
                <Text style={styles.emptyText}>No collections found</Text>
                <Text style={styles.emptySubtext}>
                  Create your first collection to organize products into curated groups
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
}