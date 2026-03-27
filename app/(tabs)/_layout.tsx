import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import Colors from '@/constants/Colors';
import { useSettings } from '@/context/SettingsContext';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { resolvedTheme } = useSettings();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[resolvedTheme ?? 'light'].tint,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          backgroundColor: Colors[resolvedTheme ?? 'light'].card,
        },
        headerShown: useClientOnlyValue(false, true),
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 17,
          color: Colors[resolvedTheme ?? 'light'].text,
        },
        headerStyle: {
          backgroundColor: Colors[resolvedTheme ?? 'light'].background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors[resolvedTheme ?? 'light'].border,
        }
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerTitle: 'Suraksha+',
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color }) => <TabBarIcon name="plus-square" color={color} />,
          headerTitle: 'Verifiable Report',
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <TabBarIcon name="map-o" color={color} />,
          headerTitle: 'Awareness Ledger',
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <TabBarIcon name="bell-o" color={color} />,
          headerTitle: 'Security & Updates',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user-o" color={color} />,
          headerTitle: 'Citizen Identity',
        }}
      />
    </Tabs>
  );
}
