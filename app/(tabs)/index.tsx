import Pigicon from '@/assets/images/icons/dream_symbol/pig.svg';
import NoteIcon from '@/assets/images/icons/note.svg';
import { useFocusEffect } from '@react-navigation/native';
import { Link, Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { dreamApi } from '../../services/dreamApi';

const colors = {
  text: '#1F2937',
  background: '#FFFFFF',
  border: '#E5E7EB',
  inactive: '#9CA3AF',
  recordButtonColor: '#BB7CFF',
};

const FIXED_BUTTON_HEIGHT = 60;
const IOS_SAFE_AREA_INSET = Platform.OS === 'ios' ? 34 : 0;
const REQUIRED_BOTTOM_PADDING = 72 + FIXED_BUTTON_HEIGHT + 16 + 20;

type HomeDream = {
  id: string;
  dreamId?: number;
  date: string;
  title: string;
  dreamText: string;
  summary: string;
  interpretation: string;
};

const formatDateToString = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const extractDate = (dream: any) => {
  const rawDate =
    dream?.date ??
    dream?.dreamDate ??
    dream?.createdAt ??
    dream?.updatedAt ??
    '';

  return typeof rawDate === 'string' ? rawDate.slice(0, 10) : '';
};

const normalizeDream = (dream: any): HomeDream | null => {
  const dreamId = Number(
    dream?.dreamId ?? dream?.id ?? dream?.dream_id ?? dream?.dreamID,
  );
  const date = extractDate(dream);

  if (!date) {
    return null;
  }

  return {
    id: String(dreamId || dream?.id || `${date}-${Math.random()}`),
    dreamId: Number.isFinite(dreamId) ? dreamId : undefined,
    date,
    title: String(dream?.title ?? dream?.dreamTitle ?? '').trim(),
    dreamText: String(dream?.rawText ?? dream?.content ?? '').trim(),
    summary: String(
      dream?.aiSummary ?? dream?.summary ?? dream?.rawText ?? dream?.content ?? '',
    ).trim(),
    interpretation: String(
      dream?.aiInterpretation ?? dream?.interpretation ?? dream?.analysisText ?? '',
    ).trim(),
  };
};

export default function TabsIndex() {
  const [dreams, setDreams] = useState<HomeDream[]>([]);
  const todayString = formatDateToString(new Date());

  const loadDreams = useCallback(async () => {
    try {
      console.log('[Home] 꿈 목록 조회 시작');
      const response = await dreamApi.getDreams();
      console.log('[Home] 서버 응답:', response);
      const nextDreams = Array.isArray(response)
        ? response.map(normalizeDream).filter(Boolean)
        : [];
      console.log('[Home] 정규화된 꿈 목록:', nextDreams);

      setDreams(nextDreams as HomeDream[]);
    } catch (error) {
      console.error('홈 꿈 목록 조회 실패:', error);
      setDreams([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDreams();
    }, [loadDreams]),
  );

  const todayRecords = dreams.filter((dream) => dream.date === todayString);
  const hasTodayDream = todayRecords.length > 0;
  const todayRecord = todayRecords[todayRecords.length - 1];

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeContentArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <NoteIcon />
            <Text style={styles.heroText}>오늘의 꿈을 기록해보세요</Text>
            {hasTodayDream ? (
              <Text style={styles.heroSubText}>기록된 꿈이 아래 카드에 추가돼요</Text>
            ) : null}
          </View>

          {hasTodayDream && todayRecord ? (
            <View style={styles.summarySection}>
              <View style={styles.countChip}>
                <Text style={styles.countChipText}>오늘 기록 {todayRecords.length}개</Text>
              </View>
              {todayRecords
                .slice()
                .reverse()
                .map((dream) => (
                  <Link
                    key={dream.id}
                    href={{
                      pathname: '/record/step5',
                      params: {
                        mode: 'review',
                        ...(dream.dreamId ? { id: String(dream.dreamId) } : {}),
                        ...(dream.dreamId ? { dreamId: String(dream.dreamId) } : {}),
                        date: dream.date,
                        title: dream.title,
                        dreamText: dream.dreamText,
                        summary: dream.summary,
                        interpretation: dream.interpretation,
                      },
                    }}
                    asChild
                  >
                    <Pressable style={styles.dreamCard}>
                      <View style={styles.dreamCardHeader}>
                        <View style={styles.symbolBadge}>
                          <Pigicon width={44} height={44} />
                        </View>
                        <Text style={styles.dreamTitle} numberOfLines={1}>
                          {dream.title?.trim() || '제목 없는 꿈'}
                        </Text>
                      </View>
                      <Text style={styles.dreamSummary} numberOfLines={2}>
                        {dream.interpretation ||
                          dream.summary ||
                          dream.dreamText ||
                          '아직 해몽이 없습니다.'}
                      </Text>
                    </Pressable>
                  </Link>
                ))}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      {hasTodayDream && todayRecord ? (
        <Link href="/record/step1" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>꿈 더 기록하기</Text>
          </Pressable>
        </Link>
      ) : (
        <Link href="/record/step1" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>꿈 기록하기</Text>
          </Pressable>
        </Link>
      )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: REQUIRED_BOTTOM_PADDING,
    alignItems: 'center',
  },
  heroSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 124,
    marginBottom: 48,
  },
  heroText: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '500',
    marginTop: 31,
    textAlign: 'center',
  },
  heroSubText: {
    color: '#8B8B8B',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
  },
  summarySection: {
    width: '100%',
    maxWidth: 380,
    gap: 12,
  },
  countChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3E8FF',
  },
  countChipText: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '700',
  },
  dreamCard: {
    width: '100%',
    minHeight: 140,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  dreamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  symbolBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dreamTitle: {
    flex: 1,
    color: '#000',
    textAlign: 'left',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  dreamSummary: {
    color: '#000',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  primaryButton: {
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
  primaryButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '700',
  },
});
