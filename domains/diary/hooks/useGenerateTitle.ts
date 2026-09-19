import { useMutation } from "@tanstack/react-query";
import { generateTitle } from "@/domains/diary/api/diaryApi";

export function useGenerateTitle() {
  return useMutation({
    mutationFn: (content: string) => generateTitle(content),
  });
}
