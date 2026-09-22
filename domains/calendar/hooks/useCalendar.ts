import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getCalendar } from "@/domains/calendar/api/calendarApi";
import { useAuthReady } from "@/shared/lib/auth-ready-context";
import { useAccessToken } from "@/shared/lib/token-store";

export function useCalendar(year: number, month: number) {
  const isAuthReady = useAuthReady();
  const accessToken = useAccessToken();

  const query = useQuery({
    queryKey: ["calendar", year, month],
    queryFn: () => getCalendar(year, month),
    // Access Token 복원이 끝나고, 그 결과 로그인 상태일 때만 조회한다.
    enabled: isAuthReady && !!accessToken,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    isAuthReady,
    isLoggedOut: isAuthReady && !accessToken,
  };
}
