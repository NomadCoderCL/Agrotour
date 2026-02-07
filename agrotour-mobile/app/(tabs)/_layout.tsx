import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { colors } = useDarkMode();
  const { user } = useAuth();

  // Determinar qué tabs mostrar según el rol del usuario
  const isProducer = user?.rol === 'productor';
  const isAdmin = user?.rol === 'admin';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
        },
      }}>
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerTitle: 'Agrotour',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* Productos Tab */}
      <Tabs.Screen
        name="productos"
        options={{
          title: 'Productos',
          headerTitle: 'Explorar Productos',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'leaf' : 'leaf-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* Mapa Tab */}
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          headerTitle: 'Ubicación de Productores',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'map' : 'map-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* Carrito Tab - Solo para clientes */}
      {!isProducer && !isAdmin && (
        <Tabs.Screen
          name="carrito"
          options={{
            title: 'Carrito',
            headerTitle: 'Mi Carrito',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'cart' : 'cart-outline'}
                color={color}
                size={24}
              />
            ),
          }}
        />
      )}

      {/* Panel Tab - Solo para productores y admin */}
      {(isProducer || isAdmin) && (
        <Tabs.Screen
          name="panel"
          options={{
            title: 'Panel',
            headerTitle: isAdmin ? 'Panel de Admin' : 'Mi Panel',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'settings' : 'settings-outline'}
                color={color}
                size={24}
              />
            ),
          }}
        />
      )}

      {/* Perfil Tab */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
