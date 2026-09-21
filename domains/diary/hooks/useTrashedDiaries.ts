import { useQuery } from "@tanstack/react-query";
import { getTrashedDiaries } from "@/domains/diary/api/diaryApi";

export function useTrashedDiaries(enabled: boolean) {
  return useQuery({
    queryKey: ["trash"],
    queryFn: getTrashedDiaries,
    enabled,
  });
}
