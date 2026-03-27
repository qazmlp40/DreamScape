// 더미 데이터 - 꿈 키워드 아이템 타입

export type DreamKeywordItem = {
    id: string;          // 유니크 id
    keyword: string;     // 키워드(간단 제목) - 필요하면 쓰고, 지금은 안 써도 됨
    dreamSummary: string;      // 상단 "제목" 자리에 들어갈 꿈 내용 요약
    interpretation: string;    // 하단 "제목" 자리에 들어갈 꿈 해몽 내용
};