import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/contexts/AuthContext';
import { theme } from '../src/theme/theme';

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: theme.colors.onPrimary,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              title: 'CalAI',
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="auth/login" 
            options={{ 
              title: 'Sign In',
              presentation: 'modal'
            }} 
          />
          <Stack.Screen 
            name="auth/register" 
            options={{ 
              title: 'Create Account',
              presentation: 'modal'
            }} 
          />
          <Stack.Screen 
            name="profile/setup" 
            options={{ 
              title: 'Complete Profile',
              headerBackVisible: false
            }} 
          />
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false 
            }} 
          />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  );
}