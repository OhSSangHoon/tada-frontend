import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCalendar } from "@/domains/calendar/api/calendarApi";

// 해당 날짜에 ACTIVE 일기가 이미 있는지 서버 기준으로 확인한다 (캐시가 아닌 최신 데이터)
export function useHasDiaryOnDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dateStr: string) => {
      const [year, month] = dateStr.split("-").map(Number);
      const items = await queryClient.fetchQuery({
        queryKey: ["calendar", year, month],
        queryFn: () => getCalendar(year, month),
        staleTime: 0,
      });
      return items.some((item) => item.entryDate === dateStr);
    },
  });
}
