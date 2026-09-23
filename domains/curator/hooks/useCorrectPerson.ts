import { useMutation, useQueryClient } from "@tanstack/react-query";

import { correctPerson } from "@/domains/curator/api/curatorApi";
import type { CorrectPersonParams } from "@/domains/curator/types/curator";

export function useCorrectPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ personId, candidateId, request }: CorrectPersonParams) =>
      correctPerson(personId, candidateId, request),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["persons"],
      });
    },
  });
}
