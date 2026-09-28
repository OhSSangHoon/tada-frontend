import { useMutation, useQueryClient } from "@tanstack/react-query";

import { renamePerson } from "@/domains/curator/api/curatorApi";
import type { PersonRenameRequest } from "@/domains/curator/types/curator";

export function useRenamePerson(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PersonRenameRequest) =>
      renamePerson(personId, request),

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["persons"],
      });
    },
  });
}
