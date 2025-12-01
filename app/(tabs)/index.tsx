import { Link, Stack } from 'expo-router';
import React from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';


// 공통 색상 정의
const colors = {
  primary: '#5B76EE',
  text: '#1F2937',
  background: '#FFFFFF',
  cardBackground: '#F9FAFB',
  border: '#E5E7EB',
  inactive: '#9CA3AF',
  recordButtonColor: '#BB7CFF', // 요청하신 컬러
};

// 탭바 높이를 0으로 설정하여 버튼 위치 계산에서 제외 (탭바는 스스로 위치 확보)
const TAB_BAR_HEIGHT = 0; 
// 하단 고정 버튼 높이
const FIXED_BUTTON_HEIGHT = 60;
// 하단 버튼과 탭바 간격: 0px으로 유지 (최소 마진)
const BUTTON_BOTTOM_MARGIN = 0; 

// iOS 하단 홈 표시기 영역 보정 값 (대략 34px)
const IOS_SAFE_AREA_INSET = Platform.OS === 'ios' ? 34 : 0;

// 콘텐츠 영역이 탭바와 버튼을 덮지 않도록 강제하는 하단 패딩
// 72 (탭바) + 60 (버튼) + 16 (버튼 마진) + 20 (추가 여백) = 168 (버튼이 가려지지 않도록 유지)
const REQUIRED_BOTTOM_PADDING = 72 + FIXED_BUTTON_HEIGHT + 16 + 20;

// 가짜 데이터
const dreamLogs = [
  { id: '1', title: '날아다니는 고양이', content: '높은 하늘을 자유롭게 날아다니는 꿈을 꾸었습니다.', date: '2024-10-12' },
  { id: '2', title: '미지의 숲 탐험', content: '길을 잃었지만 아름다운 숲에서 신비로운 동물을 만났습니다.', date: '2024-10-11' },
  { id: '3', title: '바다 속 도서관', content: '푸른 바닷속에서 수많은 책이 가득한 도서관을 발견했습니다.', date: '2024-10-10' },
];

type Dream = {
  id: string;
  title: string;
  content: string;
  date: string;
};

interface DreamItemProps {
  dream: Dream;
}

const DreamItem: React.FC<DreamItemProps> = ({ dream }) => (
  <View style={styles.dreamItem}>
    <View style={styles.dreamIconPlaceholder} /> 
    <View style={styles.dreamTextContent}>
      <Text style={styles.dreamTitle}>{dream.title}</Text>
      <Text style={styles.dreamContent}>{dream.content.substring(0, 30)}...</Text>
    </View>
  </View>
);

export default function HomeScreen() {
  
  // 꿈 목록을 3개로 축소
  const displayDreamLogs = dreamLogs.slice(0, 3); 

  return (
    // 최상단 컨테이너를 View로 변경하고 flex: 1 적용 (버튼의 절대 위치 기준)
    <View style={styles.mainContainer}> 
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* 콘텐츠 영역만 SafeAreaView로 감싸서 상단 상태 표시줄 처리 */}
      <SafeAreaView style={styles.safeContentArea}> 
        
        {/* ScrollView 제거 후 View로 복원 및 하단 패딩 적용 */}
        <View style={styles.contentContainer}>
          
          {/* --- 0. 헤더 타이틀 --- */}
          <Text style={styles.headerTitle}>오늘의 꿈은?</Text>

          {/* --- 1. 꿈 상징 캐릭터 박스 --- */}
          <View style={styles.characterSection}>
            <View style={styles.characterBox}>
              <Text style={styles.characterPlaceholder}>꿈 상징 캐릭터</Text>
              <Text style={styles.characterPlaceholderSub}>?</Text>
            </View>
          </View>
          
          {/* --- 2. 최근 나의 꿈 목록 (3개 표시) --- */}
          <View style={styles.listContainer}>
            {displayDreamLogs.map((item) => (
              <DreamItem key={item.id} dream={item} />
            ))}
          </View>
          {/* 하단 패딩은 contentContainer에 적용되어 있음 */}

        </View>
      </SafeAreaView>
      
      {/* --- 3. 꿈 기록하기 버튼 (Fixed Bottom Button) --- */}
      {/* View 대신 Pressable을 사용하여 터치 상호작용을 보장 */}
      <Link href={'/record/step1' as any} asChild> 
        <Pressable style={styles.recordButton}>
          <Text style={styles.recordButtonText}>꿈 기록하기</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  // 최상단 컨테이너를 View로 변경하고 flex: 1 적용 (버튼의 절대 위치 기준)
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // 새로 추가된 Safe Area Wrapper: flex: 1로 남은 공간 차지
  safeContentArea: {
    flex: 1,
    // 이 SafeAreaView가 상단 상태 표시줄의 패딩을 처리합니다.
  },

  // ScrollView 제거 후 View로 복원
  contentContainer: {
    flex: 1, // 남은 공간 모두 차지
    paddingHorizontal: 20,
    paddingTop: 0, // SafeAreaView가 처리하므로 0
    // 탭바와 버튼을 확실히 피하는 하단 패딩 적용
    paddingBottom: REQUIRED_BOTTOM_PADDING, 
  },
  
  // --- NEW HEADER TITLE STYLE ---
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    // ★★★ 60으로 변경 (상단 콘텐츠 하향) ★★★
    marginBottom: 60, 
    marginLeft: -4, 
  },
  
  // --- 캐릭터 섹션 스타일 ---
  characterSection: {
    // ★★★ 100으로 변경 (상단 콘텐츠 하향) ★★★
    marginBottom: 100, 
    alignItems: 'center',
  },
  characterBox: {
    width: 220,
    height: 220,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterPlaceholder: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.inactive,
  },
  characterPlaceholderSub: {
    fontSize: 14,
    color: colors.inactive,
    marginTop: 4,
  },

  // --- 목록 섹션 스타일 ---
  listContainer: {
    // 380px 너비를 적용하고 가운데 정렬
    width: '100%', // 380px에 가깝게 최대 너비 사용
    alignSelf: 'center',
  },
  dreamItem: {
    backgroundColor: colors.background,
    padding: 16, 
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // 요청된 gap: 16px 적용
    borderBottomWidth: 1,
    borderColor: colors.border,
    height: 70,
  },
  dreamIconPlaceholder: {
    width: 40, 
    height: 40,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    marginRight: 15,
  },
  dreamTextContent: {
    flex: 1,
  },
  dreamTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  dreamContent: {
    fontSize: 13,
    color: colors.inactive,
  },
  
  // --- 고정 하단 기록 버튼 스타일 ---
  recordButton: {
    backgroundColor: colors.recordButtonColor,
    // width: 372px를 left: 18, right: 18로 구현
    height: FIXED_BUTTON_HEIGHT, // 60px
    borderRadius: 8, // 8px
    alignItems: 'center',
    justifyContent: 'center',
    // ★★★ 버튼 위치: 34px - 20px = 14px (최종 확인된 위치) ★★★
    position: 'absolute',
    bottom: IOS_SAFE_AREA_INSET - 20, 
    left: 18, 
    right: 18, 
    zIndex: 10, 
    // 그림자
    ...Platform.select({
      ios: {
        shadowColor: '#BB7CFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  recordButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '700',
  },
});


