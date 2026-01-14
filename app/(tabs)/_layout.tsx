import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import BarChartDisabled from '@/assets/images/icons/footer/bar_chart_disabled.svg';
import BarChartTrue from '@/assets/images/icons/footer/bar_chart_true.svg';

import CalendarDisabled from '@/assets/images/icons/footer/calendar_disabled.svg';
import CalendarTrue from '@/assets/images/icons/footer/calendar_true.svg';

import UserDisabled from '@/assets/images/icons/footer/user_disabled.svg';
import UserTrue from '@/assets/images/icons/footer/user_true.svg';

import HomeDisabled from '@/assets/images/icons/footer/home_disabled.svg';
import HomeTrue from '@/assets/images/icons/footer/home_true.svg';

const tapIcon = require('../../assets/images/tap_icon.png');

const colors = {
  primary: '#BB7CFF', // 메인 색상
  inactive: '#D6D6D6', // 비활성 아이콘 색상
  background: '#FFFFFF', // 배경색
};

export default function TabLayout() {
  console.log("✅ metro.config.js loaded");


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
          tabBarIcon: ({ focused }) =>
            focused ? (
              <HomeTrue width={24} height={24} />
            ) : (
              <HomeDisabled width={24} height={24} />
            ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <CalendarTrue width={24} height={24} />
            ) : (
              <CalendarDisabled width={24} height={24} />
            ),
        }}
      />

      <Tabs.Screen
        name="chart"
        options={{
          title: '차트',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <BarChartTrue width={24} height={24} />
            ) : (
              <BarChartDisabled width={24} height={24} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <UserTrue width={24} height={24} />
            ) : (
              <UserDisabled width={24} height={24} />
            ),
        }}
      />
    </Tabs>
  );
}


