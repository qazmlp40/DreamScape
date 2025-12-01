import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform } from 'react-native';

const tapIcon = require('../../assets/images/tap_icon.png');

const colors = {
  primary: '#BB7CFF', // 메인 색상
  inactive: '#D6D6D6', // 비활성 아이콘 색상
  background: '#FFFFFF', // 배경색
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary, 
        tabBarInactiveTintColor: colors.inactive, 
        headerShown: false, 
        tabBarStyle: {
          height: 72, 
          paddingBottom: Platform.OS === 'ios' ? 0 : 10, 
          paddingTop: 8,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.inactive + '20', 
        },
        tabBarLabelStyle: {
          fontSize: 14,
          textAlign: 'center',
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => (
            <Image
              source={tapIcon}
              style={{ 
                width: 24, 
                height: 24,
                tintColor: focused ? colors.primary : colors.inactive
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ focused }) => (
            <Image
              source={tapIcon}
              style={{ 
                width: 24, 
                height: 24,
                tintColor: focused ? colors.primary : colors.inactive
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chart"
        options={{
          title: '분석',
          tabBarIcon: ({ focused }) => (
            <Image
              source={tapIcon}
              style={{ 
                width: 24, 
                height: 24,
                tintColor: focused ? colors.primary : colors.inactive
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '마이',
          tabBarIcon: ({ focused }) => (
            <Image
              source={tapIcon}
              style={{ 
                width: 24, 
                height: 24,
                tintColor: focused ? colors.primary : colors.inactive
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}


