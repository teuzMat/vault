import React from 'react';
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
        name="explorar" 
        options={{ 
          title: 'Explorar', 
          // O "any" desativa a cobrança chata do TypeScript nesta linha
          tabBarIcon: (props: any) => (
            <MaterialCommunityIcons name="compass" size={props.size || 24} color={props.color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="biblioteca" 
        options={{ 
          title: 'Biblioteca', 
          tabBarIcon: (props: any) => (
            <MaterialCommunityIcons name="view-grid" size={props.size || 24} color={props.color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="perfil" 
        options={{ 
          title: 'Perfil', 
          tabBarIcon: (props: any) => (
            <MaterialCommunityIcons name="account" size={props.size || 24} color={props.color} />
          )
        }} 
      />
    </Tabs>
  );
}