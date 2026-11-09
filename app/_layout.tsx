import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
      
      {/* Força a barra de status do celular a ficar clara, já que o nosso fundo será escuro */}
      <StatusBar style="light" /> 
    </SafeAreaProvider>
  );
}