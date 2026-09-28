import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getMemoryRecall } from "@/domains/curator/api/curatorApi";

export function useMemoryRecall(
  enabled: boolean,
  excludeDiaryId: string | null,
) {
  return useQuery({
    queryKey: ["memory-recall", excludeDiaryId],
    queryFn: () => getMemoryRecall(excludeDiaryId),
    enabled,
    placeholderData: keepPreviousData,
  });
}
