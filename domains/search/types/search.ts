// SearchResultResponse (백엔드 search/dto/SearchResultResponse.java) 와 1:1 매핑
export interface SearchResultResponse {
  id: string; // UUID
  entryDate: string; // LocalDate -> "YYYY-MM-DD" 문자열로 직렬화
  title: string;
  weather: string;
  content: string;
  createdAt: string; // LocalDateTime -> ISO 8601 문자열
}

// Spring Data Page<T>가 직렬화되는 형태
// 다른 도메인(ex: 스티커 앨범 페이지네이션)도 같은 모양을 쓰게 되면
// 그때는 shared/types로 옮기는 게 맞음 - 지금은 search만 사용
export interface SpringPage<T> {
  content: T[];
  number: number; // 현재 페이지, 0-base
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

export type SearchResultPage = SpringPage<SearchResultResponse>;
