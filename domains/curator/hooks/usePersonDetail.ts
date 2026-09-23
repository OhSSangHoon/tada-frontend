import { useQuery } from "@tanstack/react-query";
import { getPersonDetail } from "@/domains/curator/api/curatorApi";

export function usePersonDetail(personId: string) {
  return useQuery({
    queryKey: ["persons", personId, "detail"],
    queryFn: () => getPersonDetail(personId),
  });
}
