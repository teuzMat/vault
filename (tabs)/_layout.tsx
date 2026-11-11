import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: { backgroundColor: '#0B0F19', borderTopColor: '#202638' },
      tabBarActiveTintColor: '#7C3AED',
      tabBarInactiveTintColor: '#6B7280'
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Explorar', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="compass" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="biblioteca" 
        options={{ title: 'Biblioteca', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-grid" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="perfil" 
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={24} color={color} /> }} 
      />
    </Tabs>
  );
}