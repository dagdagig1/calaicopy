import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Chip, Searchbar, FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/config/supabase';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { ErrorMessage } from '../../src/components/ui/ErrorMessage';

interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  created_at: string;
  image_url?: string;
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFoodEntries();
    }
  }, [user]);

  useEffect(() => {
    filterEntries();
  }, [entries, searchQuery, selectedMealType]);

  const loadFoodEntries = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      setError('Failed to load food history');
      console.error('Error loading food entries:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.food_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedMealType) {
      filtered = filtered.filter(entry => entry.meal_type === selectedMealType);
    }

    setFilteredEntries(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFoodEntries();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'free-breakfast';
      case 'lunch': return 'lunch-dining';
      case 'dinner': return 'dinner-dining';
      case 'snack': return 'cookie';
      default: return 'restaurant';
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '#FF9800';
      case 'lunch': return '#4CAF50';
      case 'dinner': return '#2196F3';
      case 'snack': return '#9C27B0';
      default: return '#666';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your food history..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadFoodEntries}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Search food entries..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.chipContainer}
          contentContainerStyle={styles.chipContent}
        >
          <Chip
            selected={selectedMealType === null}
            onPress={() => setSelectedMealType(null)}
            style={styles.chip}
          >
            All
          </Chip>
          <Chip
            selected={selectedMealType === 'breakfast'}
            onPress={() => setSelectedMealType('breakfast')}
            style={styles.chip}
          >
            Breakfast
          </Chip>
          <Chip
            selected={selectedMealType === 'lunch'}
            onPress={() => setSelectedMealType('lunch')}
            style={styles.chip}
          >
            Lunch
          </Chip>
          <Chip
            selected={selectedMealType === 'dinner'}
            onPress={() => setSelectedMealType('dinner')}
            style={styles.chip}
          >
            Dinner
          </Chip>
          <Chip
            selected={selectedMealType === 'snack'}
            onPress={() => setSelectedMealType('snack')}
            style={styles.chip}
          >
            Snacks
          </Chip>
        </ScrollView>
      </View>

      {/* Food Entries List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredEntries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="restaurant" size={64} color="#ccc" />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              {searchQuery || selectedMealType ? 'No matching entries' : 'No food entries yet'}
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {searchQuery || selectedMealType 
                ? 'Try adjusting your search or filters'
                : 'Start by scanning your first meal!'
              }
            </Text>
          </View>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id} style={styles.entryCard}>
              <Card.Content>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitle}>
                    <MaterialIcons 
                      name={getMealTypeIcon(entry.meal_type)} 
                      size={20} 
                      color={getMealTypeColor(entry.meal_type)} 
                    />
                    <Text variant="titleMedium" style={styles.foodName}>
                      {entry.food_name}
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={styles.timestamp}>
                    {formatDate(entry.created_at)}
                  </Text>
                </View>

                <View style={styles.nutritionInfo}>
                  <View style={styles.nutritionItem}>
                    <Text variant="titleSmall" style={styles.nutritionValue}>
                      {entry.calories}
                    </Text>
                    <Text variant="bodySmall" style={styles.nutritionLabel}>
                      kcal
                    </Text>
                  </View>
                  
                  <View style={styles.nutritionItem}>
                    <Text variant="titleSmall" style={styles.nutritionValue}>
                      {entry.protein.toFixed(0)}g
                    </Text>
                    <Text variant="bodySmall" style={styles.nutritionLabel}>
                      protein
                    </Text>
                  </View>
                  
                  <View style={styles.nutritionItem}>
                    <Text variant="titleSmall" style={styles.nutritionValue}>
                      {entry.carbs.toFixed(0)}g
                    </Text>
                    <Text variant="bodySmall" style={styles.nutritionLabel}>
                      carbs
                    </Text>
                  </View>
                  
                  <View style={styles.nutritionItem}>
                    <Text variant="titleSmall" style={styles.nutritionValue}>
                      {entry.fat.toFixed(0)}g
                    </Text>
                    <Text variant="bodySmall" style={styles.nutritionLabel}>
                      fat
                    </Text>
                  </View>
                </View>

                <Text variant="bodySmall" style={styles.servingSize}>
                  Serving: {entry.serving_size}
                </Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="camera"
        style={styles.fab}
        onPress={() => {/* Navigate to camera */}}
        label="Scan"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 8,
    elevation: 2,
  },
  searchbar: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  chipContainer: {
    paddingHorizontal: 16,
  },
  chipContent: {
    paddingRight: 16,
  },
  chip: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  entryCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  foodName: {
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
  timestamp: {
    color: '#666',
  },
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontWeight: '600',
    color: '#333',
  },
  nutritionLabel: {
    color: '#666',
    marginTop: 2,
  },
  servingSize: {
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});