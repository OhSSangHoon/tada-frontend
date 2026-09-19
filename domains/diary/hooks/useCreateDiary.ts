import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDiary } from "@/domains/diary/api/diaryApi";

export function useCreateDiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDiary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
