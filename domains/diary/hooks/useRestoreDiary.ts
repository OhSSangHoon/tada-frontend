import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreDiary } from "@/domains/diary/api/diaryApi";

interface RestoreDiaryParams {
  id: string;
  replace?: boolean;
}

export function useRestoreDiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, replace }: RestoreDiaryParams) =>
      restoreDiary(id, replace),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trash"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
