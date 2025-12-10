import { Link, Stack, router } from 'expo-router';
import React from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tapIcon = require('../assets/images/tap_icon.png');

const colors = {
  primary: '#5B76EE',
  text: '#1F2937',
  background: '#FFFFFF',
  cardBackground: '#F9FAFB',
  border: '#E5E7EB',
  inactive: '#9CA3AF',
  recordButtonColor: '#BB7CFF',
};

const FIXED_BUTTON_HEIGHT = 56;

export default function Main2Screen() {
  const insets = useSafeAreaInsets();
  const BOTTOM_INSET = insets.bottom || 20;
  const TAB_BAR_HEIGHT = 72;

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.safeContentArea}>
        <View style={styles.contentContainer}>
          
          <View style={styles.centerContent}>
            <View style={styles.figmaCard}>
              <Text style={styles.cardText}>꿈 상징 캐릭터</Text>
            </View>
            <View style={styles.whiteCard}>
              <Text style={styles.dreamTitle}>꿈 제목</Text>
              <Text style={styles.dreamSummary}>꿈 내용 요약</Text>
            </View>
            <View style={styles.newBox}>
              <View style={styles.innerBox}>
                <Text style={styles.innerText}>내용이 자동으로 달라집니다</Text>
              </View>
            </View>
          </View>

        </View>
      </SafeAreaView>
      
      {/* 자세히 보기 버튼 */}
      <View style={[
        styles.buttonContainer, 
        { 
          paddingBottom: BOTTOM_INSET + TAB_BAR_HEIGHT,
        }
      ]}>
        <Link href="/(tabs)" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>자세히 보기</Text>
          </Pressable>
        </Link>
      </View>
      
      {/* 하단 탭바 */}
      <View style={[
        styles.tabBar,
        { 
          paddingBottom: BOTTOM_INSET,
          height: TAB_BAR_HEIGHT + BOTTOM_INSET,
        }
      ]}>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => router.push('/(tabs)')}
        >
          <Image
            source={tapIcon}
            style={[styles.tabIcon, { tintColor: colors.primary }]}
          />
          <Text style={[styles.tabLabel, { color: colors.primary }]}>홈</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <Image
            source={tapIcon}
            style={[styles.tabIcon, { tintColor: colors.inactive }]}
          />
          <Text style={[styles.tabLabel, { color: colors.inactive }]}>캘린더</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <Image
            source={tapIcon}
            style={[styles.tabIcon, { tintColor: colors.inactive }]}
          />
          <Text style={[styles.tabLabel, { color: colors.inactive }]}>분석</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <Image
            source={tapIcon}
            style={[styles.tabIcon, { tintColor: colors.inactive }]}
          />
          <Text style={[styles.tabLabel, { color: colors.inactive }]}>마이</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeContentArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  figmaCard: {
    width: 200,
    height: 200,
    padding: 119,
    paddingHorizontal: 58,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 22,
    alignSelf: 'center',
  },
  whiteCard: {
    width: '100%',  // 🎯 고정 너비 대신 반응형으로 변경
    maxWidth: 380,
    minHeight: 220,  // 🎯 height 대신 minHeight 사용
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.inactive,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,  // 🎯 패딩 감소
    backgroundColor: colors.background,
  },
  backButton: {
    height: FIXED_BUTTON_HEIGHT,
    backgroundColor: colors.recordButtonColor,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.36,
  },
  tabBar: {
    position: 'absolute',  // 🎯 추가: absolute positioning
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.inactive + '20',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,  // 🎯 추가: 세로 패딩
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  dreamTitle: {
    color: '#000',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,  // 🎯 lineHeight 조정
    alignSelf: 'stretch',
  },
  dreamSummary: {
    alignSelf: 'stretch',
    color: '#000',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,  // 🎯 lineHeight 조정
  },
  newBox: {
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
    borderRadius: 16,
    backgroundColor: '#FFF',
    marginTop: 10,
    width: '100%',  // 🎯 추가
    maxWidth: 380,  // 🎯 추가
  },
  innerBox: {
    padding: 16,
    alignItems: 'flex-start',
    gap: 10,
    alignSelf: 'stretch',
  },
  innerText: {
    color: '#000',
    fontSize: 14,
  },
});