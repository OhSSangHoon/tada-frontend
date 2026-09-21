import { apiClient } from "@/shared/lib/api-client";
import type { CalendarResponse } from "@/domains/calendar/types/calendar";

export async function getCalendar(
  year: number,
  month: number,
): Promise<CalendarResponse> {
  return apiClient<CalendarResponse>(
    `/api/calendar?year=${year}&month=${month}`,
  );
}
