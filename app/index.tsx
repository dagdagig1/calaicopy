import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { LoadingSpinner } from '../src/components/ui/LoadingSpinner';

export default function WelcomeScreen() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      // User is authenticated, redirect to main app
      router.replace('/(tabs)');
    }
  }, [session, loading]);

  if (loading) {
    return <LoadingSpinner message="Loading CalAI..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="displayMedium" style={styles.title}>
          CalAI
        </Text>
        <Text variant="headlineSmall" style={styles.subtitle}>
          AI-Powered Nutrition Tracking
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          Take photos of your meals and let AI analyze the nutrition content. 
          Track calories, macros, and achieve your health goals effortlessly.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={() => router.push('/auth/login')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Sign In
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => router.push('/auth/register')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Create Account
          </Button>
        </View>
      </View>
      
      <View style={styles.features}>
        <View style={styles.feature}>
          <Text variant="titleMedium">📸 Photo Recognition</Text>
          <Text variant="bodySmall">Snap a photo and get instant nutrition analysis</Text>
        </View>
        
        <View style={styles.feature}>
          <Text variant="titleMedium">📊 Smart Tracking</Text>
          <Text variant="bodySmall">Monitor calories, macros, and progress over time</Text>
        </View>
        
        <View style={styles.feature}>
          <Text variant="titleMedium">🎯 Personal Goals</Text>
          <Text variant="bodySmall">Set and achieve your unique health objectives</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
    color: '#555',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  features: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    gap: 24,
  },
  feature: {
    alignItems: 'center',
  },
});