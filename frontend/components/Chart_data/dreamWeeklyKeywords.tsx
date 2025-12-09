// 더미 데이터 - 주간 TOP3 꿈 내용/ 해몽

import { DreamKeywordItem } from "./dreamType";

export const MOCK_WEEKLY_KEYWORDS: Record<string, DreamKeywordItem[]> = {
  '2025-07-1': [ // 행복
    {
      id: '2025-07-1-1',
      keyword: '여행',
      dreamSummary: '햇살 좋은 날 여행가는 꿈',
      interpretation: '현재 상황에 만족도가 높음',
    },
    {
      id: '2025-07-1-2',
      keyword: '득템',
      dreamSummary: '원하는 물건을 얻는 꿈',
      interpretation: '자기 효능감이 상승하는 시기',
    },
    {
      id: '2025-07-1-3',
      keyword: '대화',
      dreamSummary: '웃으며 대화하는 꿈',
      interpretation: '인간관계가 안정된 상태',
    },
  ],

  '2025-07-2': [ // 행복
    {
      id: '2025-07-2-1',
      keyword: '축하',
      dreamSummary: '축하받는 꿈',
      interpretation: '성과에 대한 기대감 반영',
    },
    {
      id: '2025-07-2-2',
      keyword: '음악',
      dreamSummary: '좋아하는 음악 듣는 꿈',
      interpretation: '정서적 만족도가 큼',
    },
    {
      id: '2025-07-2-3',
      keyword: '집',
      dreamSummary: '따뜻한 집에 있는 꿈',
      interpretation: '심리적 안정감이 큰 상황',
    },
  ],

  '2025-07-4': [ // 신남
    {
      id: '2025-07-4-1',
      keyword: '새 장소',
      dreamSummary: '새로운 장소에 가는 꿈',
      interpretation: '변화와 도전을 즐기려는 상태',
    },
    {
      id: '2025-07-4-2',
      keyword: '여럿이 놂',
      dreamSummary: '여럿이서 노는 꿈',
      interpretation: '사회적 에너지가 충만',
    },
    {
      id: '2025-07-4-3',
      keyword: '춤',
      dreamSummary: '춤추는 꿈',
      interpretation: '감정적 해방감이 큼',
    },
  ],

  '2025-03-1': [ // 슬픔
    {
      id: '2025-03-1-1',
      keyword: '눈물',
      dreamSummary: '눈물이 나는 꿈',
      interpretation: '감정 배출이 필요함',
    },
    {
      id: '2025-03-1-2',
      keyword: '반려동물',
      dreamSummary: '잃어버린 반려동물을 찾는 꿈',
      interpretation: '애착 불안 반영',
    },
    {
      id: '2025-03-1-3',
      keyword: '헤어진 사람',
      dreamSummary: '헤어진 사람과 다시 만나는 꿈',
      interpretation: '미련 또는 정서 잔재',
    },
  ],

  '2025-03-3': [ // 신남
    {
      id: '2025-03-3-1',
      keyword: '놀이공원',
      dreamSummary: '놀이공원 가는 꿈',
      interpretation: '일상의 변화에 대한 기대',
    },
    {
      id: '2025-03-3-2',
      keyword: '질주',
      dreamSummary: '빠르게 달리는 꿈',
      interpretation: '목표를 향해 속도 내는 상태',
    },
    {
      id: '2025-03-3-3',
      keyword: '새 옷',
      dreamSummary: '새 옷을 입는 꿈',
      interpretation: '이미지 변화 욕구',
    },
  ],

  '2025-09-1': [ // 분노
    {
      id: '2025-09-1-1',
      keyword: '소리침',
      dreamSummary: '소리치는 꿈',
      interpretation: '참았던 감정이 임계점에 도달',
    },
    {
      id: '2025-09-1-2',
      keyword: '문 안 열림',
      dreamSummary: '문이 안 열리는 꿈',
      interpretation: '좌절감이 커진 상태',
    },
    {
      id: '2025-09-1-3',
      keyword: '방해',
      dreamSummary: '누군가 방해하는 꿈',
      interpretation: '갈등이 잔존',
    },
  ],

  '2025-09-5': [ // 분노
    {
      id: '2025-09-5-1',
      keyword: '깨짐',
      dreamSummary: '깨지는 물건을 보는 꿈',
      interpretation: '감정 폭발 직전',
    },
    {
      id: '2025-09-5-2',
      keyword: '기차 놓침',
      dreamSummary: '기차를 놓치는 꿈',
      interpretation: '계획 차질에 대한 분노',
    },
    {
      id: '2025-09-5-3',
      keyword: '길 막힘',
      dreamSummary: '길이 막힌 꿈',
      interpretation: '현실적 장애에 대한 스트레스',
    },
  ],

  '2025-02-2': [ // 공포
    {
      id: '2025-02-2-1',
      keyword: '추격',
      dreamSummary: '누군가 따라오는 꿈',
      interpretation: '불안 요소가 근접해 있음',
    },
    {
      id: '2025-02-2-2',
      keyword: '전화 불통',
      dreamSummary: '전화가 안 걸리는 꿈',
      interpretation: '소통 단절에 대한 두려움',
    },
    {
      id: '2025-02-2-3',
      keyword: '어두운 방',
      dreamSummary: '불 꺼진 방에 있는 꿈',
      interpretation: '미지의 상황에 대한 공포',
    },
  ],

  '2025-02-4': [ // 슬픔
    {
      id: '2025-02-4-1',
      keyword: '그리운 사람',
      dreamSummary: '그리운 사람을 찾는 꿈',
      interpretation: '정서적 공허함',
    },
    {
      id: '2025-02-4-2',
      keyword: '잃어버린 사진',
      dreamSummary: '잃어버린 사진을 보는 꿈',
      interpretation: '과거 감정에 매몰된 상태',
    },
    {
      id: '2025-02-4-3',
      keyword: '텅 빈 공간',
      dreamSummary: '텅 빈 공간에 서 있는 꿈',
      interpretation: '정체감 흔들림',
    },
  ],

  '2025-10-2': [ // 감동
    {
      id: '2025-10-2-1',
      keyword: '위로',
      dreamSummary: '누군가 위로해주는 꿈',
      interpretation: '따뜻함에 대한 갈망',
    },
    {
      id: '2025-10-2-2',
      keyword: '편지',
      dreamSummary: '편지를 받는 꿈',
      interpretation: '관심과 인정 욕구',
    },
    {
      id: '2025-10-2-3',
      keyword: '대화',
      dreamSummary: '기억에 남는 대화 꿈',
      interpretation: '연결감에 대한 희구',
    },
  ],

  '2025-10-3': [ // 미묘
    {
      id: '2025-10-3-1',
      keyword: '표정 없음',
      dreamSummary: '표정 없는 사람과 마주치는 꿈',
      interpretation: '감정을 구분하기 어려운 관계',
    },
    {
      id: '2025-10-3-2',
      keyword: '방향 바뀌는 길',
      dreamSummary: '방향이 계속 바뀌는 길',
      interpretation: '결정을 미루는 심리',
    },
    {
      id: '2025-10-3-3',
      keyword: '흐릿한 풍경',
      dreamSummary: '흐릿한 풍경을 보는 꿈',
      interpretation: '감정이 정리되지 않음',
    },
  ],

  '2025-05-3': [ // 공포
    {
      id: '2025-05-3-1',
      keyword: '물 차오름',
      dreamSummary: '물이 점점 차오르는 꿈',
      interpretation: '감정에 잠식될 두려움',
    },
    {
      id: '2025-05-3-2',
      keyword: '몸이 안 움직임',
      dreamSummary: '발이 안 움직이는 꿈',
      interpretation: '현실에서 무력감 경험',
    },
    {
      id: '2025-05-3-3',
      keyword: '손잡이 없음',
      dreamSummary: '문의 손잡이가 사라지는 꿈',
      interpretation: '탈출 불가능한 상황 인식',
    },
  ],

  '2025-05-5': [ // 감동
    {
      id: '2025-05-5-1',
      keyword: '오래된 사진',
      dreamSummary: '오래된 사진을 받는 꿈',
      interpretation: '과거 기억에 대한 긍정적 해석',
    },
    {
      id: '2025-05-5-2',
      keyword: '보살핌',
      dreamSummary: '누가 대신 나를 챙겨주는 꿈',
      interpretation: '보살핌 욕구 충족',
    },
    {
      id: '2025-05-5-3',
      keyword: '따뜻한 빛',
      dreamSummary: '따뜻한 빛이 비추는 꿈',
      interpretation: '정서적 회복기',
    },
  ],

  '2025-12-1': [ // 슬픔
    {
      id: '2025-12-1-1',
      keyword: '이별',
      dreamSummary: '누군가 떠나는 꿈',
      interpretation: '상실감이 부각된 상태',
    },
    {
      id: '2025-12-1-2',
      keyword: '전화 끊김',
      dreamSummary: '전화기가 꺼지는 꿈',
      interpretation: '소통 단절에 대한 불안',
    },
    {
      id: '2025-12-1-3',
      keyword: '빈 집',
      dreamSummary: '텅 빈 집에 있는 꿈',
      interpretation: '정서적 고립',
    },
  ],

  '2025-12-4': [ // 신남
    {
      id: '2025-12-4-1',
      keyword: '폭죽',
      dreamSummary: '폭죽이 터지는 꿈',
      interpretation: '기대감 상승',
    },
    {
      id: '2025-12-4-2',
      keyword: '새 구두',
      dreamSummary: '새 구두를 신는 꿈',
      interpretation: '새로운 시작에 대한 설렘',
    },
    {
      id: '2025-12-4-3',
      keyword: '사람들 모임',
      dreamSummary: '사람들이 모여 있는 꿈',
      interpretation: '사회적 에너지 증가',
    },
  ],

  '2025-12-5': [ // 신남
    {
      id: '2025-12-5-1',
      keyword: '조명',
      dreamSummary: '번쩍이는 조명을 보는 꿈',
      interpretation: '환상적 기대감',
    },
    {
      id: '2025-12-5-2',
      keyword: '무대',
      dreamSummary: '무대 위에 서는 꿈',
      interpretation: '인정 욕구 상승',
    },
    {
      id: '2025-12-5-3',
      keyword: '빠른 이동',
      dreamSummary: '빠른 이동을 하는 꿈',
      interpretation: '변화에 대한 열망',
    },
  ]
};
