import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDiary } from "@/domains/diary/api/diaryApi";
import type { UpdateDiaryRequest } from "@/domains/diary/types/diary";

export function useUpdateDiary(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDiaryRequest) => updateDiary(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary", id] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
