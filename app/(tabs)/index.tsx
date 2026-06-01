import NoteIcon from '@/assets/images/icons/note.svg';
import AlertOctagonIcon from '@/assets/images/icons/alert-octagon.svg';
import DreamSymbolIcon from '@/components/app/DreamSymbolIcon';
import { useFocusEffect } from '@react-navigation/native';
import { Link, Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { dreamApi } from '../../services/dreamApi';
import {
  extractDreamDate,
  extractDreamId,
  extractDreamInterpretation,
  extractDreamSummary,
  extractDreamTags,
  extractDreamText,
  extractDreamTitle,
  extractDreamVideoUrl,
  getDreamListFromResponse,
} from '../../utils/dreamNormalize';
import { normalizeMoodId } from '../../utils/mood';

const colors = {
  text: '#1F2937',
  background: '#FFFFFF',
  border: '#E5E7EB',
  inactive: '#9CA3AF',
  recordButtonColor: '#BB7CFF',
};

const FIXED_BUTTON_HEIGHT = 60;
const IOS_SAFE_AREA_INSET = Platform.OS === 'ios' ? 34 : 0;
const PRIMARY_BUTTON_BOTTOM = 0;
const CARD_TO_BUTTON_GAP = 48;
const REQUIRED_BOTTOM_PADDING = PRIMARY_BUTTON_BOTTOM + FIXED_BUTTON_HEIGHT + CARD_TO_BUTTON_GAP;
const DREAMSCAPE_LOGO_WIDE = require('../../assets/images/dreamscape-logo-wide.png');

type HomeDream = {
  id: string;
  dreamId?: number;
  date: string;
  title: string;
  mood: string;
  dreamText: string;
  summary: string;
  interpretation: string;
  videoUrl: string;
  tags: string[];
};

const formatDateToString = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const normalizeDream = (dream: any): HomeDream | null => {
  const dreamId = extractDreamId(dream);
  const date = extractDreamDate(dream);
  const dreamText = extractDreamText(dream);
  const summary = extractDreamSummary(dream);

  if (!date) {
    return null;
  }

  return {
    id: String(dreamId || `${date}-${Math.random()}`),
    dreamId,
    date,
    title: extractDreamTitle(dream),
    mood: normalizeMoodId(dream?.mood ?? dream?.emotion),
    dreamText,
    summary: summary || dreamText,
    interpretation: extractDreamInterpretation(dream),
    videoUrl: extractDreamVideoUrl(dream),
    tags: extractDreamTags(dream),
  };
};

export default function TabsIndex() {
  const [dreams, setDreams] = useState<HomeDream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const todayString = formatDateToString(new Date());

  const loadDreams = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      console.log('[Home] 꿈 목록 조회 시작');
      const response = await dreamApi.getDreams();
      console.log('[Home] 서버 응답:', response);
      const nextDreams = getDreamListFromResponse(response)
        .map(normalizeDream)
        .filter(Boolean);
      console.log('[Home] 정규화된 꿈 목록:', nextDreams);

      setDreams(nextDreams as HomeDream[]);
    } catch (error) {
      console.error('홈 꿈 목록 조회 실패:', error);
      setDreams([]);
      setIsError(true);
    } finally {
      setIsLoading(false);
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
          <View style={styles.header}>
            <Image
              source={DREAMSCAPE_LOGO_WIDE}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.heroSection}>
            <NoteIcon />
            <Text style={styles.heroText}>오늘의 꿈을 기록해보세요</Text>
            {hasTodayDream ? (
              <Text style={styles.heroSubText}>기록된 꿈이 아래 카드에 추가돼요</Text>
            ) : null}
          </View>

          {isLoading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator size="small" color={colors.recordButtonColor} />
              <Text style={styles.stateText}>꿈 기록을 불러오는 중이에요</Text>
            </View>
          ) : isError ? (
            <View style={styles.stateBox}>
              <AlertOctagonIcon width={32} height={32} />
              <Text style={styles.stateText}>꿈 기록을 불러오지 못했어요</Text>
              <Pressable
                style={styles.retryButton}
                onPress={loadDreams}
                accessibilityRole="button"
              >
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </Pressable>
            </View>
          ) : hasTodayDream && todayRecord ? (
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
                      pathname: '/dream-view',
                      params: {
                        mode: 'review',
                        ...(dream.dreamId ? { id: String(dream.dreamId) } : {}),
                        ...(dream.dreamId ? { dreamId: String(dream.dreamId) } : {}),
                        date: dream.date,
                        mood: dream.mood,
                        title: dream.title,
                        dreamText: dream.dreamText,
                        summary: dream.summary,
                        interpretation: dream.interpretation,
                        videoUrl: dream.videoUrl,
                        ...(dream.tags.length ? { tags: dream.tags.join(',') } : {}),
                      },
                    }}
                    asChild
                  >
                    <Pressable style={styles.dreamCard}>
                      <View style={styles.dreamCardHeader}>
                        <View style={styles.symbolBadge}>
                          <DreamSymbolIcon
                            tags={dream.tags}
                            text={`${dream.title} ${dream.summary} ${dream.interpretation} ${dream.dreamText}`}
                            width={44}
                            height={44}
                          />
                        </View>
                        <Text style={styles.dreamTitle} numberOfLines={1}>
                          {dream.title?.trim() || '제목 없는 꿈'}
                        </Text>
                      </View>
                      <Text style={styles.dreamSummary} numberOfLines={2}>
                        {dream.dreamText ||
                          dream.summary ||
                          dream.interpretation ||
                          '아직 해몽이 없어요.'}
                      </Text>
                    </Pressable>
                  </Link>
                ))}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      {!isLoading && !isError && hasTodayDream && todayRecord ? (
        <Link href="/record/step1" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>꿈 더 기록하기</Text>
          </Pressable>
        </Link>
      ) : !isLoading && !isError ? (
        <Link href="/record/step1" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>꿈 기록하기</Text>
          </Pressable>
        </Link>
      ) : null}
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
  header: {
    width: '100%',
    paddingTop: 16,
    alignItems: 'flex-start',
  },
  headerLogo: {
    width: 150,
    height: 27,
  },
  heroSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 84,
    marginBottom: 32,
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
    marginBottom: CARD_TO_BUTTON_GAP,
  },
  stateBox: {
    width: '100%',
    maxWidth: 320,
    minHeight: 126,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  stateText: {
    color: colors.inactive,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 112,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.recordButtonColor,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
    bottom: PRIMARY_BUTTON_BOTTOM,
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
