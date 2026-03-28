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
    <Card style={styles.collectionCard}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.collectionName}>{collection.name}</Text>
          <StatusBadge
            status={collection.isActive ? 'active' : 'pending'}
            label={collection.isActive ? 'Active' : 'Inactive'}
          />
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditCollection(collection)}
          >
            <Ionicons name="pencil" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleStatus(collection)}
          >
            <Ionicons 
              name={collection.isActive ? "pause" : "play"} 
              size={16} 
              color={collection.isActive ? colors.warning : colors.success} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteCollection(collection)}
          >
            <Ionicons name="trash" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {collection.description && (
        <Text style={styles.description}>{collection.description}</Text>
      )}

      <View style={styles.filtersContainer}>
        <Text style={styles.filtersLabel}>Filters:</Text>
        {collection.filters.map((filter, index) => (
          <View key={index} style={styles.filterChip}>
            <Text style={styles.filterText}>
              {filter.type}: {typeof filter.value === 'object' 
                ? `${(filter.value as any).min || 0} - ${(filter.value as any).max || '∞'}`
                : filter.value
              }
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.productCount}>
          {collection.productCount || 0} products
        </Text>
        <Text style={styles.displayOrder}>
          Order: {collection.displayOrder}
        </Text>
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
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    createButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    collectionCard: {
      marginBottom: spacing.md,
      padding: spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    titleContainer: {
      flex: 1,
      gap: spacing.xs,
    },
    collectionName: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    description: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    filtersContainer: {
      marginBottom: spacing.md,
    },
    filtersLabel: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    filterChip: {
      backgroundColor: colors.primaryLight,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
      alignSelf: 'flex-start',
    },
    filterText: {
      fontSize: fontSizes.xs,
      color: colors.text,
      fontWeight: fontWeights.medium,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    productCount: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    displayOrder: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: fontSizes.lg,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    emptySubtext: {
      fontSize: fontSizes.sm,
      color: colors.textLight,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Collections" showBack />
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateCollection}>
          <Ionicons name="add" size={20} color={colors.textInverse} />
          <Text style={styles.createButtonText}>Create Collection</Text>
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
                <Ionicons name="albums-outline" size={64} color={colors.textLight} />
                <Text style={styles.emptyText}>No collections found</Text>
                <Text style={styles.emptySubtext}>
                  Create your first collection to organize products
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
}