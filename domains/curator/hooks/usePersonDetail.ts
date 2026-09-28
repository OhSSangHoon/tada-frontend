import { useQuery } from "@tanstack/react-query";
import { getPersonDetail } from "@/domains/curator/api/curatorApi";
import { ApiError } from "@/shared/lib/api-client";

export function usePersonDetail(personId: string) {
  return useQuery({
    queryKey: ["persons", personId, "detail"],
    queryFn: () => getPersonDetail(personId),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }

      return failureCount < 3;
    },
  });
}
