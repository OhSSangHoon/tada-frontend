import { useMutation } from "@tanstack/react-query";
import { generateTitle } from "@/domains/diary/api/diaryApi";

interface GenerateTitleParams {
  content: string;
  weather: string | null;
}

export function useGenerateTitle() {
  return useMutation({
    mutationFn: ({ content, weather }: GenerateTitleParams) =>
      generateTitle(content, weather),
  });
}
