import { useQuery } from "@tanstack/react-query";

import { getPersonMemories } from "@/domains/curator/api/curatorApi";

export function usePersonMemories(personId: string) {
  return useQuery({
    queryKey: ["persons", personId, "memories"],
    queryFn: () => getPersonMemories(personId),
  });
}
