import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getCalendar } from "@/domains/calendar/api/calendarApi";

// 로그인 여부는 app/page.tsx가 게스트/회원 화면을 분기하면서 이미 보장한다
// (이 훅은 회원용 화면 트리 안에서만 쓰인다).
export function useCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ["calendar", year, month],
    queryFn: () => getCalendar(year, month),
    placeholderData: keepPreviousData,
  });
}
