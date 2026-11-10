// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function InitialLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Verifica se a rota atual está dentro da navegação privada (tabs)
    const inAuthGroup = segments[0] === '(tabs)';

    if (!user && inAuthGroup) {
      // Se não houver usuário logado e tentar acessar área privada, envia para o Login
      router.replace('/');
    } else if (user && !inAuthGroup) {
      // Se já estiver logado e tentar ver Login/Cadastro, envia para as Tabs
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  // Exibe a tela de splash/loading no tema Dark Mode durante o check inicial do Firebase
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F19' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <InitialLayout />
        {/* Força a barra de status a ficar com texto/ícones claros para o Dark Mode */}
        <StatusBar style="light" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}