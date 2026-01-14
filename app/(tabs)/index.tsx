import Pigicon from '@/assets/images/icons/dream_symbol/pig.svg';
import NoteIcon from '@/assets/images/icons/note.svg';
import { Link, Stack } from 'expo-router';
import React from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ✅ DreamRecordContext 가져오기 (경로는 프로젝트에 맞게)
import { useDreamRecord } from '../../contexts/DreamRecordContext';

// ================= 공통 상수/스타일 =================

const tapIcon = require('../../assets/images/tap_icon.png');

const colors = {
  primary: '#5B76EE',
  text: '#1F2937',
  background: '#FFFFFF',
  cardBackground: '#F9FAFB',
  border: '#E5E7EB',
  inactive: '#9CA3AF',
  recordButtonColor: '#BB7CFF',
};

const FIXED_BUTTON_HEIGHT = 60;
const IOS_SAFE_AREA_INSET = Platform.OS === 'ios' ? 34 : 0;
const REQUIRED_BOTTOM_PADDING = 72 + FIXED_BUTTON_HEIGHT + 16 + 20;

// =============== 1. 최상위: 조건부로 어떤 화면을 보여줄지 결정 ===============

export default function TabsIndex() {
  const { hasTodayRecord, savedRecords, getTodayRecord } = useDreamRecord();
  const hasTodayDream = hasTodayRecord();
  const todayRecord = getTodayRecord();
  
  console.log('🔍 디버깅:', {
    hasTodayDream,
    savedRecordsCount: savedRecords.length,
    todayRecord,
    allRecords: savedRecords
  });

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      {hasTodayDream ? <TodayDreamScreen /> : <HomeScreen />}
    </View>
  );
}

// =============== 2. 오늘 꿈 없을 때: HomeScreen ===============

function HomeScreen() {
  return (
    <View style={homeStyles.mainContainer}>
      <SafeAreaView style={homeStyles.safeContentArea}>
        <View style={homeStyles.contentContainer}>
          {/* --- 1. 꿈 상징 캐릭터 박스 --- */}
          <View style={homeStyles.characterSection}>
              <NoteIcon />
            <View style={{marginTop: 31}}>
              <Text style={homeStyles.character_text}>오늘의 꿈을 기록해보세요</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* 꿈 기록하기 버튼 -> step1으로 이동 */}
      <Link href="/record/step1" asChild>
        <Pressable style={homeStyles.recordButton}>
          <Text style={homeStyles.recordButtonText}>꿈 기록하기</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const homeStyles = StyleSheet.create({
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
    paddingTop: 0,
    paddingBottom: REQUIRED_BOTTOM_PADDING,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 60,
    marginLeft: -4,
  },
  characterSection: {
    marginTop: 124,
    marginBottom: 100,
    alignItems: 'center',
  },
  character_text: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: 500
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
  recordButton: {
    backgroundColor: colors.recordButtonColor,
    height: FIXED_BUTTON_HEIGHT,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: IOS_SAFE_AREA_INSET - 20,
    left: 18,
    right: 18,
    zIndex: 10,
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

// =============== 3. 오늘 꿈 있을 때: TodayDreamScreen ===============

function TodayDreamScreen() {
  const { getTodayRecord } = useDreamRecord();
  const todayRecord = getTodayRecord();
  const insets = useSafeAreaInsets();
  const BOTTOM_INSET = insets.bottom || 20;

  // 데모용 하드코딩 값
  const DEMO_TITLE = '돈을 뿌리다 쓰러진 돼지';
  const DEMO_SUMMARY =
    '꿈에서 돼지가 하늘을 날며 돈을 뿌렸고, 돈에는 숫자가 적혀 있었습니다. 이후 돼지가 갑자기 쓰러졌고 꿈이 끝났습니다. 꿈을 꾼 후 기분이 이상했습니다.';
  const DEMO_INTERPRETATION =
    '예상치 못한 기회와 불안정한 성공을 의미한다.';

  return (
    <View style={todayStyles.mainContainer}>
      <SafeAreaView style={todayStyles.safeContentArea}>
        <ScrollView 
          style={todayStyles.scrollView}
          contentContainerStyle={todayStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={todayStyles.figmaCard}>
            <Pigicon width={200} height={200}/>
          </View>
          <View style={todayStyles.whiteCard}>

            {/* 원래 작성되어있던 코드 */}
            {/* <Text style={todayStyles.dreamTitle}>{todayRecord?.title || DEMO_TITLE}</Text>
            <Text style={todayStyles.dreamSummary}>{todayRecord?.analysis?.summary || todayRecord?.dreamText || DEMO_SUMMARY}</Text> */}
            
            {/* 데모용 - 강제로 렌더링 시키기 코드 */}
            <Text style={todayStyles.dreamTitle}>
              {todayRecord?.title?.trim() ? todayRecord.title : DEMO_TITLE}
            </Text>
            <Text style={todayStyles.dreamSummary}>
              {todayRecord?.analysis?.summary ?? DEMO_SUMMARY}
            </Text>

          </View>
          <View style={todayStyles.newBox}>
            <View style={todayStyles.innerBox}>
              <Text style={todayStyles.innerText}>{todayRecord?.analysis?.interpretation || ''}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* 자세히 보기 버튼 */}
      <Link
        href={{
          pathname: '/record/step5',
          params: {
            id: todayRecord?.id ?? '',
            date: todayRecord?.date ?? '',
          },
        }}
        asChild
      >
        <Pressable style={todayStyles.detailButton}>
          <Text style={todayStyles.detailButtonText}>자세히 보기</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const todayStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeContentArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: FIXED_BUTTON_HEIGHT + 40,
    alignItems: 'center',
  },
  figmaCard: {
    width: 200,
    height: 200,
    // padding: 119,
    paddingHorizontal: 58,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // gap: 10,
    // backgroundColor: colors.cardBackground,
    borderRadius: 12,
    // borderWidth: 1,
    // borderColor: colors.border,
    marginBottom: 4,
    alignSelf: 'center',
     marginTop: 72,
  },
  whiteCard: {
    width: '100%',
    maxWidth: 380,
    minHeight: 220,
    padding: 16,
    paddingTop: 24, // ✅ 상단 여백 추가 (원하는 만큼 조정)
    justifyContent: 'flex-start', // ✅ center → flex-start로 변경
    alignItems: 'center',
    gap: 24,
    alignSelf: 'stretch',
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 32,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.inactive,
  },
  detailButton: {
    backgroundColor: colors.recordButtonColor,
    height: FIXED_BUTTON_HEIGHT,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: IOS_SAFE_AREA_INSET - 20,
    left: 18,
    right: 18,
    zIndex: 10,
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
  detailButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '700',
  },
  dreamTitle: {
    color: '#000',
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 36,
    alignSelf: 'stretch',
  },
  dreamSummary: {
    alignSelf: 'stretch',
    color: '#000',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
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
    marginBottom: 32,
    width: '100%',
    maxWidth: 380,
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