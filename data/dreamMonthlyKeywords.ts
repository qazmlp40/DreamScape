// 더미 데이터 - 월간 TOP3 꿈 내용/ 해몽

import { DreamKeywordItem } from "./dreamType";

export const MOCK_MONTHLY_KEYWORDS: Record<string, DreamKeywordItem[]> = {
  '2025-02': [ // 공포 최다
    {
      id: '2025-02-1',
      keyword: '추락',
      dreamSummary: '높은 곳에서 떨어지는 꿈',
      interpretation: '현실에서 통제 불가한 상황을 두려워함',
    },
    {
      id: '2025-02-2',
      keyword: '추격',
      dreamSummary: '쫓기는 꿈',
      interpretation: '해결하지 못한 문제가 스트레스로 남아 있음',
    },
    {
      id: '2025-02-3',
      keyword: '문 불안',
      dreamSummary: '문이 잠기지 않는 꿈',
      interpretation: '불안하거나 안전이 위협받는 심리',
    },
  ],

  '2025-03': [ // 슬픔 최다
    {
      id: '2025-03-1',
      keyword: '가족',
      dreamSummary: '길 잃은 가족을 찾는 꿈',
      interpretation: '정서적 의지 대상과의 거리감',
    },
    {
      id: '2025-03-2',
      keyword: '물건',
      dreamSummary: '잃어버린 물건을 찾는 꿈',
      interpretation: '미련 또는 놓지 못한 감정이 존재',
    },
    {
      id: '2025-03-3',
      keyword: '비',
      dreamSummary: '비 오는 날 혼자 걷는 꿈',
      interpretation: '우울한 감정이 잠재적으로 남아 있음',
    },
  ],

  '2025-05': [ // 감동 최다
    {
      id: '2025-05-1',
      keyword: '친구',
      dreamSummary: '오래 못 본 친구를 만나는 꿈',
      interpretation: '관계 회복과 위안에 대한 기대',
    },
    {
      id: '2025-05-2',
      keyword: '선물',
      dreamSummary: '선물을 받는 꿈',
      interpretation: '누군가에게 인정받고 싶은 마음',
    },
    {
      id: '2025-05-3',
      keyword: '말',
      dreamSummary: '따뜻한 말 듣는 꿈',
      interpretation: '애정 결핍을 메우고자 하는 욕구',
    },
  ],

  '2025-07': [ // 행복 최다
    {
      id: '2025-07-1',
      keyword: '복권',
      dreamSummary: '복권에 당첨되는 꿈',
      interpretation: '행운과 기회에 대한 기대감 상승',
    },
    {
      id: '2025-07-2',
      keyword: '데이트',
      dreamSummary: '좋아하는 사람과 데이트하는 꿈',
      interpretation: '관계 발전 욕구 반영',
    },
    {
      id: '2025-07-3',
      keyword: '햇빛',
      dreamSummary: '햇빛 아래 걷는 꿈',
      interpretation: '긍정적 에너지와 자존감이 높아진 상태',
    },
  ],

  '2025-09': [ // 분노 최다
    {
      id: '2025-09-1',
      keyword: '화냄',
      dreamSummary: '누군가에게 크게 화내는 꿈',
      interpretation: '참아온 감정이 쌓인 상태',
    },
    {
      id: '2025-09-2',
      keyword: '던짐',
      dreamSummary: '물건을 던지는 꿈',
      interpretation: '감정 폭발 직전의 스트레스',
    },
    {
      id: '2025-09-3',
      keyword: '고장',
      dreamSummary: '차가 고장나는 꿈',
      interpretation: '계획이 틀어지는 것에 대한 분노',
    },
  ],

  '2025-10': [ // 미묘(혼합감정) 최다
    {
      id: '2025-10-1',
      keyword: '낯섦',
      dreamSummary: '익숙한 장소가 낯설게 보이는 꿈',
      interpretation: '관계나 환경에서 애매한 감정 상태',
    },
    {
      id: '2025-10-2',
      keyword: '익명',
      dreamSummary: '익명의 사람과 대화하는 꿈',
      interpretation: '내면의 감정을 정리 중',
    },
    {
      id: '2025-10-3',
      keyword: '갈림길',
      dreamSummary: '길이 계속 갈라지는 꿈',
      interpretation: '선택에 대한 혼란과 망설임',
    },
  ],

  '2025-12': [ // 신남 최다
    {
      id: '2025-12-1',
      keyword: '롤러코스터',
      dreamSummary: '롤러코스터 타는 꿈',
      interpretation: '새로운 자극과 변화에 대한 욕구',
    },
    {
      id: '2025-12-2',
      keyword: '파티',
      dreamSummary: '파티장에서 즐기는 꿈',
      interpretation: '인정 욕구와 사회적 에너지 증가',
    },
    {
      id: '2025-12-3',
      keyword: '준비',
      dreamSummary: '선물을 준비하는 꿈',
      interpretation: '다가올 이벤트에 대한 기대감',
    },
  ],
};