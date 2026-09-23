import { useInfiniteQuery } from "@tanstack/react-query";
import { getPersonTimeline } from "@/domains/curator/api/curatorApi";
import type { PersonTimelineSort } from "@/domains/curator/types/curator";

export function usePersonTimeline(personId: string, sort: PersonTimelineSort) {
  return useInfiniteQuery({
    queryKey: ["persons", personId, "timeline", sort],
    queryFn: ({ pageParam }) => getPersonTimeline(personId, sort, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
