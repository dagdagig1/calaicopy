import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { theme } from '@/theme/theme';

export default function RootLayout() {
  const isReady = useFrameworkReady();

  if (!isReady) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" options={{ presentation: 'modal' }} />
          <Stack.Screen name="auth/register" options={{ presentation: 'modal' }} />
          <Stack.Screen name="profile/setup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </PaperProvider>
  );
}