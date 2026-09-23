"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/*
    검색 결과를 통해 연 일기가 수정되면 검색 결과 캐시도 최산화 한다.
    - diary 도메인 파일은 건드리지 않음: useUpdateDiary.ts가 저장 성공 시
      queryClient.setQueryData(["diary". id], updated)를 호출하는 기종 동작을 그대로 이용
    - setQueryData로 갱신된 캐시 이벤트는 action.menual === true로 찍혀서
      일반 refetch 성공과 구분 가능 -> 감지해서 search 캐시만 invalidate
*/

export function useInvalidateSearchOnDiaryUpdate(diaryId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!diaryId) return;

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return;
      if (event.query.queryKey[0] !== "diary") return;
      if (event.query.queryKey[1] !== diaryId) return;
      if (event.action.type === "success" && event.action.manual) {
        queryClient.invalidateQueries({ queryKey: ["search"] });
      }
    });

    return unsubscribe;
  }, [diaryId, queryClient]);
}
