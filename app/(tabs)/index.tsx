import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, ProgressBar, Button, FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/config/supabase';

const { width } = Dimensions.get('window');

interface DailyStats {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  target_calories: number;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DailyStats>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    target_calories: 2000,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDailyStats();
    }
  }, [user]);

  const loadDailyStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's food entries
      const { data: entries, error: entriesError } = await supabase
        .from('food_entries')
        .select('calories, protein, carbs, fat')
        .eq('user_id', user?.id)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      if (entriesError) throw entriesError;

      // Get user profile for target calories
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('daily_calorie_target')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Calculate totals
      const totals = entries?.reduce(
        (acc, entry) => ({
          calories: acc.calories + entry.calories,
          protein: acc.protein + entry.protein,
          carbs: acc.carbs + entry.carbs,
          fat: acc.fat + entry.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ) || { calories: 0, protein: 0, carbs: 0, fat: 0 };

      setStats({
        ...totals,
        target_calories: profile?.daily_calorie_target || 2000,
      });
    } catch (error) {
      console.error('Error loading daily stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calorieProgress = stats.target_calories > 0 ? stats.calories / stats.target_calories : 0;
  const remainingCalories = Math.max(0, stats.target_calories - stats.calories);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.welcomeText}>
              Good {getTimeOfDay()}, {user?.email?.split('@')[0]}! 👋
            </Text>
            <Text variant="bodyMedium" style={styles.welcomeSubtext}>
              Let's track your nutrition today
            </Text>
          </Card.Content>
        </Card>

        {/* Calorie Progress */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.calorieHeader}>
              <MaterialIcons name="local-fire-department" size={24} color="#FF5722" />
              <Text variant="titleLarge" style={styles.cardTitle}>
                Daily Calories
              </Text>
            </View>
            
            <View style={styles.calorieStats}>
              <Text variant="displaySmall" style={styles.calorieNumber}>
                {stats.calories}
              </Text>
              <Text variant="bodyMedium" style={styles.calorieTarget}>
                / {stats.target_calories} kcal
              </Text>
            </View>
            
            <ProgressBar 
              progress={Math.min(calorieProgress, 1)} 
              style={styles.progressBar}
              color={calorieProgress > 1 ? '#FF5722' : '#4CAF50'}
            />
            
            <Text variant="bodySmall" style={styles.remainingText}>
              {remainingCalories > 0 
                ? `${remainingCalories} calories remaining`
                : `${stats.calories - stats.target_calories} calories over target`
              }
            </Text>
          </Card.Content>
        </Card>

        {/* Macros Breakdown */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Macronutrients
            </Text>
            
            <View style={styles.macrosContainer}>
              <View style={styles.macroItem}>
                <View style={[styles.macroIcon, { backgroundColor: '#2196F3' }]}>
                  <MaterialIcons name="grain" size={20} color="white" />
                </View>
                <Text variant="bodySmall" style={styles.macroLabel}>Protein</Text>
                <Text variant="titleMedium" style={styles.macroValue}>
                  {stats.protein.toFixed(0)}g
                </Text>
              </View>
              
              <View style={styles.macroItem}>
                <View style={[styles.macroIcon, { backgroundColor: '#FF9800' }]}>
                  <MaterialIcons name="bakery-dining" size={20} color="white" />
                </View>
                <Text variant="bodySmall" style={styles.macroLabel}>Carbs</Text>
                <Text variant="titleMedium" style={styles.macroValue}>
                  {stats.carbs.toFixed(0)}g
                </Text>
              </View>
              
              <View style={styles.macroItem}>
                <View style={[styles.macroIcon, { backgroundColor: '#9C27B0' }]}>
                  <MaterialIcons name="opacity" size={20} color="white" />
                </View>
                <Text variant="bodySmall" style={styles.macroLabel}>Fat</Text>
                <Text variant="titleMedium" style={styles.macroValue}>
                  {stats.fat.toFixed(0)}g
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Quick Actions
            </Text>
            
            <View style={styles.actionsContainer}>
              <Button
                mode="contained"
                onPress={() => router.push('/(tabs)/camera')}
                style={styles.actionButton}
                icon="camera"
              >
                Scan Food
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => router.push('/(tabs)/history')}
                style={styles.actionButton}
                icon="history"
              >
                View History
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="camera"
        style={styles.fab}
        onPress={() => router.push('/(tabs)/camera')}
        label="Scan"
      />
    </View>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  welcomeText: {
    fontWeight: '600',
    marginBottom: 4,
  },
  welcomeSubtext: {
    color: '#666',
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  calorieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  calorieNumber: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  calorieTarget: {
    marginLeft: 8,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  remainingText: {
    color: '#666',
    textAlign: 'center',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroLabel: {
    color: '#666',
    marginBottom: 4,
  },
  macroValue: {
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});