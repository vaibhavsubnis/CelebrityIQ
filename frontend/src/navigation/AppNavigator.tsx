import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import GameScreen from '../screens/GameScreen';
import AdminListScreen from '../screens/AdminListScreen';
import AdminEditScreen from '../screens/AdminEditScreen';
import { RootTabParamList, AdminStackParamList } from '../types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();

function AdminNavigator() {
  return (
    <AdminStack.Navigator>
      <AdminStack.Screen
        name="AdminList"
        component={AdminListScreen}
        options={{ title: 'Manage Celebrities' }}
      />
      <AdminStack.Screen
        name="AdminEdit"
        component={AdminEditScreen}
        options={({ route }) => ({
          title: route.params?.celebrity ? 'Edit Celebrity' : 'Add Celebrity',
        })}
      />
    </AdminStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6c5ce7',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Game"
        component={GameScreen}
        options={{
          title: 'Play',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>?</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Admin"
        component={AdminNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>*</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
