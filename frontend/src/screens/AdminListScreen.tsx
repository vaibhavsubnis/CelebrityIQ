import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { celebrityApi } from '../services/api';
import { AdminStackParamList, Celebrity } from '../types';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AdminList'>;

export default function AdminListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCelebrities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await celebrityApi.getAll();
      setCelebrities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load celebrities');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCelebrities();
    }, [loadCelebrities])
  );

  const confirmDelete = (celebrity: Celebrity) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Delete "${celebrity.name}"? This action cannot be undone.`
      );
      if (confirmed) handleDelete(celebrity.id);
    } else {
      Alert.alert(
        'Delete Celebrity',
        `Are you sure you want to delete "${celebrity.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => handleDelete(celebrity.id),
          },
        ]
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await celebrityApi.delete(id);
      setCelebrities((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: Celebrity }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.detail}>
          {item.nationality} | {item.fieldOfExpertise}
        </Text>
        <Text style={styles.detail}>Born: {formatDate(item.dateOfBirth)}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('AdminEdit', { celebrity: item })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCelebrities}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={celebrities}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No celebrities yet.</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first celebrity.
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdminEdit', {})}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#e74c3c',
    fontWeight: '600',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
