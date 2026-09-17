import { apiClient } from "@/shared/lib/api-client";
import type { CalendarItem } from "@/domains/calendar/types/calendar";

// TEMP: 진경의 api-client.ts 인증 헤더 자동 첨부가 아직 없어서, 로컬 테스트용으로만 .env.local의
// NEXT_PUBLIC_DEV_TOKEN을 붙임 (.env.local은 git에 안 올라감). 진경 쪽 구현되면 이 블록 삭제.
const devAuthHeader = process.env.NEXT_PUBLIC_DEV_TOKEN
    ? { Authorization: `Bearer ${process.env.NEXT_PUBLIC_DEV_TOKEN}` }
    : undefined;

export async function getCalendar(year: number, month: number): Promise<CalendarItem[]> {
    return apiClient<CalendarItem[]>(`/api/calendar?year=${year}&month=${month}`, { headers: devAuthHeader });
}