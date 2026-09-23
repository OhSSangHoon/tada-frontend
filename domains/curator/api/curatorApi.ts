import { apiClient } from "@/shared/lib/api-client";
import type {
  PersonDetailResponse,
  PersonSummaryResponse,
  PersonTimelinePageResponse,
  PersonTimelineSort,
} from "@/domains/curator/types/curator";

export async function getPersons(): Promise<PersonSummaryResponse[]> {
  return apiClient<PersonSummaryResponse[]>("/api/curator/persons");
}

export async function getPersonDetail(
  personId: string,
): Promise<PersonDetailResponse> {
  return apiClient<PersonDetailResponse>(`/api/curator/persons/${personId}`);
}

export async function getPersonTimeline(
  personId: string,
  sort: PersonTimelineSort,
  cursor: string | null,
): Promise<PersonTimelinePageResponse> {
  const params = new URLSearchParams({
    sort,
  });

  if (cursor) {
    params.set("cursor", cursor);
  }

  return apiClient<PersonTimelinePageResponse>(
    `/api/curator/persons/${personId}/timeline?${params.toString()}`,
  );
}
