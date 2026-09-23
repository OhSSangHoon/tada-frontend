import { useQuery } from "@tanstack/react-query";
import { getPersons } from "@/domains/curator/api/curatorApi";

export function usePersons(enabled = true) {
  return useQuery({
    queryKey: ["persons"],
    queryFn: getPersons,
    enabled,
  });
}
