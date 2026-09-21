import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDiary } from "@/domains/diary/api/diaryApi";
import type { UpdateDiaryRequest } from "@/domains/diary/types/diary";

export function useUpdateDiary(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDiaryRequest) => updateDiary(id, payload),
    onSuccess: (updated) => {
      // 저장 응답으로 바로 갱신해서, 조회 화면이 다시 불러오는 동안 이전 내용으로 보이지 않게 한다
      queryClient.setQueryData(["diary", id], updated);
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
