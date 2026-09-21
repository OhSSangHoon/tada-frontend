import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trashDiary } from "@/domains/diary/api/diaryApi";

export function useTrashDiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => trashDiary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
